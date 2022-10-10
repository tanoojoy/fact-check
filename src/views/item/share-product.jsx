import React, { useState } from 'react';
import { getCustomFieldValues } from '../../utils';
import SendEmailModal, { EmailSentModal}  from '../common/send-email-modal';
import { ItemInfo } from './item-detail-header';

const defaultMessage = "Hello! I thought you might find this pharmaceutical product information useful. If you don't already have access to Cortellis Supply Chain Network, you can register for free to view this content.";

const ShareProduct = ({
	itemDetails = {},
	itemViewType = '',
	shareProductProfile = () => null,
}) => {
	const { MerchantDetail = {} } = itemDetails;
	const [processing, setProcessing] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);
	const [showEmailSentModal, setShowEmailSentModal] = useState(false);
	const [emailSuccessfullySent, setEmailSuccessfullySent] = useState(false);

	const handleShareProduct = ({ emails = [], comment = defaultMessage }) => {
		const data = {
			emails, 
			comment,
			companyId: MerchantDetail?.ID,
			companyName: MerchantDetail?.DisplayName,
			productId: itemDetails?.ID,
			productName: itemDetails?.Name,
			productType: itemViewType
		};
		if (processing) return;
		setProcessing(true);
		shareProductProfile(data, (success) => {
			setShowEmailSentModal(true);
			setEmailSuccessfullySent(success);
			setProcessing(false);
		});
	};
	return (
		<>
			<ItemInfo>
		        <div className="contact-stay-con">
		            <div className="blue-con-for-contact">
		                
		                <p className="title-caption">Share Product Profile</p>
		                <p className="contact-chat">
		                    <i 
		                    	className="icon icon-share-blue"
		                    	onClick={() => setShowShareModal(true)}
		                    />
		                    <a onClick={() => setShowShareModal(true)} href="#">
		                    	Share
		                    </a>
		                </p>
		            </div>
		        </div>
		    </ItemInfo>
		    <SendEmailModal
				id='shareProduct'
				title='Share Product Profile'
				cancelLabel='Cancel'
				confirmLabel='Share'
				defaultMessage={defaultMessage}
				showModal={showShareModal}
				setShowModal={setShowShareModal}
				onConfirm={handleShareProduct}
			/>
			<EmailSentModal
				title='Share Product Profile'
				successMessage='Product profile shared successfully.'
				success={emailSuccessfullySent}
				showModal={showEmailSentModal}
				setShowModal={setShowEmailSentModal}
			/>
		</>
	);
}

export default ShareProduct;