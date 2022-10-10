import React from 'react';
import UpstreamSupply from './upstream-supply';
import ManufacturingStatus  from './manufacturing-status';
import SpecialOfferBulkDeal from './special-offer';
import RegulatoryFilings from './regulatory-filings';
import GmpCertificates from './gmp-certificates';
import ProductAlerts from './product-alerts';
import AdditionalProductInformation from './additional-product-information';

const AddEditAPIProductMain = ({ 
	user = {}, 
	predefinedValues = {},
	item = {},
	referenceItem = {},
	updateModalVisibility = () => null,
	updateItemData = () => null,
    updateSelectedRowInfo = () => null,
    handleStateChange = () => null,
    specialOffer = {},
    alerts = {},
    documents = [],
    manufacturerOfIntermediatesActive = false,
    manufacturerOfRawMaterialsActive = false
}) => {

	const manufacturingStatuses = predefinedValues.manufacturingStatuses || [];
	const specialOfferOptions = predefinedValues.specialOffers || [];
    const regFilings = predefinedValues.regFilings || [];
    const regFilingsStatuses = predefinedValues.regFilingsStatuses || [];
    const gmpCertificateOptions = predefinedValues.gmpCertificates || [];
    const gmpStatuses = predefinedValues.gmpStatuses || [];
    const productAlertOptions = predefinedValues.alerts || [];

	return (
		<div className="container">
            <div className="section-description new-cortellis-design">
                <div className="h-body display-Flex">
                	<ManufacturingStatus 
                		item={item}
                		referenceItem={referenceItem}
                		manufacturingStatuses={manufacturingStatuses}
                		updateModalVisibility={updateModalVisibility}
                		updateItemData={updateItemData}
                	/>
                	<SpecialOfferBulkDeal 
                        specialOffer={specialOffer}
                		specialOfferOptions={specialOfferOptions}
                        handleStateChange={handleStateChange}
                	/>
                </div>
            </div>
            <div className="section-description new-cortellis-design">
                <div className="h-body display-Flex">
                    <RegulatoryFilings
                        user={user}
                        item={item}
                        regFilings={regFilings}
                        regFilingsStatuses={regFilingsStatuses}
                        updateModalVisibility={updateModalVisibility}
                        updateItemData={updateItemData}
                        referenceItem={referenceItem}
                        updateSelectedRowInfo={updateSelectedRowInfo}
                    />
                    <GmpCertificates 
                        user={user}
                        item={item}
                        gmpCertificateOptions={gmpCertificateOptions}
                        gmpStatuses={gmpStatuses}
                        updateModalVisibility={updateModalVisibility}
                        updateItemData={updateItemData}
                        referenceItem={referenceItem}
                        updateSelectedRowInfo={updateSelectedRowInfo}
                    />
                </div>
            </div>
            <UpstreamSupply
                item={item}
                updateItemData={updateItemData}
                updateModalVisibility={updateModalVisibility}
                handleStateChange={handleStateChange}
                manufacturerOfIntermediatesActive={manufacturerOfIntermediatesActive}
                manufacturerOfRawMaterialsActive={manufacturerOfRawMaterialsActive}
            />
            <div className="section-description new-cortellis-design">
                <div className="h-body display-Flex">
                    <ProductAlerts
                        alerts={alerts}
                        productAlertOptions={productAlertOptions}
                        handleStateChange={handleStateChange}
                    />
                    <AdditionalProductInformation
                        updateModalVisibility={updateModalVisibility}
                        updateSelectedRowInfo={updateSelectedRowInfo}
                        documents={documents}
                    />
                </div>
            </div>
        </div>
	);
}

export default AddEditAPIProductMain;