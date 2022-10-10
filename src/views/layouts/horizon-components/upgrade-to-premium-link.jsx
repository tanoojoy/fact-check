import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAppPrefix } from '../../../public/js/common';

const UpgradeToPremiumLink = () => {
    const [upgradeLink, setUpgradeLink] = useState(null);

    useEffect(() => {
        if (!upgradeLink) {
            axios.get(getAppPrefix() + '/userinfo/payment-link').then((response) => {
                setUpgradeLink(response?.data?.paymentLink);
            });
        }
    });

    return <a href={upgradeLink || '#'}>Upgrade to Premium</a>;
};

export default UpgradeToPremiumLink;
