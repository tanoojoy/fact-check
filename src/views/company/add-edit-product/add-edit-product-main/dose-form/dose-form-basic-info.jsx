import React, { useState, useEffect } from 'react';
import ItemCard from '../../common/item-card';
import ItemCheckboxForm from '../../common/item-checkbox-form';

import { GetCountries } from '../../../../../public/js/enum-core';

const countries =  GetCountries().map(country => country.name).sort((a, b) => {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
});

const DoseFormBasicInfo = ({
	subsidaryType = '',
    countriesLaunched = [],
    handleStateChange = () => null,
}) => {
    const [visibleCountries, setVisibleCountries] = useState(countries);
    const [isDropdownOpen, openDropdown] = useState(false);

    const subsidaryTypeData = ['Manufacturer', 'Marketer'].map(option => ({
        label: option,
        value: option,
    }))

    const onChangeSubsidaryType = (event) => {
        handleStateChange('subsidaryType', event.target.value);
    }

    const onChange = (e, country) => {
    	if (countriesLaunched.includes(country)) {
            handleStateChange('countriesLaunched', countriesLaunched.filter(c => c !== country));
    	} else {
            handleStateChange('countriesLaunched', [...countriesLaunched, country]);
    	}
    }

    const handleClearSelectedCountries = (e) => {
        handleStateChange('countriesLaunched', []);
    	e.preventDefault();
    }

    const handleSelectAllVisibleCountries = (e) => {
    	if (isAllVisibleCountriesSelected()) {
            handleStateChange('countriesLaunched', []);
    	} else {
            handleStateChange('countriesLaunched', visibleCountries);
    	}
    }

    const onSearch = (e) => {
    	const searchString = e.target.value;
    	setVisibleCountries(countries.filter(country => country.toLowerCase().includes(searchString)));
    }

    const getSummary = () => {
    	const selectedCountriesCount = countriesLaunched.length;
    	if (selectedCountriesCount === 0) {
    		return 'Start typing';
    	} else if (selectedCountriesCount === 1) {
    		return countriesLaunched[0];
    	} else {
    		return `${selectedCountriesCount} selected`;
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

    const isAllVisibleCountriesSelected = () => visibleCountries.length === countriesLaunched.length &&
    	visibleCountries.every(visibleCountry => countriesLaunched.indexOf(visibleCountry) > -1);

    useEffect(() => initEventListeners());

	return (
		<ItemCard containerClass='display-Flex'>
            <div className="common-tab-con dose-form">
                <div className="title-con">
                    <p>Subsidiary Type</p>
                </div>
                <div className="content-con">
                    <ItemCheckboxForm
		                id='subsidary-type'
		                formName='Subsidary Type'
		                data={subsidaryTypeData}
		                onChange={onChangeSubsidaryType}
		                selected={subsidaryType}
		            />
                </div>
            </div>
            <div className="common-tab-con dose-form">
                <div className="title-con">
                    <p>Launched Countries</p>
                </div>
                <div className="content-con">
                    <div className={`advanced-select country ${(countriesLaunched.length > 0 && 'choosen') || ''}`} data-model="Countries">
                        <div className={`dropdown ${(isDropdownOpen && 'open') || ''}`}>
                            <input 
                            	id="LaunchedCountries"
                            	type="button"
                            	value={getSummary()}
                                className="trigger"
                                onClick={() => openDropdown(!isDropdownOpen)}
                                placeholder="Start typing"
                            />
                            <input 
                            	type="text"
                            	className="q"
                            	placeholder="Start typing"
                            	onChange={onSearch}
                            />
                            <a href="#" className="x-clear" onClick={handleClearSelectedCountries}>
                            	<i className="fa  fa-times-circle" />
                        	</a>
                            <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                            <ul className="dropdown-menu">
                                <li>
                                	<a className="x-check parent-check" href="#">
                                		<input
                                            type="checkbox"
                                            name="LaunchedCountries_0"
                                            id="LaunchedCountries_0"
                                            checked={isAllVisibleCountriesSelected()}
                            				onChange={handleSelectAllVisibleCountries}

                                        />
                                        <label htmlFor="LaunchedCountries_0"> Select All</label>
                                    </a>
                                </li>
                                <li>
                                	{
                                		visibleCountries.map((country, index) => 
                                			<a 
                                				key={index}
                                				className="x-check"
                                				href="#"
                                			>
		                                		<input className="check-merchant"
		                                            type="checkbox"
		                                            name={country}
		                                            id={country}
		                                            checked={countriesLaunched.includes(country)}
                                    				onChange={(e) => onChange(e, country)}

		                                        />
		                                        <label htmlFor={country}>{country}</label>
		                                    </a>
                                		)
                                	}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ItemCard>
	);
}

export default DoseFormBasicInfo;