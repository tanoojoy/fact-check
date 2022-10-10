import React, { useState, useEffect } from 'react';
import Popover from '../../common/popover';
import { capitalize } from '../../../scripts/shared/common';

export const UPDATE_TYPES = {
	MERGE: 'MERGE',
	REPLACE: 'REPLACE',
    RESET: 'RESET'
}

export const FilterCheckbox = ({
    title = '',
    popoverData = null,
    filterKey = '',
    options = [],
    disabled = false,
    isChecked = () => false,
    handleChange = () => null,
}) => {
    const [popoverConfig, setPopoverConfig] = useState(null);

    useEffect(() => {
        setPopoverConfig(popoverData);
    }, [popoverData]);

    return (
        <FilterWrapper title={title} popoverConfig={popoverConfig}>
            <div className="fsc-filter-checkbox full-width" disabled={disabled}>
                {
                    options.map((option, ix) => 
                        <CheckboxField
                            key={`${filterKey}-${ix}`}
                            label={option.label}
                            value={option.value || option.label}
                            filterKey={filterKey}
                            disabled={disabled}
                            checked={isChecked(filterKey, option.value || option.label)}
                            onChange={handleChange}
                        />
                    )
                }
            </div>
        </FilterWrapper>
    )
}

const CheckboxField = ({
	id = '',
	label = '',
	checked = false,
	value = '',
	filterKey = '',
	onChange = () => null,
	disabled = false,
}) => {

	return (
        <span className="fancy-checkbox full-width">
            <input 
            	type="checkbox"
            	id={`${filterKey}-${label}`}
            	name={filterKey}
            	value={value}
            	disabled={disabled}
            	checked={checked}
            	onChange={(e) => onChange(filterKey, value, e.target.checked)}
            />
            <label htmlFor={`${filterKey}-${label}`}>{label}</label>
        </span>
	);
}

export const FilterDropdown = ({
    title = '',
    popoverData = null,
    filterKey = '',
    data = [],
    selectedValues = [],
    disabled = false,
    handleChange = () => null,
}) => {
    const [popoverConfig, setPopoverConfig] = useState(null);

    useEffect(() => {
        setPopoverConfig(popoverData);
    }, [popoverData]);

    return (
        <FilterWrapper title={title} popoverConfig={popoverConfig}>
            <DropdownField
                data={data}
                selectedValues={selectedValues}
                disabled={disabled}
                handleChange={handleChange}
                filterKey={filterKey}
            />
        </FilterWrapper>
    );
}


export const DropdownField = ({
    data = [],
    selectedValues = [],
    disabled = false,
    handleChange = () => null,
    filterKey = ''
}) => {

    const [visibleData, setVisibleData] = useState(data);
    const [isDropdownOpen, openDropdown] = useState(false);

    const onSearch = (e) => {
        const searchString = e.target.value;
        setVisibleData(data.filter(text => text.toLowerCase().includes(searchString)));
    }

    const handleClearSelectedValues = (e) => {
        handleChange(filterKey, null, false, UPDATE_TYPES.RESET);
        e.preventDefault();
    }

    const handleSelectAllVisibleData = (e) => {
        if (isAllVisibleDataSelected()) {
            handleChange(filterKey, null, false, UPDATE_TYPES.RESET);
        } else {
            handleChange(filterKey, visibleData, true, UPDATE_TYPES.REPLACE);
        }
    }

    const handleSelectValue = (e, value) => {
        handleChange(filterKey, value, e.target.checked, UPDATE_TYPES.MERGE);
    }

    const isAllVisibleDataSelected = () => visibleData.length > 0 && 
        visibleData.length === selectedValues.length &&
        visibleData.every(text => selectedValues.indexOf(text) > -1);

    const getSummary = () => {
        const selectedValuesCount = selectedValues.length;
        if (selectedValuesCount === 0) {
            return 'Select from the list';
        } else if (selectedValuesCount === 1) {
            return selectedValues[0];
        } else {
            return `${selectedValuesCount} selected`;
        }
    }
    
    const initEventListeners = () => {
        if (typeof $ !== undefined) {
            //Prevent dropdown to close
            $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {
                return false;
            });

            //Close dropdown to click outside
            $('body').on('click', function (e) {
                var $target = $(e.target);
                if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                    openDropdown(false);
                }
            });
        }
    }

    useEffect(() => initEventListeners());

	return (
		<div className={`advanced-select ${(selectedValues.length > 0 && 'choosen') || ''}`} disabled={disabled}>
            <div className={`dropdown ${(isDropdownOpen && 'open') || ''}`}>
                <input
                    id={filterKey}
                    type="button"
                    value={getSummary()}
                    className="trigger"
                    onClick={() => !disabled ? openDropdown(!isDropdownOpen) : null}
                    placeholder="Select from the list"
                />
                <a href="#" className="x-clear" onClick={handleClearSelectedValues}>
                    <i className="fa fa-times-circle" />
                </a>
                <a href="#" className="btn-toggle" data-toggle={(!disabled && "dropdown") || ''}>
                    <b className="caret" />
                </a>
                <ul className="dropdown-menu">
                    <li className="skip-li">
                        <input 
                            type="text"
                            className="q"
                            placeholder="Search"
                            onChange={onSearch}
                        />
                    </li>
                    <li>
                        <a className="x-check parent-check" href="#">
                            <input
                                type="checkbox"
                                name="Select_All"
                                id={`${filterKey}_0`}
                                checked={isAllVisibleDataSelected()}
                                onChange={handleSelectAllVisibleData}
                            />
                            <label htmlFor={`${filterKey}_0`}> Select All</label>
                        </a>
                    </li>
                    <li>
                        {
                            visibleData.map((entry, index) => 
                                <a 
                                    key={index}
                                    className="x-check"
                                    href="#"
                                >
                                    <input className="check-merchant"
                                        type="checkbox"
                                        name={entry}
                                        id={`${filterKey}_${entry}`}
                                        checked={selectedValues.includes(entry)}
                                        onChange={(e) => handleSelectValue(e, entry)}

                                    />
                                    <label htmlFor={`${filterKey}_${entry}`}>{capitalize(entry)}</label>
                                </a>
                            )
                        }
                    </li>
                </ul>
            </div>
        </div>
	);
}

export const FilterWrapper = ({
	title,
    popoverConfig,
	children,
}) => {
	return (
		<div className="fsc-container">
            <div className="fsc-field" id={popoverConfig?.containerId || ''}>
                <span className="title">
                    {title}
                    &nbsp;
                    { 
                        popoverConfig &&
                        <Popover
                            id={popoverConfig.id}
                            iconClass={popoverConfig.iconClass}
                            trigger={popoverConfig.trigger}
                            autoHideIcon={popoverConfig.autoHide}
                            containerId={popoverConfig.containerId}
                            content={popoverConfig.content}
                            placement={popoverConfig.placement}
                        />
                    }
                </span>
                {children}
            </div>
        </div>
	);
}
