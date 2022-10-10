import React, { useState } from 'react';
import ItemCard from '../../common/item-card';
import { ModalTypes } from '../../../../../consts/modal-types';

const AdditionalProductInformation = ({
	updateModalVisibility = () => null,
	updateSelectedRowInfo = () => null,
    documents = []
}) => {

	const openUploadDocumentModal = (e) => {
		updateModalVisibility(ModalTypes.UPLOAD_DOCUMENT, true);
		e.preventDefault();
	}
	const onDeleteBtnClick = (e, index) => {
		updateSelectedRowInfo('documents', index);
		updateModalVisibility(ModalTypes.DELETE, true);
		e.preventDefault();
	}

	return (
		<ItemCard
			rowTitle='Additional Product Information'
			rowSubTitle='Coming Soon: Upload documents to share on your company profile page'
			title='Uploaded Documents'
			innerContainerClass='additional-products-info'
		>
			{documents.map((doc, ix) => 
				<div className="cortellis-row-partition" key={ix} >
                	<input className="width-whole" type="text" name="txt-field" value={doc.title} />
                	<a onClick={(e) => onDeleteBtnClick(e, ix)} href="#"><i className="icon icon-delete-entry"></i></a>
              	</div>
			)}
			<div className="table-button-con">
                <a className="table-row-button" href="#" onClick={openUploadDocumentModal}>
                	<i className="icon icon-add-row-cross"/>&nbsp;
                	Add Document
            	</a>
            </div>
		</ItemCard>
	);
}

export default AdditionalProductInformation;