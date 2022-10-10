import { Search, SearchType } from '../../../consts/search-categories';
import { companiesSortFields, doseFormSortFields } from '../../../consts/search-results';
import { getServiceAddress } from '../../../public/js/common';
import { microservices } from '../../../horizon-settings';
import axios from 'axios';

const { SEARCH_BY } = Search;

const defaultHits = 2000;

const specialCharacters = /[-\,\[\]\;]/g;

const categoriesMapping = {
    [SEARCH_BY.COMPANIES]:SearchType.companies,
    [SEARCH_BY.PRODUCTS]: SearchType.products,
    [SEARCH_BY.DOSE_FORMS]: SearchType.doseForms,
    [SEARCH_BY.INACTIVE_INGREDIENTS]: SearchType.inactiveIngredient,
    [SEARCH_BY.INTERMEDIATE]: SearchType.intermediate
}

const getIndex = (queryCategories) => {
    return categoriesMapping[queryCategories.toLowerCase()] || SearchType.products;
}

const getValue = (queryCategories, keywords) =>
    queryCategories.toLowerCase() === SEARCH_BY.COMPANIES
        ? keywords + '*' : '';

const getAppliedFilters = (categories, id) => {
    if (categories.toLowerCase() === SEARCH_BY.PRODUCTS || categories.toLowerCase() === SEARCH_BY.DOSE_FORMS) {
        return `api_grp_id:OR(${id})`;
    } else if (categories.toLowerCase() === SEARCH_BY.INACTIVE_INGREDIENTS) {
        return `inactive_ingredient_id:OR(${id})`;
    } else if (categories.toLowerCase() === SEARCH_BY.INTERMEDIATE) {
        return `intermediate_reagent_id:OR(${id})`;
    } else {
        return (id && `co_id:OR(${id})` || '');
    }
};

const prepareAppliedFilters = (filters) => {
    return filters.map(({
        filterKey,
        values
    }) => {
        const preparedValues = values?.map(value => value === 'Yes' || `"${value}"`).join();
        if (preparedValues) {
            return `${filterKey}:OR(${preparedValues})`;
        }
    }).filter(filter => Boolean(filter)).join(' AND ');
};

module.exports = {
    getSearchResults: ({ categories, keywords, id, filters, sortBy, sortDirection, customHits }) => {
        const hits = customHits || defaultHits;
        const config = {
            index: getIndex(categories),
            queryInput: {
                value: getValue(categories, keywords).replace(specialCharacters, " "),
                language: 'ssql'
            },
            hits: hits.toString(),
            offset: '0'
        };

        config.queryInput.appliedFilter = getAppliedFilters(categories, id);

        if (sortBy && sortDirection) {
            if(categories === SEARCH_BY.DOSE_FORMS){
                config.sort = {
                    "subs_count": "desc",
                    [doseFormSortFields[sortBy]]: sortDirection
                };
            } else {
                config.sort = {
                    "subs_count": "desc",
                    [companiesSortFields[sortBy]]: sortDirection
                };
            }
        }        
        if (categories === SEARCH_BY.DOSE_FORMS){
            config.queryInput.aggregations = [{
                "name": "dose_forms",
                "field": "dose_forms",
                "type": "terms",
                "sort": {
                    "field": "term",
                    "order": "asc"
                }
            }];
        }
        if (filters) {
            const appliedFilters = prepareAppliedFilters(filters);
            config.queryInput.appliedFilter = [config.queryInput.appliedFilter, appliedFilters].filter(Boolean).join(' AND ');
        }

        return getServiceAddress(microservices.search)
            .then(searchServiceAddress => axios.post(`${searchServiceAddress}/search`, config));
    },
    getCountriesList: ({ categories, keywords, id, filters }) => {
        const config = {
            index: getIndex(categories),
            queryInput: {
                value: getValue(categories, keywords).replace(specialCharacters, " "),
                aggregations: [{
                    name: 'aggregated_list_of_countries',
                    field: 'co_cntry',
                    type: 'terms',
                    sort: {
                        field: 'term',
                        order: 'asc'
                    }
                }
                ]

            },
            hits: '0'
        };

        config.queryInput.appliedFilter = getAppliedFilters(categories, id);

        if (filters) {
            const appliedFilters = prepareAppliedFilters(filters);
            config.queryInput.appliedFilter = [config.queryInput.appliedFilter, appliedFilters].filter(Boolean).join(' AND ');
        }

        return getServiceAddress(microservices.search)
            .then(searchServiceAddress => axios.post(`${searchServiceAddress}/search`, config));
    },
    getCorporateApiRatingList: ({ categories, id, keywords }) => {
        const config = {
            index: 'horizon-companies',
            queryInput: {
                value: getValue(categories, keywords).replace(specialCharacters, " "),
                aggregations: [{
                    name: 'aggregated_list_of_corporate_api_rating',
                    field: 'corporate_api_ratg',
                    type: 'terms',
                    sort: {
                        field: 'term',
                        order: 'asc'
                    }
                }]
            },
            hits: '0'
        };

        config.queryInput.appliedFilter = getAppliedFilters(categories, id);

        return categories === SEARCH_BY.COMPANIES ? getServiceAddress(microservices.search)
            .then(searchServiceAddress => axios.post(`${searchServiceAddress}/search`, config)) : Promise.resolve([]);
    },
    autosuggestByProduct: (searchString = '', recordType = '', hits = 100) => {
        const config = {
            index: SearchType.typeaheadProducts,
            queryInput: {
                value: searchString.replace(specialCharacters, " "),
                language: 'ssql',
                appliedFilter: recordType ? Array.isArray(recordType) ? `recordType:OR(${recordType.join()})` : `recordType:${recordType}` : null
            },
            hits,
            offset: '0'
        };

        return getServiceAddress(microservices.search)
            .then(searchServiceAddress => axios.post(`${searchServiceAddress}/search`, config));
    },
    autosuggestByProductPreview: (searchString = '', searchProductType = '', companyId, hits = 1000) => {
        const config = {
            index: SearchType.productsPreview,
            queryInput: {
                value: searchString.replace(specialCharacters, " "),
                language: 'ssql',
                appliedFilter: `company_id:${companyId}`
            },
            hits,
            offset: '0'
        };

        if (searchProductType && searchProductType.length) {
            config.queryInput.appliedFilter = config.queryInput.appliedFilter
                + (Array.isArray(searchProductType)
                ? ` AND (type:OR(${searchProductType.join()}))`
                : ` AND (type:${searchProductType}))`)
        }

        return getServiceAddress(microservices.search)
            .then(searchServiceAddress => axios.post(`${searchServiceAddress}/search`, config));
    }
};
