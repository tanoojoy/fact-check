'use strict';
// import { QuotationDetails } from '../views/layouts/horizon-pages/quotation/quotation-template';

var express = require('express');
var quotationRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var QuotationListComponent = require('../views/quotation/quotation-list/index').QuotationListComponent;
var QuotationDetailComponent = require('../views/quotation/quotation-detail/index').QuotationDetailComponent;
var QuotationDetailViewIndexComponent = require('../views/quotation/quotation-detail-view/index').QuotationDetailViewIndexComponent;
var client = require('../../sdk/client');
var authenticated = require('../scripts/shared/authenticated');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var authorizedUser = require('../scripts/shared/authorized-user');
var Store = require('../redux/store');
var EnumCoreModule = require('../public/js/enum-core');
var TwilioChat = require('twilio-chat');
const CommonModule = require('../public/js/common');



import { getCgiProductData, getManufacturerProductById, getMarketerProductById } from './horizon-api/entity-service/product-controller';
import { productCompanyTypes } from '../consts/company-products';
import { productTabs } from '../consts/product-tabs';
import { redirectUnauthorizedUser, getMonths, toQuoteDetailObj, getNormalizedProductAttributes, toCompanyProductItemDetailsInfoObj, toExternalQuoteDetailObj } from '../utils';
import { getConnectionsDetailsByCompanyProduct, updateProduct, getCompanySources } from './horizon-api/entity-service/connections-controller';
import {
    getCurrenciesInfo,
    getRequiredDocs,
    getIncoterms,
    getGmpStatuses,
    getRegFilings,
    getRegFilingsStatuses, getGmpCertificates,
    getManufacturingStatus
} from './horizon-api/entity-service/drop-down-controller';

import { getCompanyById } from './horizon-api/entity-service/company-controller';
import { updateRfq, createRfq, getRfqById } from './horizon-api/entity-service/rfq-controller';
import { createQuote, getQuoteDetails, updateQuote } from './horizon-api/entity-service/quote-controller';

import { userRoles } from '../consts/horizon-user-roles';
import { rfqStatuses } from '../consts/rfq-quote-statuses';
import { getAppPrefix } from '../public/js/common';

import {
    viewRfq as viewRfqPPs,
    quotationTemplate as quotationTemplatePPs,
    quotationView as quotationViewPPS
} from '../consts/page-params';

import { getSubsAccounts, getAnotherUserInfo } from './horizon-api/auth-service/auth-controller';
import { constructAndSendEmail } from './users';
import rfqQuoteEmail from '../consts/rfq-quote-email';
import {
    GetHorizonEdmTemplateTypes
} from '../public/js/enum-core';

const { API, DOSE_FORM } = productTabs;

function getQuotations(userID, pageNumber, filters, callback) {
    const options = {
        userID: userID,
        pageNumber: pageNumber,
        filters: filters
    }
    const promiseQuotations = new Promise((resolve, reject) => {
        client.Quotations.getUserQuotations(options, function (err, quotations) {
            resolve(quotations);
        });
    });

    Promise.all([promiseQuotations]).then((responses) => {
        const quotationList = responses[0];
        callback(quotationList);
    });
}

quotationRouter.get('/create-template/:rfqId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    // if (!isCompleteOnBoarding(req?.user)) {
    //     res.redirect(getAppPrefix() + '/');
    //     return;
    // }

    const userInfo = req?.user?.userInfo;

    const isSubmerchant = req.user.role === userRoles.subMerchant;

    try {
        const { rfqId } = req.params;

        const rfqData = await getRfqById(rfqId);
        const chatId = rfqData.data.chatId;
        const rfqStatus = rfqData.data.status;

        const sellerCompanyData = await getCompanyById(req, rfqData.data.cgiCompanyId);
        rfqData.data.sellerCompanyName = sellerCompanyData.data.name;

        const s = Store.createQuotationPageStore({
            userReducer: { user: req.user, userInfo },
            quotationReducer: {
                quotationDetail: null,
                rfqDetails: { ...rfqData.data },
                onlyView: !isSubmerchant || rfqStatus === rfqStatuses.declined
            },
            productReducer: {
                rfqFormDropdowns: null,
                productDetails: null
            }
        });
        const reduxState = s.getState();
        let appString;
        let QuotationApp;

        const prevPageUrl = `${getAppPrefix()}/chat/chatRFQ/${rfqId}/${chatId}`;
        console.log('isSubmerchant', isSubmerchant);
        appString = quotationTemplatePPs.appString;
        console.log('appString', appString);
        QuotationApp = reactDom.renderToString(<QuotationDetailComponent user={req.user} rfqDetails={rfqData.data} prevPageUrl={prevPageUrl} />);
        //if (isSubmerchant) {
        //    if (rfqStatus === rfqStatuses.declined) {
        //        appString = viewRfqPPs.appString;
        //        QuotationApp = reactDom.renderToString(
        //            <CreateRFQ
        //                user={req.user}
        //                prevPageUrl={prevPageUrl}
        //                onlyView
        //                rfqDetails={rfqData.data}
        //            />
        //        );
        //    } else {                
        //        appString = quotationTemplatePPs.appString;
        //        console.log('appString', appString);
        //        QuotationApp = reactDom.renderToString(<QuotationDetailComponent user={req.user} rfqDetails={rfqData.data} prevPageUrl={prevPageUrl} />);
        //    }
        //} 

        res.send(template(viewRfqPPs.bodyClass, viewRfqPPs.title, QuotationApp, appString, reduxState));
    } catch (e) {
        console.log('quotation Error', e);
    }
});

quotationRouter.post('/create', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;

    const getAnotherUserDetails = (clarivateUserId, email) => {
        return new Promise((resolve, reject) => {
            getAnotherUserInfo(clarivateUserId)
                .then(resp => {
                    resolve({
                        ...resp.data,
                        clarivateUserId,
                        email
                    });
                });
        });
    };

    try {
        const { quote, chatId, buyerId } = req.body;
        let result = false;
        const quoteObj = JSON.parse(quote);
        await createQuote(quoteObj);
        if (quoteObj) {
            result = true;
            let buyerEmail = '';
            const buyer = await getAnotherUserDetails(buyerId);
            const buyerSubAccounts = await getSubsAccounts(buyer.clarivate_company_id);
            const buyerInfo = buyerSubAccounts.find(acct => acct.clarivateUserId === buyerId)
            if (buyerInfo) {
                buyerEmail = buyerInfo.email;
                if (buyerEmail) {
                    const edmData = {
                        emails: [buyerEmail],
                        notificationTitle: rfqQuoteEmail.quoteCreated.notificationTitle,
                        notificationMessage: rfqQuoteEmail.quoteCreated.notificationMessage,
                        inboxLink: '/chat/inbox/requests-quotes',
                        settingsLink: '/users/settings?activeTab=Notifications'
                    }
                    constructAndSendEmail(GetHorizonEdmTemplateTypes().Create_RFQ_QUOTE_EDM, edmData, (success) => {
                        console.log('success', success);
                        res.send(result);
                    });
                }
                else res.send(result);
            }
            else res.send(result);
        }
        res.send(result);
    } catch (e) {
        console.log('/create Error', e);
    }
});

quotationRouter.get('/quote/:quoteId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    //if (!isCompleteOnBoarding(req?.user)) {
    //    res.redirect(getAppPrefix() + '/');
    //    return;
    //}

    const isSubmerchant = req.user.role === userRoles.subMerchant;
    console.log('isSubmerchant', isSubmerchant);

    try {
        const quoteId = req.params.quoteId;
        const userInfo = req?.user?.userInfo;

        const quoteData = await getQuoteDetails(userInfo.userid, quoteId);
        console.log('quoteData.data', quoteData.data);
        const quoteDto = toQuoteDetailObj(quoteData.data);
        
        const rfqId = req.query.rfqId;
        const rfqData = await getRfqById(rfqId);
        const chatId = rfqData.data.chatId;

        const sellerCompanyData = await getCompanyById(req, rfqData.data.cgiCompanyId);
        console.log('sellerCompanyData', sellerCompanyData.data);
        rfqData.data.sellerCompanyName = sellerCompanyData.data.name;
        const prevPageUrl = `${getAppPrefix()}/chat/chatRFQ/${rfqId}/${chatId}`;

        const s = Store.createQuotationPageStore({
            userReducer: { user: req.user, userInfo },
            quotationReducer: {
                quotationDetail: { ...quoteDto },
                rfqDetails: { ...rfqData.data },
                customFields: [
                    {
                        isSubmerchant: isSubmerchant
                    }
                ],
                prevPageUrl: prevPageUrl
            }
        });

        const reduxState = s.getState();
        
        let appString = quotationViewPPS.appString;
        const QuotationApp = reactDom.renderToString(
            <QuotationDetailViewIndexComponent user={req.user} rfqDetails={rfqData.data} quotationDetail={quoteDto} prevPageUrl={prevPageUrl} isSubmerchant={isSubmerchant} />
        );

        

        res.send(template(quotationTemplatePPs.bodyClass, quotationTemplatePPs.title, QuotationApp, appString, reduxState));
    } catch (e) {
        console.log('/quote; error', e);
    }
});

const prepareQuoteForUpdate = (quote) => {
    let preparedQuote = { ...quote };
    preparedQuote.quoteId = quote.id;
    delete preparedQuote.rfqId;
    delete preparedQuote.createdAt;
    delete preparedQuote.updatedAt;
    delete preparedQuote.id;

    return preparedQuote;
};

quotationRouter.post('/update', authenticated, async (req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    let result = false;
    try {
        const { quote, chatId, cgiCompanyId } = req.body;
        
        let extQuote = toExternalQuoteDetailObj(JSON.parse(quote));

        const userInfo = req?.user?.userInfo;
        const preparedQuote = prepareQuoteForUpdate(extQuote);
        
        await updateQuote(userInfo.userid, preparedQuote.quoteId, preparedQuote);
        result = true;
        //let notificationTitle = '';
        //let notificationMessage = ''
        //if (extQuote.status === 'accepted') {
        //    notificationTitle = rfqQuoteEmail.quoteAccepted.notificationTitle;
        //    notificationMessage = rfqQuoteEmail.quoteAccepted.notificationMessage;
        //}
        //else if (extQuote.status === 'declined') {
        //    notificationTitle = rfqQuoteEmail.quoteDeclined.notificationTitle;
        //    notificationMessage = rfqQuoteEmail.quoteDeclined.notificationMessage;
        //}
        //const subsAccounts = await getSubsAccounts(cgiCompanyId);
        //console.log('subsAccounts', subsAccounts);
        //if (subsAccounts) {
        //    const recipientEmails = subsAccounts.filter(acct => acct.role === 'MerchantSubAccount').map(item => item.email);
        //    console.log('recipientEmails', recipientEmails);
        //    if (recipientEmails) {
        //        const edmData = {
        //            emails: recipientEmails,
        //            notificationTitle: notificationTitle,
        //            notificationMessage: notificationMessage,
        //            inboxLink: '/chat/inbox/requests-quotes',
        //            settingsLink: '/users/settings?activeTab=Notifications'
        //        }
        //        constructAndSendEmail(GetHorizonEdmTypes().Create_RFQ_EDM, edmData, (success) => {
        //            console.log('success', success);
        //            res.send({ rfq: createdRfq });
        //        });
        //    }
        //    else {
        //        res.send({ rfq: createdRfq });
        //    }
        //}
        //else {
        //    res.send({ rfq: createdRfq });
        //}
        res.send(result);
    } catch (e) {
        console.log('/update; error', e);
    }
});

quotationRouter.get('/', authenticated, (req, res) => {
    // if (redirectUnauthorizedUser(req, res)) return;
    // const s = Store.createQuotationPageStore({
    //     userReducer: { user: req.user }
    // });
    // const reduxState = s.getState();
    // const appString = 'quotation';
    // const QuotationApp = reactDom.renderToString(<QuotationDetails user={req.user} />);
    // res.send(template('page-home', 'quotation', QuotationApp, appString, reduxState));
});

quotationRouter.get('/list', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const buyer = req.query['buyer'];

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, categories) {
            resolve(categories);
        });
    });
    const pageNumber = 1;
    const filters = {
        keywords: null,
        isAccepted: null,
        isPending: null,
        isCancelled: null,
        isDeclined: null,
        itemsPerPage: 20,
        isBuyerSideBar: req.query.buyer == "true" ? true : false
    };

    getQuotations(user.ID, pageNumber, filters, function (quotationList) {
        Promise.all([promiseCategories]).then((responses) => {
            const appString = 'quotation-list';
            const categories = responses[0];
            user.isBuyerSideBar = filters.isBuyerSideBar;
            const s = Store.createQuotationStore({
                userReducer: {
                    user: user
                },
                quotationReducer: {
                    quotationList: quotationList,
                    buyerdocs: buyer
                }
            });
            const reduxState = s.getState();
            const quotationListApp = reactDom.renderToString(
                <QuotationListComponent quotationList={quotationList}
                    categories={categories}
                    user={user}
                    buyerdocs={buyer}
                />
            );

            let seoTitle = 'Quotation List';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-seller quotation-list page-sidebar', seoTitle, quotationListApp, appString, reduxState));
        });
    });
});

quotationRouter.get('/filter', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;
    const { keywords, isAccepted, isPending, isCancelled, isDeclined, itemsPerPage } = req.query;
    const pageNumber = 1;
    const filters = {
        keywords: keywords,
        isAccepted: isAccepted,
        isPending: isPending,
        isCancelled: isCancelled,
        isDeclined: isDeclined,
        itemsPerPage: itemsPerPage,
        isBuyerSideBar: user.isBuyerSideBar
    };

    getQuotations(user.ID, pageNumber, filters, function (quotationList) {
        res.send(quotationList);
    });
});

quotationRouter.get('/paging', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;
    const { keywords = null, isAccepted = null, isPending = null, isCancelled = null, isDeclined = null,
        itemsPerPage = 1, pageNumber = 1 } = req.query;

    const filters = {
        keywords: keywords,
        isAccepted: isAccepted,
        isPending: isPending,
        isCancelled: isCancelled,
        isDeclined: isDeclined,
        itemsPerPage: itemsPerPage,
        isBuyerSideBar: user.isBuyerSideBar
    };

    getQuotations(user.ID, pageNumber, filters, function (quotationList) {
        res.send(quotationList);
    });
});

quotationRouter.get('/detail', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const quotationId = req.query['id'];
    let buyer = req.query['buyer'];

    if (!quotationId) {
        return res.redirect(`${CommonModule.getAppPrefix()}/quotation/list?error=quotation-id-not-found`);
    }

    let promiseQuotation = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            quotationId: quotationId,
            includes: ['CartItemDetail', 'ItemDetail' , 'PaymentTerm']
        };

        client.Quotations.getQuotationById(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseQuotation]).then((responses) => {
        let quotationDetail = responses[0];
        if (buyer === undefined) {
            if (user && user.Roles) {
                if (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant')) {
                    if (user.ID !== quotationDetail.FromUserID) {
                        buyer = "true";
                    }
                }
            }
        }

        if (!quotationDetail) {
            return res.redirect(`${CommonModule.getAppPrefix()}/quotation/list?error=quotation-not-found`);
        }

        if (!quotationDetail.Accepted && !quotationDetail.Declined && quotationDetail.MessageType !== 'CANCELLED') {
            const Moment = require('moment');
            let validEndDate = typeof quotationDetail.ValidEndDate === 'number'
                ? Moment.unix(quotationDetail.ValidEndDate).utc().local()
                : Moment.utc(quotationDetail.ValidEndDate).local();

            const currentDate = Moment().utc().local();
            const isValidQuotation = validEndDate > currentDate;

            if (isValidQuotation) {
                const reduxState = Store.createQuotationStore({
                    userReducer: {
                        user: user
                    },
                    quotationReducer: {
                        quotationDetail: quotationDetail,
                        buyerdocs: buyer
                    }
                }).getState();

                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                const app = reactDom.renderToString(<QuotationDetailComponent user={user} quotation={quotationDetail} buyerdocs={buyer} />);

                res.send(template('page-seller page-buyer-quotation-detail requisition-list page-sidebar', seoTitle, app, 'quotation-detail', reduxState));
            } else {
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

                Promise.all([promiseAccountOwner]).then((responses) => {
                    const accountOwner = responses[0];
                    const cancelMessage = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
                        `<p class=\"chat-system-generated-msg\" data-msg-type=\"cancelled-quotation\">${accountOwner.DisplayName} has cancelled the quotation.</p>`;

                    const promiseCancelQuotation = new Promise((resolve, reject) => {
                        const options = {
                            userId: user.ID,
                            quotationId: quotationDetail.ID,
                            accepted: false,
                            declined: false,
                            messageType: 'CANCELLED',
                            message: cancelMessage
                        };

                        client.Quotations.updateQuotation(options, (err, result) => {
                            resolve(result);
                        });
                    });

                    const promiseChat = new Promise((resolve, reject) => {
                        client.Chat.getMessages(user.ID, quotationDetail.ChannelID, (err, result) => {
                            resolve(result);
                        });
                    });

                    Promise.all([promiseCancelQuotation, promiseChat]).then((responses) => {
                        const chat = responses[1];
                        const promiseUpdatedQuotation = new Promise((resolve, reject) => {
                            const options = {
                                userId: user.ID,
                                quotationId: responses[0].ID,
                                includes: ['CartItemDetail', 'ItemDetail', 'PaymentTerm']
                            };

                            client.Quotations.getQuotationById(options, (err, result) => {
                                resolve(result);
                            });
                        });

                        Promise.all([promiseUpdatedQuotation]).then((responses) => {
                            quotationDetail = responses[0];
                            if (!chat || !chat.Channel || !chat.Channel.Members) {
                                return res.send('Chat channel is invalid');
                            }

                            let cancelQuotationMessage = null;
                            let chatMessageToUpdate = null;

                            if (quotationDetail.Message && quotationDetail.Message.indexOf('data-msg-type=\"sent-quotation\"') >= 0) {
                                chatMessageToUpdate = chat.Messages.Records.find(m => m.Message == quotationDetail.Message && m.Sender == accountOwner.Email);

                                if (chatMessageToUpdate) {
                                    cancelQuotationMessage = quotationMessage.substring(0, quotationMessage.indexOf('<button')) +
                                        '<button class=\"btn\" id=\"cancelled-quotation-button\">Quotation Cancelled</button>';
                                }
                            }

                            const promiseNewMessage = new Promise((resolve, reject) => {
                                const options = {
                                    userId: user.ID,
                                    channelId: quotationDetail.ChannelID,
                                    message: cancelMessage
                                };

                                client.Chat.createChannelMessage(options, (err, result) => {
                                    resolve(result);
                                });
                            });

                            const promiseUpdateMessage = new Promise((resolve, reject) => {
                                if (chatMessageToUpdate) {
                                    const options = {
                                        userId: user.ID,
                                        channelId: quotationDetail.ChannelID,
                                        messageId: chatMessageToUpdate.SID,
                                        message: cancelQuotationMessage
                                    };

                                    client.Chat.updateChannelMessage(options, (err, result) => {
                                        resolve(result);
                                    });
                                } else {
                                    resolve(null);
                                }
                            });

                            Promise.all([promiseNewMessage, promiseUpdateMessage]).then((responses) => {
                                const reduxState = Store.createQuotationStore({
                                    userReducer: {
                                        user: user
                                    },
                                    quotationReducer: {
                                        quotationDetail: quotationDetail,
                                        buyerdocs: buyer
                                    }
                                }).getState();

                                const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                                const app = reactDom.renderToString(<QuotationDetailComponent user={user} quotation={quotationDetail} buyerdocs={buyer} />);

                                res.send(template('page-seller page-buyer-quotation-detail requisition-list page-sidebar', seoTitle, app, 'quotation-detail', reduxState));
                            });
                        });
                    });
                });
            }
        } else {
            const reduxState = Store.createQuotationStore({
                userReducer: {
                    user: user
                },
                quotationReducer: {
                    quotationDetail: quotationDetail,
                    buyerdocs: buyer
                }
            }).getState();

            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<QuotationDetailComponent user={user} quotation={quotationDetail} buyerdocs={buyer} />);

            res.send(template('page-seller page-buyer-quotation-detail requisition-list page-sidebar', seoTitle, app, 'quotation-detail', reduxState));
        }
    });
});

quotationRouter.post('/cancel-quotation', authenticated, authorizedMerchant, function (req, res) {
    const user = req.user;
    const quotationId = req.body['quotationId'];
    const channelId = req.body['channelId'];
    const quotationMessage = req.body['quotationMessage'];

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

    Promise.all([promiseAccountOwner]).then((responses) => {
        const accountOwner = responses[0];
        const cancelMessage = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
	                          `<p class=\"chat-system-generated-msg\" data-msg-type=\"cancelled-quotation\">${accountOwner.DisplayName} has cancelled the quotation.</p>`;

        const promiseCancelQuotation = new Promise((resolve, reject) => {
            const options = {
                userId: user.ID,
                quotationId: quotationId,
                accepted: false,
                declined: false,
                messageType: 'CANCELLED',
                message: cancelMessage
            };

            client.Quotations.updateQuotation(options, (err, result) => {
                resolve(result);
            });
        });

        const promiseChat = new Promise((resolve, reject) => {
            client.Chat.getMessages(user.ID, channelId, (err, result) => {
                resolve(result);
            });
        });

        Promise.all([promiseCancelQuotation, promiseChat]).then((responses) => {
            const chat = responses[1];

            if (!chat || !chat.Channel || !chat.Channel.Members) {
                return res.send('Chat channel is invalid');
            }

            let cancelQuotationMessage = null;
            let chatMessageToUpdate = null;

            if (quotationMessage && quotationMessage.indexOf('data-msg-type=\"sent-quotation\"') >= 0) {
                chatMessageToUpdate = chat.Messages.Records.find(m => m.Message == quotationMessage && m.Sender == accountOwner.Email);

                if (chatMessageToUpdate) {
                    cancelQuotationMessage = quotationMessage.substring(0, quotationMessage.indexOf('<button')) +
                        '<button class=\"btn\" id=\"cancelled-quotation-button\">Quotation Cancelled</button>';
                }
            }

            const promiseNewMessage = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    channelId: channelId,
                    message: cancelMessage
                };

                client.Chat.createChannelMessage(options, (err, result) => {
                    resolve(result);
                });
            });

            const promiseUpdateMessage = new Promise((resolve, reject) => {
                if (chatMessageToUpdate) {
                    const options = {
                        userId: user.ID,
                        channelId: channelId,
                        messageId: chatMessageToUpdate.SID,
                        message: cancelQuotationMessage
                    };

                    client.Chat.updateChannelMessage(options, (err, result) => {
                        resolve(result);
                    });
                } else {
                    resolve(null);
                }
            });

            Promise.all([promiseNewMessage, promiseUpdateMessage]).then((responses) => {
                res.send();
            });
        });
    });
});

quotationRouter.post('/decline-accept-quotation', authenticated, function (req, res) {
    const user = req.user;
    const quotationId = req.body['quotationId'];
    const channelId = req.body['channelId'];
    const isAccepted = req.body['isAccepted'] == 'true';
    const isDeclined = req.body['isDeclined'] == 'true';
    const messageType = isAccepted ? "ACCEPTED" : "DECLINED";
    let message = '';
    if (isDeclined) {
        message = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
            `<p class=\"chat-system-generated-msg\" data-msg-type=\"declined-quotation\">Quotation has been declined!</p>`;
    }
    if (isAccepted) {
        message = `<span class=\"user-container\">${user.FirstName + ' ' + user.LastName}</span>` +
            `<p class=\"chat-system-generated-msg\" data-msg-type=\"accepted-quotation\">Quotation has been accepted!</p>`;
    }

    const promiseQuotation = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            quotationId: quotationId,
            accepted: isAccepted,
            declined: isDeclined,
            messageType:  messageType,
            message: message
        };

        client.Quotations.updateQuotation(options, (err, result) => {
            resolve(result);
        });
    });

    const promiseChat = new Promise((resolve, reject) => {
        client.Chat.getMessages(user.ID, channelId, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseQuotation, promiseChat]).then((responses) => {
        const chat = responses[1];

        if (!chat || !chat.Channel || !chat.Channel.Members) {
            return res.send('Chat channel is invalid');
        }

        if (message !== "") {
            const promiseNewMessage = new Promise((resolve, reject) => {
                const options = {
                    userId: user.ID,
                    channelId: channelId,
                    message: message
                };

                client.Chat.createChannelMessage(options, (err, result) => {
                    resolve(result);
                });
            });

            Promise.all([promiseNewMessage]).then((responses) => {
                res.send();
            });
        }

        res.send();
    });
});

module.exports = quotationRouter;
