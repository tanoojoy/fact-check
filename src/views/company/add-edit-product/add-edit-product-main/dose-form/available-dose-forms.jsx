import React, { useState, useEffect } from 'react';
import ItemCard from '../../common/item-card';
import { FormTable, AddTableRow } from '../../common/form-table';
import { ColumnType as columnTypes } from '../../../../../consts/table';
import { ModalTypes } from '../../../../../consts/modal-types';

const columnNames = {
	DOSE_FORM: 'Dose Form',
	STRENGTH: 'Strength',
};

const columnLabels = Object.values(columnNames).map(col => col);

const doseFormTypes = [
	'Applicator',
	'Capsule',
	'Capsule/Cream',
	'Capsule/Injection',
	'Capsule/Tablet',
	'Chewable Capsule',
	'Chewable Tablet',
	'Chewing Gum'
]

const AvailableDoseForms = ({ 
	doseForms = [],
    handleStateChange = () => null,
    updateModalVisibility = () => null,
    updateSelectedRowInfo = () => null,
}) => {
	const tableData = doseForms.map((entry, ix) => 
		[
			{
				colName: columnNames.DOSE_FORM,
				inputType: columnTypes.DROPDOWN,
	            options: doseFormTypes,
				value: entry.doseForm || '',
				placeholder: 'Select Dose Form'
			}, 
			{
				colName: columnNames.STRENGTH,
				inputType: columnTypes.TEXT,
				value: entry.strength || '',
				placeholder: 'eg. 250 mg, 150 ml, 1kg',
				appendEditButton: true
			},
			{
				name: 'ID',
				value: `doseForms-${ix}`,
				hidden: true,
			}
		]	
	);

	const handleDataChange = (updatedDoseForms = []) => {
        const updatedValues = updatedDoseForms.map((row, i) => {
            const doseForm = row?.find(cl => cl.colName === columnNames.DOSE_FORM)?.value;
            const strength = row?.find(cl => cl.colName === columnNames.STRENGTH)?.value;
            return {
                doseForm,
                strength,
            };
        });
        handleStateChange('doseForms', updatedValues);
	}

	const handleAddRow = () => {
		const newDoseForm = {
			doseForm: '',
			strength: ''
		}
		const updatedDoseForms = [...doseForms, newDoseForm];
        handleStateChange('doseForms', updatedDoseForms);
	}

	const handleDeleteRow = (index) => {
		updateSelectedRowInfo('doseForms', index);
		updateModalVisibility(ModalTypes.DELETE, true);
	}


	return (
		<ItemCard title='Available Dose Forms'>
			<FormTable
				columnLabels={columnLabels}
				data={tableData}
				updateModalVisibility={updateModalVisibility}
				handleDataChange={handleDataChange}
				handleDeleteRow={handleDeleteRow}
			/>
			<AddTableRow handleAddRow={handleAddRow} />
		</ItemCard>
	)
}


export default AvailableDoseForms;