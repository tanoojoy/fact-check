import React, { useState } from 'react';
import ConfirmationModal from '../../../common/confirmation-modal';

const bytesToMegaBytes = (bytes, roundTo) => {
    const converted = bytes / (1024*1024);
    return roundTo ? converted.toFixed(roundTo) : converted;
}

const UploadDocumentModalBody = ({
	onFileChange = () => null,
	onUploadNameChange = () => null,
	file = {},
}) => {
	const showBrowseButton = !(file && file.fileName && file.size);
	return (
		<>
			<div className="col-md-12">
                <div className="common-tab-con">
                    <div className="title-con">
                        <p>Title</p>
                    </div>
                    <div className="content-con">
                        <input 
                        	id="uploadName"
                        	type="text"
                        	className="input-text get-text "
                        	name="Upload Name"
                        	placeholder="Start typing"
                        	value={file?.title || ''}
                        	onChange={onUploadNameChange}
                    	/>
                    </div>
                </div>
           </div>
           <div className="col-md-12">
               <div className="common-tab-con flex-direction-column">
                    <div className="upload-con">
                    	{
                    		showBrowseButton ?
		                        <div className="btn-upload btn">
		                            <input onChange={onFileChange} type="file" accept="application/pdf" />
		                            Browse Files
		                        </div>
		                    : 
		                    	<div className="file-common">
		                            <div className="file-con">
		                                Files &nbsp;
		                                <span className="file-name">{file?.fileName || ''}</span>
		                            </div> 
		                            <div className="file-con">
		                                Size &nbsp;
		                                <span className="file-name">{file?.size || 0} MB</span>
		                            </div>  
		                        </div>
                        }
                    </div>
                    <div className="notification-con">
                        <i className="icon icon-warn-blue"></i>
                        <span>PDF Files Only. Maximum file size 10MB.</span>
                    </div>
                </div>
            </div>
		</>

	)
}

const UploadDocumentModal = ({ 
	showModal = false,
	setShowModal = () => null,
	onAddDocument = () => null
}) => {
	const [document, setDocument] = useState(null);

	const onUploadNameChange = (e) => {
		setDocument({
			...document,
			title: e.target.value,
		})
	}
	const onFileChange = (e) => {
		const file = e.target.files[0];
		const fileName = file.name;
		const size = bytesToMegaBytes(file.size, 2);
		setDocument({
			...document,
			fileName,
			size,
			file
		});
	}

	const ModalBody = (
		<UploadDocumentModalBody
			onFileChange={onFileChange}
			onUploadNameChange={onUploadNameChange}
			file={document}
		/>
	);
	const isConfirmBtnDisabled =  !(document && document.fileName && document.title && document.size && document.size <= 100);

	return (
		<ConfirmationModal
			title='Add Document'
			show={showModal}
			body={ModalBody}
			onCancel={() => setShowModal(false)}
			onConfirm={() => {
				onAddDocument({ title: document.title, file: document.file})
				setShowModal(false);
				setDocument(null);
			}}
			disableConfirm={isConfirmBtnDisabled}
			cancelLabel="Cancel"
			confirmLabel="Add Document"
			wrapperClass='common upload-modal'
			id='uploadDocumentModal'
		/>
	);
}

export default UploadDocumentModal;