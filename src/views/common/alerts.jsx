'use strict';
import React from 'react';
import { isFreemiumUserSku, isPremiumUserSku } from '../../utils';
import { capitalize } from '../../scripts/shared/common';

const NoAlerts = () => (<div className="no-alerts">No Alerts Reported</div>);

const LockAlerts = ({ type = '' }) => (<Alert text={`${type} Alert`} iconClass="icon-lock" />);

const Alert = ({ text = '', iconClass = '' }) => {
	return (
		<div className="item-alerts" >
	        <i className={`icon ${iconClass || 'icon-attention-alerts'}`}/>&nbsp;
	        {`${capitalize(text)}`}
	    </div>
	)
};


const Alerts = ({ alerts, user, type}) => {

	const hasAlerts = alerts && alerts.length > 0;
	return (
		<>
        	{isFreemiumUserSku(user) && <LockAlerts type={type} />}
			{isPremiumUserSku(user) && hasAlerts && alerts.map((alert, index) => <Alert key={index} text={alert} />)}
			{isPremiumUserSku(user) && !hasAlerts && <NoAlerts />}
		</>
	)
}

export default Alerts;