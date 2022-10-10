import React from 'react';
import UpgradeToPremiumLink from './upgrade-to-premium-link';

const UpgradeToPremiumTopBanner = () => {
    return (
        <div className='upgrade-to-premium-top-banner__container'>
            <div className='upgrade-to-premium-top-banner__message'>
                <span>Make more connections with unlimited insights and usage.</span> &nbsp;
                <UpgradeToPremiumLink />.
            </div>
        </div>
    );
};

export default UpgradeToPremiumTopBanner;
