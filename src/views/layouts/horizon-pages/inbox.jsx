import React, { Component, useEffect, useState } from 'react';
import $ from 'jquery';
import axios from 'axios';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../header';
import HorizonFooterComponent from '../horizon-components/footer';
import { userRoles } from '../../../consts/horizon-user-roles';
import { rfqStatusMessages, quoteStatusMessages } from '../../../consts/rfq-quote-statuses';
import { getAppPrefix } from '../../../public/js/common';
import MainContent from '../horizon-components/main-content';
import UnlockMoreResultsBanner from '../horizon-components/unlock-more-results-banner';
import { inbox as inboxPPs } from '../../../consts/page-params';
import BreadcrumbsBlock from '../horizon-components/breadcrumbs-block';
import { WrapperPaginator } from '../horizon-components/wrapper-paginator';
import { isFreemiumUserSku } from '../../../utils';
import { FREEMIUM_LIMITATION_POSITION, LimitationBlockFreemium } from '../horizon-components/limitation-block-freemium';
import { bool, number, object, oneOf, shape, string } from 'prop-types';

const ListOfChats = ({
    role,
    page = 0,
    size = 15,
    userInfo = {},
    companyInfo = {},
    isFreemiumUser = false
}) => {
    const [dealsData, setDealsData] = useState([]);

    const getDealStatus = (deal, userRole) => {
        const messages = deal.quote ? quoteStatusMessages : rfqStatusMessages;
        const status = deal.quote ? deal.quote.status : deal.rfq.status;
        if (messages[status]) {
            if (userRoles.subMerchant === userRole) {
                return {
                    message: messages[status].sellerMessage,
                    color: `inbox__deal-product-info-status-${status}`
                };
            } else {
                return {
                    message: messages[status].buyerMessage,
                    color: `inbox__deal-product-info-status-${status}`
                };
            }
        }
        return {
            message: deal.rfq.status,
            color: ''
        };
    };

    const goToChat = (rfqId, chatId) => {
        window.location = `${getAppPrefix()}/product-profile/chatRFQ/${rfqId}/${chatId}`;
    };

    const fillChats = (dealsData = []) => {
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
                dealsData.map(deal => {
                    const { chatId: channelName } = deal.rfq;
                    chatClient.getChannelByUniqueName(channelName)
                        .then(function(channel) {
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

    useEffect(() => {
        const normalizePageNumber = page - 1; // due to on FE pages starts from 1 but on BE its starts from 0
        console.log(`${normalizePageNumber} - ${size}`);
        axios.get(`${getAppPrefix()}/inbox/deal-chat-list?page=${normalizePageNumber}&size=${size}`)
            .then(res => {
                let deals = res?.data?.deals || [];
                console.log('deals', deals);
                deals = isFreemiumUser ? deals.slice(0, 3) : deals;
                setDealsData(deals.slice());
                fillChats(deals.slice());
            })
            .catch(console.log);
    }, [page, size]);

    return (
        <div className='inbox__deals-list'>
            {dealsData.map(deal => {
                const { quantity, unit, productName, chatId: channelName, id: rfqId } = deal.rfq;
                const { interlocutorCompany = {} } = deal;
                const status = getDealStatus(deal, role);

                if (!interlocutorCompany.name) return null;

                return (
                    <div key={rfqId} className='inbox__deal-item' onClick={() => { goToChat(rfqId, channelName); }}>
                        <div className='inbox__deal-summary'>
                            <div className='inbox__deal-company-name'>
                                {interlocutorCompany.name}
                            </div>
                            <div className='inbox__deal-product-info'>
                                <div className='inbox__deal-product-info-item'>
                                    <div className='inbox__unread-mark' id={`${channelName}UnreadMark`} />
                                    <div className='inbox__deal-product-info-item-title'>
                                        Product
                                    </div>
                                    <div className='inbox__deal-product-info-item-value'>
                                        {productName}
                                    </div>
                                </div>
                                <div className='inbox__deal-product-info-item'>
                                    <div className='inbox__deal-product-info-item-title'>
                                        Quantity
                                    </div>
                                    <div className='inbox__deal-product-info-item-value'>
                                        {`${quantity} ${unit}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='inbox__deal-last-message'>
                            <div className='inbox__deal-last-message-info'>
                                <div className='inbox__deal-last-message-info-sender' id={`${channelName}author`}>
                                    Not started
                                </div>
                                <div className='inbox__deal-last-message-info-time' id={`${channelName}time`} />
                            </div>
                            <div className='inbox__deal-last-message-body' id={channelName}>
                                No messages yet
                            </div>
                        </div>
                        <div className='inbox__deal-status'>
                            <div className='inbox__deal-status-title'>
                                Status
                            </div>
                            <div className={`inbox__deal-status-value ${status.color}`}>
                                {status.message}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export class Inbox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            size: 10
        };
    }

    render() {
        const { dealsCount = 0, user = {}, userInfo = {}, companyInfo = {} } = this.props;
        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={user} />
                </div>
                <MainContent className='inbox__deals' user={user}>
                    <BreadcrumbsBlock>
                        {isFreemiumUserSku(user) &&
                        <LimitationBlockFreemium position={FREEMIUM_LIMITATION_POSITION.inbox} user={user} />}
                    </BreadcrumbsBlock>
                    <div className='inbox__header'>
                        <h1 className='inbox__title'>Inbox</h1>
                        <div className='inbox__tabs'>
                            <div className='inbox__tab active '>My requests and quotes</div>
                            <div className='inbox__tab'>
                                <a href={`${getAppPrefix()}/inbox/enquiries`}>
                                    Enquiries
                                </a>
                            </div>
                        </div>
                    </div>
                    <WrapperPaginator
                        isFreemiumUser={isFreemiumUserSku(user)}
                        count={dealsCount}
                        callback={(page, rowPerPage) => this.setState({ page, size: rowPerPage })}
                    >
                        <ListOfChats
                            isFreemiumUser={isFreemiumUserSku(user)}
                            role={userInfo?.role}
                            page={this.state.page}
                            size={this.state.size}
                            userInfo={userInfo}
                            companyInfo={companyInfo}
                        />
                    </WrapperPaginator>
                    <div className='unlock-more-results-banner__wrapper-inbox'>
                        <UnlockMoreResultsBanner user={user} page={inboxPPs.appString} />
                    </div>
                </MainContent>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </>);
    }
}

ListOfChats.propTypes = {
    role: oneOf([userRoles.subMerchant, userRoles.subBuyer]),
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

Inbox.propTypes = {
    dealsCount: number,
    userInfo: shape({
        email: string,
        first_name: string,
        last_name: string
    }),
    companyInfo: shape({
        name: string
    }),
    user: object
};

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        userInfo: state.userReducer.userInfo,
        dealsCount: state.marketplaceReducer.dealsCount,
        companyInfo: state.userReducer.companyInfo
    };
};

const mapDispatchToProps = (dispatch) => {};

export const InboxLayout = connect(mapStateToProps, mapDispatchToProps)(Inbox);
