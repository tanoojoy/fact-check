import React, { useState, useEffect } from 'react';
import { productTabs } from '../../../../consts/product-tabs';
import { ADD_EDIT_PRODUCT_POPOVER } from '../../../../consts/popover-content';
import { Search } from '../../../../consts/search-categories';
import { getCustomFieldValues, getRecordTypesByProductType } from '../../../../utils';
import ItemCheckboxForm from '../common/item-checkbox-form';
import AutoSuggest from '../../../common/search-panel/auto-suggest/index';
import ItemHeaderInfoBox from './common/item-header-info-box';
import Popover from '../../../common/popover';

const { SEARCH_BY } = Search;
const { PRODUCT_NOT_FOUND } = ADD_EDIT_PRODUCT_POPOVER;

const NoProductFoundPopover = () => (
    <Popover
        id={PRODUCT_NOT_FOUND.id}
        iconClass={PRODUCT_NOT_FOUND.iconClass}
        trigger={PRODUCT_NOT_FOUND.trigger}
        autoHideIcon={PRODUCT_NOT_FOUND.autoHide}
        content={PRODUCT_NOT_FOUND.content}
        placement={PRODUCT_NOT_FOUND.placement}
    />
)

const ProductName = ({
	value = '',
	category = '',
	readOnly = true,
	updateItemData = () => null,
	getSearchResults = () => null,
    chooseProduct = () => null,
}) => {

    const [suggestions, setSuggestions] = useState([]);
    const onChange = (event) => {
    	const itemName = event.target.value;
        setSuggestions([]);
        chooseProduct('');
    	updateItemData('Name', itemName);
    	getSearchResults(itemName, SEARCH_BY.PRODUCTS, category, ({ searchResults = {} }) => setSuggestions(searchResults));
    }

    const isAutoSuggestActive = !readOnly && value && suggestions && suggestions.count > 0;
    const title = (<>Product Name &nbsp; <NoProductFoundPopover /> </>);
    return (
        <div className={`clearfix product-name-con ${(isAutoSuggestActive && 'active') || ''}`}>
            {!readOnly && <ItemHeaderInfoBox title={title} />}
			<input 
				type="text"
				className="item-name required"
				name="item-name"
				id="item-name"
				value={value}
				onChange={onChange}
				disabled={readOnly}
			/>
            {
                isAutoSuggestActive &&
                <AutoSuggest 
                    activeSearchCategory={SEARCH_BY.PRODUCTS}
                    searchResults={suggestions}
                    searchString={value}
                    gotoSearchResultsPage={chooseProduct}
                    showLabelAndCount={false}
                />
            }
        </div>
    );   
}

export default ProductName;