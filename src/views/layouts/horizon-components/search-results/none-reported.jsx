import React from 'react';

const NoneReported = ({ size }) => (
    <span
        className={`search-results__cell search-results__cell--none-reported ${size ? `search-results__column--${size}` : ''} `}
    >
        None reported
    </span>
);

export default NoneReported;
