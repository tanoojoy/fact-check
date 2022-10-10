import React from 'react';
import { func, string, any, object } from 'prop-types';
import { quoteStatuses } from '../../../../consts/rfq-quote-statuses';
import { userRoles } from '../../../../consts/horizon-user-roles';
import { Currencies } from '../../../../consts/currencies';
import { PrimaryButton, SecondaryButton } from '../buttons';
import { isFreemiumUserSku } from '../../../../utils';
import { getLimits, FREEMIUM_LIMITATION_POSITION } from '../limitation-block-freemium';
import getSymbolFromCurrency from 'currency-symbol-map';

const QuotationPriceFormFooter = ({
    quoteDetails = {},
    createQuote,
    cancelQuote,
    acceptQuote,
    declineQuote,
    userRole = {},
    user = {}
}) => {
    const decline = () => {
        quoteDetails.status = quoteStatuses.declined;
        declineQuote(quoteDetails);
    };

    const accept = () => {
        quoteDetails.status = quoteStatuses.accepted;
        acceptQuote(quoteDetails);
    };

    if (userRole === userRoles.subMerchant && !quoteDetails.id) {
        const areFilledRequiredFileds = quoteDetails.shelfLife && quoteDetails?.validDate;
        const limits = getLimits(FREEMIUM_LIMITATION_POSITION.quote, user?.flags);
        const disabled = (isFreemiumUserSku(user) && limits.current >= limits.limit) || !areFilledRequiredFileds;

        return (
            <div className='quotation-price-form-footer'>
                <SecondaryButton onClick={() => cancelQuote(quoteDetails)}>Decline</SecondaryButton>
                <PrimaryButton onClick={createQuote} disabled={disabled}>Submit</PrimaryButton>
            </div>
        );
    }

    if (userRole === userRoles.subBuyer && quoteDetails.status === quoteStatuses.pending) {
        return (
            <div className='quotation-price-form-footer'>
                <SecondaryButton onClick={decline}>Decline</SecondaryButton>
                <PrimaryButton onClick={accept}>Accept</PrimaryButton>
            </div>
        );
    }

    return null;
};

const QuotationPriceForm = ({
    quoteDetails = {},
    rfqDetails = {},
    createQuote,
    cancelQuote,
    acceptQuote,
    declineQuote,
    userInfo = {},
    user = {}
}) => {
    const userRole = userInfo.role;
    const checkValues = () => {
        const { validDate, shelfLife } = quoteDetails;
        if (validDate && shelfLife) {
            createQuote(quoteDetails);
        }
    };

    const { codes } = Currencies;
    const symbol = getSymbolFromCurrency(codes[rfqDetails?.preferredCurrency] || '') || '$';
    const code = codes[rfqDetails?.preferredCurrency] || 'USD';

    return (
        <div className='quotation-price-form'>
            <div className='quotation-price-form-header'>Quotation Price</div>
            <div className='quotation-price-form-body'>
                <div className='total-cost-title'>Total Cost</div>
                <div className='total-cost-value'>
                    <div className='currency'>{`${code} ${symbol}`}</div>
                    <div className='currency-value'>{quoteDetails.price}</div>
                </div>
            </div>
            <QuotationPriceFormFooter
                createQuote={checkValues}
                cancelQuote={cancelQuote}
                quoteDetails={quoteDetails}
                acceptQuote={acceptQuote}
                declineQuote={declineQuote}
                userRole={userRole}
                user={user}
            />
        </div>
    );
};

QuotationPriceForm.propTypes = {
    quoteDetails: any,
    rfqDetails: any,
    createQuote: func,
    cancelQuote: func,
    acceptQuote: func,
    declineQuote: func,
    userInfo: any,
    user: object
};

QuotationPriceFormFooter.propTypes = {
    quoteDetails: any,
    createQuote: func,
    cancelQuote: func,
    acceptQuote: func,
    declineQuote: func,
    userRole: string,
    user: object
};

export default QuotationPriceForm;
