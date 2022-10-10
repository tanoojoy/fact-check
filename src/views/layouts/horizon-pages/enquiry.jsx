import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../header';
import HorizonFooterComponent from '../horizon-components/footer';
import { getAppPrefix } from '../../../public/js/common.js';
import MainContent from '../horizon-components/main-content';
import UnlockMoreResultsBanner from '../horizon-components/unlock-more-results-banner';
import { enquiry as enquiryPPs } from '../../../consts/page-params';
import BreadcrumbsBlock from '../horizon-components/breadcrumbs-block';
import { isFreemiumUserSku } from '../../../utils';
import { FREEMIUM_LIMITATION_POSITION, LimitationBlockFreemium } from '../horizon-components/limitation-block-freemium';
import { bool, number, object, shape, string } from 'prop-types';
import { WrapperPaginator } from '../horizon-components/wrapper-paginator';
import axios from 'axios';

const ListOfChats = ({
    page = 0,
    size = 15,
    userInfo = {},
    companyInfo = {},
    isFreemiumUser = false
}) => {
    const [chats, setChats] = useState([]);

    const goToChat = (chatId, interlocutorCompanyId = '') => {
        window.location = `${getAppPrefix()}/common-chat/${chatId}/?interlocutor=${interlocutorCompanyId}`;
    };

    useEffect(() => {
        const normalizePageNumber = page - 1; // due to on FE pages starts from 1 but on BE its starts from 0
        axios.get(`${getAppPrefix()}/inbox/enquire-chat-list?page=${normalizePageNumber}&size=${size}&companyId=${companyInfo.id}`)
            .then(res => {
                let chats = res?.data?.chats || [];
                console.log('chats', chats);
                chats = isFreemiumUser ? chats.slice(0, 3) : chats;
                setChats(chats.slice());
                fillChats(chats.slice());
            })
            .catch(console.log);
    }, [page, size]);

    const fillChats = (chats = []) => {
        let username;
        if (userInfo) {
            const { email, first_name, last_name } = userInfo;
            const { name: companyName } = companyInfo;
            username = email;
            if (last_name && first_name) {
                username = `${last_name} ${first_name}`;
            }
            username = `${username} | ${companyName}`;
        }
        $.getJSON(`${getAppPrefix()}/product-profile/token/${username}`, (data) => {
            // Initialize the Chat client
            Twilio.Chat.Client.create(data.token).then(client => {
                const chatClient = client;
                console.log(chatClient);
                chats.map(chat => {
                    const { twillioChatId: channelName } = chat;
                    chatClient.getChannelByUniqueName(channelName)
                        .then(function(channel) {
                            console.log(channel);
                            channel.join().finally(() => {
                                channel.getUnconsumedMessagesCount().then(res => {
                                    channel.getMessagesCount().then(msgCount => {
                                        if (res !== 0 && msgCount !== 0) {
                                            $(`#${channel.channelState.uniqueName}UnreadMark`).css('display', 'flex');
                                        }
                                    });
                                });
                                channel.getMessages().then(function(messages) {
                                    const lastMessage = messages.items[messages.items.length - 1];
                                    const { author, body, dateUpdated } = lastMessage.state;
                                    $(`#${channel.channelState.uniqueName}`).text(body);
                                    $(`#${channel.channelState.uniqueName}author`).text(author);
                                    $(`#${channel.channelState.uniqueName}time`).text(dateUpdated.toLocaleString());
                                });
                            });
                        }).catch(function() {
                            console.log('No messages yet in channel');
                        });
                });
            }).catch(error => {
                console.error(error);
            });
        });
    };

    return (
        <div className='inbox__enquiries-list'>
            {chats.map((chat, ix) => {
                const { twillioChatId: channelName, interlocutorCompany } = chat;
                return (
                    <div
                        key={channelName}
                        className='inbox__enquiry-item'
                        onClick={() => { goToChat(channelName, interlocutorCompany?.id); }}
                    >
                        <div className='inbox__enquiry-summary'>
                            <div className='inbox__enquiry-company-name'>
                                {chat?.interlocutorCompany?.name || 'Unknown'}
                            </div>
                            <div className='inbox__unread-mark' id={`${channelName}UnreadMark`} />
                        </div>
                        <div className='inbox__enquiry-last-message'>
                            <div className='inbox__enquiry-last-message-info'>
                                <div className='inbox__enquiry-last-message-info-sender' id={`${channelName}author`}>
                                    Not started
                                </div>
                                <div className='inbox__enquiry-last-message-info-time' id={`${channelName}time`} />
                            </div>
                            <div className='inbox__enquiry-last-message-body' id={channelName}>
                                No messages yet
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export class Enquiry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            size: 10
        };
    }

    render() {
        const { chatsCount = 0, user = {}, userInfo = {}, companyInfo = {} } = this.props;

        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={user} />
                </div>
                <MainContent className='inbox__enquiries' user={user}>
                    <BreadcrumbsBlock>
                        {isFreemiumUserSku(user) && <LimitationBlockFreemium position={FREEMIUM_LIMITATION_POSITION.inboxEnquiries} user={user} />}
                    </BreadcrumbsBlock>
                    <div className='inbox__header'>
                        <h1 className='inbox__title'>Inbox</h1>
                        <div className='inbox__tabs'>
                            <div className='inbox__tab'><a href={`${getAppPrefix()}/inbox/requests-quotes`}>My requests and quotes</a></div>
                            <div className='inbox__tab active'>Enquiries</div>
                        </div>
                    </div>
                    <WrapperPaginator
                        isFreemiumUser={isFreemiumUserSku(user)}
                        count={chatsCount}
                        callback={(page, rowPerPage) => this.setState({ page, size: rowPerPage })}
                    >
                        <ListOfChats
                            isFreemiumUser={isFreemiumUserSku(user)}
                            page={this.state.page}
                            size={this.state.size}
                            userInfo={userInfo}
                            companyInfo={companyInfo}
                        />
                    </WrapperPaginator>

                    <div className='unlock-more-results-banner__wrapper-enquiry'>
                        <UnlockMoreResultsBanner user={user} page={enquiryPPs.appString} />
                    </div>
                </MainContent>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </>);
    }
}

ListOfChats.propTypes = {
    page: number,
    size: number,
    userInfo: shape({
        email: string,
        first_name: string,
        last_name: string
    }),
    companyInfo: shape({
        name: string
    }),
    isFreemiumUser: bool
};

Enquiry.propTypes = {
    user: object,
    userInfo: shape({
        email: string,
        first_name: string,
        last_name: string
    }),
    companyInfo: shape({
        name: string
    }),
    chatsCount: number
};

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        userInfo: state.userReducer.userInfo,
        chatsCount: state.userReducer.chatsCount,
        companyInfo: state.userReducer.companyInfo
    };
};

const mapDispatchToProps = (dispatch) => {};

export const EnquiryLayout = connect(mapStateToProps, mapDispatchToProps)(Enquiry);
