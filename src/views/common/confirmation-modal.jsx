import React, { useEffect } from 'react';

const ConfirmationModal = ({ 
	title = '',
	id = '',
	show = false,
	hideCancelBtn = false,
	cancelLabel = 'No',
	onCancel = () => null,
	disableConfirm = false,
	confirmLabel = 'Yes',
	onConfirm = () => null,
	body = '',
	bodyClass = '',
	wrapperClass = 'delete-row',
}) => {

	useEffect(() => {
		if (show) {
			$('#root').parent().addClass('modal-open');
		} else {
			$('#root').parent().removeClass('modal-open');
		}
	}, [show]);


	if (!show) return null;
	return (
		<>
			<div id={id} className={`modal fade ${show ? 'in' : ''}`} role="dialog" style={{ display: show ? 'block' : 'none' }}>
	        	<div className={`modal-dialog ${wrapperClass}`}>
		            <div className="modal-content">
		                <div className="modal-header">
		                    <h4 className="modal-title">{title}</h4>
		                </div>
		                <div className={`modal-body ${bodyClass}`}>
		                    {body}
						</div>
		                <div className="modal-footer">
		                    {!hideCancelBtn && <div className="btn-gray" onClick={onCancel}>{cancelLabel}</div>}
		                    <div className={`btn-blue ${(disableConfirm && 'disabled') || ''}`} disabled={disableConfirm} onClick={!disableConfirm ? onConfirm : null}>{confirmLabel}</div>
		                </div>
		            </div>
		        </div>
	        </div>
	        <div className="modal-backdrop fade in" />
	    </>
	)
}

export default ConfirmationModal;