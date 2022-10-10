import React from 'react';

const Modal = ({
	id = '',
	show = false,
	title = '',
	handleConfirm = () => null,
	handleCancel = () => null,
	body = '',
	cancelLabel = 'Cancel',
	confirmLabel = 'Yes',
	disableConfirmButton = false
}) => {
	if (!show) return null;

	const onConfirmBtnClick = (e) => {
		handleConfirm();
		e.preventDefault();
	}

	const onCancelBtnClick = (e) => {
		handleCancel();
		e.preventDefault();
	}

	return (
		<div id={id} className={`popup popup-start-seller ${show ? 'in' : ''}`} style={{ display: 'block'}}>
			<div className="popup-wrapper clearfix">
				<div className="popup-title">
					<h4>{title}</h4>
				</div>
				<div className="popup-body">
					{body}
				</div>
				<div className="popup-footer clearfix">
					<a href="#" onClick={onConfirmBtnClick} className={`mybtn btn-blue pull-right ${disableConfirmButton ? 'disabled': ''}`}>{confirmLabel}</a>
					<a href="#" onClick={onCancelBtnClick} className="mybtn btn-grey pull-right">{cancelLabel}</a>
				</div>
			</div>
		</div>

	);
}

export default Modal;