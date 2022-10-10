'use strict';
var React = require('react');
var EnumCoreModule = require('../../public/js/enum-core');
var HtmlEntities = require('html-entities').AllHtmlEntities;
var entities = new HtmlEntities();
const CommonModule = require('../../public/js/common');
import moment from 'moment';
import { rfqStatusMessages, quoteStatusMessages, licensingInquiryStatusMessages } from '../../consts/rfq-quote-statuses';

import { MESSAGES } from './limitation';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatMessagesComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatReady: false,
            membersActive: false,
            enableSending: true,
            messages: props.messages,
            messagesContainerCss: 'right-message-bar'
        }
    }

    setMessagesContainerCss(css) {
        this.setState({ messagesContainerCss: 'right-message-bar' + (css ? ' ' + css : '') });
    }

    setChatReady = (isReady = false) => {
        this.setState({
            chatReady: isReady
        });
    }

    isChatReady = () => {
        return this.state.chatReady;
    }

    sendMessage = () => {
        const self = this;

        let message = $('#chat-input').val();
        message = message && message.trim().length >= 0 ? message.trim() : '';

        if (message.length <= 0 && self.state.enableSending) {
            return;
        }

        self.setState({ enableSending: false });

        self.props.sendMessage(message);
        $('#chat-input').val('');
        self.setState({ enableSending: true });
    }

    renderMessageInput = () => {
        
        if (this.state.chatReady && !this.props.isLockedChat) {
            return (
                <div className="view-chat-edit-sec" >
                    <div className="padded-container">
                        <textarea id='chat-input' className="moji-text" placeholder="Type here to reply" onKeyUp={(e) => this.sendMesageOnKeyPress(e)}></textarea>
                        <div className="text-right" placeholder="Enter your message..." > 
                            <a href="javascript:void(0);" className="btn-chat-send" onClick={this.sendMessage}>
                                <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.01 18L21 9L0.01 0L0 7L15 9L0 11L0.01 18Z" fill="#9D9D9C"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>                
            );
        }
        else {
            let statusMessage = "Enter your message...";
            if (!this.state.chatReady) {
                statusMessage = "Please wait while channel is loading";
            }
            if (this.props.isLockedChat) {
                statusMessage = MESSAGES.chat;
            }
            
            return (
                <div className="view-chat-edit-sec">
                    <div className="padded-container type-area-msg">
                        <textarea className="moji-text" placeholder="Type here to reply" placeholder={statusMessage} disabled style={{ background: !this.state.chatReady ? "#D2D2D2" : 'transparent' }}></textarea>
                        <div className="text-right"> 
                            <a href="javascript:void(0);" className="btn-chat-send">
                                <svg width="18" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.01 18L21 9L0.01 0L0 7L15 9L0 11L0.01 18Z" fill="#ffffff"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>                
            );
        }
    }

    sendMesageOnKeyPress(e) {
        const self = this;
        var message = $(".type-area-msg .moji-text").val();
        if (e.which === 13 && message !== "") {
            self.sendMessage();
        }
        if ($(".type-area-msg .moji-text").val() == "\n") {
            $(".type-area-msg .moji-text").val('');
        }
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps) {
        if (prevProps.messages && this.props.messages) {
            if (prevProps.messages.length !== this.props.messages.length) {
                document.querySelector('.view-chat-listsec').scrollTo(0, document.querySelector('.view-chat-listsec').scrollHeight);
            }
        }
    }

    displayStatusMessage = () => {
        const { deal, quote } = this.props;

        const statusMessages = quote && quote.id && quote.status ? quoteStatusMessages : deal.productType === 'api' ? rfqStatusMessages : licensingInquiryStatusMessages;
        const status =  (quote && quote.id && quote.status) || deal.status;
        const type = (this.props.isCurrentUserBuyer && 'buyerMessage') || 'sellerMessage';

        let statusColorClass = '';
        switch (status) {
            case 'submitted':
                statusColorClass = 'received-new-quote';
                break;
            case 'accepted':
                statusColorClass = 'quote-accepted-rgt';
                break;
            case 'declined':
                statusColorClass = 'rfq-declined';
                break;
        } 
        if (!statusColorClass) return;   
        return (<div className={`${statusColorClass}`}>{statusMessages[status][`${type}`]}</div>)
    }

    render() {
        const { horizon_user, messages } = this.props;
        return (   
            <div className="view-chat-right col-sm-8">
                <div className="view-chat-sec affix-top" data-spy="affix" data-offset-top="79">
                    <div className="view-chat-listsec" tabindex="2">
                        {
                            messages && messages.map((chat) => {
                                const { Message, Sender, SentDateTime } = chat;
                                const messageSplit = Message.split('|');
                                const msgLen = messageSplit.length;
                                let userName = '';
                                let senderName = '';
                                let cleanMessage = '';
                                
                                if (msgLen == 3) {
                                    userName = messageSplit[msgLen - 2].trim();
                                    const companyName = messageSplit[msgLen - 1].trim();
                                    senderName = `${userName} | ${companyName}`
                                    messageSplit.splice(msgLen - 1, 1);
                                    messageSplit.splice(msgLen - 2, 1);
                                    cleanMessage = messageSplit.join('|');
                                }
                                else if (msgLen == 2) {
                                    senderName = messageSplit[msgLen - 1].trim();
                                    userName = senderName;
                                    messageSplit.splice(msgLen - 1, 1);
                                    cleanMessage = messageSplit.join('|');
                                }
                                else {
                                    senderName = Sender;
                                    userName = senderName;
                                    cleanMessage = Message;
                                }
                                

                                const momentDate = moment(SentDateTime);
                                const sentDate = momentDate.format('LL');
                                const sentTime = momentDate.format('LTS');
                                
                                let initials;
                                let userNameArr = userName.split(' ');
                                if (userNameArr.length > 1) {
                                    initials = `${userNameArr[0][0]}${userNameArr[1][0]}`.toUpperCase();
                                } else {
                                    initials = `${userNameArr[0][0]}${userNameArr[0][1]}`.toUpperCase();
                                }
                                console.log('momentDate', momentDate);
                                
                                
                                //let senderDisplayName = Sender.split('|');
                                //if (senderDisplayName && senderDisplayName.length > 0) {
                                //    senderDisplayName = senderDisplayName[0].trim();
                                //}
                                if (senderName.includes(horizon_user.DisplayName) ||
                                    senderName.includes(horizon_user.Email) ||
                                    senderName.includes(`${horizon_user.LastName} ${horizon_user.FirstName}`)) {
                                    return (                                        
                                        <React.Fragment>
                                            <div className="view-chat-ind chat-ind-self ">
                                                <div className="chat-user-icon">{initials}</div>
                                                <div className="chat-msg-info">
                                                    <span className="cmsg-cinfy">{senderName}</span>
                                                    <div className="cmsg-time"><span className="date-format">{ sentDate }</span> <span className="time-format">{ sentTime }</span> </div>
                                                </div>
                                                <p>{cleanMessage}</p>
                                            </div>
                                            <div className="clearfix"></div>
                                        </React.Fragment>
                                    )
                                }
                                else {
                                    return (
                                        <React.Fragment>
                                            <div className="view-chat-ind chat-ind-other ">
                                                <div className="chat-user-icon">{initials}</div>
                                                <div className="chat-msg-info">
                                                    <span className="cmsg-cinfy">{senderName}</span>
                                                    <div className="cmsg-time"><span className="date-format">{ sentDate }</span> <span className="time-format">{ sentTime }</span> </div>
                                                </div>
                                                <p>{cleanMessage }</p>
                                            </div>
                                            <div className="clearfix"></div>
                                        </React.Fragment>
                                    )
                                }
                            })
                        }
                        { this.props.quoteData && 
                            (
                                <div className="chat-mid-sec-status">
                                    { this.displayStatusMessage() }
                                </div>
                            )
                        }                            
                    </div>
                    
                    {
                        this.renderMessageInput()
                    }
                </div>
                <div className="clearfix"></div>
            </div>
        )        
    }
}

module.exports = ChatMessagesComponent;
