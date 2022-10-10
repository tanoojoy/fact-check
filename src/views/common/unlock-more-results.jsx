import React from 'react';
import { isFreemiumUserSku } from '../../utils';
import {
    itemSearch as itemSearchPPs,
    product as productPPs,
    createRfq as createRfqPPs,
    viewRfq as viewRfqPPs,
    quotationTemplate as quotationTemplatePPs,
    company as companyPPs,
    inbox as inboxPPs,
    enquiry as enquiryPPs,
    companySettings as companySettingsPPs,
    createLicensingInquiry as createLicensingInquiryPPs,
    viewLicensingInquiry as viewLicensingInquiryPPs,
} from '../../consts/page-params';
import UpgradeToPremiumLink from './upgrade-to-premium-link';

const getMessage = (page) => {
    switch (page) {
    case itemSearchPPs.appString:
        return {
            header: 'Unlock More Results',
            message: 'Discover more partners with unlimited search results, filters and more.'
        };
    case productPPs.appString:
        return {
            header: 'Unlock More Insights',
            message: 'Make informed decisions with unlimited access to regulatory filings, GMP certificates and more.'
        };
    case createRfqPPs.appString:
    case viewRfqPPs.appString:
        return {
            header: 'Unlock Unlimited RFQs',
            message: 'Discover more partners and send unlimited requests for quotations.'
        };
    case createLicensingInquiryPPs.appString:
    case viewLicensingInquiryPPs.appString:
        return {
            header: 'Unlock Unlimited Licensing Inquiries',
            message: 'Discover more partners and send unlimited licensing inquiries.'
        };
    case quotationTemplatePPs.appString:
        return {
            header: 'Unlock More Quotes',
            message: 'Discover more customers and send unlimited quotes.'
        };
    case companyPPs.appString:
        return {
            header: 'Unlock More Insights',
            message: 'Make informed decisions with unlimited access to inspections, products, capabilities and more.'
        };
    case inboxPPs.appString:
    case enquiryPPs.appString:
        return {
            header: 'Unlock More Results',
            message: 'Discover more partners with additional insights on potential partners and unlimited use of search, chat and more.'
        };
    case companySettingsPPs.appString:
        return {
            header: 'Unlock More Features',
            message: 'Share more information about your company and products.'
        };
    default:
        return {
            header: 'Unlock More Results',
            message: 'Discover more partners with additional insights on potential partners and unlimited use of search, chat and more.'
        };
    }
};

const UnlockMoreResultsBanner = ({ user, page, getUpgradeToPremiumPaymentLink }) => {

    if (!(user && isFreemiumUserSku(user))) return null;

    const currentMessage = getMessage(page);

    return (
        <div className="freemium-banner-con">
            <i className="icon icon-blue-lock-freemium"></i>
            <div className="freemium-messages">
                
                <p className="title">{currentMessage.header}</p>
                <p className="content">{currentMessage.message}</p>
                <UpgradeToPremiumLink
                    user={user}
                    getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
                />
            </div>
        </div>
    );
}

export default UnlockMoreResultsBanner;
