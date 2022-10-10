import React from 'react';
import { object, string } from 'prop-types';
import { isFreemiumUserSku } from '../../../utils';
import {
    itemSearch as itemSearchPPs,
    product as productPPs,
    createRfq as createRfqPPs,
    viewRfq as viewRfqPPs,
    quotationTemplate as quotationTemplatePPs,
    company as companyPPs,
    inbox as inboxPPs,
    enquiry as enquiryPPs,
    companySettings as companySettingsPPs
} from '../../../consts/page-params';
import UpgradeToPremiumLink from './upgrade-to-premium-link';

const getMessage = (page) => {
    switch (page) {
    case itemSearchPPs.appString:
        return {
            header: 'Unlock More Results',
            message: <span>Discover more partners with unlimited search results, filters and more.<br /><UpgradeToPremiumLink /></span>
        };
    case productPPs.appString:
        return {
            header: 'Unlock More Insights',
            message: <span>Make informed decisions with unlimited access to regulatory filings, GMP certificates and more.<br /><UpgradeToPremiumLink /></span>
        };
    case createRfqPPs.appString:
    case viewRfqPPs.appString:
        return {
            header: 'Unlock Unlimited RFQs',
            message: <span>Discover more partners and send unlimited requests for quotations.<br /><UpgradeToPremiumLink /></span>
        };
    case quotationTemplatePPs.appString:
        return {
            header: 'Unlock More Quotes',
            message: <span>Discover more customers and send unlimited quotes.<br /><UpgradeToPremiumLink /></span>
        };
    case companyPPs.appString:
        return {
            header: 'Unlock More Insights',
            message: <span>Make informed decisions with unlimited access to inspections, products, capabilities and more.<br /><UpgradeToPremiumLink /></span>
        };
    case inboxPPs.appString:
    case enquiryPPs.appString:
        return {
            header: 'Unlock More Results',
            message: <span>Discover more partners with additional insights on potential partners and unlimited use of search, chat and more.<br /><UpgradeToPremiumLink /></span>
        };
    case companySettingsPPs.appString:
        return {
            header: 'Unlock More Features',
            message: <span>Share more information about your company and products.<br /><UpgradeToPremiumLink /></span>
        };
    default:
        return {
            header: 'Unlock More Results',
            message: <span>Discover more partners with additional insights on potential partners and unlimited use of search, chat and more.&nbsp; <UpgradeToPremiumLink /> or find out more.</span>
        };
    }
};

const UnlockMoreResultsBanner = ({ user, page }) => {
    if (isFreemiumUserSku(user)) {
        const currentMessage = getMessage(page);

        return (
            <div className='unlock-more-results-banner__container'>
                <div className='unlock-more-results-banner__image' />
                <div className='unlock-more-results-banner__message'>
                    <div className='unlock-more-results-banner__message-header'>
                        {currentMessage.header}
                    </div>
                    <div className='unlock-more-results-banner__message-body'>
                        {currentMessage.message}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

UnlockMoreResultsBanner.propTypes = {
    user: object.isRequired,
    page: string
};

export default UnlockMoreResultsBanner;
