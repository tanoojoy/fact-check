import React from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';

const DiscardChangesModal = ({
	showModal = false,
	setShowModal = () => null,
	onConfirmDiscard = () => null,
}) => {
	const ModalBody = (
		<div className="item-field">
            <p>
	            Are you sure you want to discard all changes?
	            <br />
				Changes will not be saved.
            </p>
        </div>
    );
	return (
		<ConfirmationModal
			title='Confirmation'
			show={showModal}
			body={ModalBody}
			cancelLabel='Cancel'
			confirmLabel='Yes, discard'
			onCancel={() => {
				setShowModal(false);
			}}
			onConfirm={() => {
				onConfirmDiscard();
				setShowModal(false);
			}}
			id='discard-changes'
		/>
	);
}

export default DiscardChangesModal;