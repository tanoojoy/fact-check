export const Search = {
    SEARCH_BY: {
        PRODUCTS: 'products',
        COMPANIES: 'companies',
        DOSE_FORMS: 'dose-forms',
        INACTIVE_INGREDIENTS: 'inactive-ingredients',
        INTERMEDIATE: 'intermediate',
        get DEFAULT_CATEGORY() { return this.PRODUCTS; }
    },
    TYPEAHEAD_BY: {
        PRODUCTS: 'products',
        COMPANIES: 'companies',
        get DEFAULT_CATEGORY() { return this.PRODUCTS; }
    },
    BANNER_SEARCH_BY: {
        PRODUCTS: 'products',
        COMPANIES: 'companies',
        get DEFAULT_CATEGORY() { return this.PRODUCTS; }
    }
};

export const SearchType = {
    companies: 'horizon-companies',
    products: 'horizon-products-companies',
    doseForms: 'horizon-dose-forms',
    inactiveIngredient: 'horizon-inactive-ingredients',
    intermediate: 'horizon-intermediates-reagents',
    typeaheadProducts: 'horizon-typeahead-products'
};

export const typeOfSearchBlock = {
    HEADER: 'header-search',
    BANNER: 'banner-search',
    ADD_EXIST_PRODUCT: 'add-exist-product-search',
    INTERMEDIATE_UPSTREAM_SUPPLY: 'intermediate-upstream-supply-search'
};

export const Categories = [
    {
        Name: 'API',
        SearchBy: Search.SEARCH_BY.PRODUCTS
    },
    {
        Name: 'Finished Dose',
        SearchBy: Search.SEARCH_BY.DOSE_FORMS
    },
    {
        Name: 'Excipients',
        SearchBy: Search.SEARCH_BY.INACTIVE_INGREDIENTS
    },
    {
        Name: 'Services',
        SearchBy: Search.SEARCH_BY.INTERMEDIATE
    }
]