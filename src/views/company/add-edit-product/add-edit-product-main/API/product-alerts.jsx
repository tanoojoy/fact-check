import React, { useState } from 'react';
import ItemCard from '../../common/item-card';

const RowAlert = ({
	id = '',
	label = '',
	selected = '',
	options = [],
	onChangeSelectedAlert = () => null
}) => {

	const onClick = (e, alert) => {
		onChangeSelectedAlert(alert);
		e.preventDefault();
	}

	return (
		<div className="cortellis-row-partition" id={id}>
        	<label className="store-new-con-title-small">{label}</label>
        	<div className="common-dropdown dropdown select">
        		<button 
        			className="btn btn-default dropdown-toggle"
        			value={selected}
        			type="button"
        			id="dropdownMenu1" 
        			data-toggle="dropdown"
        			aria-haspopup="true"
        			aria-expanded="true"
        		>
					{selected || 'None Selected'}
					<span className="caret" />
				</button>
				<ul className="dropdown-menu" aria-labelledby="alertMenu1">
					{options.map((opt, i) => <li key={i}><a href="#" onClick={(e) => onClick(e, opt)}>{opt}</a></li>)}
				</ul>
        	</div>
        </div>
    );
}

const ProductAlerts = ({ alerts = {}, handleStateChange = () => null, productAlertOptions = [] }) => {
	return (
		<ItemCard
			rowTitle='Product Alerts'
			rowSubTitle='Coming Soon: These alerts will be displayed on Product Page'
		>
			<RowAlert 
				label='1st'
				id='cortellis-row-partition-one'
				options={productAlertOptions}
				selected={alerts.alert1}
				onChangeSelectedAlert={(value) => handleStateChange('alerts', { ...alerts, alert1: value })}
			/>
			{
				alerts.alert1 &&
				alerts.alert1 !== 'No Alerts Reported' &&
				<RowAlert 
					label='2nd'
					id='cortellis-row-partition-two'
					options={productAlertOptions}
					selected={alerts.alert2}
				onChangeSelectedAlert={(value) => handleStateChange('alerts', { ...alerts, alert2: value })}
				/>
			}
		</ItemCard>
	);
}


export default ProductAlerts;