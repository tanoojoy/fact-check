'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var UserInformation = require('../../views/chat/user-info');
var ItemInformation = require('../../views/chat/item-info');
var Messages = require('../../views/chat/messages');
var QuotationActions = require('../../views/chat/quotation-actions');
var BaseComponent = require('../../views/shared/base');
var ChatActions = require('../../redux/chatActions');
var TwilioChat = require('twilio-chat');
var EnumCoreModule = require('../../public/js/enum-core');
const CommonModule = require('../../public/js/common');

import { HeaderLayoutComponent as HeaderLayout } from '../../views/layouts/header/index';
import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../redux/userActions';
import { FooterLayoutComponent } from '../layouts/footer';
import BreadcrumbsComponent from '../common/breadcrumbs';
import UpgradeToPremiumTopBanner from '../common/upgrade-to-premium-top-banner';
import { getAppPrefix } from '../../public/js/common';
import { FREEMIUM_LIMITATION_POSITION, getLimits } from './limitation';
import axios from 'axios';
import { typeOfSearchBlock } from '../../consts/search-categories';
import SearchPanel from '../common/search-panel/index';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../redux/searchActions';
import { isFreemiumUserSku } from '../../utils';
import { func } from 'prop-types';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            generalChannel: null,
            messages: [],
            isLockedChat: false,
            userInfo: props.user.userInfo,
            mainConversation: null
        }

        this.trails = [{ name: 'Home', redirectUrl: '/' }, { name: 'Inbox', redirectUrl: '/chat/inbox/requests-quotes' }, { name: 'Chat', redirectUrl: '' }]

        this.currentUserName = '';
        const { userInfo, companyInfo } = props.user;
        if (userInfo) {
            const { email, first_name, last_name } = userInfo;
            const { name: companyName } = companyInfo;
            this.currentUserName = email;
            if (last_name && first_name) {
                this.currentUserName = `${last_name} ${first_name}`;
            }
            this.currentUserName = `${this.currentUserName} | ${companyName}`;
        }
    }

    /* horizon */
    setLockedChat = () => {
        const { user = {} } = this.props;
        const { userInfo = {} } = this.state;
        const chatLimits = getLimits(FREEMIUM_LIMITATION_POSITION.chat, userInfo?.flags);
         if (isFreemiumUserSku(user) && chatLimits.current >= chatLimits.limit) {
             this.setState({
                 isLockedChat: true
             });
         }
    }

    /* horizon */

    initialize = () => {
        const { chatDetail, user, isBuyer, interlocutorCompany, sid, channelId } = this.props;
        console.log('chatDetail', chatDetail);
        const { userInfo, companyInfo } = user;
        let self = this;       
        let friendlyName = '';
        let userId = '';
        let [, , , rfqData] = this.props.customFields || []; 
        if (rfqData) {
            const chatIdSplit = rfqData.chatId.split('|');
            friendlyName = chatIdSplit[0];            
        }
        else {
            if (channelId) {
                friendlyName = this.props.channelId;
            }            
        }
        if (isBuyer) {
            userId = userInfo.userid;
        }
        else {
            userId = user.companyId
        }
        let conversationData = null;
        let chatData = null;

        let username = '';

        if (user) {
            const { Email, FirstName, LastName } = user;
            const { name: companyName } = companyInfo;
            username = Email;
            if (LastName && FirstName) {
                username = `${LastName} ${FirstName}`;
            }
            username = `${username} | ${companyName}`;
        }

        this.props.generateConversationToken('browser', userId, (convData) => {
            conversationData = convData;
            $.getJSON(`${CommonModule.getAppPrefix()}/product-profile/token/${username}`, function (chData) {
                chatData = chData;

                let dataToken = null;
                if (sid) {
                    dataToken = conversationData;
                }
                else {
                    dataToken = chatData;
                }

                var accessManager = new window.Twilio.AccessManager(dataToken.token);
                window.Twilio.Conversations.Client.create(dataToken.token).then(client => {
                    client.on("connectionStateChanged", (state) => {
                        if (state === "connected") {
                            if (sid) {
                                client.getConversationBySid(sid).then(channel => {
                                    self.setState({
                                        mainConversation: channel
                                    });
                                    //self.refreshMessageTimer(channel);
                                    channel.on('messageAdded', message => {
                                        console.log('message', message);
                                        self.addMessage(message.state.author, message.state.body, message.state.dateUpdated.toISOString(), message.state.sid);
                                    });
                                    channel.getMessages()
                                        .then(messagePaginator => {
                                            const total = messagePaginator.items.length;
                                            for (let i = 0; i < total; i++) {
                                                const message = messagePaginator.items[i];
                                                self.addMessage(message.state.author, message.state.body, message.state.dateUpdated.toISOString(), message.state.sid);
                                            }
                                            channel.setAllMessagesRead(msgCount => {
                                                console.log('set message as read', msgCount);
                                            });
                                        }).catch(e => {
                                            console.log(e);
                                        });
                                    self.messages.setChatReady(true);
                                });
                            }
                            else {
                                client.getConversationByUniqueName(friendlyName).then(channel => {
                                    self.setState({
                                        mainConversation: channel
                                    });
                                    //self.refreshMessageTimer(channel);
                                    channel.on('messageAdded', message => {
                                        console.log('message', message);
                                        self.addMessage(message.state.author, message.state.body, message.state.dateUpdated.toISOString(), message.state.sid);
                                    });
                                    channel.getMessages()
                                        .then(messagePaginator => {
                                            const total = messagePaginator.items.length;
                                            for (let i = 0; i < total; i++) {
                                                const message = messagePaginator.items[i];
                                                self.addMessage(message.state.author, message.state.body, message.state.dateUpdated.toISOString(), message.state.sid);
                                            }
                                            channel.setAllMessagesRead(msgCount => {
                                                console.log('set message as read', msgCount);
                                            });
                                        }).catch(e => {
                                            console.log(e);
                                        });
                                    self.messages.setChatReady(true);
                                });
                            }                            
                        }
                        if (state === "disconnected") {
                            self.messages.setChatReady(false);
                        }
                        if (state === "denied") {
                            self.messages.setChatReady(false);
                        }
                    });

                    accessManager.on('tokenUpdated', am => {
                        // get new token from AccessManager and pass it to the library instance
                        client.updateToken(am.token);
                    });

                });
            });            
        });
        
    }

    sendMessage = (message) => {
        const _self = this;
        
        if (this.state.mainConversation) {
            if (isFreemiumUserSku(this.props?.user)) {
                axios
                    .post(`${getAppPrefix()}/users/increase-chat-counter`)
                    .then((response) => {
                        const userInfo = response.data;
                        _self.setState({
                            userInfo
                        }, () => {
                            _self.setLockedChat();
                        });
                    })
                    .catch(err => console.error(err));
            }
            const modifiedMsg = `${message}|${this.currentUserName}`;            
            this.state.mainConversation.sendMessage(modifiedMsg).then(i => {
                //if (i && !!this.props.customFields && !!this.props.customFields[3]) {
                //    //update rfq
                //    this.props.updateRfqData(this.props.customFields[3]);
                //}
            });
        } else {
            console.error('Wrong arguments.The message could not be sent');
        }
    }

    addMessage = (author, body, dateUpdated, sid) => {
        let { messages } = this.state;
        if (!messages.some((msg) => msg.Sid === sid)) {
            messages = [...messages, { Message: body, Sender: author, SentDateTime: dateUpdated.toString(), Sid: sid }]
            this.setState(() => ({ messages }));
        }        
    }

    addMessages = (newMessages) => {
        let { messages } = this.state;
        for (i = 0; i < newMessages.length; i++) {
            const newMsg = newMessages[i];
            if (!messages.some((msg) => msg.Sid === newMsg.SID)) {
                messages.push({ Message: newMsg.Body, Sender: newMsg.Sender, SentDateTime: newMsg.DateSentTimeStamp.toString(), Sid: newMsg.SID });                
            }
        }
        this.setState(() => ({ messages }));
    }

    componentDidMount() {
        const self = this;
        const { chatDetail } = this.props;
        let messages = [];
        if (chatDetail) {
            for (let i = 0; i < chatDetail.Records.length; i++) {
                const message = chatDetail.Records[i];
                messages.push(
                    { Message: message.Body, Sender: message.Sender, SentDateTime: message.DateSentTimeStamp.toString(), Sid: message.SID }
                );                
            }
            this.setState(() => ({ messages }));
        }
        
        this.setLockedChat();
        self.initialize();
    }

    render() {
        const { chatDetail, user } = this.props;
        const { isLockedChat } = this.state;
        console.log('this.props', this.props);
        const horizon_user = user.userInfo.horizon_user;
        let [ interlocutorCompany, productInfo, quoteData, rfqData ] = this.props.customFields || [];
        if (!interlocutorCompany && this.props.interlocutorCompany) {
           interlocutorCompany = this.props.interlocutorCompany; 
        }
        let isCurrentUserBuyer = false;
        if (rfqData) {
            isCurrentUserBuyer = user.ID === rfqData.buyerId;
        }
        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main" style={{paddingTop: '95px'}}>        
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />
                    <SearchPanel
                        user={this.props.user}
                        position={FREEMIUM_LIMITATION_POSITION.chat}
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                    <div className="container margin-top-fix" id="page-chat-dumb">
			            <div className="blue-chat-theme">
				            <div className="view-chat chat-active">
					            <div className="view-chat-left col-sm-4">
						            <div className="view-chat-left-inner">
                                        <UserInformation 
                                            userDetail={interlocutorCompany}                                            
                                        />
							            <div className="clearfix"></div>
							            <ItemInformation 
                                            deal={rfqData}
                                            quote={quoteData}
                                            isRfq={true}
                                            isCurrentUserBuyer={isCurrentUserBuyer}
                                        />
                                    </div>
                                </div>

                                <Messages 
                                    horizon_user={horizon_user}
                                    messages={this.state.messages}
                                    sendMessage={this.sendMessage}
                                    deal={rfqData}
                                    quoteData={quoteData}
                                    isLockedChat={isLockedChat}
                                    ref={(ref) => this.messages = ref}
                                />
                                <div className="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                
                <div className="footer grey">
                    <FooterLayoutComponent user={this.props.user} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        isBuyer: state.userReducer.isBuyer,
        channelId: state.chatReducer.channelId,
        sid: state.chatReducer.sid,
        chatDetail: state.chatReducer.chatDetail,        
        customFields: state.chatReducer.customFields,
        companyInfo: state.companyReducer.companyInfo,
        interlocutorCompany: state.companyReducer.interlocutorCompany,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
        generateConversationToken: (device, userid, callback) => dispatch(ChatActions.generateConversationToken(device, userid, callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)), 
        updateRfqData: (data) => dispatch(ChatActions.updateRfqData(data)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids))
    };
}

const ChatComponentHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatComponent);

module.exports = {
    ChatComponentHome,
    ChatComponent
};