import React from 'react';

const VerifiedStatus = ({ 
	isVerified = false,
	handleVerifyClick = () => null,
	hasPermissionToVerify = false
}) => {
	
    const iconClass = isVerified ? 'icon-gear-check-blue' : 'icon-gear-gray';

    const onClick = (e) => {
    	if (isVerified || !hasPermissionToVerify) return;
    	handleVerifyClick(e);
    }

    const cursor = (isVerified && 'auto') || (hasPermissionToVerify && 'pointer') || 'unset';
    return (
    	<i 
    		className={`icon ${iconClass}`} 
    		onClick={onClick}
    		style={{ cursor }}
    	/>
	)
}

export default VerifiedStatus;