'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
import { typeOfSearchBlock } from '../../../consts/search-categories';
import { 
    viewRfq as viewRfqPPs,
    viewLicensingInquiry as viewLicensingInquiryPPs
} from '../../../consts/page-params';
import { userRoles } from '../../../consts/horizon-user-roles';

import { HeaderLayoutComponent as HeaderLayout } from '../../layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';
import moment from 'moment';
const CommonModule = require('../../../public/js/common');
import { FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';

import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';
import { 
    rfqStatusMessages,
    licensingInquiryStatusMessages
} from '../../../consts/rfq-quote-statuses';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

const AcceptingQuotes = ({ acceptingQuotesUntil }) => {
    return (
        <div className="row">
            <div className="col-sm-4 col-xs-4">
                <label htmlFor="accepting-quotes">Accepting quotes until</label>
            </div>
            <div className="col-sm-4 col-xs-4">
                <div className="attr-label"><strong>{acceptingQuotesUntil}</strong></div>
            </div>
        </div>
    )
}
                                            
const DocumentsRequired = ({ documentsRequiredValue }) => {
    return (
        <div className="row">
            <div className="col-sm-4 col-xs-4">
                <label htmlFor="documents">Documents required</label>
            </div>
            <div className="col-sm-8 col-xs-8">
                <div className="attr-label"><strong>{documentsRequiredValue}</strong></div>
            </div>
        </div>
    )
}

const Comment = ({ rfqComment }) => {
    return (
        <div className="row">
            <div className="col-sm-4 col-xs-4">
                <label htmlFor="comment">Comment</label>
            </div>
            <div className="col-sm-8 col-xs-8">
                <div className="attr-label"><strong>{rfqComment}</strong></div>
            </div>
        </div>
    )
}

class ViewRfqComponent extends BaseComponent {
    constructor(props) {
        super(props);

        const [rfqData] = props.customFields;

        const { company } = rfqData;
        this.trails = [{ name: 'Home', redirectUrl: '/' },
        { name: company.name, redirectUrl: `/company/${company.id}` },
        { name: rfqData.productName, redirectUrl: `/product-profile/${rfqData.productType === 'api' ? 'profile' : 'Manufacturer'}/${company.id}/${rfqData.productId}` },
        { name: rfqData.productType === 'api' ? 'RFQ' : 'Licensing Inquiry', redirectUrl: '' }
        ];
    }

    getStatus = () => {
        const [rfqData] = this.props.customFields;
        let statusColorClass = '';
        const statusMessages = rfqData.productType === 'api' ? rfqStatusMessages : licensingInquiryStatusMessages;
        const status = statusMessages[rfqData.status].buyerMessage;
        switch (rfqData.status) {
            case 'pending':
                statusColorClass = 'alert-warning';
                break;
            case 'submitted':
                statusColorClass = 'alert-primary';
                break;
            case 'declined':
                statusColorClass = 'alert-danger';
                break;
        }
        
        return <div className={`alert ${statusColorClass}`}>{status}</div>;
    }

    getLabel = () => {
        const [rfqData] = this.props.customFields;
        return rfqData.productType === 'finished dose'? 'Licensing Inquiry' : 'Request for Quotation';
    }

    render() {
        const [rfqData, chatId] = this.props.customFields;
        console.log('rfqData', rfqData);
        let documentsRequiredValue = '';
        for (var i = 0; i < rfqData.documentsRequired.length; i++) {
            documentsRequiredValue += rfqData.documentsRequired[i].name;
            if (i < rfqData.documentsRequired.length - 1) {
                documentsRequiredValue += ', ';
            }
        }
                

        let expectedTimeOfArrival = '';
        let acceptingQuotesUntil = '';
        
        if (rfqData && rfqData.expectedTimeOfArrival) {
            expectedTimeOfArrival = moment(rfqData.expectedTimeOfArrival.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
        }

        if (rfqData && rfqData.acceptingQuotesUntil) {
            acceptingQuotesUntil = moment(rfqData.acceptingQuotesUntil.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
        }
        
        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                /> 
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} setSearchCategory={this.props.setSearchCategory} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main">       
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />   
                    <SearchPanel
                        hideLimitationToRoles={[userRoles.subMerchant]}
                        user={this.props.user}
                        position={rfqData.productType === 'api' ? FREEMIUM_LIMITATION_POSITION.rfq : FREEMIUM_LIMITATION_POSITION.licensingInquiry}
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
                                <a className="btn-cancel-link" href="javascript:void(0);" href={`${CommonModule.getAppPrefix()}/chat/chatRFQ/${rfqData.id}/${chatId.chatId}`}>
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
                                            <h4>{this.getLabel()}</h4>
                                        </div>
                                        <div className="ccard-body">
                                            {this.getStatus()}
                                            <div className="bg-quota">
                                                <p><span>Supplier</span> <strong>{rfqData.company.name}</strong></p>
                                                <p><span>Product Name</span> <strong>{rfqData.productName}</strong></p>
                                                <p><span>CAS Number</span> <strong>{rfqData.casNumber}</strong></p>
                                                <p><span>Product Type</span> <strong>{rfqData.productType}</strong></p>
                                            </div>
                                            {
                                                rfqData.productType === 'api' &&
                                                <div className="row-margin-bottom">
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="quantity">Quantity & Unit *</label>
                                                        </div>
                                                        <div className="col-sm-8 col-xs-8">
                                                                <div className="attr-label"><strong>{rfqData.quantity}</strong> {rfqData.unit}</div>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <h4 className="blue-title">Additional Information</h4>
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="currency">Preferred currency</label>
                                                        </div>
                                                        <div className="col-sm-4 col-xs-4">
                                                            <div className="attr-label"><strong>{rfqData.preferredCurrency}</strong></div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="packaging-type">Preferred packaging type</label>
                                                        </div>
                                                        <div className="col-sm-8 col-xs-8">
                                                            <div className="attr-label"><strong>{rfqData.preferredPackagingType}</strong></div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="expected-time">Expected time of arrival</label>
                                                        </div>
                                                        <div className="col-sm-8 col-xs-8">
                                                            <div className="attr-label"><strong>{expectedTimeOfArrival}</strong></div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="incoterms">Incoterms</label>
                                                        </div>
                                                        <div className="col-sm-4 col-xs-4">
                                                            <div className="attr-label"><strong>{rfqData.incoterms}</strong></div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="place-delivery">Place of delivery</label>
                                                        </div>
                                                        <div className="col-sm-8 col-xs-8">
                                                            <div className="attr-label"><strong>{rfqData.placeOfDelivery}</strong></div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-4 col-xs-4">
                                                            <label htmlFor="payment-terms">Preferred payment terms</label>
                                                        </div>
                                                        <div className="col-sm-8 col-xs-8">
                                                            <div className="attr-label"><strong>{rfqData.preferredPaymentTerms}</strong></div>
                                                        </div>
                                                    </div>
                                                    <AcceptingQuotes acceptingQuotesUntil={acceptingQuotesUntil} />
                                                    <DocumentsRequired documentsRequiredValue={documentsRequiredValue} />
                                                    <Comment rfqComment={rfqData.comment} />
                                                </div>
                                            }
                                            {
                                                rfqData.productType === 'finished dose' &&
                                                <div className="row-margin-bottom">
                                                    <Comment rfqComment={rfqData.comment} />
                                                    <DocumentsRequired documentsRequiredValue={documentsRequiredValue} />
                                                    <AcceptingQuotes acceptingQuotesUntil={acceptingQuotesUntil} />
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className='container'>
                                <UnlockMoreResultsBanner 
                                    user={this.props.user}
                                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                                    page={rfqData.productType === 'api' ? viewRfqPPs.appString : viewLicensingInquiryPPs.appString} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer grey">
                    <FooterLayoutComponent user={this.props.user} />
                </div>
            </React.Fragment>
        )
    }
};

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        customFields: state.quotationReducer.customFields,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    };
}

const ViewRfqHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewRfqComponent);

module.exports = {
    ViewRfqHome,
    ViewRfqComponent
};