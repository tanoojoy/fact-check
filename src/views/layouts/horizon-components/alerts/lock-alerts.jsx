import React from 'react';
import LockSymbol from '../lock-symbol';
import { company as companyPPs } from '../../../../consts/page-params';
import { string } from 'prop-types';

export const LockAlerts = ({ type = companyPPs.title }) => {
    const text = type === companyPPs.title ? 'Company Alert' : 'Product Alert';
    const className = type === companyPPs.title ? 'company-profile__warning' : 'product-profile__warning';
    return (
        <div className={className}>
            <>
                <LockSymbol type='warn' />
                {text}
            </>
        </div>
    );
};

LockAlerts.propTypes = {
    type: string
};
