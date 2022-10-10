'use strict';

var express = require('express');
var chatRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var ChatComponent = require('../views/chat/index').ChatComponent;
var ChatInboxPage = require('../views/chat/inbox/main').ChatComponent;
var ChatQuotationComponent = require('../views/chat/quotation/index').ChatQuotationComponent;
var client = require('../../sdk/client');
var authenticated = require('../scripts/shared/authenticated');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var authorizedUser = require('../scripts/shared/authorized-user');
var Store = require('../redux/store');
var EnumCoreModule = require('../public/js/enum-core');
var CustomFieldStaticModule = require('../public/js/static/custom-field');
let TwilioChat = require('twilio-chat');

import { getDealsByUserId, getDealsByCompanyId, getDealsCountByBuyer } from './horizon-api/entity-service/deals-controller';
import { getChatsByParams, postChatParams } from './horizon-api/entity-service/chat-controller';
import { resolveClarivateUserId } from './horizon-api/auth-service/auth-controller';
import { getCompanyById, getCompaniesByIds } from './horizon-api/entity-service/company-controller';
import { updateRfq, createRfq, getRfqById } from './horizon-api/entity-service/rfq-controller';
import { getCgiProductData, getManufacturerProductById, getMarketerProductById } from './horizon-api/entity-service/product-controller';
import { getQuoteDetails } from './horizon-api/entity-service/quote-controller';
import { isCompleteOnBoarding, redirectUnauthorizedUser, toInboxMessageObj, toInboxEnquiryObj, toChatMessagesObj } from '../utils';
import { userRoles } from '../consts/horizon-user-roles';
import tokenGenerator from './horizon-routers/token-generator';


function getUserInboxes(userId, pageNumber, keyword, callback) {
    var promiseInbox = new Promise((resolve, reject) => {
        const options = {
            userId: userId,
            pageSize: 20,
            pageNumber: pageNumber,
            keyword: keyword
        };

        client.Inbox.getUserMessages(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInbox]).then((responses) => {
        const inboxes = responses[0];
        let inboxMessages= [];

        if (inboxes.TotalRecords > 0) {
            let promiseMessages = [];

            inboxes.Records.forEach(function (inbox) {
                let options = {
                    userId: userId,
                    channelId: inbox.ChannelID,
                    limit: 1,
                    orderDirection: 'desc',
                    includes: ["Offer", "User"]
                };

                let promise = new Promise((resolve, reject) => {
                    client.Inbox.getChannelMessages(options, function (err, result) {
                        resolve(result);
                    });
                });

                promiseMessages.push(promise);
            });

            Promise.all(promiseMessages).then((responses) => {
                responses.forEach(function (response) {
                    let channel = response.Channel;
                    let messages = response.Messages;
                    let member = channel.Members.find(m => m.User.ID == userId);
                    let data = {
                        messages: messages,
                        channel: channel,
                        isNewMessage: false
                    };

                    if (messages.TotalRecords > 0) {
                        messages.Records.forEach(function (message) {
                            if (message.SID != member.LastMessageSID) {
                                data.isNewMessage = true;
                            }
                        });
                    }

                    inboxMessages.push(data);
                });

                callback(inboxes, inboxMessages);
            });
        } else {
            callback(inboxes, inboxMessages)
        }
    });
}

chatRouter.get('/generate-conversation-token', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;
    const device = req.query["device"];
    const identity = encodeURIComponent(req.query["identity"]);
    console.log('generate-conversation-token', device, identity);
    client.Chat.generateConversationToken(device, identity, function (err, response) {
        res.send(response);
    });
});

chatRouter.get('/generate-token-username-company/', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;
    const { username } = req.params;
    
    var promiseToken = new Promise((resolve, reject) => {
        const token = tokenGenerator(username);
        resolve(token);
    });

    Promise.all([promiseToken]).then((responses) => {
        const token = responses[0];
        res.send(token);
    });
});

chatRouter.get('/:chatId', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;
    console.log('chat/chatID');
    const context = {};
    const userInfo = req?.user?.userInfo;
    const hasInterlocutorId = !!req.query?.interlocutor;
    const interlocutorId = req.query?.interlocutor;
    const getInterlocutorCompany = hasInterlocutorId ? getCompanyById(req, interlocutorId) : Promise.resolve;
    
    Promise.all([getCompanyById(req), getInterlocutorCompany])
        .then(responses => {
            const [resCgiCompanyData, interlocutorCompanyInfo] = responses;
            const companyInfo = resCgiCompanyData.data || {};
            const interlocutorCompany = interlocutorCompanyInfo && interlocutorCompanyInfo.data || {};
            const appString = 'chat';
            const channelId = req.params.chatId;
            const sid = req.query.sid;
            const isBuyer = !(userInfo.role === userRoles.subMerchant);
            
            client.Chat.getMessageHistory(sid, function (err, response) {
                let chatDetail = null;
                if (response && response.result) {
                    chatDetail = response.result;
                }
                console.log('chatDetail', chatDetail);
                const s = Store.createChatStore({
                    userReducer: {
                        user: req?.user,
                        isBuyer: isBuyer
                    },
                    companyReducer: {
                        companyInfo: companyInfo,
                        interlocutorCompany: interlocutorCompany
                    },
                    chatReducer: {
                        channelId: channelId,
                        sid: sid,
                        customFields: [
                            {
                                ...interlocutorCompany
                            }
                        ],
                        chatDetail: chatDetail
                    }
                });

                const reduxState = s.getState();
                const chatPageApp = reactDom.renderToString(<ChatComponent context={context}
                    user={req?.user}
                    isBuyer={isBuyer}
                    chatDetail={chatDetail}
                    interlocutorCompany={interlocutorCompany}
                    companyInfo={companyInfo}
                />);

                let seoTitle = 'Chat';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                res.send(template('page-chat new-search-settings', seoTitle, chatPageApp, appString, reduxState));
            });            
        });
});

chatRouter.post('/createChat', authenticated, function (req, res) {
    console.log('chatRouter createChat');
    if (redirectUnauthorizedUser(req, res)) return;
    const userClarivateId = req.body['userClarivateId'];
    const arcadierUserId = req.body['arcadierUserId'];
    let twillioChatId = req.body['twillioChatId'];
    const isInitiator = req.body['isInitiator'];
    const incomingCoId = req.body['incomingCoId'];
    const outgoingCoId = req.body['outgoingCoId'];
    
    client.Chat.createConversationChannel({
        channelName: twillioChatId,
        buyerId: userClarivateId,
        sellerCompanyId: outgoingCoId
        //channelName: 'chatcommon10121636949441970',
        //buyerId: 'c57b30a0-d26b-11ea-a606-8dbbd477c73c',
        //sellerCompanyId: '10092'
    }, async (err, response) => {
        console.log('createChannelResult', response);
        if (response.Result) {
            twillioChatId = `${twillioChatId}|${response.Sid}`;
            try {
                // post (create) rfq
                const createChatRequest = await postChatParams({ userClarivateId, twillioChatId, arcadierUserId, isInitiator, incomingCoId, outgoingCoId });
                //console.log('createChatRequest', createChatRequest);
                res.send({ chat: createChatRequest.data });
            } catch (e) {
                console.log('productProfile create RFQ Error e', e);
            }
        }
    });
})

chatRouter.get('/chatRFQ/:rfqId/:chatId', authenticated, function(req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const context = {};    
    const { rfqId, chatId } = req.params;   
    const userInfo = req?.user?.userInfo;             
    
    getRfqById(rfqId)
        .then(result => {
            const rfqData = result.data;
            const interlocutorId = rfqData.company.id;
            const productId = rfqData.productId;
            const quoteId = rfqData.quoteId;
            const chatIdSplit = rfqData.chatId.split('|');
            const friendlyName = chatIdSplit[0];
            let sid = '';
            if (chatIdSplit.length > 1) {
                sid = chatIdSplit[1];
            }
            client.Chat.getMessageHistory(sid, function (err, response) {
                let chatDetail = null;
                if (response && response.result) {
                    chatDetail = response.result;
                }
                const getQuoteDetailPromise = quoteId ? getQuoteDetails(userInfo.userid, quoteId) : Promise.resolve;


                Promise.all([getCompanyById(req), getCompanyById(req, interlocutorId), getCgiProductData(req, productId), getQuoteDetailPromise])
                    .then(responses => {
                        const [resCgiCompanyData, interlocutorCompanyInfo, resCgiProductData, quote] = responses;
                        const companyInfo = resCgiCompanyData.data || {};
                        const interlocutorCompany = interlocutorCompanyInfo && interlocutorCompanyInfo.data || {};
                        const productInfo = resCgiProductData.data || {};
                        const appString = 'chat';
                        const channelId = chatId;
                        const quoteData = quote.data;

                        const customFields = [
                            {
                                ...interlocutorCompany
                            },
                            {
                                ...productInfo
                            },
                            {
                                ...quoteData
                            },
                            {
                                ...rfqData
                            }
                        ];

                        const s = Store.createChatStore({
                            userReducer: {
                                user: req?.user
                            },
                            companyReducer: {
                                companyInfo: companyInfo
                            },
                            chatReducer: {
                                channelId: channelId,
                                sid: sid,
                                customFields: customFields,
                                chatDetail: chatDetail
                            }
                        });

                        const reduxState = s.getState();
                        const chatPageApp = reactDom.renderToString(<ChatComponent context={context}
                            user={req?.user}
                            chatDetail={chatDetail}
                            interlocutorCompany={interlocutorCompany}
                            companyInfo={companyInfo}
                            customFields={customFields}
                        />);

                        let seoTitle = 'Chat';
                        if (req.SeoTitle) {
                            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                        }

                        res.send(template('page-chat new-search-settings', seoTitle, chatPageApp, appString, reduxState));
                        
                    });
            });
        });
});

chatRouter.put('/chat-update-rfq/:rfqId/', authenticated, async (req, res) => {
    const rfqData = req.body;
    try {
        const { chatId, id } = rfqData;
        //const userInfo = req?.user?.userInfo;
        console.log('id', id);
        await updateRfq(req, { chatId }, id);
    }
    catch (e) {

    }
    return;
});

const getDealsWithInterlocutor = async({ role, companyId, userId, page, size }) => {
    if (role === userRoles.subMerchant) {
        const deals = (await getDealsByCompanyId(companyId, page, size)).content;
        const buyerIds = deals.map(deal => deal.rfq && deal.rfq.buyerId);
        const usersData = await resolveClarivateUserId(buyerIds);
        const companies = await getCompaniesByIds(usersData.map(userData => userData.clarivateCompanyId), true);

        deals.forEach((deal, ix) => (deal.interlocutorCompany = companies[ix]));

        return deals;
    }

    const dealsResponse = await getDealsByUserId(userId, page, size);
    const deals = dealsResponse.data;

    const companyIds = deals.map(deal => deal.rfq && deal.rfq.cgiCompanyId);
    const companies = await getCompaniesByIds(companyIds, true);

    deals.forEach((deal) => {
        const company = companies.find((company) => deal.rfq.cgiCompanyId === company.id);
        deal.interlocutorCompany = company;
    });

    return deals;
};

const getChatMessage = async (deal) => {
    //let dealsWithMessages = [];
    const promiseMsgHist = (sid) => {
        return new Promise((resolve, reject) => {
            client.Chat.getMessageHistory(sid, function (err, response) {
                resolve(response);
            });
        });
    };

    const { ChannelID: channelName } = deal;
    const channelSplit = channelName.split('|');
    let sid = '';
    if (channelSplit.length > 1) {
        sid = channelSplit[1];
    }
    console.log('sid', sid);
    if (sid) {
        try {
            const messages = await promiseMsgHist(sid);            
            deal.messages = messages.result.Records.map(item => {
                if (item) {
                    console.log('item.sid', item.SID);
                    return { author: item.Sender, body: item.Body, dateUpdated: item.DateSentTimeStamp, sid: item.SID }
                }
                return null;
            });
            console.log('getChatMessage', JSON.stringify(deal));
        }
        catch {
            return { ...deal };
        }
    }
    return { ...deal };
}

const getChatMessages = async (inboxes) => {
    let updatedInboxes = [];
    
    try {
        for (let deal of inboxes) {
            try {
                const updatedDeal = await getChatMessage(deal);
                updatedInboxes.push(updatedDeal);
            }
            catch {

            }            
        };
        return updatedInboxes;
    }
    catch {
        return null;
    }    
}

const getDealsByPage = (deals, page, size) => {
    deals = deals.sort((a, b) => {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
    });
    console.log('deals sorted', deals);
    deals = deals.slice((page - 1) * size, (size * page) - 1);
    return deals;
}

const renderInboxRequestsQoutes = (req, res, user, companyInfo, dealsCount, isDataOnly = false, isBuyer = false) => {
    const context = {};
    let seoTitle = 'Inbox';
    if (req.SeoTitle) {
        seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
    }
    const appString = 'chat-inbox';

    let { page = 1, size = 5 } = req.query;
    page -= 1;
    const { role, companyId = null, ID: userId } = req.user;    

    getDealsWithInterlocutor({
            role,
            companyId,
            userId,
            page,
            size
        }).then(async responseDeal => {
            let deals = responseDeal;
            if (deals) {
                if (deals.length > size) {
                    deals = getDealsByPage(deals, page, size);
                }
            }
            let inboxes = {
                TotalRecords: dealsCount,
                PageNumber: page + 1,
                PageSize: size,
                Records: []
            };
            deals.forEach((deal) => {    
                let record = toInboxMessageObj(deal);
                inboxes.Records.push(record);
            });
            const records = await getChatMessages(inboxes.Records);
            //console.log('records', JSON.stringify(records));
            inboxes.Records = [...records];
            if (isDataOnly) {
                return res.send({ inboxes });
            }
            //Request/Quotes code above
            
            const chatInboxes = await GetEnquiries(req);
            
            
            const s = Store.createInboxStore({
                userReducer: { user: req.user, isBuyer: isBuyer },
                inboxReducer: {
                    messages: inboxes,
                    enquiries: chatInboxes
                },
                companyReducer: {
                    companyInfo: companyInfo
                },
                marketplaceReducer: { dealsCount: dealsCount || 0 },      
                searchReducer: {

                }
                
            });
            const reduxState = s.getState();
            const InboxPage = reactDom.renderToString(
                <ChatInboxPage
                    currentUser={req.user}
                    messages={inboxes}
                    enquiries={chatInboxes}
                    companyInfo={companyInfo}
                    isBuyer={isBuyer}
                />);
        
            res.send(template('page-chat new-search-settings', seoTitle, InboxPage, appString, reduxState));
        });
}

chatRouter.get('/inbox/requests-quotes', authenticated, authorizedUser, async function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;
    if (!isCompleteOnBoarding(req?.user)) {
        res.redirect(getAppPrefix() + '/');
        return;
    }

    const userInfo = req?.user?.userInfo;    
    getCompanyById(req)
        .then(resCgiCompanyData => {
            const companyInfo = resCgiCompanyData.data || {};            
            let dealsCount;
            if (userInfo.role === userRoles.subMerchant) {
                getDealsByCompanyId(req?.user?.companyId)
                    .then(deals => {
                        dealsCount = deals?.total;      
                        renderInboxRequestsQoutes(req, res, userInfo, companyInfo, dealsCount, false, false);
                    });
            } else {
                getDealsCountByBuyer(req.user.ID)
                    .then(deals => {
                        dealsCount = deals?.rfq[0]?.count;
                        renderInboxRequestsQoutes(req, res, userInfo, companyInfo, dealsCount, false, true );
                    });
            }
        });
});

const GetEnquiries = (req) => {
    let { page = 1, size = 5 } = req.query;
    page -= 1;
    const userInfo = req?.user?.userInfo;
    let companyInfo = {};
    let companyId = 0;
    let chats = [];
    let inboxes = {};
    
    return new Promise((resolve, reject) => {
        getCompanyById(req)
            .then(resCgiCompanyData => {
                companyInfo = resCgiCompanyData.data || {};  
                companyId = companyInfo.id;          
                return getChatsByParams({
                    userId: req.user.ID,
                    page,
                    size
                });
            })
            .then(response => {
                chats = response ? response.content : [];
                console.log('chats', JSON.stringify(chats));
                inboxes = {
                    TotalRecords: response.total,
                    PageNumber: response.pageNumber + 1,
                    PageSize: response.pageSize,
                    Records: []
                }; 
                let interlocutorIds = chats?.map(chat => {
                    if (chat.incomingCoId && chat.outgoingCoId) {
                        if (chat.incomingCoId === chat.outgoingCoId) {
                            chat.interlocutorCompanyId = chat.incomingCoId
                            return chat.incomingCoId;
                        }
        
                        return companyId === chat.incomingCoId ? chat.outgoingCoId : chat.incomingCoId;
                    }
                    return null;
                });
                console.log('interlocutorIds', interlocutorIds);
                interlocutorIds = interlocutorIds.reduce((acc, companyId) => {
                    if (acc && acc.find(cid => cid === companyId)) {
                        return acc;
                    }
                    acc.push(companyId);
                    return acc;
                }, []);
                return getCompaniesByIds(interlocutorIds, true);
            })
            .then(companies => {
                chats = chats.map(chat => toInboxEnquiryObj(chat, companyId, companies));
                return getChatMessages(chats);
            })
            .then(records => {
                inboxes.Records = records;
                resolve(inboxes);
            }); 
    })
}

chatRouter.get('/inbox/get-enquiries', authenticated, authorizedUser, function(req, res) {    
    GetEnquiries(req)
        .then(response => {
            res.send({ inboxes: response });
        });
});

chatRouter.get('/inbox/get-requests-quotes', authenticated, authorizedUser, function(req, res) {    
    const userInfo = req?.user?.userInfo;
    let companyInfo = {};
    getCompanyById(req)
        .then(resCgiCompanyData => {
            companyInfo = resCgiCompanyData.data || {};            
            let dealsCount;
            if (userInfo.role === userRoles.subMerchant) {
                getDealsByCompanyId(req?.user?.companyId)
                    .then(deals => {                        
                        dealsCount = deals?.total;      
                        renderInboxRequestsQoutes(req, res, userInfo, companyInfo, dealsCount, true);
                    });
            } else {
                getDealsCountByBuyer(req.user.ID)
                    .then(deals => {                        
                        dealsCount = deals?.rfq[0]?.count;
                        renderInboxRequestsQoutes(req, res, userInfo, companyInfo, dealsCount, true);
                    });
            }
        });
})

chatRouter.get('/inbox/search', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;
    const keyword = req.query['keyword'];
    const pageNumber = 1;

    getUserInboxes(user.ID, pageNumber, keyword, function (inboxes, inboxMessages) {
        res.send({
            messages: inboxes,
            inboxDatas: inboxMessages
        });
    });
});

chatRouter.get('/inbox/paging', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;
    const keyword = req.query['keyword'];
    const pageNumber = req.query['pageNumber'];

    getUserInboxes(user.ID, pageNumber, keyword, function (inboxes, inboxMessages) {
        res.send({
            messages: inboxes,
            inboxDatas: inboxMessages
        });
    });
});

chatRouter.get('/inbox/getUnreadCount', authenticated, function (req, res) {
    let user = req.user;
    if (!user) {
        //Guest no Inbox
        return res.send('0');
    }

    let promiseInbox = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            pageSize: 1000,
            pageNumber: 1,
            includes: 'User'
        }

        client.Inbox.getChannels(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseInbox]).then((responses) => {
        const inboxes = responses[0];

        if (inboxes.TotalRecords > 0) {
            let unreadCount = 0;
            let promiseMessages = [];

            inboxes.Records.forEach(function (inbox) {
                let options = {
                    userId: user.ID,
                    channelId: inbox.ChannelID,
                    limit: 1,
                    orderDirection: 'desc',
                    includes: null
                };

                let promise = new Promise((resolve, reject) => {
                    client.Inbox.getChannelMessages(options, function (err, result) {
                        resolve(result);
                    });
                });

                promiseMessages.push(promise);
            });

            Promise.all(promiseMessages).then((responses) => {
                responses.forEach(function (response) {
                    let channel = response.Channel;
                    let messages = response.Messages;
                    let member = channel.Members.find(m => m.User.ID == user.ID);

                    if (messages.TotalRecords > 0) {
                        messages.Records.forEach(function (message) {
                            if (message.SID != member.LastMessageSID) {
                                unreadCount += 1;
                            }
                        });
                    }
                });

                res.send(unreadCount.toString());
            });
        } else {
            res.send('0');
        }
    });
});

chatRouter.get('/generate-token', authenticated, function (req, res) {
    console.log('generate-token');
    if (redirectUnauthorizedUser(req, res)) return;

    var promiseToken = new Promise((resolve, reject) => {
        client.Chat.generateToken(req.user.ID, 'browser', function (err, token) {
            resolve(token);
        });
    });

    Promise.all([promiseToken]).then((responses) => {
        const token = responses[0];
        res.send(token);
    });
});



chatRouter.post('/send-offer', authenticated, authorizedMerchant, function (req, res) {
    const user = req.user;

    const offer = {
        ID: 0,
        FromUserID: user.ID,
        ToUserID: req.body['ToUserID'],
        CartItemID: req.body['CartItemID'],
        Total: req.body['Total'],
        CurrencyCode: req.body['CurrencyCode'],
        ChannelID: req.body['ChannelID'],
        MessageType: 'PRE-APPROVED',
        Message: null,
        Accepted: false,
        Declined: false,
        Quantity: req.body['Quantity'],
        PaymentTermID: req.body['PaymentTermID'],
        ValidStartDate: req.body['ValidStartDate'],
        ValidEndDate: req.body['ValidEndDate'],
        OfferDetails: JSON.parse(req.body['OfferDetails'])
    };

    var promiseCart = new Promise((resolve, reject) => {
        const options = {
            userID: offer.ToUserID,
            quantity: offer.Quantity,
            cartID: offer.CartItemID
        };
        client.Carts.editCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        offer.CartItemID = cart.ID;

        var promiseOffer = new Promise((resolve, reject) => {
            client.Chat.sendOffer(user.ID, offer, function (err, result) {
                resolve(result);
            });
        });

        const promiseAccountOwner = new Promise((resolve, reject) => {
            if (user.AccountOwnerID) {
                const options = {
                    userId: user.AccountOwnerID
                };

                client.Users.getUserDetails(options, (err, result) => {
                    resolve(result);
                });
            } else {
                resolve(user);
            }
        });

        Promise.all([promiseOffer, promiseAccountOwner]).then((responses) => {
            const offer = responses[0];
            const accountOwner = responses[1];

            const chatMessage = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
                                `<p class=\"chat-system-generated-msg\" data-msg-type=\"sent-quotation\">${accountOwner.DisplayName} sent a quotation.</p>` +
	                            `<button class=\"btn\" id=\"quotation-button\" onclick="window.location = '${'/quotation/detail?id=' + offer.ID}';">Check Quotation</button>`;

            const promiseUpdateQuotation = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    quotationId: offer.ID,
                    message: chatMessage
                };

                client.Quotations.updateQuotation(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promiseUpdateQuotation]).then((responses) => {
                res.send(responses[0]);
            });
        });
    });
});

chatRouter.put('/decline-offer', authenticated, function (req, res) {
    var promiseOffer = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const offer = {
            ID: req.body['ID'],
            Accepted: req.body['Accepted'],
            Declined: req.body['Declined'],
            Message: '<p><span class=\"offer-declined\">Offer has been declined!</span></p>'
        };
        client.Chat.declineOffer(userId, offer, function (err, token) {
            resolve(token);
        });
    });

    Promise.all([promiseOffer]).then((responses) => {
        const token = responses[0];

        const promiseUserComparisons = new Promise((resolve, reject) => {
            const options = {
                userId: req.user.ID,
                namesOnly: false,
                pageSize: 1000,
                pageNumber: 1,
                includes: 'CartItem'
            };
            client.Comparisons.getUserComparisons(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseUserComparisons]).then((responses) => {
            const userComparisons = responses[0];
            let toDeleteComparisonDetailIds = [];

            if (userComparisons.TotalRecords > 0) {
                const comparisons = userComparisons.Records.filter(c => c.ReadOnly == false && c.Active == true);
                if (comparisons.length > 0) {
                    comparisons.forEach(function (comparison) {
                        comparison.ComparisonDetails.forEach(function (detail) {
                            if (detail.Active == true && detail.CartItemID == token.CartItemID) {
                                toDeleteComparisonDetailIds.push(detail.ID);
                            }
                        });
                    });
                }
            }

            const promiseDeleteComparisonDetails = new Promise((resolve, reject) => {
                if (toDeleteComparisonDetailIds.length > 0) {
                    const options = {
                        userId: req.user.ID,
                        comparisonDetailIds: toDeleteComparisonDetailIds
                    };

                    client.Comparisons.deleteComparisonDetailsByIds(options, function (err, result) {
                        resolve(result);
                    });
                } else {
                    resolve(null);
                }
            });

            Promise.all([promiseDeleteComparisonDetails]).then((responses) => {
                res.send(token);
            })
        });
    });
});

chatRouter.get('/get-channels', authenticated, function (req, res) {

    if (redirectUnauthorizedUser(req, res)) return;

    const options = {
        pageSize: req.query['pageSize'],
        pageNumber: req.query['pageNumber'],
        includes: req.query['includes']
    };

    var promiseChannels = new Promise((resolve, reject) => {
        client.Chat.getUserChannels(req.user.ID, options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChannels]).then((responses) => {
        res.send(responses[0]);
    });
});

chatRouter.post('/create-channel', authenticated, function (req, res) {
    const userId = req.user.ID;
    var promiseCart = new Promise((resolve, reject) => {
        if (req.body['createCartItem']) {
            const cartOptions = {
                userId: userId,
                quantity: req.body['quantity'],
                itemId: req.body['itemId'],
                force: true
            };
            client.Carts.addCart(cartOptions, function (err, result) {
                resolve(result);
            });
        }
        else {
            resolve(null);
        }
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        const channelOptions = {
            recipientId: req.body['recipientId'],
            itemId: !cart ? req.body['itemId'] : cart.ItemDetail.ID,
            cartItemId: cart ? cart.ID : null
        };

        var promiseChannel = new Promise((resolve, reject) => {
            client.Chat.createChannel(userId, channelOptions, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseChannel]).then((responses) => {
            const channel = responses[0];
            res.send(channel);
        });
    });
});

chatRouter.get('/get-recipient-addresses', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const recipientId = req.query['recipientId'];

    var promiseAddresses= new Promise((resolve, reject) => {
        client.Addresses.getUserAddresses(recipientId, function (err, addresses) {
            resolve(addresses);
        });
    });

    let promiseMerchantDetail = new Promise((resolve, reject) => {
        const options = {
            token: null,
            userId: recipientId,
            includes: ''
        };

        client.Users.getUserDetails(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseAddresses, promiseMerchantDetail]).then((response) => {
        res.send(response);
    });
});

chatRouter.get('/enquiry', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const channelId = req.query["channelId"];

    const promiseChatDetail = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, function (err, chatDetail) {
            resolve(chatDetail);
        });
    });
    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'BusinessProfile'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChatDetail, promiseMarketplace]).then((responses) => {
        const chatDetail = responses[0];
        const marketplace = responses[1];
        let sellerName = '';
        let sellerEmail = '';

        if (chatDetail.Channel.ItemDetail) {
            if (chatDetail.Channel.ItemDetail.MerchantDetail) {
                sellerName = chatDetail.Channel.ItemDetail.MerchantDetail.FirstName + ' ' + chatDetail.Channel.ItemDetail.MerchantDetail.LastName;
                sellerEmail = chatDetail.Channel.ItemDetail.MerchantDetail.Email;
            }
        }
        else if (chatDetail.Channel.CartItemDetail.ItemDetail) {
            if (chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail) {
                sellerName = chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail.FirstName + ' ' + chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail.LastName;
                sellerEmail = chatDetail.Channel.CartItemDetail.ItemDetail.MerchantDetail.Email;
            }
        }

        const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
        const chatParams = EnumCoreModule.MapChatToEdmParameters({
            ChannelId: channelId,
            SellerName: sellerName,
            SellerDisplayName: '',
            ConsumerFirstName: user.FirstName + ' ' + user.LastName,
            ConsumerEmail: user.Email,
            SellerEmail: sellerEmail
        }, req.protocol, req.get('host'));

        const params = marketplaceParams.concat(chatParams);
        const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, EnumCoreModule.GetEdmTemplates().ChatEnquiry), params);

        const options = {
            from: edm.From,
            to: edm.To,
            subject: edm.Subject,
            body: edm.Body
        };

        client.Emails.sendEdm(options, function (err, result) {
            res.redirect('/chat?channelId=' + channelId);
        });
    });
});

chatRouter.put('/accept-offer', authenticated, function (req, res) {
    var promiseOffer = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const offer = {
            ID: req.body['ID'],
            Accepted: req.body['Accepted'],
            Declined: req.body['Declined'],
            MessageType: req.body['MessageType'],
            Message: req.body['Message']
        };
        client.Chat.acceptOffer(userId, offer, function (err, token) {
            resolve(token);
        });
    });

    Promise.all([promiseOffer]).then((responses) => {
        const offer = responses[0];
        res.send(offer);
    });
});

chatRouter.get('/get-offer', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    var promiseOffer = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            cartItemId: req.query['cartItemId'],
        };
        client.Chat.getOfferByCartItemId(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseOffer]).then((responses) => {
        res.send(responses[0]);
    });
});

chatRouter.put('/update-member-last-seen-message', authenticated, function (req, res) {
    var promiseMember = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const data = {
            memberId: req.body['memberId'],
            messageId: req.body['messageId']
        };
        client.Chat.updateMemberLastSeenMessage(userId, data, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMember]).then((responses) => {
        const member = responses[0];
        res.send(member);
    });
});

chatRouter.get('/get-chat-details', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const channelId = req.query["channelId"];

    const promiseChatDetails = new Promise((resolve, reject) => {
        client.Chat.getMessages(req.user.ID, channelId, function (err, chatDetails) {
            resolve(chatDetails);
        });
    });

    Promise.all([promiseChatDetails]).then((responses) => {
        res.send(responses[0]);
    });
});

chatRouter.post('/add-channel-member', authenticated, function (req, res) {
    var promiseMember = new Promise((resolve, reject) => {
        const userId = req.user.ID;
        const data = {
            channelId: req.body['channelId']
        };
        client.Chat.addChannelMember(userId, data, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMember]).then((responses) => {
        const member = responses[0];
        res.send(member);
    });
});

chatRouter.get('/quotation', authenticated, authorizedMerchant, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const channelId = req.query['channelId'];

    if (!channelId)
        return res.redirect('/chat/inbox');

    const promiseChatDetail = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, function (err, result) {
            resolve(result);
        });
    });

    const promisePaymentTerms = new Promise((resolve, reject) => {
        client.Payments.getPaymentTerms({ merchantId: user.ID }, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChatDetail, promisePaymentTerms]).then((responses) => {
        const chatDetail = responses[0];
        const paymentTerms = responses[1];

        if (!chatDetail.Channel || !chatDetail.Channel.CartItemDetail) {
            return res.redirect(`/chat?channelId=${channelId}&error=invalid-cart-item`);
        }

        const offer = chatDetail.Channel.Offer;
        if (offer) {
            if (offer.Accepted || (!offer.Accepted && !offer.Declined && offer.MessageType != 'CANCELLED')) {
                return res.redirect(`/chat?channelId=${channelId}&error=quotation-already-exists`);
            }
        }

        const chatItemDetail = chatDetail.Channel.CartItemDetail.ItemDetail;

        const promiseItemDetail = new Promise((resolve, reject) => {
            if (process.env.PRICING_TYPE == 'country_level') {
                const options = {
                    itemId: chatItemDetail.ParentID || chatItemDetail.ID,
                    activeOnly: true
                };

                client.Items.getItemDetails(options, function (err, result) {
                    resolve(result);
                });
            } else {
                resolve(null);
            }
        });

        Promise.all([promiseItemDetail]).then((responses) => {
            const itemDetail = responses[0];
            let availability = null;

            if (itemDetail) {
                //blocker cant access chatdetails
                let customFields = itemDetail.CustomFields;
                if (itemDetail.ChildItems) {
                    itemDetail.ChildItems.forEach(function (ci) {
                        if (ci.Tags && chatItemDetail.Tags && ci.Tags[0] == chatItemDetail.Tags[0]) {
                            customFields = ci.CustomFields;
                        }
                    });
                }
                console.log("teee", customFields);
                if (customFields) {
                    availability = {};

                    const moqCustomField = customFields.find(c => c.Name == CustomFieldStaticModule.GetAvailabilityProperties().MOQ);

                    if (moqCustomField) {
                        availability['moq'] = moqCustomField.Values ? JSON.parse(moqCustomField.Values[0]) : null;
                    }
                }
            }

            const reduxState = Store.createChatStore({
                userReducer: { user: user },
                chatReducer: {
                    chatDetail: chatDetail,
                    paymentTerms: paymentTerms,
                    availability: availability
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<ChatQuotationComponent user={user}
                channelId={channelId}
                chatDetail={chatDetail}
                paymentTerms={paymentTerms} />);

            res.send(template('page-seller quotation-detail', seoTitle, app, 'chat-quotation', reduxState));
        });
    });
});

chatRouter.post('/send-message', authenticated, function (req, res) {
    const { user } = req;

    const promiseMessage = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            ...req.body
        };

        client.Chat.createChannelMessage(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseMessage]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = chatRouter;
