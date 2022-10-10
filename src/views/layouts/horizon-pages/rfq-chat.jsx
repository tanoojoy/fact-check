import React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { HeaderLayoutComponent } from '../header';
import { getAppPrefix } from '../../../public/js/common.js';
import { rfqStatusMessages, quoteStatusMessages } from '../../../consts/rfq-quote-statuses';
import { userRoles } from '../../../consts/horizon-user-roles';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Currencies } from '../../../consts/currencies';
import { InfoMessage } from '../horizon-components/info-message';
import { chatConstants } from '../../../consts/chat-constants';
import MainContent from '../horizon-components/main-content';
import { isFreemiumUserSku } from '../../../utils';
import LockedBlockChat from '../horizon-components/locked-block-chat';
import { PrimaryButton } from '../horizon-components/buttons';
import BreadcrumbsBlock from '../horizon-components/breadcrumbs-block';
import { BaseChat } from '../horizon-components/base-chat';
import { FREEMIUM_LIMITATION_POSITION, LimitationBlockFreemium } from '../horizon-components/limitation-block-freemium';

export class ChatRFQComponent extends BaseChat {
    constructor(props) {
        super(props);
        this.state = {
            statusMessage: ''
        };
    }

    componentDidMount() {
        this.setState({
            userInfo: { ...this.props?.userInfo }
        }, () => {
            this.setLockedChat();
            const $chatWindow = $('#messages');
            let chatClient;
            let generalChannel;
            let username;
            let channelName;
            if (this.props.userInfo) {
                const { email, first_name, last_name } = this.props.userInfo;
                const { name: companyName } = this.props.companyInfo;
                username = email;
                if (last_name && first_name) {
                    username = `${last_name} ${first_name}`;
                }
                username = `${username} | ${companyName}`;
                ({ chatId: channelName } = this.props);
            }
            function print(infoMessage, asHtml) {
                const $msg = $('<div class="info">');
                if (asHtml) {
                    $msg.html(infoMessage);
                } else {
                    $msg.text(infoMessage);
                }
                $chatWindow.append($msg);
            }

            // Helper function to print chat message to the chat window
            function printMessage(fromUser, message, msgTime) {
                if (fromUser === chatConstants.systemName) {
                    const $message = $('<span>').text(message);
                    const $container = $('<div class="system-chat-message-container">');
                    const $msgContainer = $('<div class="system-chat-message">');
                    $msgContainer.addClass(chatConstants[message]);
                    $msgContainer.append($message);
                    $container.append($msgContainer);
                    $chatWindow.append($container);
                } else {
                    const pureUserNameArr = fromUser.split(' | ');
                    const userNameArr = pureUserNameArr[0].split(' ');
                    let initials;
                    if (userNameArr.length > 1) {
                        initials = `${userNameArr[0][0]}${userNameArr[1][0]}`.toUpperCase();
                    } else {
                        initials = `${userNameArr[0][0]}${userNameArr[0][1]}`.toUpperCase();
                    }
                    const $withAvatarContainer = $('<div class="message-with-avatar">');
                    const $avatar = $('<div class="message-avatar">').text(initials);
                    const $user = $('<span class="username">').text(fromUser);
                    const $time = $('<span class="msgTime">').text(msgTime);
                    const $message = $('<span class="chat-message">').text(message);
                    const $container = $('<div class="message-container">');
                    if (fromUser === username) {
                        $user.addClass('me');
                        $container.addClass('from-me');
                        $withAvatarContainer.addClass('from-me');
                        $avatar.addClass('mine-avatar');
                    }
                    $container.append($user).append($time).append($message);
                    $withAvatarContainer.append($avatar).append($container);
                    $chatWindow.append($withAvatarContainer);
                    $chatWindow.scrollTop($chatWindow[0].scrollHeight);
                }
            }

            // Alert the user they have been assigned a random username

            // Get an access token for the current user, passing a username (identity)
            $.getJSON(`${getAppPrefix()}/product-profile/token/${username}`, function(data) {
                // Initialize the Chat client
                Twilio.Chat.Client.create(data.token).then(client => {
                    console.log('Created chat client');
                    chatClient = client;
                    chatClient.getPublicChannelDescriptors().then(function(paginator) {
                        for (let i = 0; i < paginator.items.length; i++) {
                            const channel = paginator.items[i];
                        }
                    });
                    chatClient.getSubscribedChannels().then(createOrJoinGeneralChannel);

                    // when the access token is about to expire, refresh it
                    chatClient.on('tokenAboutToExpire', function() {
                        refreshToken(username);
                    });

                    // if the access token already expired, refresh it
                    chatClient.on('tokenExpired', function() {
                        refreshToken(username);
                    });

                    // Alert the user they have been assigned a random username
                    username = data.identity;
                }).catch(error => {
                    console.error(error);
                });
            });

            function refreshToken(identity) {
                console.log('Token about to expire');
                // Make a secure request to your backend to retrieve a refreshed access token.
                // Use an authentication mechanism to prevent token exposure to 3rd parties.
                $.getJSON(`${getAppPrefix()}/product-profile/token/` + identity, function(data) {
                    console.log('updated token for chat client');
                    chatClient.updateToken(data.token);
                });
            }

            function createOrJoinGeneralChannel() {
                // Get the general chat channel, which is where all the messages are
                // sent in this simple application
                chatClient.getChannelByUniqueName(channelName)
                    .then(function(channel) {
                        generalChannel = channel;
                        generalChannel.join().finally(() => {
                            generalChannel.setAllMessagesConsumed();
                            channel.getMessages().then(function(messages) {
                                const totalMessages = messages.items.length;
                                for (let i = 0; i < totalMessages; i++) {
                                    const message = messages.items[i];
                                    printMessage(message.author, message.body, message.state.dateUpdated.toLocaleString());
                                }
                            });
                        });
                        setupChannel();
                    }).catch(function() {
                    // If it doesn't exist, let's create it
                        console.log('Creating general channel');
                        chatClient.createChannel({
                            uniqueName: channelName,
                            friendlyName: 'General Chat Channel'
                        }).then(function(channel) {
                            console.log('Created general channel:');
                            console.log(channel);
                            generalChannel = channel;
                            setupChannel();
                        }).catch(function(channel) {
                            console.log('Channel could not be created:');
                            console.log(channel);
                        });
                    });
            }

            // Set up channel after it has been found
            function setupChannel() {
                // Join the general channel
                generalChannel.join().then(function(channel) {
                    // print('Joined channel as ' + '<span class="me">' + username + '</span>.', true);
                });

                // Listen for new messages sent to the channel
                generalChannel.on('messageAdded', function(message) {
                    printMessage(message.author, message.body, message.state.dateUpdated.toLocaleTimeString());
                    generalChannel.setAllMessagesConsumed();
                });
                generalChannel.on('memberUpdated', function(event) {
                    console.log(event.member);
                });
            }

            // Send a new message to the general channel
            const $input = $('#chat-input');
            $input.on('keydown', (e) => {
                if (e.keyCode === 13 && $input.val()) {
                    if (generalChannel === undefined) {
                        print('The Chat Service is not configured. Please check your .env file.', false);
                        return;
                    }
                    this.sendMessage(generalChannel, $input);
                }
            });
            const $inputBtn = $('.deal__chat-send-btn');
            $inputBtn.on('click', (e) => {
                if ($input.val()) {
                    if (generalChannel === undefined) {
                        print('The Chat Service is not configured. Please check your .env file.', false);
                        return;
                    }
                    this.sendMessage(generalChannel, $input);
                }
            });

            const rfqData = get(this.props, 'rfqData', {});
            const quoteData = get(this.props, 'quoteData', {});
            const userInfo = get(this.props, 'userInfo', {});
            const { status: quoteStatus } = quoteData;
            const { status: rfqStatus } = rfqData;
            const statusMessage = this.getStatusMessage(quoteData.id ? quoteStatus : rfqStatus, !!quoteData.id, userInfo.role);
            this.setState({
                statusMessage
            });
        });
    }

    getStatusMessage(status, isQuote, userRole) {
        const messages = isQuote ? quoteStatusMessages : rfqStatusMessages;

        if (messages[status]) {
            if (userRoles.subMerchant === userRole) {
                return {
                    message: messages[status].sellerMessage,
                    color: `deal__deal-product-info-status-${status}`
                };
            } else {
                return {
                    message: messages[status].buyerMessage,
                    color: `deal__deal-product-info-status-${status}`
                };
            }
        }
        return {
            message: '',
            color: ''
        };
    }

    render() {
        const rfqData = get(this.props, 'rfqData', {});
        const quoteData = get(this.props, 'quoteData', {});
        const interlocutorCompanyInfo = get(this.props, 'interlocutorCompanyInfo', {});
        const { productName, quantity, unit } = rfqData;
        const { codes } = Currencies;
        const {
            name: interlocutorCompanyName,
            id: interlocutorCompanyId,
            addresses: interlocutorCompanyAddresses
        } = interlocutorCompanyInfo;

        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={this.props?.user} />
                </div>
                <MainContent className='flex-direction-column' user={this.props?.user}>
                    <BreadcrumbsBlock>
                        {isFreemiumUserSku(this.props?.user) && <LimitationBlockFreemium position={FREEMIUM_LIMITATION_POSITION.chat} user={this.state?.userInfo} />}
                    </BreadcrumbsBlock>
                    <div className='deal__deal-container'>
                        <div className='deal__deal-details'>
                            <div className='deal__company-details'>
                                <div className='deal__company-details-link'>
                                    {interlocutorCompanyId && <a href={`${getAppPrefix()}/company/${interlocutorCompanyId}`}>
                                        <i className='fas fa-chevron-left' />
                                    </a>}
                                </div>
                                <div className='deal__company-details-text'>
                                    <div className='deal__company-name'>
                                        {interlocutorCompanyName || ''}
                                    </div>
                                    <div className='deal__company-location'>
                                        {interlocutorCompanyAddresses && interlocutorCompanyAddresses[0]}
                                    </div>
                                </div>
                            </div>
                            <hr className='deal__deal-divider-gray' />
                            <div className='deal__deal-summary'>
                                <div className='deal__deal-summary-container'>
                                    <div className='deal__deal-summary-title'>
                                        Deal Summary
                                    </div>
                                    <hr className='deal__deal-divider' />
                                    <div className='deal__deal-product-info'>
                                        <div className='deal__deal-product-info-item'>
                                            <div className='deal__deal-product-info-title'>Product</div>
                                            <div className='deal__deal-product-info-value'>{productName}</div>
                                        </div>
                                        <div className='deal__deal-product-info-item'>
                                            <div className='deal__deal-product-info-title'>Quantity</div>
                                            <div className='deal__deal-product-info-value'>{`${quantity} ${unit}`}</div>
                                        </div>
                                        <div className='deal__deal-product-info-item'>
                                            <div className='deal__deal-product-info-title'>Status</div>
                                            <div className={`deal__deal-product-info-status ${this.state.statusMessage.color}`}>
                                                {this.state.statusMessage.message}
                                            </div>
                                        </div>
                                    </div>
                                    <hr className='deal__deal-divider' />
                                    <div className='deal__deal-summary-action'>
                                        <PrimaryButton
                                            onClick={quoteData.id ? this.openQuote : this.createQuote}
                                            addClasses='deal__deal-summary-action-btn'
                                        >
                                            {quoteData.id ? 'Open Quote' : 'Open RFQ'}
                                        </PrimaryButton>
                                    </div>
                                    {quoteData.id && <div className='deal__deal-product-info-item'>
                                        <div className='deal__deal-total-cost-title'>Total Cost</div>
                                        <div className='deal__deal-total-cost-title-value'>
                                            {`${getSymbolFromCurrency(codes[rfqData.preferredCurrency] || '') || ''} ${quoteData.price}`}
                                        </div>
                                    </div>}
                                </div>
                            </div>
                            <div className='deal__deal-summary'>
                                <InfoMessage>Only 1 quote can be submitted per RFQ</InfoMessage>
                            </div>
                            <div className='deal__deal-summary'>
                                <InfoMessage>To receive another Quote, Buyer needs to send another RFQ</InfoMessage>
                            </div>
                        </div>
                        <div className='deal__chat-container'>
                            <section className='chat-window'>
                                <div id='messages' />
                                <div className='deal__chat-input-container'>
                                    {
                                        this.state.isLockedChat
                                            ? <LockedBlockChat />
                                            : <>
                                                <input id='chat-input' type='text' placeholder='type here to reply' autoFocus />
                                                <img src={getAppPrefix() + '/assets/images/horizon/send_arrow.svg'} alt='' className='deal__chat-send-btn' />
                                            </>
                                    }
                                </div>
                            </section>
                        </div>
                    </div>
                </MainContent>
            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        rfqData: state.productInfoReducer.rfqData,
        productInfo: state.productInfoReducer.productInfo,
        companyInfo: state.userReducer.companyInfo,
        userInfo: state.userReducer.userInfo,
        user: state.userReducer.user,
        chatId: state.productInfoReducer.chatId,
        quoteData: state.productInfoReducer.quoteData,
        interlocutorCompanyInfo: state.productInfoReducer.interlocutorCompanyInfo
    };
};

const mapDispatchToProps = dispatch => ({});

export const ChatRFQContainer = connect(mapStateToProps, mapDispatchToProps)(ChatRFQComponent);
