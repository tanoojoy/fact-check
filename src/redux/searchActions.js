import axios from 'axios';
import actionTypes from './actionTypes';
import { getAppPrefix } from '../public/js/common';
import { Search as searchCategories } from '../consts/search-categories';
import { getProductTabsValues, getSearchResultsPageRedirectUrl, getProductType } from '../utils';
import { productTabs } from '../consts/product-tabs';
import values from 'lodash/values';

const prefix = getAppPrefix();
const { SEARCH_BY } = searchCategories;

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function goToPage(pageNumber, filters) {
    return function(dispatch, getState) {
        const state = getState().searchReducer;

        const user = getState().userReducer;
        //ARC8983 should still pass 1 country so that it will not be empty search.
        let tags = 'PH';
        if (!jQuery.isEmptyObject(user)) {
            tags = state.tags;
        }
        if (process.env.PRICING_TYPE === 'variants_level') {
            tags = '';
        }

        const categoryIds = [];
        if (state.categories && state.categories.length > 0) {
            Array.from(state.categories).map(function(category, index) {
                categoryIds.push(category.ID);
                if (category.ParentId) {
                    categoryIds.push(category.ParentId);
                }
                ;
            });
        }

        $.ajax({
            url: prefix + '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: state.pageSize,
                pageNumber: pageNumber,
                tags: tags,
                withChildItems: state.withChildItems,
                sort: state.sort,
                keywords: state.keywords,
                minPrice: state.minimumPrice,
                maxPrice: state.maximumPrice,
                categories: categoryIds,
                customFields: state.customfields
            },
            success: function(items) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    items: items,
                    pageNumber: pageNumber
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function sortResult(sort) {
    return function(dispatch, getState) {
        const state = getState().searchReducer;

        const user = getState().userReducer;
        //ARC8983 should still pass 1 country so that it will not be empty search.
        let tags = 'PH';
        if (!jQuery.isEmptyObject(user)) {
            tags = state.tags;
        }
        if (process.env.PRICING_TYPE === 'variants_level') {
            tags = '';
        }
        $.ajax({
            url: prefix + '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: state.pageSize,
                pageNumber: state.pageNumber,
                tags: tags,
                withChildItems: state.withChildItems,
                sort: sort,
                keywords: state.keywords,
                minPrice: state.minimumPrice,
                maxPrice: state.maximumPrice,
                categories: state.categories ? state.categories.map(c => c.ID) : [],
                customFields: state.customfields,
                customValues: state.customValues,
            },
            success: function(result) {
                return dispatch({
                    type: actionTypes.SORT_SEARCH_RESULT,
                    items: result,
                    sort: sort
                });
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function changeResultDisplay(resultDisplayBehavior) {
    return {
        type: actionTypes.SET_SEARCH_RESULT_DISPLAY,
        resultDisplayBehavior: resultDisplayBehavior
    };
}

function searchByCategory(categories) {
    function getCustomFields(categoryIds, callback) {
        $.ajax({
            url: prefix + '/search/items/custom-fields',
            type: 'GET',
            data: {
                categoryIds: categoryIds
            },
            success: function(result) {
                callback(result);
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }

    const categoryIds = [];
    Array.from(categories).map(function(category, index) {
        categoryIds.push(category.ID);
        if (category.ParentId) categoryIds.push(category.ParentId);
    });

    return function(dispatch, getState) {
        const state = getState().searchReducer;
        const user = getState().userReducer;
        //ARC8983 should still pass 1 country so that it will not be empty search.
        let tags = 'PH';
        if (!jQuery.isEmptyObject(user)) {
            tags = state.tags;
        }
        if (process.env.PRICING_TYPE === 'variants_level') {
            tags = '';
        }
        $.ajax({
            url: prefix + '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: state.pageSize,
                pageNumber: 1,
                tags: tags,
                withChildItems: state.withChildItems,
                sort: state.sort,
                keywords: state.keywords,
                minPrice: state.minimumPrice,
                maxPrice: state.maximumPrice,
                categories: categoryIds,
                customFields: state.customfields,
                customValues: null,
            },
            success: function(promiseItemsResult) {
                getCustomFields(categoryIds, function(result) {
                    const items = promiseItemsResult;
                    return dispatch({
                        type: actionTypes.SEARCH_BY_CATEGORY,
                        items: items,
                        categories: categories,
                        customFilters: result,
                    });
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function searchByFilters(filters) {
    return function(dispatch, getState) {
        const state = getState().searchReducer;
        //let searchQuerystring = "?pageSize=" + state.pageSize;
        //searchQuerystring += "&pageNumber=" + state.pageNumber;
        //searchQuerystring += "&tags=" + state.tags;
        //searchQuerystring += "&withChildItems=" + state.withChildItems;
        //searchQuerystring += "&sort=" + state.sort;
        //searchQuerystring += "&keywords=" + state.keywords;
        //searchQuerystring += "&minPrice=" + filters.minimumPrice;
        //searchQuerystring += "&maxPrice=" + filters.maximumPrice;
        //searchQuerystring += "&categories=" + state.categories;
        //searchQuerystring += "&customFields=" + filters.customfields;
        //searchQuerystring += "&resultDisplayBehavior=" + state.resultDisplayBehavior;

        const user = getState().userReducer;
        //ARC8983 should still pass 1 country so that it will not be empty search.
        let tags = 'PH';
        if (!jQuery.isEmptyObject(user)) {
            tags = state.tags;
        }
        if (process.env.PRICING_TYPE === 'variants_level') {
            tags = '';
        }
        $.ajax({
            url: prefix + '/search/items/ajax',
            type: 'GET',
            data: {
                pageSize: state.pageSize,
                pageNumber: 1,
                tags: tags,
                withChildItems: state.withChildItems,
                sort: state.sort,
                keywords: state.keywords,
                minPrice: filters.minimumPrice,
                maxPrice: filters.maximumPrice,
                categories: state.categories && state.categories.length > 0 ? state.categories.map(cat => cat.ID) : state.categories,
                customFields: filters.customfields,
                customValues: filters.customValues,
                sellerId: filters.sellerId
            },
            success: function(result) {
                return dispatch({
                    type: actionTypes.SEARCH_BY_FILTERS,
                    items: result,
                    minimumPrice: filters.minimumPrice,
                    maximumPrice: filters.maximumPrice,
                    customfields: filters.customfields,
                    customValues: filters.customValues,
                });
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getAutoSuggestResults(searchString, searchBy, productType, callback) {
    if (searchBy === SEARCH_BY.COMPANIES) {
        axios({
            url: prefix + '/autosuggest/by-companies',
            params: { searchString }
        })
            .then((companiesData) => {
                callback({
                    searchResults: companiesData.data,
                    searchString
                });
            });
    } else {
        const recordTypes = productType
            ? Object.values(productTabs).find(value => value?.productType === productType)?.recordType
            : getProductTabsValues('recordType');

        const normalizeData = (data = {}) => {
            const result = {
                products: [],
                count: data?.products?.info?.totalHits
            };

            result.products = data?.products?.hits?.map((hit) => {
                return {
                    uid: hit.id,
                    name: hit.fields.recordName.join(','),
                    recordType: hit.fields.recordType[0],
                    dictId: hit.fields.dictId[0],
                    productType: getProductType(hit, productType)
                };
            });

            return result;
        };

        axios({
            url: prefix + '/autosuggest/srp-find',
            params: {
                searchString,
                category: searchBy,
                recordType: recordTypes
            }
        })
            .then((productsData) => {
                callback({
                    searchResults: normalizeData(productsData.data),
                    searchString
                });
            });
    }
}

function getSearchResults(searchString, searchBy, productType, callback) {
    return function(dispatch) {
        getAutoSuggestResults(searchString, searchBy, productType, (data) => {
            callback(data);
            return dispatch({ type: '' });
        });
    }
}

function setSearchString(searchString, searchBy,  productType, stringCountToTriggerSearch = 3) {
    return function(dispatch) {
        if (searchString.length < stringCountToTriggerSearch) {
            return dispatch({
                type: actionTypes.SET_SEARCH_RESULTS,
                searchResults: {},
                searchString
            });
        }

        getAutoSuggestResults(searchString, searchBy, productType, (data) => {
            return dispatch({
                type: actionTypes.SET_SEARCH_RESULTS,
                ...data
            });
        })
    };
}

const gotoSearchResultsPage = (searchString, searchBy) => {
    return function(dispatch) {
        dispatch({ type: ''});
        window.location.href = getSearchResultsPageRedirectUrl(searchString, searchBy);
    }
};

const setSearchCategory = (category) => {
    return function(dispatch) {
        return dispatch({
            type: actionTypes.SET_SEARCH_CATEGORY,
            category
        });
    };
};

const setSearchResultsItems = (items, totalRecords) => {
    return function(dispatch) {
        return dispatch({
            type: actionTypes.SET_SEARCH_RESULTS_ITEMS,
            items,
            totalRecords
        });
    };
};

const sortSearchResults = sortByColumn => {
    return function(dispatch, getState) {
        const { searchReducer } = getState();
        const {
            searchId: id,
            categories,
            keywords,
            appliedFilters: filters,
            sortBy,
            sortDirection
        } = searchReducer;
        let newSortDirection;

        if (sortBy && sortBy === sortByColumn) {
            newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            newSortDirection = 'asc';
        }
        axios({
            url: prefix + '/search/cgi-search/apply-filters',
            method: 'POST',
            data: {
                id,
                categories,
                keywords,
                filters,
                sortByColumn,
                sortDirection: newSortDirection
            }
        }).then(response => {
            const { items, totalRecords } = response.data;
            dispatch(setSearchResultsItems(items, totalRecords));
        });

        return dispatch({
            type: actionTypes.SET_SEARCH_RESULTS_SORTING,
            filters,
            sortByColumn,
            sortDirection: newSortDirection
        });
    };
}

const updateSearchResultsFilters = (filters, sortByColumn) => {
    return function(dispatch, getState) {
        const { searchReducer } = getState();
        const {
            searchId: id,
            categories,
            keywords
        } = searchReducer;

        axios({
            url: prefix + '/search/cgi-search/apply-filters',
            method: 'POST',
            data: {
                id,
                categories,
                keywords,
                filters
            }
        }).then(response => {
            const { items, totalRecords } = response.data;
            dispatch(setSearchResultsItems(items, totalRecords));
        });

        return dispatch({
            type: actionTypes.SET_SEARCH_RESULTS_FILTERS,
            filters
        });
    };
};

module.exports = {
    sortResult,
    changeResultDisplay,
    goToPage,
    searchByCategory,
    searchByFilters,
    setSearchString,
    gotoSearchResultsPage,
    setSearchCategory,
    updateSearchResultsFilters,
    sortSearchResults,
    getSearchResults,
};
