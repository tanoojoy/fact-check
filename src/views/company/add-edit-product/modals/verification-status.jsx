import React from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';

const mailToLink = 'mailto:dl-genericscscncompanyrequest@clarivate.com?subject=Cortellis Supply Chain Network: Verification Request [company page]&body=The Cortellis team will review your request and may contact you by email for further information.' +
    '%0D%0A%0D%0A' +
    'Are you requesting verification for a regulatory inspection or manufacturing capability? Please specify:  \n' +
    '%0D%0A%0D%0A' +
    'If you are requesting verification for a regulatory inspection, please provide GMP inspection certificates for inspection dates and GMPs. \n' +
    '%0D%0A%0D%0A' +
    'Please feel free to include any additional relevant supporting documents or information. ';


const VerificationStatusModal = ({ 
	showModal = false,
	setShowModal = () => null 
}) => {
	const ModalBody = (
		<div className="item-field">
            <p>Would you like to request verification for this item?</p>
        </div>
    );
	return (
		<ConfirmationModal
			title='Verification Request'
			show={showModal}
			body={ModalBody}
			onCancel={() => setShowModal(false)}
			onConfirm={() => {
				setShowModal(false)
				window.open(mailToLink);
			}}
			id='manufacturingStatusVerificationModal'
		/>
	);
}

export default VerificationStatusModal;