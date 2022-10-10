import React, { useState, useEffect } from 'react';
import ItemCard from '../../common/item-card';
import { ModalTypes } from '../../../../../consts/modal-types';
import { 
	getCustomFieldValues, 
	isPremiumUserSku,
	objectsEqual
} from '../../../../../utils';
import { formatDate } from '../../../../item/common-components';
import { FormTable, AddTableRow, columnNames } from '../../common/form-table';
import { ColumnType as columnTypes } from '../../../../../consts/table';
import { isEntryVerified } from './regulatory-filings';

const VERIFICATION_STATUS = 'VerificationStatus';

const RegulatoryFilings = ({
	user = {}, 
	item = {},
	referenceItem = {},
	gmpStatuses = [],
	gmpCertificateOptions = [],
	updateModalVisibility = () => null,
	updateItemData = () => null,
	updateSelectedRowInfo = () => null
}) => {

	const { CustomFields = [] } = item;
	const columnLabels = Object.values(columnNames).map(col => col);
	const gmpCertificates = getCustomFieldValues(CustomFields, 'gmpCertificates') || [];

	const isCertificateVerified = (index) => {
		const refItemCustomFields = (referenceItem && referenceItem.CustomFields) || [];
		const refEntries = getCustomFieldValues(refItemCustomFields, 'gmpCertificates') || [];
		return isEntryVerified(refEntries, gmpCertificates, index);
	}

	const tableData = gmpCertificates.map((entry, ix) => 
		[
			{
				colName: columnNames.NAME,
				inputType: columnTypes.DROPDOWN,
	            options: gmpCertificateOptions,
				value: entry.authority,
			}, 
			{
				colName: columnNames.DATE,
				inputType: columnTypes.DATE,
				value: entry.statusDate,
			},
			{
				colName: columnNames.STATUS,
				inputType: columnTypes.DROPDOWN,
	            options: gmpStatuses,
				value: entry.status,
			},
			{
				name: VERIFICATION_STATUS,
				value: isCertificateVerified(ix),
				hidden: true,
            	hasPermission: isPremiumUserSku(user)
			},
			{
				name: 'ID',
				value: `gmpCertificates-${ix}`,
				hidden: true,
			}
		]	
	);

	const handleDataChange = (updatedCertificateRows = []) => {
        const updatedGMPCertificates = updatedCertificateRows.map((row, i) => {
            const authority = row?.find(cl => cl.colName === columnNames.NAME)?.value;
            const statusDate = row?.find(cl => cl.colName === columnNames.DATE)?.value;
            const verified = row?.find(cl => cl.name === VERIFICATION_STATUS)?.value;
            const status = row?.find(cl => cl.colName === columnNames.STATUS)?.value;
            return {
                authority,
                status,
                statusDate,
                verified
            };
        });
		updateItemData('gmpCertificates', updatedGMPCertificates, true);
	}

	const handleAddRow = () => {
		const newCertificate = {
			authority: '',
			status: null,
			statusDate: '',
			verified: false,
		}
		const updatedGMPCertificates = [...gmpCertificates, newCertificate];
		updateItemData('gmpCertificates', updatedGMPCertificates, true);
	}

	const handleDeleteRow = (index) => {
		updateSelectedRowInfo('gmpCertificates', index);
		updateModalVisibility(ModalTypes.DELETE, true);
	}

	return (
		<ItemCard title='GMP Certificates' containerClass='display-Flex'>
			<FormTable
				columnLabels={columnLabels}
				data={tableData}
				updateModalVisibility={updateModalVisibility}
				handleDataChange={handleDataChange}
				handleDeleteRow={handleDeleteRow}
				handleVerifyClick={() => updateModalVisibility(ModalTypes.VERIFICATION, true)}
			/>
			<AddTableRow handleAddRow={handleAddRow} />
		</ItemCard>
	);
}

export default RegulatoryFilings;