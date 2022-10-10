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

const VERIFICATION_STATUS = 'VerificationStatus';
const FILING_NUMBER = 'FilingNumber'

export const isEntryVerified = (refEntries, entries, index) => {
	const entry = entries[index];
	const refEntry = (refEntries && refEntries[index]) || null;
	
	let isVerified = false;

	if (refEntry && entry) {
		const { verified: entryVerified , ...entryComparableProperties } = entry;
		const { verified: refVerified , ...refComparableProperties} = refEntry;
		isVerified = refEntry.verified && objectsEqual(entryComparableProperties, refComparableProperties);
	}

	return isVerified;
}

const RegulatoryFilings = ({
	user = {}, 
	item = {},
	referenceItem = {},
	regFilings = [],
	regFilingsStatuses = [],
	updateModalVisibility = () => null,
	updateItemData = () => null,
	updateSelectedRowInfo = () => null
}) => {

	const { CustomFields = [] } = item;
	const columnLabels = Object.values(columnNames).map(col => col);
	const registrationFilings = getCustomFieldValues(CustomFields, 'registrationFilings') || [];

	const isFilingVerified = (index) => {
		const refItemCustomFields = (referenceItem && referenceItem.CustomFields) || [];
		const refEntries = getCustomFieldValues(refItemCustomFields, 'registrationFilings') || [];
		return isEntryVerified(refEntries, registrationFilings, index);
	}

	const tableData = registrationFilings.map((entry, ix) => 
		[
			{
				colName: columnNames.NAME,
				inputType: columnTypes.DROPDOWN,
	            options: regFilings,
				value: entry.filing,
			},
			{
				colName: columnNames.DATE,
				inputType: columnTypes.DATE,
				value: entry.filingDate,
			},
			{
				colName: columnNames.STATUS,
				inputType: columnTypes.DROPDOWN,
	            options: regFilingsStatuses,
				value: entry.filingStatus,
			},
			{
				name: VERIFICATION_STATUS,
				value: isFilingVerified(ix),
				hidden: true,
            	hasPermission: isPremiumUserSku(user)
			},
			{
				name: FILING_NUMBER,
				value: entry.filingNo,
				hidden: true,
			},
			{
				name: 'ID',
				value: `registrationFilings-${ix}`,
				hidden: true,
			}
		]	
	);

	const handleDataChange = (updatedFilingRows = []) => {
        const updatedRegistrationFilings = updatedFilingRows.map((row, i) => {
            const filing = row?.find(cl => cl.colName === columnNames.NAME)?.value;
            const filingDate = row?.find(cl => cl.colName === columnNames.DATE)?.value;
            const verified = row?.find(cl => cl.name === VERIFICATION_STATUS)?.value;
            const filingStatus = row?.find(cl => cl.colName === columnNames.STATUS)?.value;
            const filingNo = row?.find(cl => cl.name === FILING_NUMBER)?.value;
            return {
                filing,
                filingStatus,
                filingNo,
                filingDate,
                verified
            };
        });
		updateItemData('registrationFilings', updatedRegistrationFilings, true);
	}

	const handleAddRow = () => {
		const newFiling = {
			filing: '',
			filingStatus: null,
			filingNo: '',
			filingDate: '',
			verified: false,
		}
		const updatedRegistrationFilings = [...registrationFilings, newFiling];
		updateItemData('registrationFilings', updatedRegistrationFilings, true);
	}

	const handleDeleteRow = (index) => {
		updateSelectedRowInfo('registrationFilings', index);
		updateModalVisibility(ModalTypes.DELETE, true);
	}

	return (
		<ItemCard title='API Regulatory Filings' containerClass='display-Flex'>
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