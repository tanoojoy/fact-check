import React from 'react';
import ItemHeaderInfoBox from './common/item-header-info-box';

const PriceRange = ({ minPrice = '', maxPrice = '', updateItemData = () => null }) => {
	const onChange = (code, value) => {
        const re = new RegExp(/^\d*\.?\d*$/);
        if (!value || re.test(value)) {
            updateItemData(code, value || null, true);
        }
	}

	return (
		<ItemHeaderInfoBox title='API Price, $USD/kg' containerId="new-price-con">
        	<p className="price-input-container">
                <input 
                	type="text"
                	name="item-price"
                	id="item-price"
                	placeholder="from"
                	value={minPrice}
                	onChange={(e) => onChange('price-min', e.target.value)}
                    onBlur={() => updateItemData('price-min', Number(minPrice), true)}
            	/>
            	&nbsp;-&nbsp;
            	<input 
            		type="text"
            		name="txt-field"
            		value={maxPrice}
            		placeholder="to"
                	onChange={(e) => onChange('price-max', e.target.value)}
                    onBlur={() => updateItemData('price-max', Number(maxPrice), true)}
        		/>
            </p>
        </ItemHeaderInfoBox>
	);
}

export default PriceRange;