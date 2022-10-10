import React from 'react';
import NoneReported from './none-reported';
import { ColumnAdditionalType, ColumnType } from '../../../../consts/table';

// TODO move to the separate file, will be addressed in LSGH-204
const TextCell = ({
    additionalData,
    additionalTypes,
    additionalClasses = '',
    value
}) => {
    const requireTooltip = additionalTypes?.indexOf(ColumnAdditionalType.WITH_TOOLTIP) >= 0;
    const isTag = additionalTypes?.indexOf(ColumnAdditionalType.TAG) >= 0;
    const classNames = `search-results__cell-data ${isTag ? 'search-results__cell-data--tag' : ''} ${additionalClasses}`;

    return Array.isArray(additionalData?.value)
        ? additionalData.value.map((val, index) => {
            return (
                <span
                    key={index}
                    title={requireTooltip ? val.tooltip : ''}
                    className={classNames}
                >
                    {val?.value || value}
                </span>
            );
        })
        : (
            <span
                title={requireTooltip ? additionalData.tooltip : ''}
                className={classNames}
            >
                {additionalData?.value || value}
            </span>
        );
};

const SearchResultsCell = ({
    data,
    type,
    additionalTypes,
    additionalClasses,
    size
}) => {
    if (!data?.value && !data?.additionalData?.value) return <NoneReported size={size} />;
    let resultCell;

    const {
        value,
        additionalData
    } = data;

    const { category, label, action } = additionalData?.analyticsData || {};
    switch (type) {
    case ColumnType?.TEXT:
        resultCell = (
            <TextCell
                additionalData={additionalData}
                additionalTypes={additionalTypes}
                additionalClasses={additionalClasses}
                value={value}
            />);
        break;
    case ColumnType?.LINK:
        resultCell = (
            <a
                className={additionalClasses}
                href={additionalData.link}
                target={additionalData.target}
                data-event-category={category}
                data-event-label={label}
                data-event-action={action}
            >
                {additionalData.icon ? <i className={`icon icon--${additionalData.icon}`}/> : ''}
                {additionalData.value || value.toString()}
            </a>);
        break;
    case ColumnType?.CHIPS:
        const isEmptyData = !additionalData?.value?.find(el => el.value);
        resultCell = (
            <TextCell
                additionalData={additionalData}
                additionalTypes={isEmptyData ? null : additionalTypes}
                additionalClasses={additionalClasses}
                value={value}
            />
        );
        break;
    default:
        resultCell = <span>{additionalData?.value || value.toString()}</span>;
        break;
    }

    return (
        <div
            key={type + data}
            className={`search-results__cell search-results__cell-${type} search-results__column--${size} ${additionalClasses}`}
        >
            {resultCell}
        </div>
    );
};

export default SearchResultsCell;
