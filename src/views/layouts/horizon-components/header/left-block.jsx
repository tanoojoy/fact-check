import React from 'react';
const CommonModule = require('../../../../public/js/common.js');

const Logo = ({ logoUrl }) => (
    <a href={`${CommonModule.getAppPrefix()}/`} className='logo'>
        <img src={logoUrl} alt='Clarivate Supply Chain Network' />
    </a>
);

const LeftBlock = (props) => (
    <div className='left-block'>
        <Logo logoUrl={props.logoUrl || CommonModule.getAppPrefix() + '/assets/images/horizon/logo_clarivate_connect.png'} />
    </div>
);

export default LeftBlock;
