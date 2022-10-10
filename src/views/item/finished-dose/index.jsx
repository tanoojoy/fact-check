import React from 'react';
import {
    AvailableDoseForms,
    BrandNames,
    CountriesLaunched,
    AssociatedCompanies,
    UpstreamSupply
} from './item-detail-sections';

const FinishedDoseDetails = ({
    itemDetails = {},
    user = {},
    itemViewType = ''
}) => {

    let { CustomFields = [], ID, MerchantDetail = {} } = itemDetails;
    const merchantCustomFields = MerchantDetail.CustomFields || []; 
    return (
        <>
            <div className="row-display-fix" id="first-row">
                <AvailableDoseForms customFields={CustomFields} />
            </div>
            <div className="single-row-fix">
                <BrandNames customFields={CustomFields} />
                <CountriesLaunched customFields={CustomFields} itemID={ID} />
            </div>
            <div className="row-display-fix" id="second-row">
                <AssociatedCompanies customFields={CustomFields} itemViewType={itemViewType} />
            </div>
            <UpstreamSupply customFields={CustomFields} />
        </>
    );
}


export default FinishedDoseDetails;