import React from 'react';
import { userRoles } from '../../consts/horizon-user-roles';
import Modal from '../choose-user-company/modal';

const getProperRoleName = (role) => {
    switch (role) {
    case userRoles.subBuyer:
        return 'Buyer';
    case userRoles.subMerchant:
        return 'Seller';
    default:
        return '';
    }
};

const ConfirmUserRoleModal = ({
	showModal = false,
	onConfirm = () => null,
	onHideModal = () => null,
	selectedRole = ''
}) => {
	const ModalBody = (
		<div className="popup-body-inner">
			<p className="text-center">Please confirm your selection</p>
		</div>
    );
	return (
		<Modal
			id='btnLoginSeller'
            title={`I am a ${getProperRoleName(selectedRole)}`}
			show={showModal}
			body={ModalBody}
			cancelLabel='Cancel'
			confirmLabel='Confirm'
			handleCancel={onHideModal}
			handleConfirm={onConfirm}
		/>
	);
}

export default ConfirmUserRoleModal;