import React, { useCallback, useState } from 'react';
import { ConfirmModalWindow, windowSizes } from './confirm-modal-window';
import { FooterConfirmModal } from '../horizon-pages/product-profile/components/footer-confirm-modal';

const mailToLink = 'mailto:dl-genericscscncompanyrequest@clarivate.com?subject=Cortellis Supply Chain Network: Verification Request [company page]&body=The Cortellis team will review your request and may contact you by email for further information.' +
    '%0D%0A%0D%0A' +
    'Are you requesting verification for a regulatory inspection or manufacturing capability? Please specify:  \n' +
    '%0D%0A%0D%0A' +
    'If you are requesting verification for a regulatory inspection, please provide GMP inspection certificates for inspection dates and GMPs. \n' +
    '%0D%0A%0D%0A' +
    'Please feel free to include any additional relevant supporting documents or information. ';

const ModalBody = () => {
    return <span>Would you like to request verification for this item?</span>;
};

export const VerifiedStatus = ({
    status = false,
    hasPermissions = false
}) => {
    const [showModal, setShowModal] = useState(false);
    const onVerifyClick = useCallback((e) => {
        e.stopPropagation();
        hasPermissions && setShowModal(true);
    }, [hasPermissions, setShowModal]);

    const currentStatus = status
        ? <span className='company-settings__verified-field' />
        : <a className={`company-settings__not-verified-field ${!hasPermissions ? ' company-settings__not-verified-field--disabled' : ''}`} onClick={onVerifyClick} target='_blank' rel='noreferrer' />;

    return (
        <>
            <ConfirmModalWindow
                title='Verification Request'
                show={showModal}
                size={windowSizes.xs}
                hideModal={() => setShowModal(false)}
                body={<ModalBody />}
                footer={
                    <FooterConfirmModal
                        approveText='Yes'
                        discardText='No'
                        onApproveChanges={(e) => {
                            e.stopPropagation();
                            setShowModal(false);
                            window.open(mailToLink);
                        }}
                        onDiscardChanges={(e) => {
                            e.stopPropagation();
                            setShowModal(false);
                        }}
                    />
                }
            />
            {currentStatus}
        </>
    );
};
