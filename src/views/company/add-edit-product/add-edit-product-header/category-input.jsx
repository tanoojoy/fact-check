import React from 'react';
import { productTabs } from '../../../../consts/product-tabs';
import { Search } from '../../../../consts/search-categories';
import { ADD_EDIT_PRODUCT_POPOVER } from '../../../../consts/popover-content';
import ItemCheckboxForm from '../common/item-checkbox-form';
import Popover from '../../../common/popover';

import ItemHeaderInfoBox from './common/item-header-info-box';

const { SEARCH_BY } = Search;
const { DOSE_FORM_CATEGORY } = ADD_EDIT_PRODUCT_POPOVER;

const DoseFormPopover = () => (
    <Popover
        id={DOSE_FORM_CATEGORY.id}
        iconClass={DOSE_FORM_CATEGORY.iconClass}
        trigger={DOSE_FORM_CATEGORY.trigger}
        autoHideIcon={DOSE_FORM_CATEGORY.autoHide}
        content={DOSE_FORM_CATEGORY.content}
        placement={DOSE_FORM_CATEGORY.placement}
    />
)

const CategoryInput = ({ 
    category = '',
    updateItemData = () => null,
    chooseProduct = () => null,
    resetToInitialItemData = () => null,
}) => {
    const isDoseForm = (categoryName) => categoryName === productTabs.DOSE_FORM.productType;
    const Categories = Object.values(productTabs).map(cat => ({ 
        label: cat.tab, 
        value: cat.productType,
        disabled: isDoseForm(cat.productType),
        popover: isDoseForm(cat.productType) && <DoseFormPopover />
    }));

    const onChange = (event) => {
        resetToInitialItemData();
        updateItemData('Categories', event.target.value);
        chooseProduct('');
        updateItemData('Name', '');
    }

    return (
        <div className="item-info-con item-category-checkbox">
            <ItemHeaderInfoBox title='Category' containerClass='clearfix'>
                <ItemCheckboxForm
                    id='product-category'
                    formName='Category'
                    data={Categories}
                    selected={category}
                    onChange={onChange}
                    addedCheckboxContainerClass='clearfix'
                />
            </ItemHeaderInfoBox>
        </div>
    );
};


export default CategoryInput;