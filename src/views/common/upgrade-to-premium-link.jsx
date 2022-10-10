import React, { useState } from 'react';

const UpgradeToPremiumLink = ({ user, getUpgradeToPremiumPaymentLink }) => {
	const [upgradeLink, setUpgradeLink] = useState(null);

	if (!upgradeLink && getUpgradeToPremiumPaymentLink) {
		getUpgradeToPremiumPaymentLink((upgradeLink) => setUpgradeLink(upgradeLink));
	}
	
	return (<a href={upgradeLink || '#'}>Upgrade to Premium</a>);
}


export default UpgradeToPremiumLink;