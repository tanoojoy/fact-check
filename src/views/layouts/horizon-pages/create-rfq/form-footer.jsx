import React from 'react';
import { string, number, func, arrayOf, oneOfType, object } from 'prop-types';
import { PrimaryButton } from '../../horizon-components/buttons';
import { isFreemiumUserSku } from '../../../../utils';
import { getLimits, FREEMIUM_LIMITATION_POSITION } from '../../horizon-components/limitation-block-freemium';

const FormFooter = ({ requiredFields, sendForm, user = {} }) => {
    const correctValues = requiredFields.filter(Boolean);
    const limits = getLimits(FREEMIUM_LIMITATION_POSITION.rfq, user?.flags);
    const disabled = (isFreemiumUserSku(user) && limits.current >= limits.limit) ||
        requiredFields.length !== correctValues.length;

    return (
        <div className='rfq-form-footer container-fluid'>
            <div className='row'>
                <div className='col-xs-12 caption'>After sending the RFQ the chat will start</div>
            </div>
            <div className='row rfq-send-btn'>
                <PrimaryButton onClick={sendForm} disabled={disabled}>
                    Send & Start Chat
                </PrimaryButton>
            </div>
        </div>
    );
};

FormFooter.propTypes = {
    requiredFields: arrayOf(oneOfType([string, number])),
    sendForm: func,
    user: object
};

export default FormFooter;
