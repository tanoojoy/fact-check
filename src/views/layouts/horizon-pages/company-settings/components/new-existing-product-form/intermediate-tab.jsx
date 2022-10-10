import React from 'react';
import { SearchBlockComponent } from '../../../../horizon-components/search-block';
import { Search, typeOfSearchBlock } from '../../../../../../consts/search-categories';
import addProductTabs from './add-product-tabs';
import { any, func, string } from 'prop-types';

const IntermediateTab = ({
    searchResults,
    searchString,
    setSearchString,
    chooseProduct,
    chosenProduct
}) => {
    return (
        <div className='intermediate-tab'>
            <div className='intermediate-tab__name'>Intermediate/Reagent Name</div>
            <SearchBlockComponent
                clarifyingClassName={typeOfSearchBlock.ADD_EXIST_PRODUCT}
                placeholder='Start typing'
                searchCategory={Search.SEARCH_BY.PRODUCTS}
                gotoSearchResultsPage={(...args) => chooseProduct(...args, addProductTabs.INTERMEDIATE.productType)}
                searchResults={searchResults}
                setSearchString={(...args) => setSearchString(...args, addProductTabs.INTERMEDIATE.recordType)}
                searchString={searchString}
                defaultValue={chosenProduct}
                chooseProduct={(...args) => chooseProduct(...args, addProductTabs.INTERMEDIATE.productType)}
            />
        </div>
    );
};

IntermediateTab.propTypes = {
    searchResults: any,
    searchString: string,
    setSearchString: func,
    chooseProduct: func,
    chosenProduct: string
};

export default IntermediateTab;
