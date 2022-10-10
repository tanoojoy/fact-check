import React, { useState } from 'react';
import { getAppPrefix } from '../../../../public/js/common';
import { productTabs } from '../../../../consts/product-tabs';
import { getCustomFieldValues } from '../../../../utils';

import ItemHeaderInfoBox from './common/item-header-info-box';
import PriceRange from './price-range';
import CategoryInput from './category-input';
import ProductName from './product-name';

const { API } = productTabs;

const CancelButton = () => (
	<a className="item-upload-cancel" href="#" onClick={(e) => e.preventDefault()}>
		<i 
            className="icon item-upload-cancel-image" 
            onClick={() => window.location.href = `${getAppPrefix()}/company/settings?activeTab=Product List`}
        />
	</a>
);

const AddEditProductHeader = ({ 
	user = {}, 
	predefinedValues = {},
	item = {},
	isEditPageType = true,
	updateItemData = () => null,
    chooseProduct = () => null,
    handleStateChange = () => null,
    resetToInitialItemData = () => null,
    getSearchResults = () => null
}) => {
	const { MerchantDetail = {}, CustomFields, Categories, Name = '' } = item;

    const casNumber = getCustomFieldValues(CustomFields, 'cas', 'Name');

    const minPrice = getCustomFieldValues(CustomFields, 'price-min', 'Code') || '';
    const maxPrice = getCustomFieldValues(CustomFields, 'price-max', 'Code') || '';

    const category = (Categories && Categories[0] && Categories[0].Name) || 'Unknown';
	return (
		<div className="cortellis-item-upload-header">
            <div className="container" id="store-container-one">
            	<CancelButton />
                {
                	!isEditPageType && 
                	<CategoryInput 
	                	category={category}
	                	updateItemData={updateItemData}
                        chooseProduct={chooseProduct}
                        resetToInitialItemData={resetToInitialItemData}
	                />
	            }
                <ProductName
                	item={item}
                	value={Name}
                	category={category}
                	updateItemData={updateItemData}
                	getSearchResults={getSearchResults}
                	readOnly={isEditPageType}
                    chooseProduct={chooseProduct}
                />
                <div className="item-info-con">
                    <ItemHeaderInfoBox title='Manufacturer'>
	                    <p>
	                    	<input 
	                    		type="text"
	                    		name="txt-field"
	                    		value={MerchantDetail.DisplayName || 'Unknown'}
	                    		disabled
	                    	/>
	                    </p>
	                </ItemHeaderInfoBox>
                    {
                        category === API.productType && 
                        <ItemHeaderInfoBox title='CAS Number'>
                        	<p>
                            	<input 
                            		type="text"
                            		name="sku-field"
                            		id="item-sku"
                            		value={casNumber || 'Unknown'}
                            		disabled
                        		/>
                        	</p>
                        </ItemHeaderInfoBox>
                    }
                    <ItemHeaderInfoBox title='Category'>
                        <p>
                        	<input 
                        		type="text"
                        		name="category-read-only"
                        		id="item-category"
                        		value={category}
                        		disabled
                    		/>
                    	</p>
                    </ItemHeaderInfoBox>
                    {
                        category === API.productType &&
                        <PriceRange 
                            updateItemData={updateItemData}
                            minPrice={minPrice}
                            maxPrice={maxPrice} 
                        />
                    }
                </div>
            </div>
		</div>
	);
}

export default AddEditProductHeader;