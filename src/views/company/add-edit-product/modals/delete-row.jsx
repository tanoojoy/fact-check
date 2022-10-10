import React from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';

const DeleteRowModal = ({
	showModal = false,
	setShowModal = () => null,
	onConfirmDelete = () => null,
	onCancelDelete = () => null
}) => {
	const ModalBody = (
		<div className="item-field">
            <p>
	            Are you sure you want to delete this row?
	            <br />
				Changes will not be saved.
            </p>
        </div>
    );
	return (
		<ConfirmationModal
			title='Delete'
			show={showModal}
			body={ModalBody}
			onCancel={() => {
				onCancelDelete();
				setShowModal(false);
			}}
			onConfirm={() => {
				onConfirmDelete();
				setShowModal(false);
			}}
			id='delete-row'
		/>
	);
}

export default DeleteRowModal;