import React, { useState } from 'react';
import { getCustomFieldValues } from '../../../../../utils';
import ItemCard from '../../common/item-card';
import VerifiedStatus from '../../../../common/verified-status';
import { ModalTypes } from '../../../../../consts/modal-types';

const ManufacturingStatus = ({ 
	item = {},
	referenceItem = {},
	manufacturingStatuses = [],
	updateModalVisibility = () => null,
	updateItemData = () => null
}) => {

	const { CustomFields = [] } = item;

	const selectedManufacturingStatus = getCustomFieldValues(CustomFields, 'manufacturerStatus', 'Code', true) || '';

	const referenceItemCustomFields = (referenceItem && referenceItem.CustomFields || []);
	const referenceItemManufacturingStatus = getCustomFieldValues(referenceItemCustomFields, 'manufacturerStatus', 'Code', true);
	const isReferenceItemManufacturingStatusVerified = getCustomFieldValues(referenceItemCustomFields, 'manufacturingStatusVerified', 'Code', true);
	
	const isVerified = isReferenceItemManufacturingStatusVerified && selectedManufacturingStatus === referenceItemManufacturingStatus;

	const statuses = manufacturingStatuses.map(status => ({
		name: status,
		value: status,
		selected: selectedManufacturingStatus === status
	}));

	if (!selectedManufacturingStatus) {
		statuses.unshift({
			name: 'Select', 
			value: '',
			selected: true
		});
	}

	const onChangeManufacturingStatus = (event) => {
		const status = event.target.value;
		updateItemData('manufacturerStatus', status, true);
	}

	return (
		<ItemCard title='Manufacturing Status' containerClass='display-Flex'>
            <select 
            	className="width-half"
            	name="Manufacturing Status"
            	value={selectedManufacturingStatus}
            	onChange={onChangeManufacturingStatus}
            >
            	{statuses.map((status, index) => <option key={index} value={status.value}>{status.name}</option>)}
            </select>
            {
            	selectedManufacturingStatus &&
            	<a className="request-btn" href={null}> 
                	<VerifiedStatus
                		hasPermissionToVerify
                		isVerified={isVerified}
                		handleVerifyClick={() => updateModalVisibility(ModalTypes.VERIFICATION, true)}
            		/>&nbsp;
                	Request Verification
                </a>
            }
	    </ItemCard>
	);
}


export default ManufacturingStatus;