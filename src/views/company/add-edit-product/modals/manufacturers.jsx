import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';
import { Search } from '../../../../consts/search-categories';
import { debounce } from '../../../../utils';

const { SEARCH_BY } = Search;

export const ManufacturersSearchFilter = ({
	searchStr = '',
	handleSearchStrChange = () => null,
	selectedCountry = '',
	handleSelectedCountryChange = () => null,
	city = '',
	handleCityInputChange = () => null,
	countries = [],
	showCompanyNameLabel = false,
	countriesDropdownPlaceholder = 'Select',
	companyNamePlaceholder = 'Search Manufacturers',
	extraInputs = null,
}) => {

	return (
		<div className="set-content">
            <div className="pdc-inputs">
                <div className="set-inputs">
                    <div className="input-container full-width">
                    	{showCompanyNameLabel && <span className="title">Company Name</span>}
                        <input 
                        	id="manufacturerName"
                        	type="text"
                        	className="input-text get-text"
                        	name="manufacturerName"
                        	placeholder={companyNamePlaceholder}
                        	value={searchStr}
                        	onChange={handleSearchStrChange}
                    	/>
                    </div>
                </div>
                <div className="set-inputs">
                    <div className="input-container full-width">
                    	<span className="title">Country / Territory</span>
                    	<select 
                        	className={`select-pop full-width ${(!selectedCountry && 'with-custom-placeholder') || ''}`}
			            	name="Country"
			            	value={selectedCountry}
			            	onChange={handleSelectedCountryChange}
			            >
			            	{!selectedCountry &&  <option disabled value={''} hidden>{countriesDropdownPlaceholder}</option>}
			            	{countries.map((country, index) => <option key={index} value={country}>{country}</option>)}
			            </select>
                    </div>
                </div>
                <div className="set-inputs">
                    <div className="input-container full-width"> <span className="title">City</span>
                        <input 
                        	id="selectedCity"
                        	type="text"
                        	className="input-text get-text"
                        	name="City"
                        	placeholder="City"
                        	value={city}
                        	onChange={handleCityInputChange}
                        />
                    </div>
                </div>
                {extraInputs}
            </div>
        </div>
	);
}

export const ManufacturersDropdown = ({
	suggestions = [],
	onOptionClick = () => null,
	isSelected = () => false,
	showDropdownHeader = false,
}) => {
	return (
		 <div className="dropdown-options">
		 	{
		 		showDropdownHeader &&
		 		<div className="dropdown-options-header clearfix">
					<span className="pull-left">Company Name</span>
					<span className="match-count pull-right">{suggestions.length} matches</span>
				</div>
		 	}
            <ul>
            	{
            		suggestions.map((suggestion, ix) => 
            			<li key={ix} className={(isSelected(suggestion.companyId) && 'selected') || ''}>
                            <a
                            	href="#"
                            	onClick={(e) => onOptionClick(e, suggestion)}
                            >
                                <div className="search-results">
                            		<i className="icon icon-little-company" />
                            		<div className="right-con">
                            			<span className="search-title">
                                        	{suggestion.companyName}
                                    	</span>
                                    	<span className="search-contents">
                                            {(suggestion.companyCountry || "") + ((suggestion.companyCity?.join() || "") && ", " + (suggestion.companyCity || "")) + ((suggestion.companyAddress?.join() || "") && ", " + (suggestion.companyAddress || ""))}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </li>
        			)
            	}
            </ul>
        </div>
	);
}

const ManufacturersModalBody = ({ 
	id = '',
	selectedManufacturers = [],
	setSelectedManufacturers = () => null,
	searchCompaniesByFilters = () => null,
}) => {

	const [searchStr, setSearchStr] = useState('');
	const [city, setCity] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState('');
	const [countries, setCountries] = useState([]);
	const [suggestions, setSuggestions] = useState([]);
	
	const inputId = `manufacturersModalTagsInput-${id}`;

	const handleSearchStrChange = (e) => {
		setSelectedCountry('');
		setCity('');
		setSearchStr(e.target.value);
	}

	const isSelected = (id) => {
		return selectedManufacturers.some(manufacturer => manufacturer.id === id);
	}

	const onClick = (e) => {
		setSelectedManufacturers([]);
		$(`#${inputId}`).tagsinput('removeAll');
		e.preventDefault();
	}

	const onOptionClick = (e, manufacturer) => {
		if (!selectedManufacturers.some(selected => selected.id === manufacturer.companyId[0])) {
			setSelectedManufacturers([
				...selectedManufacturers, 
				{ 
					id: manufacturer.companyId[0],
					name: manufacturer.companyName[0],

				}
			]);
		}
		e.preventDefault();
	}

	useEffect(() => {
		$(`#${inputId}`).tagsinput({
			itemValue: 'id',
  			itemText: 'name',
		});

		$(`#${inputId}`).tagsinput('removeAll');

		selectedManufacturers.forEach(item => $(`#${inputId}`).tagsinput('add', item));
	}, [selectedManufacturers])

	useEffect(() => {
		if (searchStr.length >= 1) {
			const filters = {
				keywords: searchStr,
				country: selectedCountry,
				city: city
			}
			debounce(() =>
				searchCompaniesByFilters(filters, ({ companies = [] , countries = [] }) => {
					setSuggestions(companies);
					setCountries(countries);
					if (selectedCountry && !countries.includes(selectedCountry)) {
						setSelectedCountry(null);
					}
		            $(".dropdown-options").niceScroll({
		                cursorcolor: "#9D9D9C",
		                cursorwidth: "6px",
		                cursorborderradius: "5px",
		                cursorborder: "1px solid transparent",
		                touchbehavior: true,
		            });
				})
			, 1000)();
		} else {
			setCountries([]);
			setSuggestions([]);
		}
	}, [searchStr, selectedCountry, city])

	useEffect(() => {
		$(`#${inputId}`).on('itemRemoved', (event) => {
			setSelectedManufacturers(selectedManufacturers.filter(manufacturer => manufacturer.id !== event.item.id));
		});
	})

	return (
		<>
			<div className="col-md-6 modal-border-right">
				<ManufacturersSearchFilter
					searchStr={searchStr}
					selectedCountry={selectedCountry}
					city={city}
					countries={countries}
					handleSearchStrChange={handleSearchStrChange}
					handleSelectedCountryChange={(e) => setSelectedCountry(e.target.value)}
					handleCityInputChange={(e) => setCity(e.target.value)}
				/>
				<ManufacturersDropdown
					suggestions={suggestions}
					isSelected={isSelected}
					onOptionClick={onOptionClick}
				/>
            </div>
       		<div className="col-md-6 tags-input">
                <div>
                    <h3>Selection <a className="pull-right" onClick={onClick} href="#">Clear all</a></h3>
                    <input id={inputId} name="Selection" type="text" name="txt-field" defaultValue={selectedManufacturers} data-role="tagsinput" style={{ display: 'none' }}/>
                </div>
			</div>
		</>
	)
}

const ManufacturersModal = ({
	showModal = false,
	setShowModal = () => null,
	updateItemData = () => null,
	searchCompaniesByFilters = () => null,
	data = [],
    id = ''
}) => {
	const [selectedManufacturers, setSelectedManufacturers] = useState();

	useEffect(() => {
		setSelectedManufacturers(data);
	}, [data]);

	const ModalBody = (
		<ManufacturersModalBody
			id={id}
			selectedManufacturers={selectedManufacturers}
			setSelectedManufacturers={setSelectedManufacturers}
			searchCompaniesByFilters={searchCompaniesByFilters}
		/>
	);
	return (
		<ConfirmationModal
			title='Manufacturers'
			show={showModal}
			body={ModalBody}
			onCancel={() => {
				setSelectedManufacturers(data);
				setShowModal(false);
			}}
			onConfirm={() => {
				updateItemData(id, selectedManufacturers, true);
				setShowModal(false);
			}}
			cancelLabel="Cancel"
			confirmLabel="Apply"
			wrapperClass='common'
			bodyClass='flex-direction-row'
			id='manufacturersModal'
		/>
	);
}

export default ManufacturersModal;