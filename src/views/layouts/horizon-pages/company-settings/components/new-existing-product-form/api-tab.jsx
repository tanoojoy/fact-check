import React from 'react';
import { SearchBlockComponent } from '../../../../horizon-components/search-block';
import { Search, typeOfSearchBlock } from '../../../../../../consts/search-categories';
import addProductTabs from './add-product-tabs';
import { any, func, string } from 'prop-types';

const ApiTab = ({
    searchResults,
    searchString,
    setSearchString,
    chooseProduct,
    chosenProduct
}) => (
    <div className='api-tab'>
        <div className='api-tab__name'>API Name</div>
        <SearchBlockComponent
            clarifyingClassName={typeOfSearchBlock.ADD_EXIST_PRODUCT}
            placeholder='Start typing'
            searchCategory={Search.SEARCH_BY.PRODUCTS}
            gotoSearchResultsPage={(...args) => chooseProduct(...args, addProductTabs.API.productType)}
            searchResults={searchResults}
            setSearchString={(...args) => setSearchString(...args, addProductTabs.API.recordType)}
            searchString={searchString}
            defaultValue={chosenProduct}
            chooseProduct={(...args) => chooseProduct(...args, addProductTabs.API.productType)}
        />
    </div>
);

ApiTab.propTypes = {
    searchResults: any,
    searchString: string,
    setSearchString: func,
    chooseProduct: func,
    chosenProduct: string
};

export default ApiTab;
