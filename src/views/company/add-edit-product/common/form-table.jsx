import React, { useState, useEffect } from 'react';
import ItemCard from './item-card';
import VerifiedStatus from '../../../common/verified-status';
import { objectsEqual } from '../../../../utils';
import { formatDate, defaultDateFormat, TextWithAutoTooltip, TextTooltipType } from '../../../item/common-components';
import { ColumnType as columnTypes } from '../../../../consts/table';

export const columnNames = {
	NAME: 'Name',
	DATE: 'Date',
	STATUS: 'Status'
};

export const AddTableRow = ({ handleAddRow = () => null }) => {
	return (
        <div className="table-button-con">
	    	<a 
	    		className="table-row-button"
	    		href="#"
	    		onClick={(e) => {
	    			handleAddRow();
	    			e.preventDefault();
	    		}}
	    	>
	    		<i className="icon icon-add-row-cross"/>
	    		&nbsp; Add Row
    		</a>
        </div>
	)
}

const Dropdown = ({ 
	options = [],
	selected = null,
	onChange = () => null,
	addedClassName = '',
	placeholder = 'Select from the list',
}) => {

	const handleClick = (e, opt) => {
		onChange(opt);
		e.preventDefault();
	}
	return (
		<div className={`dropdown select ${addedClassName}`}>
            <button 
            	className="btn btn-default dropdown-toggle"
            	value={selected}
            	type="button" 
            	data-toggle="dropdown"
            	aria-haspopup="true"
            	aria-expanded="true"
        	>
        		{selected || placeholder}
        	</button>
        	<ul className="dropdown-menu">
        		{
        			options.map((opt, i) => <li key={i}><a href="#" onClick={(e) => handleClick(e, opt)}>{opt}</a></li>)
        		}
            </ul>
		</div>
	);
}

const DatePickerField = ({
	value = '',
	id = '',
	onChange = () => null
}) => {

	useEffect(() => {
		initDatePicker();
	});

	const initDatePicker = () => {
		$(`#filter-datepicker-${id}`).daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            autoApply: true,
            opens: "left",
            locale: {
                "format": "DD-MMM-YYYY"
            }
        }, (date) => onChange(date.format(defaultDateFormat)));
        $(`#filter-datepicker-${id}`).val(value);
	}

	return (
		<>
			<input 
				className="table-timepicker date-value-select"
				type="text"
				name="timestamp"
				id={`filter-datepicker-${id}`}
				defaultValue={value}
			/>
			<i className="fa fa-calendar status-options-select-calendar-icon" />
		</>
	);
}

const TableRow = ({
	rowData	= [] ,
	isEditing = false,
	onRowInputChange = () => null,
	handleDeleteRow = () => null,
	handleVerifyClick = () => null
}) => {
	
	const [isEditingRow, setEditingRowFlag] = useState(isEditing);

    const verificationStatus = rowData.find(row => row.name === 'VerificationStatus');

    const rowID = rowData.find(r => r.name === 'ID');
	const ID =  rowID?.value || null;

	const onColDataChange = (colData) => {
		const index = rowData.findIndex(d => colData.colName === d.colName);
		const updatedData = [...rowData];
		updatedData[index] = colData;
		onRowInputChange(updatedData);
	}

    return (
    	<tr>
    		{
	    		rowData.map((colData, i) => {
	    			if (colData.hidden) return null;
			    	if (colData.colName === columnNames.NAME) {
			    		return (
			    			<td key={i}>
			    				<div className="icon-container-gear">
				    				<VerifiedStatus
						        		hasPermissionToVerify={verificationStatus?.hasPermission}
						        		isVerified={verificationStatus?.value}
						        		handleVerifyClick={handleVerifyClick}
						    		/>
						    	</div>
				        		{!isEditingRow &&
			        			    <TextWithAutoTooltip
                                        extraClassOnTooltipEnabled='with-tooltip'
                                        name={colData.value}
                                        type={TextTooltipType.TEXT}
                                    />
				        		}
								{
									isEditingRow && 
									colData.inputType === columnTypes.DROPDOWN &&
									<Dropdown
										addedClassName='name-options-select'
										selected={colData.value}
										options={colData.options}
										onChange={(value) => {
											onColDataChange({
												...colData,
												value
											})
										}}
									/>
								}
							</td>
						);
			    	} else if (colData.colName === columnNames.DATE) {
			    		return (
			    			<td key={i}>
			    				{!isEditingRow && <span className="date-value">{formatDate(colData.value)}</span>}
			    				{
			    					isEditingRow &&
			    					colData.inputType === columnTypes.DATE &&
			    					<DatePickerField
			    						value={(colData.value &&formatDate(colData.value)) || ''}
			    						id={ID}
			    						onChange={(value) => {
											onColDataChange({
												...colData,
												value
											})
										}}
			    					/>
			    				}
			    			</td>
		    			);
			    	} else if (colData.colName === columnNames.STATUS) {
			    		return (
			    			<td key={i}>
			    				{
		    						!isEditingRow &&
		    						<>
		    							{colData.value}
		    							<a 
		    								href="#"
		    								onClick={(e) => {
		    									setEditingRowFlag(true);
		    									e.preventDefault();
		    								}}
	    								>
		    								<i className="icon icon-pen-blue" />
	    								</a>
		    						</>
		    					}
		    					{
									isEditingRow && 
									colData.inputType === columnTypes.DROPDOWN &&
									<Dropdown
										addedClassName='status-options-select'
										selected={colData.value}
										options={colData.options}
										onChange={(value) => {
											onColDataChange({
												...colData,
												value
											})
										}}
									/>
								}
		    				</td>
		    			);
			    	} else {
			    		return (
			    			<td key={i}>
			    				{
		    						!isEditingRow &&
		    						<>
		    							{colData.value}
		    							{
		    								colData.appendEditButton &&
		    								<a 
			    								href="#"
			    								onClick={(e) => {
			    									setEditingRowFlag(true);
			    									e.preventDefault();
			    								}}
		    								>
			    								<i className="icon icon-pen-blue" />
		    								</a>
		    							}
		    						</>
		    					}
		    					{
									isEditingRow && 
									colData.inputType === columnTypes.DROPDOWN &&
									<Dropdown
										addedClassName='name-options-select'
										placeholder={colData.placeholder}
										selected={colData.value}
										options={colData.options}
										onChange={(value) => {
											onColDataChange({
												...colData,
												value
											})
										}}
									/>
								}
		    					{
									isEditingRow && 
									colData.inputType === columnTypes.TEXT &&
									<input
										className="table-timepicker"
										placeholder={colData.placeholder}
										value={colData.value}
										onChange={(e) => {
											onColDataChange({
												...colData,
												value: e.target.value
											})
										}}
									/>
								}
		    				</td>
		    			);
			    	}
			    })
			}
			<td>
				<a 
					href="#" 
					onClick={(e) => {
						handleDeleteRow();
						e.preventDefault();
					}}
				>
					<i className="icon icon-delete-entry" />
				</a>
			</td>
    	</tr>
    );
}

export const FormTable = ({ 
	columnLabels = [],
	data = [],
	handleDataChange = () => null,
	handleDeleteRow = () => null,
	handleVerifyClick = () => null
}) => {
	const [tableData, setTableData] = useState(data);

	const getID = (row) => {
		const rowID = row.find(r => r.name === 'ID');
		return rowID?.value || null;
	}

	const onRowInputChange = (row) => {
		const rowID = getID(row);
	    const updatedTableData = tableData.map(d => {
	    	const ID = getID(d);
	    	if (ID === rowID) {
	    		return row;
	    	} else {
	    		return d;
	    	}
	    });

	    setTableData(updatedTableData);
	    handleDataChange(updatedTableData);
	}

    useEffect(() => {
        if (!objectsEqual(data, tableData)) {
            setTableData(data);
        }
    }, [data]);

	return (
		<table border="0" cellPadding="0" cellSpacing="0" className="table storefront-tables">
			<thead>
				<tr>
                    {
                    	columnLabels.map((col, i) => <th scope="col" key={i}>{col}</th>)
                    }
                    <th />
				</tr>
			</thead>
			<tbody>
				{
					tableData.map((rowData, i) => {
						
						return (
							<TableRow
								key={i}
								rowData={rowData}
								onRowInputChange={onRowInputChange}
				                isEditing={(rowData.filter(d => d.colName)).some(s => s.value === '' || s.value === null)}
				                handleDeleteRow={() => handleDeleteRow(i)}
				                handleVerifyClick={handleVerifyClick}
							/>
						)
					})
				}
			</tbody>
		</table>
	);
}
