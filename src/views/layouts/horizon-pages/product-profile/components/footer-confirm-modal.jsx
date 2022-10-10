import React from 'react';
import { string, func, bool } from 'prop-types';
import { PrimaryButton, SecondaryButton } from '../../../horizon-components/buttons';

export const FooterConfirmModal = ({
    discardText = '',
    approveText = '',
    onDiscardChanges = () => { console.log('discardChanges is undefined'); },
    onApproveChanges = () => { console.log('approveChanges is undefined'); },
    secondaryButtonDisabled = false,
    primaryButtonDisabled = false
}) => {
    return (
        <div className='modal-footer-buttons'>
            {discardText && <SecondaryButton onClick={onDiscardChanges} disabled={secondaryButtonDisabled}>{discardText}</SecondaryButton>}
            {approveText && <PrimaryButton onClick={onApproveChanges} disabled={primaryButtonDisabled}>{approveText}</PrimaryButton>}
        </div>
    );
};

FooterConfirmModal.propTypes = {
    discardText: string,
    approveText: string,
    onDiscardChanges: func,
    onApproveChanges: func,
    secondaryButtonDisabled: bool,
    primaryButtonDisabled: bool
};
