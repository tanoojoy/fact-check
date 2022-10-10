import React from 'react';
import { isFreemiumUserSku, isPremiumUserSku } from '../../../../utils';
import { getAppPrefix } from '../../../../public/js/common';
import { LockAlerts } from './lock-alerts';
import { NoAlerts } from './no-alerts';
import { company as companyPPs } from '../../../../consts/page-params';
import { arrayOf, object, string } from 'prop-types';

export const CompanyAlerts = ({ alerts = [], user = {} }) => (
    <>
        {isFreemiumUserSku(user) && <LockAlerts type={companyPPs.title} />}
        {isPremiumUserSku(user) &&
        (alerts && alerts.length > 0
            ? alerts.map(alert => {
                return (
                    <div key={alert} className='company-profile__warning'>
                        <img
                            src={getAppPrefix() + '/assets/images/horizon/round_exclamation.svg'}
                            alt='warning'
                            className='company-profile__alert-icon'
                        />
                        {alert}
                    </div>
                );
            })
            : <NoAlerts type={companyPPs.title} />)}
    </>
);

CompanyAlerts.propTypes = {
    alerts: arrayOf(string),
    user: object
};
