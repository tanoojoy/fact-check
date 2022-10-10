import React from 'react';
import { PRODUCTS_MORE_INFO_DESCRIPTION } from '../../../consts/more-info';
import { product as productPPs } from '../../../consts/page-params';
import { isFreemiumUserSku, getCustomFieldValues } from '../../../utils';
import { 
    ManufacturingStatus,
    SpecialOffer,
    RegulatoryFilings,
    GMPCertificates,
    UpstreamSupply,
} from './item-detail-sections';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';

const ProductDetails = ({
    itemDetails = {},
    user = {},
    getUpgradeToPremiumPaymentLink = () => null,
    handleVerifyClick = () => null,
    isUserLinkedToSupplier = false,
}) => {

    let { CustomFields = [], MerchantDetail = {}  } = itemDetails;
    const isFreemiumUser = user && isFreemiumUserSku(user);

	return (
        <>
            <div className="row-display-fix" id="first-row">
                <ManufacturingStatus
                    isFreemiumUser={isFreemiumUser}
                    customFields={CustomFields}
                    isUserLinkedToSupplier={isUserLinkedToSupplier}
                    handleVerifyClick={handleVerifyClick}
                />
                <SpecialOffer />
            </div>
            <div className="row-display-fix" id="second-row">
                <RegulatoryFilings
                    supplierID={MerchantDetail?.ID}
                    isFreemiumUser={isFreemiumUser}
                    customFields={CustomFields}
                    isUserLinkedToSupplier={isUserLinkedToSupplier}
                    handleVerifyClick={handleVerifyClick}
                />
                <GMPCertificates
                    supplierID={MerchantDetail?.ID}
                    isFreemiumUser={isFreemiumUser}
                    customFields={CustomFields}
                    isUserLinkedToSupplier={isUserLinkedToSupplier}
                    handleVerifyClick={handleVerifyClick}
                />
            </div>
            <UpstreamSupply 
                customFields={CustomFields}
                isFreemiumUser={isFreemiumUser}
                isUserLinkedToSupplier={isUserLinkedToSupplier}
            />
            <UnlockMoreResultsBanner 
                user={user}
                getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
                page={productPPs.appString} 
            />
        </>
	);
}

export default ProductDetails;