import React, { useState, useEffect } from 'react';
import { isFreemiumUserSku } from '../../utils';
import UpgradeToPremiumLink from './upgrade-to-premium-link';

const UpgradeToPremiumTopBanner = ({ user, getUpgradeToPremiumPaymentLink }) => {
	
	useEffect(() => {
		if (isFreemiumUserSku(user)) {
			$('#root').parent().addClass('upgrade');
		}
	});

	if (!(user && isFreemiumUserSku(user))) return null;
	return (
		<div className='freemium-header-banner'>
            <p>
                Make more connections with unlimited insights and usage. &nbsp;
            	<UpgradeToPremiumLink 
            		user={user}
            		getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink} 
        		/>.
            </p>
        </div>
	)

}

export default UpgradeToPremiumTopBanner;