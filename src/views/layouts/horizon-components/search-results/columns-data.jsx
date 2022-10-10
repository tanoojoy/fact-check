import React from 'react';
import isFunction from 'lodash/isFunction';
import SearchResultsCell from './cell';

const SearchResultsColumnsData = ({
    items: itemsRaw,
    columnsMap,
    additionalClasses
}) => {
    const items = itemsRaw?.map(rawItem => rawItem.fields);
    const rows = items?.map((item, index) => {
        const itemKeys = [...columnsMap.keys()];
        const row = itemKeys?.map((key) => {
            const cellType = columnsMap.get(key).type;
            const cellAdditionalTypes = columnsMap.get(key).additionalTypes;
            const cellSize = columnsMap.get(key).size;
            const cellAdditionalData = columnsMap.get(key).additionalData;
            const data = { value: item[key] };

            const additionalClassesField = columnsMap.get(key).additionalClasses;
            const additionalClasses = isFunction(additionalClassesField) ? additionalClassesField(item) : additionalClassesField;

            if (cellAdditionalData) {
                const additionalValues = cellAdditionalData.additionalFields?.map(fieldKey => item[fieldKey]);
                data.additionalData = cellAdditionalData?.format(item[key], additionalValues);
            }

            return (
                <SearchResultsCell
                    key={row}
                    type={cellType}
                    additionalTypes={cellAdditionalTypes}
                    additionalClasses={additionalClasses}
                    size={cellSize}
                    data={data}
                />
            );
        });

        return (
            <div key={index} className={`search-results__row-data ${additionalClasses}`}>
                {row}
            </div>
        );
    });

    return rows || '';
};

export default SearchResultsColumnsData;
