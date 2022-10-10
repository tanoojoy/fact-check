import React from 'react';
import Modal from './modal';

const ConfirmLinkToCompanyModal = ({
	showModal = false,
	onConfirm = () => null,
	onHideModal = () => null,
	selectedManufacturer = null,
	hasRequestError = false
}) => {
    const companyInfo = selectedManufacturer?.companyId ? 
    	`${selectedManufacturer.companyName}, ${selectedManufacturer.companyCity}, ${selectedManufacturer.companyCountry}`
    	: (selectedManufacturer?.companyName || '');
	const ModalBody = (
		<div className="popup-body-inner">
			<p className="selected-style">Selected Company</p>
			<p className="selected-content">{companyInfo}</p>
			<p>
				Approval may take up to 2 business days. Until then, 
				you can still access Cortellis Supply Chain Network 
				with some limitations.
			</p>
			{
				hasRequestError &&
				<p>
					Server error. Please try again later.
				</p>
			}
		</div>
    );
	return (
		<Modal
			id='btnConfirmRequest'
			title='Confirm your request'
			show={showModal}
			body={ModalBody}
			cancelLabel='Cancel'
			confirmLabel='Send Request'
			handleCancel={onHideModal}
			handleConfirm={onConfirm}
		/>
	);
}

export default ConfirmLinkToCompanyModal;