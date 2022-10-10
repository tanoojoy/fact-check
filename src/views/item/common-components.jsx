import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import VerifiedStatus from '../common/verified-status';
import LockSymbol from '../common/lock-symbol';

export const ItemInfoBox = ({ title = '', customTitleClass = 'store-new-con-title-small', subTitle = null, colId = '', colWidth = 6, locked = false, children }) => {
	return (
		<div className={`col-md-${colWidth}`} id={colId}>
            <div className="store-new-con">
                {title && <p className={customTitleClass}>{title}</p>}
                {!locked && subTitle && <p className="store-new-con-sub-title-black">{subTitle}</p>}
                {locked && <LockSymbol />}
                {!locked && children}
            </div>
        </div>
	);
}

export const TextTooltipType = {
    TAG: 'tag',
    TEXT: 'text'
}

export const TextWithAutoTooltip = ({ 
    name = '',
    link = '',
    maxWidth = 155,
    type = TextTooltipType.TEXT,
    extraClassOnTooltipEnabled = '',
    containerClass = '',
}) => {
    const ref = useRef(null);
    const [tooltipEnabled, setTooltipEnabled] = useState(false)
    const [tooltipText, setTooltipText] = useState('');
    useEffect(() => {
        const currentWidth = ref?.current?.offsetWidth || 0;
        setTooltipEnabled(currentWidth >= maxWidth);
    }, [ref.current, name]);

    useEffect(() => {
        if (tooltipEnabled) {
            setTooltipText(name);
            $('[data-toggle="tooltip"]').tooltip();
        } else {
            setTooltipText('');
        }
    }, [tooltipEnabled]);
    if (type === TextTooltipType.TAG) {
        return (
            <span 
                className={`tagify-text ${containerClass}`}
                data-toggle={tooltipEnabled ? 'tooltip' : ''}
                data-original-title={tooltipText}
            >
                <span ref={ref}>
                    {
                        link ?
                           <a href={link} target="_blank" rel="noopener noreferrer">{name}</a>
                        : `${name}`
                    }
                </span>
            </span>
        );
    } else if (type === TextTooltipType.TEXT) {
        return (
            <span 
                className={containerClass}
                data-toggle={tooltipEnabled ? 'tooltip' : ''}
                data-original-title={tooltipText}
            >
                <span ref={ref} className={tooltipEnabled ? extraClassOnTooltipEnabled : ''}>{name}</span>
            </span>
        );
    } 
    return name;
}

export const ItemInfoTags = ({ title = '', showAll = false, data = [], locked = false }) => {
    const [ showAllTags, setShowAllTags ] = useState(showAll);

    const hasData = data && data.length > 0;
    const defaultVisibleItemsCount = 15;
    
    let displayedData = data;
    if (!showAllTags) {
        displayedData = data.slice(0, defaultVisibleItemsCount)
    }

    return (
        <ItemInfoBox title={title} colWidth={12} locked={locked}>
            <div className="text-con clearfix">
                {   hasData && 
                    displayedData.map((tag, i) => 
                        <TextWithAutoTooltip 
                            key={i}
                            name={tag.name}
                            link={tag.redirectUrl}
                            type={TextTooltipType.TAG}
                        />
                    )
                }
                {!hasData && <label className="unknown">Unknown</label>}
            </div>
            <p>&nbsp;</p>
            {
                hasData &&
                !showAllTags &&
                data.length > displayedData.length &&
                <a href={null} style={{ cursor: 'pointer'}} className="store-new-con-show-more" onClick={() => setShowAllTags(true)}>
                    <i className="icon icon-cross-blue"/>&nbsp; Show More
                </a>
            }
        </ItemInfoBox> 
    );
}

const ColumnName = {
    NAME: 'name',
    DATE: 'date',
    STATUS: 'status'
};

export const defaultDateFormat =  'YYYY-MM-DD';
export const defaultDisplayDateFormat = 'DD-MMM-YYYY';
export const formatDate = (dateStr, fromFormat = defaultDateFormat, toFormat = defaultDisplayDateFormat) => moment(dateStr, fromFormat).format(toFormat);

export const ItemInfoRow = ({ data = {}, columnNames = [] }) => {
	return (
		<tr>
    		{
    			columnNames.map((colName, ix) => {
    				switch(colName.toLowerCase()) {
    					case ColumnName.NAME:
                            if (data.showVerifiedIcon) { 
        						return (
                                    <td key={ix}>
                                        <div className="icon-container-gear">
                                            <VerifiedStatus 
                                                isVerified={data.Verified}
                                                hasPermissionToVerify={data.hasPermissionToVerify}
                                                handleVerifyClick={data.handleVerifyClick}
                                            />
                                        </div>
                                        <TextWithAutoTooltip
                                            maxWidth={140}
                                            extraClassOnTooltipEnabled='with-tooltip'
                                            name={data[colName]}
                                            type={TextTooltipType.TEXT}
                                        />
                                    </td>
                                );
                            }
                            return (<td key={ix}>{data[colName]}</td>);
    					case ColumnName.DATE:
    						if (typeof data[colName] === 'string') {
    							return (<td key={ix}>{formatDate(data[colName])}</td>);
    						}
    					default:
		    				return (<td key={ix}>{data[colName]}</td>);
    				}
    			})
    		}
        </tr>
	);
}

export const ItemInfoTable = ({ columnNames = [], data = [], showAll = false }) => {
    const [ showAllRows, setShowAllRows ] = useState(showAll);
    const defaultVisibleItemsCount = 6;
    let displayedData = data;
    if (!showAllRows) {
        displayedData = data.slice(0, defaultVisibleItemsCount)
    }

    const withVerification = data.some(d => d.showVerifiedIcon);
    const additionalClass = !withVerification ? 'no-gear-icons' : '';
	return (
		<>
            <table border="0" cellPadding="1" cellSpacing="1" style={{ width: '500px' }} className={`table storefront-tables ${additionalClass}`}>
                <thead>
                    <tr>
                        {columnNames.map((colName, i) => <th scope="col" key={i} >{colName}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {displayedData.map((rowData, ix) => <ItemInfoRow key={`${ix}`} data={rowData} columnNames={columnNames} />)}
                </tbody>
            </table>
            <p>&nbsp;</p>
            { 
                !showAllRows &&
                data.length > displayedData.length &&
                <a href={null} style={{ cursor: 'pointer'}} className="store-new-con-show-more" onClick={() => setShowAllRows(true)}>
                    <i className="icon icon-cross-blue"/> &nbsp;
                    Show More
                </a>
            }
		</>

	);
}