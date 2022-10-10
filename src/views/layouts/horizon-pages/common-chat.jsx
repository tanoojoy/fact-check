import React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../header';
import { getAppPrefix } from '../../../public/js/common.js';
import { InfoMessage } from '../horizon-components/info-message';
import MainContent from '../horizon-components/main-content';
import { isFreemiumUserSku } from '../../../utils';
import LockedBlockChat from '../horizon-components/locked-block-chat';
import BreadcrumbsBlock from '../horizon-components/breadcrumbs-block';
import { BaseChat } from '../horizon-components/base-chat';
import { FREEMIUM_LIMITATION_POSITION, LimitationBlockFreemium } from '../horizon-components/limitation-block-freemium';

export class CommonChatComponent extends BaseChat {
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
            if (this.state.userInfo) {
                const { email, first_name, last_name } = this.state.userInfo;
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
                            console.log('Channel: ' + channel.friendlyName);
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
                    generalChannel.setAllMessagesConsumed();
                    printMessage(message.author, message.body, message.state.dateUpdated.toLocaleTimeString());
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
        });
    }

    render() {
        const interlocutorCompanyInfo = this.props?.interlocutorCompanyInfo || {};
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
                                        {interlocutorCompanyName || 'Unknown'}
                                    </div>
                                    <div className='deal__company-location'>
                                        {interlocutorCompanyAddresses && interlocutorCompanyAddresses[0]}
                                    </div>
                                </div>
                            </div>
                            <div className='deal__deal-summary' style={{ width: '346px' }}>
                                <InfoMessage>To start a negotiation on a certain product, please, proceed to the product page, create a Request for Quotation and click Send and Start Chat button</InfoMessage>
                            </div>
                        </div>
                        <hr className='deal__deal-divider-gray' />
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
        companyInfo: state.userReducer.companyInfo,
        userInfo: state.userReducer.userInfo,
        user: state.userReducer.user,
        chatId: state.userReducer.chatId,
        interlocutorCompanyInfo: state.userReducer.interlocutorCompanyInfo
    };
};

const mapDispatchToProps = dispatch => ({});

export const CommonChatContainer = connect(mapStateToProps, mapDispatchToProps)(CommonChatComponent);
