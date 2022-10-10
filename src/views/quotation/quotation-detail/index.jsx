'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const DetailComponent = require('../quotation-detail/detail');
const PriceComponent = require('../quotation-detail/price');
const ModalComponent = require('../quotation-detail/modal');
const QuotationActions = require('../../../redux/quotationActions');
const chatActions = require('../../../redux/chatActions');
const itemDetailsActions = require('../../../redux/itemDetailsActions');
const EnumCoreModule = require('../../../public/js/enum-core');
const CommonModule = require('../../../public/js/common');

import { HeaderLayoutComponent as HeaderLayout } from '../../layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';
import { chatConstants } from '../../../consts/chat-constants';
import { typeOfSearchBlock } from '../../../consts/search-categories';
import { FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';
import { userRoles } from '../../../consts/horizon-user-roles';
import { rfqStatuses } from '../../../consts/rfq-quote-statuses';

import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../../redux/userActions';

import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';

import moment from 'moment';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class QuotationDetailComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            clarivateUserId: '',
            issueDate: '',
            rfqId: 0,
            shelfLife: '',
            validDate: '',
            comment: '',
            price: 0,
            hasAccomplishedRequiredFields: false
        };

        this.trails = [{ name: 'Home', redirectUrl: '/' }, { name: 'Chat', redirectUrl: '/chat/inbox/requests-quotes' }, { name: 'Quote', redirectUrl: '' }]; //{name: Company.name, redirectUrl: `company/${Company.id}`}, {name: itemDetail.Name, redirectUrl: `/product-profile/profile/${Company.id}/${itemDetail.ID}`}];
    }

    cancelQuotation() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        $('#modalRemove').fadeOut();

        this.props.cancelQuotation((errorMessage) => {
            if (!errorMessage) {
                return window.location = `${CommonModule.getAppPrefix()}/chat?channelId=${quotation.ChannelID}`;
            }

            self.setState({
                isProcessing: false
            });

            $('#modalRemove').modal('hide');
            self.showMessage(EnumCoreModule.GetToastStr().Error.CANCEL_QUOTATION_FAILED);
        });
    }

    getCurrencyCode() {
        const { quotation } = this.props;
        return quotation.CartItemDetail ? quotation.CartItemDetail.CurrencyCode: null;
    }

    getItemImageUrl() {
        const { quotation } = this.props;

        if (quotation.CartItemDetail) {
            if (quotation.CartItemDetail.ItemDetail && quotation.CartItemDetail.ItemDetail.Media) {
                return quotation.CartItemDetail.ItemDetail.Media[0].MediaUrl;
            }
        }

        return '';
    }

    getQuotationStatus() {
        const { quotation } = this.props;

        if (quotation.Accepted) {
            return 'Approved';
        } else if (quotation.Declined) {
            return 'Declined';
        } else if (quotation.MessageType == 'CANCELLED') {
            return 'Cancelled';
        }

        return 'Pending';
    }

    isLoggedUserMerchant() {
        const { user } = this.props;

        if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
            return true;
        }

        return false;
    }

    declineQuotation() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        $('#modalRemove').fadeOut();

        this.props.declineQuotation((errorMessage) => {
            if (!errorMessage) {
                return window.location = `${CommonModule.getAppPrefix()}/chat?channelId=${quotation.ChannelID}`;
            }

            self.setState({
                isProcessing: false,
                modalProcess: 'CANCEL QUOTATION'
            });

            $('#modalRemove').modal('hide');
            self.showMessage(EnumCoreModule.GetToastStr().Error.DECLINE_QUOTATION_FAILED);
        });
    }

    generateInvoiceByCartItem() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        this.props.generateInvoiceByCartItem([quotation.CartItemDetail.ID], (invoiceNo) => {
            if (invoiceNo) {
                return window.location = "/checkout/one-page-checkout?invoiceNo=" + invoiceNo;
            }

            self.setState({
                isProcessing: false
            });

            self.showMessage(EnumCoreModule.GetToastStr().Error.CREATE_INVOICE_FAILED);
        });
    }

    generateOrderByCartItem() {
        const self = this;
        const { quotation } = this.props;

        if (this.state.isProcessing) return;

        this.setState({
            isProcessing: true
        });

        this.props.generateOrderByCartItem([quotation.CartItemDetail.ID], (orderId) => {
            if (orderId) {
                return window.location = "/checkout/one-page-checkout?orderId=" + orderId;
            }

            self.setState({
                isProcessing: false
            });

            self.showMessage(EnumCoreModule.GetToastStr().Error.CREATE_ORDER_FAILED);
        });
    }

    openRemoveModal(modalProcess) {
        this.setState({
            modalProcess: modalProcess
        }, () => {
            $('#modalRemove').modal('show');
        });
    }

    onChange = (e) => {
        const newValue = e.target.value;
        if (e.target.name === 'price') {
            const { validDate } = this.state;
            this.setState({ hasAccomplishedRequiredFields: (newValue && parseFloat(newValue) > 0) && (validDate && validDate.length > 0) });
        }
        this.setState({[e.target.name]: newValue});
    }

    onSubmitQuotation = (e) => {
        const {clarivateUserId, rfqId, shelfLife, validDate, comment , price, hasAccomplishedRequiredFields} = this.state;
        const { rfqDetails, user } = this.props;

        if (!hasAccomplishedRequiredFields) {
            return;
        }
        
        let newQuote = {
            rfqId: rfqDetails.id,
            price: price,
            shelfLife: shelfLife,
            validDate: validDate,
            issueDate: rfqDetails.createdAt,
            comment: comment,
            clarivateUserId: user.userInfo.userid
        };

        this.props.createQuotation(newQuote, (chatUrl) => {
            const chatIdSplit = rfqDetails.chatId.split('|');
            const channelName = chatIdSplit[0];
            const sid = chatIdSplit[1];
            const userId = rfqDetails.sellerId;
            this.props.generateConversationToken('browser', userId, (convData) => {
                this.props.sendSystemMessage(channelName, sid, convData, chatConstants.systemName, chatConstants.QuoteReceivedMsg, () => {
                    window.location.href = chatUrl;
                });
            });            
        });;
    }

    onRespondRfq = (e) => {
        const { rfqDetails, user } = this.props;
        const updateRfq = {
            status: rfqStatuses.submitted,
            chatId: rfqDetails.chatId,
            sellerId: user.userInfo.userid
        };
        
        this.props.updateRFQ(rfqDetails.id, updateRfq, (chatUrl) => {
            const chatIdSplit = rfqDetails.chatId.split('|');
            const channelName = chatIdSplit[0];
            const sid = chatIdSplit[1];
            const userId = rfqDetails.sellerId;
            this.props.generateConversationToken('browser', userId, (convData) => {
                this.props.sendSystemMessage(channelName, sid, convData, chatConstants.systemName, chatConstants.LicensingInquiryReceivedMsg, () => {
                    window.location.href = chatUrl;
                });
            });
        });
    }

    onCancelRfq = (e) => {
        const { rfqDetails, user } = this.props;
        const updateRfq = {
            status: 'declined',
            chatId: rfqDetails.chatId,
            sellerId: user.userInfo.userid
        };
        
        this.props.updateRFQ(rfqDetails.id, updateRfq, (chatUrl) => {
            const chatIdSplit = rfqDetails.chatId.split('|');
            const channelName = chatIdSplit[0];
            const sid = chatIdSplit[1];
            const userId = rfqDetails.sellerId;
            this.props.generateConversationToken('browser', userId, (convData) => {
                this.props.sendSystemMessage(channelName, sid, convData, chatConstants.systemName, chatConstants.RFQDeclinedMsg, () => {
                    window.location.href = chatUrl;
                });
            });
        });
    }

    componentDidMount() {
        const self = this;
        $(document).ready(function () {
            $('#datepicker').datetimepicker({
                format: 'DD/MM/YYYY'
            });

            $('#datepicker').on('dp.change', function(e) { 
                const { name, value } = e.currentTarget;
                if (name) {
                    const d = value ? moment(value, 'DD/MM/YYYY').toISOString() : '';
                    self.setState({[name]: d});
                    if (name === 'validDate') {
                        const { price } = self.state;
                        self.setState({ hasAccomplishedRequiredFields: (price && parseFloat(price) > 0) && (d && d.length > 0) });
                    }
                }                
            });
        });
    }

    render() {
        const { rfqDetails, quotationDetail } = this.props;
        const { shelfLife, validDate, comment, price, hasAccomplishedRequiredFields } = this.state;
        const { company } = rfqDetails;        

        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                /> 
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} setSearchCategory={this.props.setSearchCategory} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main" style={{paddingTop: '95px'}}>       
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />
                    <SearchPanel
                        hideLimitationToRoles={[userRoles.subBuyer]}
                        user={this.props.user}
                        position={FREEMIUM_LIMITATION_POSITION.quote}
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                    <DetailComponent
                        user={this.props.user}
                        shelfLife={shelfLife}
                        validDate={validDate}
                        comment={comment}
                        price={price}
                        rfqDetails={rfqDetails}
                        company={company}
                        onChange={this.onChange}
                        quotationDetail={quotationDetail}
                        onSubmitQuotation={this.onSubmitQuotation}
                        onCancelRfq={this.onCancelRfq}
                        onRespondRfq={this.onRespondRfq}
                        hasAccomplishedRequiredFields={hasAccomplishedRequiredFields}
                        getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                    />
                </div>

                <div className="footer grey">
                    <FooterLayoutComponent user={this.props.user} />
                </div>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        rfqDetails: state.quotationReducer.rfqDetails,
        quotationDetail: state.quotationReducer.quotationDetail,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        createQuotation: (quote, callback) => dispatch(QuotationActions.createQuotation(quote, callback)),
        updateRFQ: (rfqId, rfq, callback) => dispatch(itemDetailsActions.updateRFQ(rfqId, rfq, callback)),
        generateConversationToken: (device, userid, callback) => dispatch(chatActions.generateConversationToken(device, userid, callback)),
        sendSystemMessage: (channelId, userId, conversationData, senderName, message, callback) => dispatch(chatActions.sendSystemMessage(channelId, userId, conversationData, senderName, message, callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    };
}

const QuotationDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(QuotationDetailComponent);

module.exports = {
    QuotationDetailHome,
    QuotationDetailComponent
};
