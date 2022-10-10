import React from 'react';
import Modal from './modal';

import { ManufacturersSearchFilter } from '../company/add-edit-product/modals/manufacturers';

const ConfirmLinkToUnknownCompanyModal = ({
	showModal = false,
	onConfirm = () => null,
	onHideModal = () => null,
	selectedManufacturer = null,
	hasRequestError = false,
	companyName = '',
	selectedCountry = '',
	city = '',
	countries = [],
	website = '',
	comment = '',
	handleCompanyNameChange = () => null,
	handleSelectedCountryChange =  () => null,
	handleCityInputChange =  () => null,
	handleWebsiteChange =  () => null,
	handleCommentChange =  () => null,
}) => {
	const extraInputs = (
		<>
			<div className="set-inputs">
				<div className="input-container full-width">
					<span className="title">Website</span>
					<input 
						type="text"
						className="input-text get-text"
						name="Website"
						value={website}
						onChange={handleWebsiteChange}
					/>
				</div>
			</div>
			<div className="set-inputs">
				<div className="input-container full-width">
					<span className="title">Comment</span>
					<textarea 
						id="comment"
						name="comment"
						value={comment}
						onChange={handleCommentChange}
					/>
				</div>
			</div>
		</>
	)

	const ModalBody = (
		<div className="popup-body-inner">
			<p>
				Please provide your company name, location and 
				website. We will respond you within 1-2 business days.
			</p>
			<ManufacturersSearchFilter
                showCompanyNameLabel
                countriesDropdownPlaceholder='Select From The List'
                searchStr={companyName}
                selectedCountry={selectedCountry}
                city={city}
                countries={countries}
                handleSearchStrChange={handleCompanyNameChange}
                handleSelectedCountryChange={handleSelectedCountryChange}
                handleCityInputChange={handleCityInputChange}
                extraInputs={extraInputs}
                companyNamePlaceholder={''}
            />
		</div>
    );
	const disableConfirmButton =  (!companyName || !selectedCountry || !city || !website);
	return (
		<Modal
			id='btnCannotFind'
			title="I can't find my company in the list"
			show={showModal}
			body={ModalBody}
			cancelLabel='Cancel'
			confirmLabel='Send Request'
			handleCancel={onHideModal}
			disableConfirmButton={disableConfirmButton}
			handleConfirm={() => {
				const data = {
					company: companyName,
					workLocationCountry: selectedCountry,
					workLocationCity: city,
					website,
					comment,
				}
				onConfirm(data);
			}}
		/>
	);
}

export default ConfirmLinkToUnknownCompanyModal;