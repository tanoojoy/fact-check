import React, { useState, useEffect } from 'react';
import ConfirmationModal from './confirmation-modal';

export const EmailSentModal = ({
	title = '',
	showModal = false,
	setShowModal = () => null,
	success = false,
	successMessage = '',
}) => {
	
	const ModalBody = (
		<div className="item-field">
            <p>{success ? successMessage : 'Unknown error'}</p>
        </div>
    );

	return (
		<ConfirmationModal
			title={title}
			show={showModal}
			body={ModalBody}
			confirmLabel='Dismiss'
			hideCancelBtn
			onConfirm={() => {
				setShowModal(false)
			}}
			id='email-sent'
		/>
	);
}

const SendEmailModalBody = ({
	emails = '',
	message = '',
	defaultMessage = '',
	defaultEmailPlaceholder = '',
	invalidEmailFormat = false,
	handleMessageChange = () => null,
	handleEmailsChange = () => null,
	setInvalidEmailFormat = () => null,
}) => {

	const onEmailChange = (e) => {
		handleEmailsChange(e);
		validateMultipleEmails(e);
	}

	const validateMultipleEmails = (e) => {
		const inputEmails = e.target.value;
		// Split string by comma into an array
		var emailArr = inputEmails.split(",");

		var valid = true;
		var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		
		var invalidEmails = [];
		
		for (var i = 0; i < emailArr.length; i++) {
			// Trim whitespaces from email address
			emailArr[i] = emailArr[i].trim();
			
			// Check email against our regex to determine if email is valid
			if( emailArr[i] == "" || ! regex.test(emailArr[i])){
				invalidEmails.push(emailArr[i]);
			}
		}
		// Output invalid emails
		setInvalidEmailFormat(false);
		if(invalidEmails != 0) {
			setInvalidEmailFormat(true);
		}
	}

	return (
		<div className="col-md-12">
			<div className="common-tab-con">
				<div className="title-con">
					<p>Email</p>
				</div>
				<div className="content-con">
					<input
						type="email"
						className={`input-text get-text ${invalidEmailFormat ? 'error-con' : ''}`}
						name="email"
						placeholder={defaultEmailPlaceholder}
						value={emails}
						onChange={onEmailChange}
					/>
				</div>
			</div>
			<br />
			<br />
			<div className="common-tab-con">
				<div className="title-con">
					<p>Comment</p>
				</div>
				<div className="content-con popup-body-inner">
					<textarea 
						type="text"
						className="input-text get-text "
						name="Comment"
						placeholder={defaultMessage}
						value={message}
						onChange={handleMessageChange}
					/>
				</div>
			</div>
		</div>
	)
}

const SendEmailModal = ({
	id = '',
	title = '',
	confirmLabel = '',
	cancelLabel = '',
	defaultEmailPlaceholder = 'Add recipient email separated by (,) comma',
	defaultMessage = '',
	showModal = false,
	setShowModal = () => null,
	onConfirm = () => null,
	onCancel = () => null,
}) => {

	const [emails, setEmails] = useState('');
	const [message, setMessage] = useState(defaultMessage);
	const [invalidEmailFormat, setInvalidEmailFormat] = useState(false);

	const hideModal = () => {
		setShowModal(false);
		setEmails('');
		setMessage(defaultMessage);
		setInvalidEmailFormat(false);
	}

	const sendEmail = () => {
		if (invalidEmailFormat) return;

		const emailsArr = emails
            .split(',')
            .map((email) => email.trim())
            .filter(email => email.length > 0);

		onConfirm({
			comment: message,
			emails: emailsArr
		});
	}
	const ModalBody = (
		<SendEmailModalBody
			emails={emails}
			message={message}
			defaultEmailPlaceholder={defaultEmailPlaceholder}
			defaultMessage={defaultMessage}
			invalidEmailFormat={invalidEmailFormat}
			setInvalidEmailFormat={setInvalidEmailFormat}
			handleMessageChange={(e) => setMessage(e.target.value)}
			handleEmailsChange={(e) => setEmails(e.target.value)}
		/>
	)
	return (
		<ConfirmationModal
			wrapperClass='invite-modal'
			title={title}
			show={showModal}
			body={ModalBody}
			confirmLabel={confirmLabel}
			cancelLabel={cancelLabel}
			onCancel={() => {
				onCancel();
				hideModal();
			}}
			onConfirm={() => {
				sendEmail();
				hideModal();
			}}
			id={id}
			disableConfirm={invalidEmailFormat || !emails}
		/>
	)
}

export default SendEmailModal;