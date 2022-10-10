'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');

import { HeaderLayoutComponent as HeaderLayout } from '../../layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';

import QuotationDetailViewComponent from './detail';
import QuotationAction from '../../../redux/quotationActions';
import chatActions from '../../../redux/chatActions';
import { chatConstants } from '../../../consts/chat-constants';
import { typeOfSearchBlock } from '../../../consts/search-categories';
import { FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';
import { userRoles } from '../../../consts/horizon-user-roles';

import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class QuotationDetailViewIndexComponent extends BaseComponent {
    constructor(props) {
        super(props);

        console.log('props', props);
        const { rfqDetails } = props;
        this.trails = [{ name: 'Home', redirectUrl: '/' }, { name: 'Chat', redirectUrl: `/chat/chatRFQ/${rfqDetails.id}/${rfqDetails.chatId}` }, { name: 'Quote', redirectUrl: null }];
    }

    componentDidUpdate(prevProps) {
        if (this.props.quotationDetail && prevProps.quotationDetail) {
            console.log('componentDidUpdate');
        }
    }

    updateQuoteStatus = (status) => {
        console.log('status', status);
        const { rfqDetails } = this.props;
        let { quotationDetail } = this.props;        
        if (quotationDetail && quotationDetail.OfferDetails) {
            let [offerDetail] = quotationDetail.OfferDetails;
            let [otherInfo] = offerDetail.CustomFields;

            otherInfo.status = status;
        }
        const msgContent = status === 'declined' ? chatConstants.QuoteDeclinedMsg : chatConstants.QuoteAcceptedMsg;
        this.props.updateQuotation(quotationDetail, (url) => {
            const chatIdSplit = rfqDetails.chatId.split('|');
            const channelName = chatIdSplit[0];
            const sid = chatIdSplit[1];
            const userId = rfqDetails.sellerId;
            this.props.generateConversationToken('browser', userId, (convData) => {
                this.props.sendSystemMessage(channelName, sid, convData, chatConstants.systemName, msgContent, () => {
                    window.location.href = url;
                });
            });
        });
        console.log('quote', quotationDetail);
    }

    render() {
        const { rfqDetails, prevPageUrl, quotationDetail, isSubmerchant } = this.props;
        
        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} setSearchCategory={this.props.setSearchCategory} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main" style={{ paddingTop: '95px' }}>
                    <BreadcrumbsComponent
                        trails={this.trails}
                    />
                    <SearchPanel
                        user={this.props.user}
                        position={FREEMIUM_LIMITATION_POSITION.quote}
                        hideLimitationToRoles={[userRoles.subBuyer]}
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                    <QuotationDetailViewComponent
                        quotationDetail={quotationDetail}
                        rfqDetails={rfqDetails}
                        prevPageUrl={prevPageUrl}
                        updateQuoteStatus={this.updateQuoteStatus}
                        isSubmerchant={isSubmerchant}
                        user={this.props.user}
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
        isSubmerchant: state.quotationReducer.customFields[0].isSubmerchant,
        prevPageUrl: state.quotationReducer.prevPageUrl,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateQuotation: (quote, callback) => dispatch(QuotationAction.updateQuotation(quote, callback)),
        generateConversationToken: (device, userid, callback) => dispatch(chatActions.generateConversationToken(device, userid, callback)),
        sendSystemMessage: (channelId, userId, conversationData, senderName, message, callback) => dispatch(chatActions.sendSystemMessage(channelId, userId, conversationData, senderName, message, callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    };
}

const QuotationDetailViewHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(QuotationDetailViewIndexComponent);

module.exports = {
    QuotationDetailViewHome,
    QuotationDetailViewIndexComponent
};
