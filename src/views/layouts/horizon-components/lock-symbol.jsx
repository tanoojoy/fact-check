import React from 'react';
import { string } from 'prop-types';
import { getAppPrefix } from '../../../public/js/common';

const LockSymbol = ({ type = '' }) => {
    const symbolUrl = type
        ? `${getAppPrefix()}/assets/images/horizon/lock_${type}.svg`
        : getAppPrefix() + '/assets/images/horizon/lock.svg';
    return <img src={symbolUrl} alt='' className='lock-symbol' />;
};

LockSymbol.propTypes = {
    type: string
};

export default LockSymbol;
