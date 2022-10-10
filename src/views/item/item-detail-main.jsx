import React, { useState, useEffect } from 'react';
import { PRODUCTS_MORE_INFO_DESCRIPTION } from '../../consts/more-info';
import { getCustomFieldValues } from '../../utils';

import ProductDetails from './product';
import FinishedDoseDetails from './finished-dose';

import RequestForQuotation from './request-for-quotation';
import AdditionalInformation from '../common/additional-information';
import MoreInformation from '../common/more-information';

import { productTabs } from '../../consts/product-tabs';

const { API, DOSE_FORM } = productTabs;

const ItemDetailMain = ({
    itemDetails = {},
    user = {},
    getUpgradeToPremiumPaymentLink = () => null,
    handleVerifyClick = () => null,
    itemViewType = '',
    isUserLinkedToSupplier = false
}) => {
    const [moreInfoLink, setMoreLinkInfo] = useState('/generics/');
    let { CustomFields = [], ID = null, MerchantDetail = {} } = itemDetails;
    const merchantCustomFields = MerchantDetail.CustomFields || []; 
 
    useEffect(() => {
        setMoreLinkInfo(itemDetails?.ID > 0? `/generics/product/${ID}/keyinsights` : '/generics/');
    }, [itemDetails]);

    const getItemCategoryName = () => {
        if (itemDetails && itemDetails.Categories) {
            const { Categories = [] } = itemDetails;
            return (Categories && Categories[0] && Categories[0].Name) || '';
        }
        return null;
    }
    const categoryName = getItemCategoryName();
    const isFinishedDose = categoryName && categoryName === DOSE_FORM.productType;

	return (
		<div className="row storefront-stuffs" id="item-details">
            <div className="container">
                <div className="col-md-8">

                {
                    categoryName &&
                    categoryName === API.productType &&
                    <ProductDetails 
                        itemDetails={itemDetails}
                        user={user}
                        getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
                        handleVerifyClick={handleVerifyClick}
                        isUserLinkedToSupplier={isUserLinkedToSupplier}
                    />
                }
                {
                    categoryName &&
                    categoryName === DOSE_FORM.productType &&
                    <FinishedDoseDetails 
                        itemDetails={itemDetails}
                        user={user}
                        itemViewType={itemViewType}
                    />
                }
                </div>
                <div className="col-md-4">
                    <RequestForQuotation 
                        user={user}
                        itemDetails={itemDetails}
                        isFinishedDose={isFinishedDose}
                        isUserLinkedToSupplier={isUserLinkedToSupplier}
                    />
                    <AdditionalInformation type='Product' />
                    <MoreInformation description={PRODUCTS_MORE_INFO_DESCRIPTION} moreInfoLink={moreInfoLink} />
                </div>
            </div>
        </div>
	);
}

export default ItemDetailMain;