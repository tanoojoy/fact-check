export const productTabs = {
    API: {
        tab: 'API',
        recordType: ['productName', 'productSynonym'],
        productType: 'API',
        searchProductType: 'api' // for companies-products-preview
    },
    DOSE_FORM: {
        tab: 'Dose Form',
        recordType: ['productName', 'productSynonym', 'compoundName'],
        productType: 'Finished Dose',
        searchProductType: 'finished_dose' // for companies-products-preview
    },
    INTERMEDIATE: {
        tab: 'Intermediate/Reagent',
        recordType: 'intermediate',
        productType: 'Intermediate',
        searchProductType: 'intermediates_reagents' // for companies-products-preview
    },
    INACTIVE_INGREDIENTS: {
        tab: 'Inactive Ingredient',
        recordType: 'inactiveIngredient',
        productType: 'Inactive Ingredient',
        searchProductType: 'inactive_ingredients' // for companies-products-preview
    }
};
