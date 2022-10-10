import React from 'react';
import { bool, func, object } from 'prop-types';
import { getAppPrefix } from '../../../../public/js/common';
import { isPremiumUserSku, isCompleteOnBoarding } from '../../../../utils';

const renderCompanyName = (companyInfo) => companyInfo.name || '';

const TemporaryPlug = ({ isCompanyAttachRequestSend }) => (
    <>
        {isCompanyAttachRequestSend &&
            <div className='company-block__temporary-plug'>
                <div className='company-block__temporary-plug-icon'>
                    <i className='far fa-clock' />
                </div>
                <span className='company-block__temporary-plug-message'>
                    Your company request is being processed
                </span>
            </div>}
        {!isCompanyAttachRequestSend &&
        <div className='company-block__temporary-plug__empty-company'>
            Your Company
        </div>}
    </>
);

const CompanyBlock = ({
    user,
    renderLink,
    showMenu
}) => {
    const { isCompanyAttachRequestSend } = user.flags || {};

    return (
        <>
            {isCompleteOnBoarding(user) && (
                <div className='company-block h-username' onClick={(e) => showMenu(e, 'company-block')}>
                    <span>{renderCompanyName((user && user.companyInfo) ? user.companyInfo : {})}</span>
                    <i className='fa fa-caret-down' aria-hidden='true' />
                    <ul className={`h-dd-menu hide-me ${isPremiumUserSku(user) ? 'company-block-dropdown' : 'company-block-dropdown-freemium-user'}`}>
                        {renderLink({
                            link: getAppPrefix() + '/company',
                            text: 'My Company Page'
                        })}
                        {renderLink({
                            link: getAppPrefix() + '/company/settings',
                            text: 'Update My Company Page'
                        })}
                    </ul>
                </div>
            )}
            {!isCompleteOnBoarding(user) && <TemporaryPlug isCompanyAttachRequestSend={!!isCompanyAttachRequestSend} />}
        </>);
};

CompanyBlock.propTypes = {
    renderLink: func,
    showMenu: func,
    user: object
};

TemporaryPlug.propTypes = {
    isCompanyAttachRequestSend: bool
};

export default CompanyBlock;
