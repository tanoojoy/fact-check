import React, { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import { chatConstants } from '../../../consts/chat-constants';
import { typeOfSearchBlock } from '../../../consts/search-categories';
import { createLicensingInquiry as createLicensingInquiryPPs } from '../../../consts/page-params';
import { userRoles } from '../../../consts/horizon-user-roles';

import Detail from './detail';

import { HeaderLayoutComponent as HeaderLayout } from '../../layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';
import { FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';
import { DropdownField, UPDATE_TYPES } from '../../search/filters/common-components';

import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';
import { generateConversationToken, sendSystemMessage } from '../../../redux/chatActions';
import { createRFQ } from '../../../redux/itemDetailsActions';
import { getAppPrefix } from '../../../public/js/common';
import { getCustomFieldValues } from '../../../utils';

const BasicProductInfo = ({ itemDetail = {}  }) => {
	const { CustomFields = [], Categories = [] } = itemDetail;
	return (
		<div className="bg-quota">
            <p><span>Supplier</span> <strong>{itemDetail?.MerchantDetail?.DisplayName || ''}</strong></p>
            <p><span>Product Name</span> <strong>{itemDetail.Name}</strong></p>
            <p><span>CAS Number</span> <strong>{getCustomFieldValues(CustomFields, 'casNumber')}</strong></p>
            <p><span>Product Type</span> <strong>{Categories[0]?.Name || ''}</strong></p>
        </div>
	);
}

const LicensingInquiryForm = ({ 
	rfqFormDropdowns,
	comment,
	acceptingQuotesUntil,
	documentsRequired,
	handleTextChange = () => null,
	handleSelectChange = () => null,
}) => {
    const { requiredDocs = [] } = rfqFormDropdowns;

    useEffect(() => {
		initDatePicker();
	});

	const initDatePicker = () => {
		$(document).ready(function () {
			$('#datepicker').datetimepicker({
	            format: 'DD/MM/YYYY',
	            minDate: new Date(),
	        });
	        $('#datepicker').on('dp.change', function(e) { 
	            const { name, value } = e.currentTarget;
	            if (name && value) {
	                const date = moment(value, 'DD/MM/YYYY').toISOString();
	                handleTextChange(null, { key: 'acceptingQuotesUntil', value: date });
	            }
	        });
	    })
	}
	return (

		<>
			<div className="row">
                <div className="col-sm-4">
                    <label htmlFor="comment">Comment</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group">
                        <textarea rows="4" className="form-control" name="comment" id="comment" value={comment} onChange={handleTextChange}></textarea>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label htmlFor="documents">Documents required</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group document-group">
		            	<DropdownField
		            		data={requiredDocs.map(doc => doc.label)}
						    selectedValues={documentsRequired}
						    handleChange={handleSelectChange}
						    filterKey={'documentsRequired'}
		            	/>
		            </div>
		        </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label htmlFor="accepting-quotes">Accepting quotes until</label>
                </div>
                <div className="col-sm-4">
                    <div className="form-group">
                        <input 
                        	data-format="DD/MM/YYYY" 
                        	name="acceptingQuotesUntil" 
                        	placeholder="DD/MM/YYYY" 
                        	id="datepicker" 
                        	type="text" 
                        	className="form-control required datepicker-txt" 
                    	/>
                    </div>
                </div>
            </div>
		</>
	)
}

export class CreateLicensingInquiry extends Component {

	constructor(props) {
		super(props);
		this.state = {
			comment: '',
			acceptingQuotesUntil: null,
			documentsRequired: [],
		}
        this.prevPageUrl = `${getAppPrefix()}/product-profile/profile/${props.companyInfo.id}/${props.itemDetail.ID}`;
        this.onTextChange = this.onTextChange.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
	}

	onTextChange(e, customData = null) {
		if (!customData) {
			this.setState({ [e.target.name]: e.target.value });
		} else {
			this.setState({ [`${customData.key}`]: customData.value })
		}
	}

	onSelectChange = (key, value, toAdd = true, updateType = UPDATE_TYPES.MERGE) => {
		const currentValues = this.state[key] || [];
		let updatedValues = [];
		switch (updateType) {
			case UPDATE_TYPES.MERGE:
				updatedValues = toAdd ? [...currentValues, value] : currentValues.filter(val => val !== value);
				break;
			case UPDATE_TYPES.REPLACE:
				updatedValues = value;
				break;
			default:
				break;
		}
		this.setState({ [`${key}`]: updatedValues });
	}

	getBreadCrumbValues() {
        if (this.props.companyInfo) {
            return [
                {
                	name: this.props.companyInfo.name, 
                	redirectUrl: `/company/${this.props.companyInfo.id}`
            	},
            	{ 
            		name: this.props.itemDetail.Name, 
            		redirectUrl: `/product-profile/Manufacturer/${this.props.companyInfo.id}/${this.props.itemDetail.ID}`
            	},
                {
                    name: 'Create Licensing Inquiry',
                }
            ];
        }
        return [];
    }

    saveLicensingInquiryDetails() {

        const { user, itemDetail } = this.props;
		const { CustomFields = [], Categories = [], MerchantDetail } = itemDetail;

        const { acceptingQuotesUntil, comment, documentsRequired } = this.state;

        const chatId = `chatcommon${this.props.user.companyId}${Date.now()}`;

        const formData = {
        	acceptingQuotesUntil,
        	comment,
            documentsRequired: JSON.stringify(documentsRequired),
        	chatId,
            quantity: 0,
            unit: '',
            buyerId: user.ID,
            casNumber: getCustomFieldValues(CustomFields, 'casNumber'),
            cgiCompanyId:  MerchantDetail.ID,
            productId: itemDetail.ID,
            productName: itemDetail.Name,
            productType: (Categories[0]?.Name || '').toLowerCase(),
            sellerId: MerchantDetail.ID.toString()
        }

        this.props.createRFQ(formData, (rfqData, chatUrl) => {
            const chatIdSplit = rfqData.chatId.split('|');
            const channelName = chatIdSplit[0];
            const sid = chatIdSplit[1];
            const userId = rfqData.sellerId;
            this.props.generateConversationToken('browser', userId, (convData) => {
                this.props.sendSystemMessage(channelName, sid, convData, chatConstants.systemName, chatConstants.LicensingInquiryReceivedMsg, () => {
                    window.location.href = chatUrl;
                });
            });
        });
    }

	render() {
        const { user, itemDetail, rfqFormDropdowns } = this.props;

		return (
			<>
				<UpgradeToPremiumTopBanner 
                    user={user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                /> 
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} setSearchCategory={this.props.setSearchCategory} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main">
                	<BreadcrumbsComponent trails={this.getBreadCrumbValues()} />
                    <SearchPanel
                        hideLimitationToRoles={[userRoles.subMerchant]}
                        user={user}
                        position={FREEMIUM_LIMITATION_POSITION.licensingInquiry}
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                	<div className="rfq-container">
                		<div className="header-title-bg-area">
                            <div className="container">
                                <a className="btn-cancel-link" href={this.prevPageUrl}>
                                	<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                		<circle cx="20" cy="20" r="19.5" fill="#3D5FC0" stroke="#3D5FC0"/>
                                		<path d="M23.41 15.41L22 14L16 20L22 26L23.41 24.59L18.83 20L23.41 15.41Z" fill="white"/>
                                	</svg>
                                	<span>Cancel</span>
                            	</a>
                            </div>
                        </div>
                        <div className="cmn-mt-section">
	                		<div className="container--fluid">
	                            <form className="requestQuotation">
	                            	<div className="ccard">
										<div className="ccard-header">
	                                        <h4>Licensing Inquiry</h4>
	                                    </div>
	                                    <div className="ccard-body">
	                                    	<BasicProductInfo itemDetail={itemDetail} />
	                                    	<LicensingInquiryForm
	                                    		rfqFormDropdowns={rfqFormDropdowns}
	                                    		comment={this.state.comment}
	                                    		documentsRequired={this.state.documentsRequired}
	                                    		acceptingQuotesUntil={this.state.acceptingQuotesUntil}
	                                    		handleTextChange={this.onTextChange}
	                                    		handleSelectChange={this.onSelectChange}
	                                    	/>
	                                    </div>
                                    	<div className="ccard-footer">
                                            <div className="rfq-chart">
                                                <a className="link" href="javascript:void(0);">After sending the Licensing Inquiry the chat will start</a>
                                                <button type="button" name="send" id="startChat" onClick={() => this.saveLicensingInquiryDetails()}>Send & Start Chat</button>
                                            </div>                                            
                                        </div>
	                            	</div>
	                            </form>
	                        </div>
                            <div className='container'>
                                <UnlockMoreResultsBanner 
                                    user={user}
                                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                                    page={createLicensingInquiryPPs.appString} 
                                />
                            </div>
	                    </div>
                	</div>    
                </div>
                <div className="footer grey">
                    <FooterLayoutComponent user={this.props.user} />
                </div>      
            </> 
		)
	}
}


const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        itemDetail: state.itemsReducer.itemDetail, 
        rfqFormDropdowns: state.itemsReducer.rfqFormDropdowns,
        companyInfo: state.companyReducer.companyInfo,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
};

const mapDispatchToProps = (dispatch) => {
	return {
		createRFQ: (rfq, callback) => dispatch(createRFQ(rfq, callback)),
        generateConversationToken: (device, userid, callback) => dispatch(generateConversationToken(device, userid, callback)),
        sendSystemMessage: (channelId, userId, conversationData, senderName, message, callback) => dispatch(sendSystemMessage(channelId, userId, conversationData, senderName, message, callback)),
	    getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
	    sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
	}
};

export const CreateLicensingInquiryHome = connect(mapStateToProps, mapDispatchToProps)(CreateLicensingInquiry);
