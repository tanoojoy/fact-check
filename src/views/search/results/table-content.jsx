import React, { useEffect } from 'react';
import { ColumnAdditionalType, ColumnType } from '../../../consts/table';
import { isFreemiumUserSku } from '../../../utils';
import Popover from '../../common/popover';

const Tags = ({
	data = null, 
	classNames = [],
}) => {
	if (!data) return null;
	useEffect(() => {
		$('[data-toggle="tooltip"]').tooltip();
	})
	return (
		<div className={classNames.join(' ')}>
			{
				data.map((entry, ix) => {
					return (
						<span
							key={ix}
							className='search-focused-bg'
							data-toggle={entry.tooltip ? 'toggle' : ''}
							title={entry.tooltip || ''}
						>
							{entry.value || ''}
						</span>
					)
				})
			}
	    </div>
	);
}

export const NoneReported = () => (<span className="search-none">None reported</span>);

const TableCell = ({
	data = {},
	rowIndex,
}) => {
	const { 
		type,
		value,
		additionalData = {},
		additionalClasses = [],
		additionalDataTypes = []
	} = data;
	
	let cell = (<NoneReported />);

	if (value || additionalData?.value) {
		switch(type) {
			case ColumnType?.LINK:

				let popoverContainerId = additionalData?.popover?.containerId;
				let containerId = popoverContainerId ? `${popoverContainerId}-${rowIndex}` : '';
				cell = (
					<a 
						className="item-link"
						href={additionalData.link}
						target={additionalData.target}
						data-event-category={additionalData.analyticsData?.category}
						data-event-label={additionalData.analyticsData?.label}
                		data-event-action={additionalData.analyticsData?.action}
					>
	                    <div className="item-image" id={containerId}>
	                    	{
	                    		additionalData.iconSrc &&
	                    		additionalData?.popover &&
	                    		<Popover
									id={`${additionalData?.popover.id}-${rowIndex}`}
									iconClass={additionalData?.popover.iconClass}
									trigger={additionalData?.popover.trigger}
									autoHideIcon={additionalData?.popover.autoHide}
									containerId={containerId}
									content={additionalData?.popover.content}
									placement={additionalData?.popover.placement}
								/>
	                    	}
	                        <img src={additionalData.iconSrc} />
	                    </div>
	                    <div className="item-desc">
	                        <p className="item-seller">{value || ''}</p>
	                    </div>
	                </a>
				);
				break;
			case ColumnType?.TEXT:
				if (additionalDataTypes.includes(ColumnAdditionalType.TAG)) {
					cell = (<Tags data={additionalData?.value} classNames={additionalClasses}/>);
					break;
				}
			default:
				cell = additionalData?.value || value;
				break;
		}
	}

	return (
		<td>
            <div className="item-box">
                {cell}
            </div>
        </td>
	);
}

const TableContent = ({
	data = [],
	columnsConfig = new Map(),
	user = {}
}) => {
	const items = data?.map(rawData => rawData.fields) || [];
	const prepareRowData = (fields) => {
		let cells = [];
		for (const [key, value] of columnsConfig.entries()) {
			const additionalDataFieldValues = value.additionalData?.additionalFields?.map(key => fields[key]) || null;
			const premiumDataKeys = [
				'manufacturing_status',
				'gmp_certificates',
				'reg_filing_list'
			];
			
			let isLocked = isFreemiumUserSku(user) && premiumDataKeys.includes(key);
			const isRegFilingWithUSDMF = (key === 'reg_filing_list' && (fields[key] || []).length > 1);
			if (isLocked && isRegFilingWithUSDMF) {
				isLocked = false;
			}

			cells.push({ 
				value: fields[key] || null,
				type: !isLocked ? value.type : '',
				additionalClasses: value.additionalClasses || [],
				additionalDataTypes: value?.additionalTypes || [],
				additionalData: !isLocked && value.additionalData? value.additionalData.format(fields[key], additionalDataFieldValues) : null
			});
		}
		return cells;
	}

	return (
		<tbody>
			{
				items.map((item, i) => {
					const rowData = prepareRowData(item);
					return (
						<tr className='item-row' key={i}>
							{
								rowData.map((cell, index) => 
									<TableCell
										key={index}
										rowIndex={i}
										data={cell}
									/>
								)
							}
						</tr>
					)
				})
			}
		</tbody>
	);
}

export default TableContent;