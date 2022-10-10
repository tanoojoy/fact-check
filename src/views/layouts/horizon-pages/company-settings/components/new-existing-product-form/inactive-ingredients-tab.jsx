import React from 'react';
import { SearchBlockComponent } from '../../../../horizon-components/search-block';
import { Search, typeOfSearchBlock } from '../../../../../../consts/search-categories';
import { any, func, string } from 'prop-types';
import addProductTabs from './add-product-tabs';

const InactiveIngredientsTab = ({
    searchResults,
    searchString,
    setSearchString,
    chooseProduct,
    chosenProduct
}) => (
    <div className='inactive-ingredient'>
        <div className='inactive-ingredient__name'>Inactive Ingredient Name</div>
        <SearchBlockComponent
            clarifyingClassName={typeOfSearchBlock.ADD_EXIST_PRODUCT}
            placeholder='Start typing'
            searchCategory={Search.SEARCH_BY.PRODUCTS}
            gotoSearchResultsPage={(...args) => chooseProduct(...args, addProductTabs.INACTIVE_INGREDIENTS.productType)}
            searchResults={searchResults}
            setSearchString={(...args) => setSearchString(...args, addProductTabs.INACTIVE_INGREDIENTS.recordType)}
            searchString={searchString}
            defaultValue={chosenProduct}
            chooseProduct={(...args) => chooseProduct(...args, addProductTabs.INACTIVE_INGREDIENTS.productType)}
        />
    </div>
);

InactiveIngredientsTab.propTypes = {
    searchResults: any,
    searchString: string,
    setSearchString: func,
    chooseProduct: func,
    chosenProduct: string
};

export default InactiveIngredientsTab;
