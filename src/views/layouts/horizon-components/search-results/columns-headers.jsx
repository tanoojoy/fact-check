import React from 'react';
import { companiesSortFields } from '../../../../consts/search-results';

const SearchResultsColumnsHeaders = ({
    columnsMap,
    additionalClasses,
    sortResults,
    sortColumn,
    sortDirection
}) => {
    const sortByField = name => {
        if (companiesSortFields[name]) {
            sortResults(name);
        }
    };

    let columns = [];
    columnsMap.forEach((column, key) => {
        const newColumn = (
            <div
                onClick={() => { sortByField(key); }}
                key={key + '_' + column.name}
                className={
                    `search-results__column-header
                    search-results__column--${column.size}
                    ${additionalClasses}
                    ${companiesSortFields[key] && 'search-results__column-header--sortable'}`}
            >
                {column.name} {companiesSortFields[key] &&
                <span
                    className={`horizon-sort-indicator horizon-sort-indicator--${key === sortColumn ? 'active' : 'inactive'}`}>
                    {(key === sortColumn && sortDirection === 'desc') ? <span>&#8593;</span> : <span>&#8595;</span>}
                </span>}
            </div>
        );
        columns = [...columns, newColumn];
    });
    return (
        <>
            {columns}
        </>
    );
};

export default SearchResultsColumnsHeaders;
