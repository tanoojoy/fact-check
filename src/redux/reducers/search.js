import actionTypes from '../actionTypes';
import { Search } from '../../consts/search-categories';

const { SEARCH_BY } = Search;
const initialState = {
    items: [],
    totalRecords: 0,
    keywords: null,
    tags: [],
    withChildItems: true,
    pageSize: 20,
    pageNumber: 1,
    sort: null,
    minimumPrice: null,
    maximumPrice: null,
    categories: null,
    customFields: null,
    currencyCode: null,
    resultDisplayBehavior: 'list',
    breadcrumbText: '',
    customFilters: [],
    priceRange: null,
    customValues: null,
    ReviewAndRating: '',
    searchCategory: SEARCH_BY.DEFAULT_CATEGORY,
    countriesList: [],
    corporateApiRatingList: [],
    appliedFilters: [],
    hideSearchBar: false,
};

function searchReducer(state = initialState, action) {
    switch (action.type) {
    case actionTypes.SEARCH_BY_FILTERS: {
        return Object.assign({}, state, {
            items: action.items.Records,
            pageSize: action.items.PageSize,
            priceRange: action.items && action.items.Meta && action.items.Meta.PriceRange ? action.items.Meta.PriceRange : null,
            totalRecords: action.items.TotalRecords,
            pageNumber: action.items.PageNumber,
            minimumPrice: action.minimumPrice,
            maximumPrice: action.maximumPrice,
            customFields: action.customFields,
            customValues: action.customValues,
            ReviewAndRating: action.ReviewAndRating
        });
    }
    case actionTypes.SORT_SEARCH_RESULT: {
        return Object.assign({}, state, {
            items: action.items.Records,
            sort: action.sort
        });
    }
    case actionTypes.SET_SEARCH_RESULT_DISPLAY: {
        return Object.assign({}, state, {
            resultDisplayBehavior: action.resultDisplayBehavior
        });
    }
    case actionTypes.SEARCH_BY_CATEGORY: {
        return Object.assign({}, state, {
            items: action.items.Records,
            pageSize: action.items.PageSize,
            priceRange: action.items && action.items.Meta && action.items.Meta.PriceRange ? action.items.Meta.PriceRange : null,
            totalRecords: action.items.TotalRecords,
            pageNumber: action.items.PageNumber,
            categories: action.categories,
            breadcrumbText: action.categories !== null ? action.categories[0].Name : '',
            customFilters: action.customFilters
        });
    }
    case actionTypes.GO_TO_PAGE: {
        return Object.assign({}, state, {
            items: action.items.Records,
            pageSize: action.items.PageSize,
            totalRecords: action.items.TotalRecords,
            pageNumber: action.items.PageNumber
        });
    }
    case actionTypes.SET_SEARCH_STRING: {
        return Object.assign({}, state, {
            searchString: action.setSearchString
        });
    }
    case actionTypes.GO_TO_SEARCH_RESULTS_PAGE: {
        return Object.assign({}, state, {
            gotoSearchResultsPage: action.gotoSearchResultsPage
        });
    }
    case actionTypes.SET_SEARCH_CATEGORY: {
        return Object.assign({}, state, {
            searchCategory: action.category,
            searchResults: {},
            searchString: ''
        });
    }
    case actionTypes.SET_SEARCH_RESULTS: {
        return Object.assign({}, state, {
            searchResults: action.searchResults,
            searchString: action.searchString
        });
    }
    case actionTypes.SET_SEARCH_RESULTS_FILTERS: {
        return Object.assign({}, state, {
            appliedFilters: [...action.filters],
            sortBy: null
        });
    }
    case actionTypes.SET_SEARCH_RESULTS_SORTING: {
        return Object.assign({}, state, {
            sortBy: action.sortByColumn,
            sortDirection: action.sortDirection
        });
    }
    case actionTypes.SET_SEARCH_RESULTS_ITEMS: {
        return Object.assign({}, state, {
            items: [...action.items],
            totalRecords: action.totalRecords
        });
    }
    default:
        return state;
    }
}

module.exports = {
    searchReducer: searchReducer
};
