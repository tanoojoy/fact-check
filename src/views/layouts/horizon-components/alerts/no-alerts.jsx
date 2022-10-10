import React from 'react';
import { company as companyPPs } from '../../../../consts/page-params';
import { string } from 'prop-types';

export const NoAlerts = ({ type = companyPPs.title }) => {
    const className = type === companyPPs.title ? 'company-profile__no-warnings' : 'product-profile__no-warnings';
    return (
        <div className={className}>
            No Alerts Reported
        </div>
    );
};

NoAlerts.propTypes = {
    type: string
};
