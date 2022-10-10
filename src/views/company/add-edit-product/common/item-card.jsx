import React from 'react';

const ItemCard = ({ 
	colWidth = 6, 
	title = '',
	rowTitle = '',
	rowSubTitle = '',
	containerClass = '', 
	innerContainerClass = '',
	handleContainerClick = () => null,
	children 
}) => {
	return (
		<div className={`col-md-${colWidth} ${containerClass}`}>
			{rowTitle && <h4 className="row-title">{rowTitle}</h4>}
	        {rowSubTitle && <p className="row-sub-title">{rowSubTitle}</p>}
            <div className={`store-new-con ${innerContainerClass}`} onClick={handleContainerClick}>
                {title && <label className="store-new-con-title-small">{title}</label>}
                {children}
            </div>
        </div>
	);
}

export default ItemCard;