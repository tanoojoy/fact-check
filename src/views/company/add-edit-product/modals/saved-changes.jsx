import React from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';

const SavedChangesModal = ({
	showModal = false,
	setShowModal = () => null,
	onConfirmSavedChanges = () => null,
	isEditPageType = false,
	success = false,
	errorMessage = ''
}) => {
	const successMessage = isEditPageType ? 'Your updates have been saved' : 
		<>
			<span style={{ fontWeight: 'bold'}}>Please Note</span>: &nbsp; New products added will appear on your company page and in search results the next day.
		</>
	;
	const ModalBody = (
		<div className="item-field">
            <p>{success ? successMessage : (errorMessage || 'Unknown error')}</p>
        </div>
    );

	return (
		<ConfirmationModal
			title='Confirmation'
			show={showModal}
			body={ModalBody}
			confirmLabel='Ok'
			hideCancelBtn
			onConfirm={() => {
				if (success) {
					onConfirmSavedChanges();
				}
				setShowModal(false)
			}}
			id='saved-changes'
		/>
	);
}

export default SavedChangesModal;