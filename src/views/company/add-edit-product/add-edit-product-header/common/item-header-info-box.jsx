import React from 'react';

const ItemHeaderInfoBox = ({ title = '', children, containerClass = '', containerId = '' }) => {
	return (
		<div className={`cor-new-design ${containerClass}`} id={containerId} >
            {title && <p className="title-caption">{title}</p>}
            {children}
        </div>
	)
}

export default ItemHeaderInfoBox;