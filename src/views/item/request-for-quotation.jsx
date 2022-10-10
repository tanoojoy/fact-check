import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { getAppPrefix } from '../../public/js/common';
import VerifiedStatus from '../common/verified-status';
import { 
    userHasCompany,
    isCompleteOnBoarding,
    getCustomFieldValues,
    isCompanyAttachRequestSend
} from '../../utils';
import { userRoles } from '../../consts/horizon-user-roles';
import { userRole } from '../../utils';

const getRFQCardLabels = (isFinishedDose) => {
    let title = 'Request for Quotation';
    let description = 'Send a request for quote and chat directly to the manufacturer for this product.';
    let buttonText = 'Create RFQ';
    let guideMessage  = 'To send a message without RFQ, chat directly from the manufacturer\'s profile page.';
    if (isFinishedDose) {
        title = 'Licensing Inquiry';
        description = 'Send a licensing inquiry for this product.';
        buttonText = 'Create Licensing Inquiry';
        guideMessage = 'To send a message, use the chat option from the manufacturer or marketer profile page.';
    }

    return {
        title,
        description,
        buttonText,
        guideMessage
    }
}

export const RequestForQuotation = ({ 
    user = {},
    itemDetails = {},
    isFinishedDose = false,
    isUserLinkedToSupplier = false
}) => {

    let { MerchantDetail = {} , ID } = itemDetails;
    let { CustomFields = [] } = MerchantDetail;
    
    const [rfqBtnDisabled, setRfqBtnDisabled] = useState(true);
    const [rfqTooltip, setRfqTooltip] = useState('');
    const [createRFQLink, setLink] = useState('#');
    const [isSubBuyer, setSubBuyer] = useState(false);

    const getCreateRFQLink = () => (
        !rfqBtnDisabled ? 
        `${getAppPrefix()}/product-profile/${MerchantDetail.ID}/${ID}/${isFinishedDose ? 'createlicensinginquiry' : 'createrfq'}` 
        : '#'
    );
    
    useEffect(() => {
        const { disabled, tooltipText } = getRFQConfig();
        setRfqBtnDisabled(disabled);
        setRfqTooltip(tooltipText);
    }, [user, isSubBuyer, itemDetails, isUserLinkedToSupplier]);

    useEffect(() => {
        setSubBuyer(user?.role === userRoles.subBuyer);
    }, [user]);

    useEffect(() => {
        setLink(getCreateRFQLink());
    }, [rfqBtnDisabled, isFinishedDose])

    const getRFQConfig = () => {
        
        let tooltipText = '';
        let disabled = true;

        const role = userRole(user);
        const hasOngoingCompanyAttachRequest = isCompanyAttachRequestSend(user) && !userHasCompany(user);
        const isFullyOnboardedUser = (isCompleteOnBoarding(user) || !hasOngoingCompanyAttachRequest);

        const companySellerCount = getCustomFieldValues(CustomFields, 'companyUsers-sellers-count', 'Code');
        const supplierWithSellers = companySellerCount && companySellerCount > 0;

        if (!role || (isSubBuyer && !isFullyOnboardedUser)) {
            tooltipText =  'To activate this feature, complete your onboarding from the button in the header';
        } else if (isUserLinkedToSupplier) {
            tooltipText = 'This product belongs to your company. This feature is enabled for other visitors to your product page.';
        } else if (!supplierWithSellers) {
            tooltipText = 'RFQ functionality is currently unavailable for this manufacturer.';
        } else if (isSubBuyer && hasOngoingCompanyAttachRequest) {
            tooltipText = 'This feature will activate when your company request is approved.';
        } else {
            disabled = false;
        }
        return { disabled, tooltipText };
    }

    const { 
        title,
        description,
        buttonText,
        guideMessage
    } = getRFQCardLabels(isFinishedDose);

    if (!isSubBuyer) return null;
    return (
        <div className="store-new-con-request-for-quotation">
            <p className="right-title">{title}</p>
            <p className="supporting-message-present">{description}</p>
            <a 
                id="rfq-button"
                className={`rfq-button ${rfqBtnDisabled ? 'rfq-button-disabled' : ''}`}
                href={createRFQLink}
            >
                {buttonText} &nbsp;
                {rfqTooltip && <span className="tooltiptext">{rfqTooltip}</span>}
            </a>
            <p className="little-instruction">{guideMessage}</p>
            <div className="rfq-info">
                <i className="icon icon-attention-blue" />&nbsp;
                <span className="attention-text">
                    Information such as price and lead time will be provided by the manufacturer
                </span>
            </div>
        </div>
    );
}

export default RequestForQuotation;