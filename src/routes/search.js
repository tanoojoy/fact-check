import express from 'express';
import React from 'react';
import reactDom from 'react-dom/server';
import axios from 'axios';
import Store from '../redux/store';
import template from '../views/layouts/template';
import client from '../../sdk/client';
import authenticated from '../scripts/shared/authenticated';
import { isFreemiumUserSku, redirectUnauthorizedUser } from '../utils';
import { getItemCustomFields } from './company';
import { SearchComponent as SearchPage } from '../views/search';
import {
    getSearchResults,
    getCountriesList,
    getCorporateApiRatingList
} from './horizon-api/search-results-service/search-results.controller';

import { SearchResults } from '../views/search';
import { Search } from '../consts/search-categories';
import { itemSearch as itemSearchPPs } from '../consts/page-params';
import { prepareData, getAutosuggestRawData } from './horizon-routers/autosuggest';

const searchRouter = express.Router();

const getIdsFromAutosuggest = async(req, keywords, categories) => {
    const autosuggestRawData = await getAutosuggestRawData(req, categories, keywords);
    const autosuggestData = prepareData(autosuggestRawData)?.results;

    if (
        Search.SEARCH_BY.PRODUCTS === categories ||
        Search.SEARCH_BY.DOSE_FORMS === categories ||
        Search.SEARCH_BY.INACTIVE_INGREDIENTS === categories ||
        Search.SEARCH_BY.INTERMEDIATE === categories
    ) {
        return autosuggestData.find(productData => {
            return productData.name === keywords;
        })?.dictId || 0;
    }
    if (Search.SEARCH_BY.COMPANIES === categories) {
        return autosuggestData.find(companyData => companyData.co_name === keywords)?.co_ids || null;
    }
};

searchRouter.get('/cgi-search', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    const {
        categories,
        keywords
    } = req.query;
    let breadcrumbText = '';

    const ids = await getIdsFromAutosuggest(req, keywords, categories);
    Promise.all([
        getSearchResults({
            categories,
            keywords,
            id: ids,
            filters: null,
            sortBy: null,
            sortDirection: null,
            customHits: isFreemiumUserSku(req.user) && 10
        }),
        getCountriesList({
            categories,
            keywords,
            id: ids
        }),
        getCorporateApiRatingList({
            categories,
            id: ids,
            keywords
        })
    ])
        .then(([resBe, rawCountriesList, rawCorporateApiRatingList]) => {
            let keywords = null;
            const appString = itemSearchPPs.appString;
            const priceRange = {};
            const countriesList = rawCountriesList?.data?.aggregations[0]?.values?.map(field => field.name);
            const doseForms = resBe.data.aggregations[0]?.values?.map(field => field.name);
            const corporateApiRatingList = rawCorporateApiRatingList?.data?.aggregations[0]?.values?.map(field => field.name).filter(rating => rating !== 'n/a');
            if (req.query.keywords && req.query.keywords !== '') {
                console.log('req.query.keywords', req.query.keywords);
                // keywords = decodeURIComponent(req.query.keywords.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
                keywords = req.query.keywords;
                breadcrumbText = keywords;
            }
            const customFieldFilters = {
                dataInputTypes: ['checkbox']
            }
            getItemCustomFields(customFieldFilters, (searchCustomFields) => {
                const s = Store.createSearchStore({
                    userReducer: { user: req.user },
                    searchReducer: {
                        ids,
                        items: resBe.data.hits,
                        doseForms,
                        totalRecords: resBe.data?.info?.totalHits,
                        keywords: keywords,
                        searchId: ids,
                        tags: [],
                        countriesList,
                        corporateApiRatingList,
                        withChildItems: true,
                        pageSize: 20,
                        pageNumber: 1,
                        sort: 'item_desc',
                        minimumPrice: null,
                        maximumPrice: null,
                        categories: req.query.categories,
                        customFields: searchCustomFields,
                        resultDisplayBehavior: 'list',
                        breadcrumbText: breadcrumbText,
                        customFilters: {},
                        currencyCode: process.env.DEFAULT_CURRENCY,
                        priceRange: priceRange,
                        ReviewAndRating: {}
                    }
                });

                let seoTitle = itemSearchPPs.title;
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const reduxState = s.getState();
                const searchPageApp = reactDom.renderToString(<SearchResults user={req.user} />);

                res.send(template(itemSearchPPs.bodyClass, seoTitle, searchPageApp, appString, reduxState));
            })
        })
        .catch(error => {
            console.log('Error', error);
            res.status(500).send(error.response);
        });
});

searchRouter.post('/cgi-search/apply-filters', authenticated, async(req, res) => {
    try {
        if (redirectUnauthorizedUser(req, res)) return;
        const {
            categories,
            keywords,
            id,
            filters,
            sortByColumn,
            sortDirection
        } = req.body;

        const response = await getSearchResults({
            categories,
            keywords,
            id,
            filters,
            sortBy: sortByColumn,
            sortDirection,
            customHits: isFreemiumUserSku(req.user) && 10
        });

        res.json({
            items: response.data.hits,
            totalRecords: response.data?.info?.totalHits
        });
    } catch (e) {
        console.log(e);
    }
});

searchRouter.post('/cgi-search/companies', authenticated, async(req, res) => {
    try {
        if (redirectUnauthorizedUser(req, res)) return;
        const { keywords, country, city, isLinking } = req.body;
        const countryFilter = { filterKey: 'co_cntry', values: country ? [country] : null };
        const cityFilter = { filterKey: 'co_city', values: city ? [city] : null };
        const filters = [countryFilter, cityFilter];
        const response = await Promise.all([
            getSearchResults({
                categories: Search.SEARCH_BY.COMPANIES,
                keywords,
                id: null,
                filters,
                sortBy: null,
                sortDirection: null,
                customHits: !isLinking && isFreemiumUserSku(req.user) && 10
            }),
            getCountriesList({
                categories: Search.SEARCH_BY.COMPANIES,
                keywords,
                id: null,
                filters: null
            })
        ]);
        const [searchResults, countriesList] = response;
        const preparedSearchResults = searchResults.data.hits
            .map((
                {
                    fields: {
                        co_name: companyName,
                        co_id: companyId,
                        co_type: companyType,
                        co_city: companyCity,
                        co_cntry: companyCountry,
                        co_addr1: companyAddress,
                        subs_count: companyUsers
                    }
                }) => (
                { companyName, companyId, companyCountry, companyCity, companyAddress, companyUsers, companyType }
            ));
        const preparedCountriesList = countriesList.data.aggregations[0]?.values?.map(field => field.name);
        res.json({
            items: preparedSearchResults,
            countriesList: preparedCountriesList
        });
    } catch (e) {
        console.log(e);
    }
});

searchRouter.get('/', authenticated, function(req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    if (req.isPrivateEnabled && !req.isPrivateSellerSignUp) {
        if (!req.user) {
            return res.redirect('/');
        }
    }

    function getSelectedCategory(categoryId, categories) {
        if (categories) {
            const category = categories.find(x => x.ID === categoryId);
            if (category) {
                return {
                    ID: category.ID,
                    Name: category.Name,
                    ParentID: category.ParentCategoryID,
                    ParentName: category.ParentCategoryID !== null
                        ? categories.find(x => x.ID === category.ParentCategoryID).Name
                        : null
                };
            }
        }

        return null;
    }

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function(err, categories) {
            resolve(categories);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function(err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCategories, promiseMarketplace]).then((responses) => {
        let breadcrumbText = '';
        let keywords = null;
        const categories = responses[0];
        const marketplaceInfo = responses[1];
        const categoryIDs = categories.map(c => c.ID);

        if (req.query.keywords && req.query.keywords !== '') {
            keywords = decodeURIComponent(req.query.keywords.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
            breadcrumbText = keywords;
        }

        let query_categories = null;
        if (req.query.categories && req.query.categories !== '') {
            query_categories = [];
            query_categories.push(req.query.categories);
        }
        const isGuestUser = req.user == null || typeof req.user == 'undefined';

        let locationVariantGroupId = null;
        let userPreferredLocationId = null;
        if (process.env.PRICING_TYPE == 'country_level') {
            if (marketplaceInfo.CustomFields) {
                const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (locationCustomField && locationCustomField.Values.length > 0) {
                    locationVariantGroupId = locationCustomField.Values[0];
                }
            }

            if (req.user) {
                if (req.user.CustomFields && req.user.CustomFields.length > 0) {
                    const customField = req.user.CustomFields.find(c => c.Code.startsWith('user_preferred_location'));

                    if (customField) {
                        userPreferredLocationId = customField.Values[0];
                    }
                }
            }
        }

        const isPrivateAndSellerRestricted = req.isPrivateEnabled && req.isSellerVisibilityRestricted;
        const sellerId = !isGuestUser && isPrivateAndSellerRestricted && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) ? req.user.ID : null;
        const withChildItems = !(isGuestUser && process.env.PRICING_TYPE == 'country_level');
        const options = {
            pageSize: 20,
            pageNumber: 1,
            tags: [],
            withChildItems: withChildItems,
            sort: 'item_desc',
            keywords: keywords,
            minimumPrice: null,
            maximumPrice: null,
            categories: query_categories,
            customfields: null,
            sellerId: sellerId,
            variantGroupId: locationVariantGroupId,
            variantId: userPreferredLocationId
        };

        const promiseItems = new Promise((resolve, reject) => {
            client.Items.searchItems(options, function(err, items) {
                resolve(items);
            });
        });

        let promiseCategoriesWithCustomFields = null;
        let promiseAllCategoriesWithCustomFields = null;

        const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
            client.CustomFields.getDefinitions('Items', function(err, details) {
                resolve(details);
            });
        });

        if (query_categories !== null) {
            promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
                client.Categories.getCategoriesByIds(query_categories, function(err, categories) {
                    resolve(categories);
                });
            });
        } else {
            promiseAllCategoriesWithCustomFields = new Promise((resolve, reject) => {
                client.Categories.getCategoriesByIds(categoryIDs, function(err, categories) {
                    resolve(categories);
                });
            });
        }

        Promise.all([promiseItems, promiseCustomFieldDefinitions, promiseCategoriesWithCustomFields, promiseAllCategoriesWithCustomFields]).then((responses) => {
            const appString = 'item-search';
            const context = {};
            const items = responses[0];
            const customFieldDefinitions = responses[1];
            const categoryCustomFields = responses[2];
            const allCategoryCustomFields = responses[3];
            const ReviewAndRating = marketplaceInfo.ControlFlags.ReviewAndRating;

            const listCustomFields = [];
            let selectedCategories = null;
            if (query_categories != null) {
                const category = getSelectedCategory(query_categories[0], categories);
                if (category) {
                    selectedCategories = [];
                    selectedCategories.push(category);
                    breadcrumbText = breadcrumbText == '' ? category.Name : breadcrumbText;
                }
            }

            if (customFieldDefinitions && categoryCustomFields) {
                Array.from(customFieldDefinitions.Records).map(function(customField, index) {
                    if (customField.DataFieldType === 'list') {
                        let categoryCustomField = {};
                        if (categoryCustomFields.length > 0 && categoryCustomFields[0].CustomFields) {
                            categoryCustomField = categoryCustomFields[0].CustomFields.find(c => c.Code === customField.Code);
                        }

                        if (categoryCustomField) {
                            listCustomFields.push(customField);
                        }
                    }
                });
            }
            // all categories selected
            if (query_categories == null && categoryCustomFields == null && customFieldDefinitions && allCategoryCustomFields) {
                customFieldDefinitions.Records.map(customFieldDefinition => {
                    for (var category of allCategoryCustomFields) {
                        if (customFieldDefinition.DataFieldType === 'list' && !listCustomFields.find(c => c.Code == customFieldDefinition.Code)) {
                            listCustomFields.push(customFieldDefinition);
                        }
                    }
                });
            }

            const priceRange = items && items.Meta && items.Meta.PriceRange ? items.Meta.PriceRange : null;
            const itemRecords = items && items.Records ? items.Records : [];
            const totalRecords = items && items.TotalRecords ? items.TotalRecords : 0;
            const s = Store.createSearchStore({
                userReducer: {
                    user: req.user,
                    userPreferredLocationId: userPreferredLocationId
                },
                categoryReducer: { categories: categories },
                searchReducer: {
                    items: itemRecords,
                    totalRecords: totalRecords,
                    keywords: keywords,
                    tags: [],
                    withChildItems: true,
                    pageSize: 20,
                    pageNumber: 1,
                    sort: 'item_desc',
                    minimumPrice: null,
                    maximumPrice: null,
                    categories: selectedCategories,
                    customfields: null,
                    resultDisplayBehavior: 'list',
                    breadcrumbText: breadcrumbText,
                    customFilters: listCustomFields,
                    currencyCode: req.CurrencyCode || process.env.DEFAULT_CURRENCY,
                    priceRange: priceRange,
                    ReviewAndRating: ReviewAndRating
                }
            });

            let seoTitle = 'Search';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const reduxState = s.getState();
            const searchPageApp =
                reactDom.renderToString(
                    <SearchPage
                        context={context}
                        breadcrumbText={breadcrumbText}
                        keywords={keywords}
                        currencyCode={req.CurrencyCode}
                        items={itemRecords}
                        priceRange={priceRange}
                        totalRecords={totalRecords}
                        categories={categories}
                        user={req.user}
                        pageSize={20}
                        pageNumber={1}
                        userPreferredLocationId={userPreferredLocationId}
                    />
                );
            res.send(template('page-search', seoTitle, searchPageApp, appString, reduxState));
        });
    });
});

searchRouter.get('/items/ajax', authenticated, function(req, res) {
    console.log('searchRouter /items/ajax req', req);
    const pageSize = req.query.pageSize;
    const pageNumber = req.query.pageNumber;

    if (redirectUnauthorizedUser(req, res)) return;

    const promiseItems = {
        Records: []
    };
    const isGuestUser = req.user == null || typeof req.user == 'undefined';
    const isPrivateAndSellerRestricted = req.isPrivateEnabled && req.isSellerVisibilityRestricted;
    const sellerId = !isGuestUser && isPrivateAndSellerRestricted && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) ? req.user.ID : null;
    const customFilterValues = req.query.customValues;
    const customFilterMap = new Map();
    const customValues = [];
    customFilterValues && customFilterValues.map(customFilter => {
        const {
            code,
            value
        } = customFilter;
        const temp = customFilterMap.get(code);
        if (!temp) {
            customFilterMap.set(code, [value]);
        } else {
            customFilterMap.set(code, [...temp, value]);
        }
        customValues.push(value);
    });

    const config = {
        index: typeOfSearch.companies,
        queryInput: {
            value: 'pharma',
            language: 'ssql'
        },
        hits: hits.toString(),
        offset: pageNumber
    };

    axios
        .post('http://localhost:7001/search', config)
        .then(resBe => {
            console.log('AJAX resBe', JSON.stringify(resBe.data));
            return res.send(resBe.data.hits);
        })
        .catch(error => {
            console.log('Error', error);
            res.status(500).send(error.response);
        });

    // });
});

searchRouter.get('/items/custom-fields', authenticated, function(req, res) {
    console.log('searchRouter /items/custom-fields');

    if (redirectUnauthorizedUser(req, res)) return;

    const categoryIds = req.query.categoryIds;
    const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions('Items', function(err, details) {
            resolve(details);
        });
    });

    const promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
        client.Categories.getCategoriesByIds(categoryIds, function(err, categories) {
            resolve(categories);
        });
    });

    Promise.all([promiseCustomFieldDefinitions, promiseCategoriesWithCustomFields]).then((responses) => {
        const definitions = responses[0];
        const categoryCustomFields = responses[1];
        const listCustomFields = [];
        if ((definitions && definitions.Records.length > 0) && (categoryCustomFields && categoryCustomFields.length > 0)) {
            Array.from(definitions.Records).map(function(customField, index) {
                if (customField.DataFieldType === 'list') {
                    if (categoryCustomFields[0].CustomFields && categoryCustomFields[0].CustomFields.length > 0) {
                        const categoryCustomField = categoryCustomFields[0].CustomFields.find(c => c.Code === customField.Code);
                        if (categoryCustomField && customField.IsComparable) {
                            listCustomFields.push(customField);
                        }
                    }
                }
            });
        }

        res.send(listCustomFields);
    });
});

module.exports = searchRouter;
