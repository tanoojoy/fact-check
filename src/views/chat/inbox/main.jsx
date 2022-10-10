'use strict';
var React = require('react');
var HTMLparse = require('html-react-parser');
var inboxAction = require('../../../redux/inboxAction');
var ChatActions = require('../../../redux/chatActions');
var ReactRedux = require('react-redux');
var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;


var BaseComponent = require('../../shared/base');

import { rfqStatusMessages, quoteStatusMessages, licensingInquiryStatusMessages } from '../../../consts/rfq-quote-statuses';
import { userRoles } from '../../../consts/horizon-user-roles';
import { typeOfSearchBlock } from '../../../consts/search-categories';
import { inbox as inboxPPs } from '../../../consts/page-params';
import { FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';

import UnlockMoreResultsBanner from '../../common/unlock-more-results';
import SearchPanel from '../../common/search-panel/index';
import PaginationComponent from '../../common/pagination';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { HeaderLayoutComponent as HeaderLayout } from '../../../views/layouts/header/index';
import BreadcrumbsComponent from '../../common/breadcrumbs';
const CommonModule = require('../../../public/js/common');
import moment from 'moment';

import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
    getSearchResults
} from '../../../redux/searchActions';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatComponent extends BaseComponent {

    constructor(props) {
        super(props);
        
        this.state = {
            requestQuotesPage: {
                PageNumber: props.messages ? props.messages.PageNumber : 1,
                PageSize: props.messages ? props.messages.PageSize : 5,
                totalRecords: props.messages ? props.messages.TotalRecords : 0
            }, 
            enquiriesPage: {
                PageNumber: props.enquiries ? props.enquiries.PageNumber : 1,
                PageSize: props.enquiries ? props.enquiries.PageSize : 5,
                totalRecords: props.enquiries ? props.enquiries.TotalRecords : 0
            },
            messages: props.messages || [],
            enquiries: props.enquiries || [],
            currentInboxTab: 'requestquotes'
        }

        this.currentUserName = '';
        const { userInfo, companyInfo } = props.currentUser;
        if (userInfo) {
            const { email, first_name, last_name } = userInfo;
            const { name: companyName } = companyInfo;
            this.currentUserName = email;
            if (last_name && first_name) {
                this.currentUserName = `${last_name} ${first_name}`;
            }
            this.currentUserName = `${this.currentUserName} | ${companyName}`;
        }

        console.log('this.currentUserName', this.currentUserName);

        this.trails = [{ name: 'Home', redirectUrl: '/' }, { name: 'Inbox', redirectUrl: '' }]
        this.isFirstLoadMessages = true;
        this.isFirstLoadEnquiries = true;
    }

    componentDidMount() {
        if (this.requestQuotesPagingComponentRef) this.requestQuotesPagingComponentRef.initializePagination();
        this.getConversationMessages(this.props.messages, this.props.enquiries);
    }

    componentDidUpdate() {
        if (this.props && this.state) {
            const { messages, enquiries } = this.props;
            let { requestQuotesPage, enquiriesPage } = this.state;
            let updateStateMessage = false;
            if (messages && Number(messages.PageNumber) !== Number(requestQuotesPage.PageNumber)) {
                requestQuotesPage.PageNumber = messages.PageNumber;
                updateStateMessage = true;
            }
            if (messages && Number(messages.PageSize) !== Number(requestQuotesPage.PageSize)) {
                requestQuotesPage.PageSize = messages.PageSize;
                updateStateMessage = true;
            }
            let updateStateEnquiry = false;
            if (enquiries && Number(enquiries.PageNumber) !== Number(enquiriesPage.PageNumber)) {
                enquiriesPage.PageNumber = enquiries.PageNumber;
                updateStateEnquiry = true;
            }
            if (enquiries && Number(enquiries.PageSize) !== Number(enquiriesPage.PageSize)) {
                enquiriesPage.PageSize = enquiries.PageSize;
                updateStateEnquiry = true;
            }
            if (updateStateMessage) {
                //this.setState(() => ({ requestQuotesPage, messages }));                
                this.setState({
                    requestQuotesPage
                }, () => {
                    this.getConversationMessages(messages, null);
                });
                
            }
            if (updateStateEnquiry) {
                //this.setState(() => ({ enquiriesPage, enquiries }));
                this.setState({
                    enquiriesPage
                }, () => {
                    this.getConversationMessages(null, enquiries);
                });
            }
        }
    }
   
    renderMenu() {
        if (typeof this.props.currentUser !== 'undefined' && this.props.currentUser != null && this.props.currentUser.Roles != null ) {
            return (<HeaderLayoutComponent categories={this.props.messages.length > 0 ? this.props.categories : []} user={this.props.currentUser}/>);
        }

        return '';
    }

    getRfqProductType = (deal) => {
        return deal?.CartItemDetail?.ItemDetail?.Categories[0]?.Name || '';
    }

    getDealStatus = (deal) => {
        const userRole = this.props.currentUser.userInfo.role;
        const productType = this.getRfqProductType(deal);
        const messages = deal.quote ? quoteStatusMessages : productType === 'finished dose'? licensingInquiryStatusMessages : rfqStatusMessages;
        const status = deal.quote ? deal.quote.status : deal.Status;
        let displayStatus = '';
        let displayHtml = null;
        if (status && messages[status]) {
            if (userRoles.subMerchant === userRole) {
                displayStatus = messages[status].sellerMessage;                
            } else {
                displayStatus = messages[status].buyerMessage;                
            }
        }

        if (deal.quote) {

            switch (status) {
                case 'pending':
                    displayHtml = <label className="label label label-primary">{displayStatus}</label>;
                    break;
                case 'declined':
                    displayHtml = <label className="label label label-danger">{displayStatus}</label>;
                    break;
                case 'accepted':
                    displayHtml = <label className="label label label-success">{displayStatus}</label>;
                    break;
            }
        }
        else {
            switch (status) {
                case 'pending':
                    displayHtml = <label className="label label label-warning">{displayStatus}</label>;
                    break;
                case 'submitted':
                    displayHtml = <label className="label label label-primary">{displayStatus}</label>;
                    break;
                case 'declined':
                    displayHtml = <label className="label label label-danger">{displayStatus}</label>;
                    break;
            }
        }
        
        return displayHtml;
    };

    changeInboxTab = (tabName, isFirstLoad = false) => {
        let { enquiriesPage, requestQuotesPage, currentInboxTab } = this.state;
        
        if (currentInboxTab === tabName && !isFirstLoad) return;
        this.setState({
            currentInboxTab: tabName
        }, () => {
            console.log('changeInboxTab ', tabName);
            switch (tabName) {
                case 'requestquotes':
                    this.getRequestsQuotes(1, requestQuotesPage.PageSize);
                    if (this.requestQuotesPagingComponentRef) {
                        this.requestQuotesPagingComponentRef.initializePagination();
                    }
                    break;
                case 'enquiries':
                    this.getEnquiry(1, enquiriesPage.PageSize);
                    if (this.inquiryPagingComponentRef) {
                        this.inquiryPagingComponentRef.initializePagination();
                    }
                    break;
            }
        });        
    }

    getEnquiry = (pageNumber, pageSize) => {
        //const { enquiriesPage } = this.state;
        this.props.getEnquiry(pageNumber, pageSize);
    }

    getRequestsQuotes = (pageNumber, pageSize) => {
        //console.log('getRequestsQuotes', this.props);
        //const { requestQuotesPage } = this.state;
        this.props.getRequestsQuotes(pageNumber, pageSize);
    }

    getConversationMessages = (messages, enquiries) => {
        const self = this;
        const { isBuyer, currentUser, companyInfo } = self.props;
        console.log('self.state', self.state);
        //let { messages, enquiries } = self.state;
        let userId = '';
        if (isBuyer) {
            userId = currentUser.ID;
        }
        else {
            userId = currentUser.companyId;
        }
        let username;
        
        if (currentUser) {
            const { Email, FirstName, LastName } = currentUser;
            const { name: companyName } = companyInfo;
            username = Email;
            if (LastName && FirstName) {
                username = `${LastName} ${FirstName}`;
            }
            username = `${username} | ${companyName}`;
        }

        if (messages) {
            self.setState(() => ({
                messages
            }));
            let conversationData = null;
            let chatData = null;
            if (messages && messages.TotalRecords > 0) {
                self.props.generateConversationToken('browser', userId, (convData) => {
                    conversationData = convData;
                    $.getJSON(`${CommonModule.getAppPrefix()}/product-profile/token/${username}`, function (chData) {
                        chatData = chData;

                        for (let i = 0; i < messages.Records.length; i++) {
                            let message = messages.Records[i];
                            if (message) {
                                const channelIdSplit = message.ChannelID.split('|');
                                const friendlyName = channelIdSplit[0];
                                let sid = '';
                                let dataToken = null;
                                if (channelIdSplit.length > 1) {
                                    sid = channelIdSplit[1]
                                    dataToken = conversationData;
                                }
                                else {
                                    dataToken = chatData;
                                }
                                window.Twilio.Conversations.Client.create(dataToken.token).then(client => {
                                    client.on("connectionStateChanged", (state) => {
                                        if (state === "connected") {
                                            if (!sid) {
                                                client.getConversationByUniqueName(friendlyName).then(channel => {
                                                    channel.getMessages()
                                                        .then(messagePaginator => {
                                                            const total = messagePaginator.items.length;
                                                            message.messages = [];
                                                            let newMessage = {};
                                                            for (let i = 0; i < total; i++) {
                                                                const rawMessage = messagePaginator.items[i];
                                                                newMessage = {
                                                                    author: rawMessage.state.author,
                                                                    body: rawMessage.state.body,
                                                                    dateUpdated: rawMessage.state.dateUpdated.toISOString(),
                                                                    sid: rawMessage.state.sid
                                                                }
                                                                message.messages.push(newMessage)
                                                            }
                                                            channel.getUnreadMessagesCount()
                                                                .then(msgCount => {
                                                                    console.log('unread msg count', msgCount);
                                                                    //newMessage.unReadMessageCount
                                                                    message.hasUnreadMsgs = !!msgCount && msgCount > 0;
                                                                    self.setState(() => ({
                                                                        messages
                                                                    }));
                                                                });
                                                        }).catch(e => {
                                                            console.log(e);
                                                        });
                                                }).catch(e => {
                                                    console.log(e);
                                                });
                                            }
                                            else {
                                                client.getConversationBySid(sid).then(channel => {
                                                    channel.getUnreadMessagesCount()
                                                        .then(msgCount => {
                                                            console.log('unread msg count', msgCount);
                                                            //newMessage.unReadMessageCount
                                                            message.hasUnreadMsgs = !!msgCount && msgCount > 0;
                                                            self.setState(() => ({
                                                                messages
                                                            }));
                                                        });
                                                }).catch(e => {
                                                    console.log(e);
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                });
            }
        }
        
        if (enquiries) {
            let conversationData = null;
            let chatData = null;
            if (enquiries && enquiries.TotalRecords > 0) {
                self.props.generateConversationToken('browser', userId, (convData) => {
                    conversationData = convData;
                    $.getJSON(`${CommonModule.getAppPrefix()}/product-profile/token/${username}`, function (chData) {
                        chatData = chData;

                        for (let i = 0; i < enquiries.Records.length; i++) {
                            let message = enquiries.Records[i];
                            if (message) {
                                const channelIdSplit = message.ChannelID.split('|');
                                const friendlyName = channelIdSplit[0];
                                let sid = '';
                                let dataToken = null;
                                if (channelIdSplit.length > 1) {
                                    sid = channelIdSplit[1]
                                    dataToken = conversationData;
                                }
                                else {
                                    dataToken = chatData;
                                }
                                window.Twilio.Conversations.Client.create(dataToken.token).then(client => {
                                    client.on("connectionStateChanged", (state) => {
                                        if (state === "connected") {
                                            if (!sid) {
                                                client.getConversationByUniqueName(friendlyName).then(channel => {
                                                    channel.getMessages()
                                                        .then(messagePaginator => {
                                                            const total = messagePaginator.items.length;
                                                            message.messages = [];
                                                            for (let i = 0; i < total; i++) {
                                                                const rawMessage = messagePaginator.items[i];
                                                                const newMessage = {
                                                                    author: rawMessage.state.author,
                                                                    body: rawMessage.state.body,
                                                                    dateUpdated: rawMessage.state.dateUpdated.toISOString(),
                                                                    sid: rawMessage.state.sid
                                                                }
                                                                message.messages.push(newMessage)
                                                            }
                                                            channel.getUnreadMessagesCount()
                                                                .then(msgCount => {
                                                                    console.log('unread msg count', msgCount);
                                                                    //newMessage.unReadMessageCount
                                                                    message.hasUnreadMsgs = !!msgCount && msgCount > 0;
                                                                    self.setState(() => ({
                                                                        enquiries
                                                                    }));
                                                                });
                                                        })
                                                        .catch(e => {
                                                            console.log(e);
                                                        });
                                                });
                                            }
                                            else {
                                                client.getConversationBySid(sid).then(channel => {
                                                    channel.getUnreadMessagesCount()
                                                        .then(msgCount => {
                                                            console.log('unread msg count', msgCount);
                                                            //newMessage.unReadMessageCount
                                                            message.hasUnreadMsgs = !!msgCount && msgCount > 0;
                                                            self.setState(() => ({
                                                                enquiries
                                                            }));
                                                        });
                                                }).catch(e => {
                                                    console.log(e);
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                });
            }
        }
    }

    getMessages = async (client) => {
        let updatedInboxes = [];
        const { messages } = this.state;
        for (let record in messages.Records) {
            const { ChannelID: channelName, sid } = record;
            console.log('channelName', channelName);
            try {
                const channel = await client.getChannelByUniqueName(channelName);
                const unconsumedMessageCount = await channel.getUnconsumedMessagesCount();
                record.unconsumedMessageCount = unconsumedMessageCount || 0;
                const messageCount = await channel.getMessagesCount();
                record.messageCount = messageCount || 0;
                const messages = await channel.getMessages();
                record.messages = messages.items.map(item => {
                    if (item) {
                        return { author: item.author, body: item.body, dateUpdated: item.dateUpdated, sid: item.sid }
                    }
                    return null;
                });
            }
            catch (e) {

            }
        }
    }

    getMessage = async (client, record) => {
        const { ChannelID: channelName } = record;
        console.log('channelName', channelName);
        try {
            const channel = await client.getChannelByUniqueName(channelName);
            const unconsumedMessageCount = await channel.getUnconsumedMessagesCount();
            record.unconsumedMessageCount = unconsumedMessageCount || 0;
            const messageCount = await channel.getMessagesCount();
            record.messageCount = messageCount || 0;
            const messages = await channel.getMessages();
            record.messages = messages.items.map(item => {
                if (item) {
                    return { author: item.author, body: item.body, dateUpdated: item.dateUpdated, sid: item.sid }
                }
                return null;
            });
        }
        catch (e) {

        }
        return { ...deal };
    }

    getRequestsQuotesByPage = (page) => {
        let { requestQuotesPage } = this.state;
        this.getRequestsQuotes(page, requestQuotesPage.PageSize);        
    }

    onRequestsQuotesPagingSizeChanged = (size) => {
        this.getRequestsQuotes(1, size);
    }

    getEnquiriesByPage = (page) => {
        let { enquiriesPage } = this.state;
        this.getEnquiry(page, enquiriesPage.PageSize);
    }

    onEnquiriesPagingSizeChanged = (size) => {
        this.getEnquiry(1, size);
    }

    render() {
        const { requestQuotesPage, enquiriesPage, messages, enquiries, currentInboxTab } = this.state;
        const filters = {
            keyword: this.props.keyword
        };

        const inboxPanelClass = messages.TotalRecords > 0 ? 'inbox-panel-outer' : 'inbox-panel-outer hide';
        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.currentUser}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.currentUser} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>

                <div className="main" style={{paddingTop: '95px'}}>
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />
                    <SearchPanel
                        user={this.props.currentUser}
                        position={currentInboxTab === 'requestquotes' ? FREEMIUM_LIMITATION_POSITION.inbox : FREEMIUM_LIMITATION_POSITION.inboxEnquiries}
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                    <div className="margin-top-fix" id="page-chatdumb-inbox">

			            <div className="chat-blueheader-sec">
				            <div className="container">
                                <h4 className="header-chat">Inbox</h4>                        
                                <div className="chat-inbox-tabs">		  
					                <ul>		  
                                        <li className="active"><a href="#requests_quotes_tab" data-toggle="tab" aria-expanded="true" onClick={() => this.changeInboxTab('requestquotes')}>My Requests and Quotes</a></li>		  
                                        <li className=""><a href="#enquiries_tab" data-toggle="tab" aria-expanded="false" onClick={() => this.changeInboxTab('enquiries')}>Inquiries</a></li>		  
					                </ul>
                                    <div className="onoffswitch-design" style={{display: "none"}}>                        
                                        <div className="onoffswitch">                        
                                            <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="myonoffswitch1" checked="" />
                                            <label className="onoffswitch-label" htmlFor="myonoffswitch1">                        
                                                <span className="onoffswitch-inner"></span> <span className="onoffswitch-switch"></span>                        
                                            </label>
                                        </div>
                                        <label htmlFor="myonoffswitch1">My Enquiries</label>
                                    </div>
				                </div>		  
				                <div className="clearfix"></div>
                            </div>		  
			            </div>
			            <div className="chatdmbinbxpg-mainsec">
				            <div className="tab-content tab-inbox">		  
				                <div className="tab-pane fade active in" id="requests_quotes_tab">		  
				                    <div className="container">		  
                                        {
                                            messages && messages.TotalRecords > 0 ? 
                                            (<React.Fragment>
                                                <div className="chatdmbinbxpg-listmsg">
                                                {
                                                    messages.Records.map((message, index) => {                                                        
                                                        if (message.CustomFields) {
                                                            let [InterlocutorCompany, Company] = message.CustomFields;
                                                            const lastMessage = message.messages && message.messages.length > 0 ? message.messages[message.messages.length - 1] : {};
                                                            let { author = '', dateUpdated, body = '' } = lastMessage;
                                                            let displayMessage = '';
                                                            if (body) {
                                                                const messageSplit = body.split('|');
                                                                const msgLen = messageSplit.length;
                                                                if (msgLen == 3) {
                                                                    const userName = messageSplit[msgLen - 2].trim();
                                                                    const companyName = messageSplit[msgLen - 1].trim();
                                                                    displayMessage = messageSplit[0];
                                                                    author = `${userName} | ${companyName}`
                                                                    if (!companyName) {
                                                                        author = userName;
                                                                    }
                                                                }
                                                                else if (msgLen == 2) {
                                                                    author = messageSplit[1].trim();
                                                                    displayMessage = messageSplit[0];
                                                                }
                                                                else {
                                                                    displayMessage = body;
                                                                }                                                                
                                                            }
                                                            else {
                                                                displayMessage = 'No messages yet';
                                                                author = 'Not started';
                                                            }
                                                            let momentDate = null;
                                                            let sentDate = null;
                                                            let sentTime = null;
                                                            if (dateUpdated) {
                                                                momentDate = moment(dateUpdated);
                                                                sentDate = momentDate.format('LL');
                                                                sentTime = momentDate.format('LTS');
                                                            }

                                                            const channelIdSplit = message.ChannelID.split('|');
                                                            const chatId = channelIdSplit[0];
                                                            let sid = ''
                                                            if (channelIdSplit.length > 1) {
                                                                sid = channelIdSplit[1];
                                                            }

                                                            let productType = this.getRfqProductType(message);

                                                            return (
                                                                <a href={`${CommonModule.getAppPrefix()}/chat/chatRFQ/${message.CartItemDetail.ID}/${chatId}?interlocutor=${InterlocutorCompany.id}`} key={`messages-${index}`}>
                                                                    <div className="chatdmbinbxpg-ind-sec" >
                                                                        <div className="chatdmbinbxpg-ind-tbl">
                                                                            <div className="chatdmbinbxpg-col-icon">
                                                                                {message.hasUnreadMsgs &&
                                                                                    <i className="chatdmbinbxpg-icon-online"></i>
                                                                                }
                                                                            </div>
                                                                            <div className="chatdmbinbxpg-col-prf">
                                                                                <div className="inbox-chat-img-right">
                                                                                    <div className="inbox-product-title">
                                                                                        <h5>{Company.name}</h5>
                                                                                        <div className="product-cattr">
                                                                                            <span className="pname">Product</span>
                                                                                            <span className="pval">{message.CartItemDetail.ItemDetail.Name}</span>
                                                                                        </div>
                                                                                        {
                                                                                            productType === 'api' &&
                                                                                            <div className="product-cattr">
                                                                                                <span className="pname">Quantity</span>
                                                                                                <span className="pval">{`${message.CartItemDetail.Quantity} ${message.CartItemDetail.Unit}`}</span>
                                                                                            </div>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="chatdmbinbxpg-col-desc">
                                                                                <div className="inbox-user-header">
                                                                                    <span className="label label-user">{author || author}</span>
                                                                                    <span>{momentDate ? momentDate.toLocaleString() : ''}</span>
                                                                                </div>
                                                                                <p>{displayMessage || displayMessage}</p>
                                                                            </div>
                                                                            <div className="chatdmbinbxpg-col-act">
                                                                                <div className="inbox-action">
                                                                                    <h6>Status</h6>
                                                                                    {
                                                                                        this.getDealStatus(message)
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            )
                                                        }
                                                        else {
                                                            return null;
                                                        }
                                                    })
                                                }
                                                </div>		
                                                {currentInboxTab === 'requestquotes' &&
                                                    (
                                                        <PaginationComponent
                                                            key='request-quotes-paging-key'
                                                            pagingId='request-quotes-paging'
                                                            pageNumber={requestQuotesPage.PageNumber}
                                                            pageSize={requestQuotesPage.PageSize}
                                                            totalRecords={messages.TotalRecords}
                                                            onPageNumberClicked={this.getRequestsQuotesByPage}
                                                            onPageSizeChanged={this.onRequestsQuotesPagingSizeChanged}
                                                            ref={(ref) => this.requestQuotesPagingComponentRef = ref}
                                                        />
                                                    )
                                                }
                                                
                                            </React.Fragment>) : 
                                            (<React.Fragment>
                                                <div className="inbox-empty-msge">
                                                    <div className="inbox-empty-img">
                                                        <img src={CommonModule.getAppPrefix() + "/assets/images/bluemail.svg"} alt="Empty" title="Empty" />
                                                    </div>
                                                    <div className="inbox-empty-title">Communicate with potential partners</div>
                                                    <div className="inbox-empty-dec">It looks like you haven't sent or received any messages, quotes or requests for quotes yet.</div>
                                                </div>
                                            </React.Fragment>)
                                        }
                                    </div>
				                </div>
				                <div className="tab-pane fade" id="enquiries_tab">
					                <div className="container">
                                        { enquiries && enquiries.TotalRecords > 0 ? 
                                            (<React.Fragment>
                                                <div className="chatdmbinbxpg-listmsg">
                                                {
                                                    enquiries.Records.map((enquiry, index) => {
                                                        console.log('enquiry', enquiry);
                                                        const { InterlocutorCompany } = enquiry;
                                                        const lastMessage = enquiry.messages && enquiry.messages.length > 0 ? enquiry.messages[enquiry.messages.length - 1] : {};

                                                        let { author = '', dateUpdated, body = '' } = lastMessage;
                                                        let displayMessage = '';
                                                        if (body) {
                                                            const messageSplit = body.split('|');
                                                            const msgLen = messageSplit.length;
                                                            if (msgLen > 2) {
                                                                const userName = messageSplit[msgLen - 2].trim();
                                                                const companyName = messageSplit[msgLen - 1].trim();
                                                                displayMessage = messageSplit[0];
                                                                author = `${userName} | ${companyName}`
                                                            }
                                                            else {
                                                                displayMessage = body;
                                                            }
                                                        }
                                                        else {
                                                            displayMessage = 'No messages yet';
                                                            author = 'Not started';
                                                        }

                                                        let momentDate = null;
                                                        let sentDate = null;
                                                        let sentTime = null;
                                                        if (dateUpdated) {
                                                            momentDate = moment(dateUpdated);
                                                            sentDate = momentDate.format('LL');
                                                            sentTime = momentDate.format('LTS');
                                                        }

                                                        const channelIdSplit = enquiry.ChannelID.split('|');
                                                        const chatId = channelIdSplit[0];
                                                        let sid = ''
                                                        if (channelIdSplit.length > 1) {
                                                            sid = channelIdSplit[1];
                                                        }

                                                        return (
                                                            <a href={`${CommonModule.getAppPrefix()}/chat/${chatId}?interlocutor=${InterlocutorCompany.id}&sid=${sid}`} key={`messages-${index}`}>
                                                                <div className="chatdmbinbxpg-ind-sec">
                                                                    <div className="chatdmbinbxpg-ind-tbl">		  
                                                                        <div className="chatdmbinbxpg-col-icon">
                                                                            {enquiry.hasUnreadMsgs &&
                                                                                <i className="chatdmbinbxpg-icon-online"></i>
                                                                            }                                                                            
                                                                        </div>
                                                                        <div className="chatdmbinbxpg-col-prf"> 		  
                                                                            <div className="inbox-chat-img-right">		  
                                                                                <div className="inbox-product-title">		  
                                                                                    <h5>{InterlocutorCompany.name}</h5>  
                                                                                    <div className="product-cattr">		  
                                                                                        <span className="pname">Message Type</span>		  
                                                                                        <span className="pval">Incoming</span>		  
                                                                                    </div>		  
                                                                                </div>		  
                                                                            </div>		  
                                                                        </div>		  
                                                                        <div className="chatdmbinbxpg-col-desc">		  
                                                                            <div className="inbox-user-header">		  
                                                                                <span className="label label-user">{author}</span>	  
                                                                                <span>{ momentDate? momentDate.toLocaleString() : ''}</span>
                                                                            </div>		  
                                                                            <p>{displayMessage || displayMessage}</p>
                                                                        </div>		  
                                                                    </div>		  
                                                                </div>	
                                                            </a>
                                                        )
                                                    })                                                    
                                                }
                                                </div>
                                                {currentInboxTab === 'enquiries' &&
                                                    (
                                                    <PaginationComponent
                                                        key='inquiry-paging-key'
                                                        pagingId='inquiry-paging'
                                                        pageNumber={enquiriesPage.PageNumber}
                                                        pageSize={enquiriesPage.PageSize}
                                                        totalRecords={enquiries.TotalRecords}
                                                        onPageNumberClicked={this.getEnquiriesByPage}
                                                        onPageSizeChanged={this.onEnquiriesPagingSizeChanged}
                                                        ref={(ref) => this.inquiryPagingComponentRef = ref}
                                                    />
                                                    )
                                                }                                                
                                            </React.Fragment>) : 
                                            (<React.Fragment>
                                                <div className="inbox-empty-msge">
                                                    <div className="inbox-empty-img">
                                                        <img src={CommonModule.getAppPrefix() + "/assets/images/bluemail.svg"} alt="Empty" title="Empty" />
                                                    </div>
                                                    <div className="inbox-empty-title">Communicate with potential partners</div>
                                                    <div className="inbox-empty-dec">It looks like you haven't sent or received any messages, quotes or requests for quotes yet.</div>
                                                </div>
                                            </React.Fragment>)
                                        }
                                        
                                    </div>
				                </div>
                                <div className="container">
                                    <UnlockMoreResultsBanner 
                                        user={this.props.currentUser}
                                        getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                                        page={inboxPPs.appString} 
                                    />
                                </div>
				            </div>  
			            </div>			
		            </div>
                    
                    
                </div>
                <div className="footer grey" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        messages: state.inboxReducer.messages,
        keyword: state.inboxReducer.keyword,
        currentUser: state.userReducer.user, 
        companyInfo: state.companyReducer.companyInfo, 
        enquiries: state.inboxReducer.enquiries,
        isBuyer: state.userReducer.isBuyer,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        searchInbox: (e) => dispatch(inboxAction.searchInbox(e)),
        goToPage: (pageNo, filters) => dispatch(inboxAction.goToPage(pageNo, filters)), 
        getEnquiry: (page, size) => dispatch(inboxAction.getEnquiry(page, size)), 
        getRequestsQuotes: (page, size) => dispatch(inboxAction.getRequestsQuotes(page, size)),
        generateConversationToken: (device, userid, callback) => dispatch(ChatActions.generateConversationToken(device, userid, callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    };
}

const ChatInboxPage = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatComponent);

module.exports = {
    ChatInboxPage,
    ChatComponent
};
