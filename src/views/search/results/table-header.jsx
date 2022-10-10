import React, { useState, useEffect } from 'react';
import { companiesSortFields } from '../../../consts/search-results';
import Popover from '../../common/popover';

const TableHeader = ({
	columnsConfig,
	sortColumn,
	sortDirection,
	sortResults
}) => {
	const [columns, setColumns] = useState([]);
	const sortResultsByField = (key) => {
		if (!companiesSortFields[key]) return;
		sortResults(key);
	}

	const getSortIconClass = (key) => {
		const iconClass = `icon-${sortColumn === key  ? 'blue' : 'grey'}-arrow-up`;
		return `icon ${iconClass} ${!(sortDirection === 'desc' && key === sortColumn) ? 'rotate-icon-down' :''}`;
	}

	useEffect(() => {
		const columns = [];
		if (columnsConfig) {
			for (const [key, value] of columnsConfig.entries()) {
				columns.push(
					<th
						id={value.popover?.containerId || ''}
		    			onClick={() => sortResultsByField(key)}
		    			key={`${key}-${value.name}`}
		    		>
		    			{value.name}
		    			&nbsp;
		    			{
		    				value.popover &&
		    				<Popover
								id={value.popover.id}
								iconClass={value.popover.iconClass}
								trigger={value.popover.trigger}
								autoHideIcon={value.popover.autoHide}
								containerId={value.popover.containerId}
								content={value.popover.content}
								placement={value.popover.placement}
							/>
		    			}
		    			{companiesSortFields[key] && <i className={getSortIconClass(key)} />}
		    		</th>
				);
			}
		}
		setColumns(columns);
	}, [columnsConfig, sortColumn, sortDirection]);

	return (
		<thead>
	        <tr>{columns}</tr>
	    </thead>
	);
}

export default TableHeader;