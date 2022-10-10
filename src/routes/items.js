'use strict';
import express from 'express';
import React from 'react';
import Redux from 'redux';
import { get } from 'lodash';
import reactDom from 'react-dom/server';
import client from '../../sdk/client';
import authenticated from '../scripts/shared/authenticated';
import { 
    redirectUnauthorizedUser,
    getMonths,
    toItemDetailObj,
    toProductInfoObj,
    getNormalizedProductAttributes,
    toCompanyProductItemDetailsInfoObj,
    toUserCompanyInfoObj
} from '../utils';
import { updateUpstreamSupply } from './horizon-api/entity-service/upstream-controller';
import { getCgiProductData, getManufacturerProductById, getMarketerProductById } from './horizon-api/entity-service/product-controller';
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
import { updateRfq, createRfq, getRfqById } from './horizon-api/entity-service/rfq-controller';
import { getFilesList } from './horizon-api/document-sharing-service/document-sharing-controller';
import { getQuoteDetails } from './horizon-api/entity-service/quote-controller';
import { getCompanyById } from './horizon-api/entity-service/company-controller';
import { CreateRFQ } from '../views/layouts/horizon-pages/create-rfq/create-rfq';
import { ChatRFQComponent } from '../views/layouts/horizon-pages/rfq-chat';
import { userRoles } from '../consts/horizon-user-roles';
import { productTabs } from '../consts/product-tabs';
import { getAppPrefix } from '../public/js/common';
import tokenGenerator from './horizon-routers/token-generator';
import {
    createRfq as createRfqPPs,
    product as productPPs,
    rfqChat as rfqChatPPs,
    finishedDose as finishedDosePPs,
    createLicensingInquiry as createLicensingInquiryPPs,
} from '../consts/page-params';
import { productCompanyTypes } from '../consts/company-products';
import Store from '../redux/store';
import template from '../views/layouts/template';
import { ItemDetailComponent } from '../views/item/index';

import { CreateRfqComponent } from '../views/item/rfq/create-rfq';
import { CreateLicensingInquiry } from '../views/item/rfq/create-licensing-inquiry';
import { ViewRfqComponent } from '../views/item/rfq/view-rfq';

import { constructAndSendEmail } from './users';
import rfqQuoteEmail from '../consts/rfq-quote-email';

import {
    GetHorizonEdmTemplateTypes
} from '../public/js/enum-core';

import { getSubsAccounts, getAnotherUserInfo } from './horizon-api/auth-service/auth-controller';

const itemRouter = express.Router();

const { API, DOSE_FORM } = productTabs;

itemRouter.get('/manufacturer/:companyId/:productId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    try {
        const productManufacturerData = await getManufacturerProductById(req, req.params.companyId, req.params.productId);
        const productInfo = productManufacturerData.data;

        const itemViewType = productCompanyTypes.PRODUCT_COMPANY_MANUFACTURER;
        const itemCategory = DOSE_FORM.productType;
        const itemDetail = toItemDetailObj(productInfo, itemCategory, itemViewType);

        const s = Store.createItemDetailStore({
            userReducer: { user: req.user },
            itemsReducer: {
                itemDetail,
                itemViewType
            }
        });

        const reduxState = s.getState();

        const appString = productPPs.appString;
        const ProductApp = reactDom.renderToString(<ItemDetailComponent 
            itemDetail={itemDetail}
            user={req.user}
            itemViewType={itemViewType}
        />);

        res.send(template(productPPs.bodyClass, productPPs.title, ProductApp, appString, reduxState));
    } catch (e) {
        console.log('finished dose Error', e);
    }
});

itemRouter.get('/marketer/:companyId/:productId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    try {
        const productManufacturerData = await getMarketerProductById(req, req.params.companyId, req.params.productId);
        const productInfo = productManufacturerData.data;

        const itemViewType = productCompanyTypes.PRODUCT_COMPANY_MARKETER;
        const itemCategory = DOSE_FORM.productType;
        const itemDetail = toItemDetailObj(productInfo, itemCategory, itemViewType);

        const s = Store.createItemDetailStore({
            userReducer: { user: req.user },
            itemsReducer: {
                itemDetail,
                itemViewType
            }
        });

        const reduxState = s.getState();

        const appString = productPPs.appString;
        const ProductApp = reactDom.renderToString(<ItemDetailComponent 
            itemDetail={itemDetail}
            user={req.user}
            itemViewType={itemViewType}
        />);

        res.send(template(productPPs.bodyClass, productPPs.title, ProductApp, appString, reduxState));
    } catch (e) {
        console.log('finished dose Error', e);
    }
});

itemRouter.get('/profile/:companyId/:productId', authenticated, async(req, res) => {
    const { companyId, productId } = req.params;

    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    try {
        const [
            connectionsDetailsByCompanyProductRequest,
            resCgiProductData,
            gmpStatuses,
            gmpCertificates,
            regFilings,
            regFilingsStatuses,
            manufacturingStatuses,
            companyData,
            companySources,
        ] = await Promise.allSettled([
            getConnectionsDetailsByCompanyProduct(req, companyId, productId),
            getCgiProductData(req),
            getGmpStatuses(),
            getGmpCertificates(),
            getRegFilings(),
            getRegFilingsStatuses(),
            getManufacturingStatus(),
            getCompanyById(req, companyId),
            getCompanySources(companyId),
        ]);

        const productInfo = resCgiProductData?.value?.data || {};

        const specialOffers = ['yes', 'no', 'unconfirmed'];
        const subsNumber = companyData?.value?.data?.subsNumber || 0;
        const productDetails = connectionsDetailsByCompanyProductRequest?.value?.data[0];
        
        let productAttributes = getNormalizedProductAttributes(productDetails, companySources?.value);
        let product = { ...productDetails, ...productAttributes}

        const itemCategory = API.productType;
        const itemDetail = toItemDetailObj(product, itemCategory);

        const predefinedValues = {
            gmpCertificates: gmpCertificates?.value?.data,
            gmpStatuses: gmpStatuses?.value?.data,
            regFilings: regFilings?.value?.data,
            regFilingsStatuses: regFilingsStatuses?.value?.data,
            manufacturingStatuses: manufacturingStatuses?.value?.data,
            specialOffers
        }

        const s = Store.createItemDetailStore({
            userReducer: { user: req.user },
            itemsReducer: {
                itemDetail,
            }
        });
        const reduxState = s.getState();
        const appString = productPPs.appString;
        const ProductApp = reactDom.renderToString(<ItemDetailComponent 
            itemDetail={itemDetail}
            user={req.user}
        />);

        res.send(template(productPPs.bodyClass, productPPs.title, ProductApp, appString, reduxState));
    } catch (e) {
        console.log('productProfile Error', e);
        res.sendStatus(500);
    }
});

itemRouter.put('/update', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }
    const itemInfo = req.body;
    const productInfo = toProductInfoObj(itemInfo);

    try {
        const { userInfo } = req?.user || {};
        const { productId, manufacturerId } = await updateProduct(userInfo.userid, productInfo) || {};
        const updateUpstreamSupplyResponse = await updateUpstreamSupply(userInfo.userid, manufacturerId, productId, productInfo.upstreamSupply);

        const productDetailsResponse = await getConnectionsDetailsByCompanyProduct(req, manufacturerId, productId);
        const productDetails = productDetailsResponse.data[0];
        const companySources = await getCompanySources(req.user?.companyId) || [];

        let productAttributes = getNormalizedProductAttributes(productDetails, companySources)
        let product = { ...productDetails, ...productAttributes}

        const updatedItem = toItemDetailObj(product, API.productType);

        res.json({ updatedItem });

    } catch (e) {
        console.log('Error', e);
        res.sendStatus(500);
    }
});

itemRouter.get('/token/:id?', (req, res) => {
    const id = req.params.id;
    res.send(tokenGenerator(id));
});

itemRouter.post('/token', (req, res) => {
    const id = req.body.id;
    res.send(tokenGenerator(id));
});

itemRouter.get('/:companyId/:productId/createrfq', authenticated, async (req, res) => {

    if (redirectUnauthorizedUser(req, res)) return;

    const {
        companyId,
        productId
    } = req.params;
    //const prevPageUrl = `${getAppPrefix()}/product-profile/profile/${companyId}/${productId}`;
    const normalizeDropdownData = (data = []) =>
        (data.map((el) =>
            typeof el === 'string' ? { value: el, label: el } : { value: el.abbreviation, label: el.description }));

    try {
        const connectionsDetailsByCompanyProductRequest = await getConnectionsDetailsByCompanyProduct(req, companyId, productId);
        const currenciesInfoRequest = await getCurrenciesInfo();
        const requiredDocsRequest = await getRequiredDocs();
        const incotermsRequest = await getIncoterms();
        const rfqFormDropdowns = {
            currenciesInfo: normalizeDropdownData(currenciesInfoRequest.data),
            requiredDocs: normalizeDropdownData(requiredDocsRequest.data),
            incoterms: normalizeDropdownData(incotermsRequest.data),
            months: getMonths(),
            years: normalizeDropdownData([new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString()]),
            partOfMonth: normalizeDropdownData(['early', 'mid', 'late'])
        };

        const itemDetailExternal = connectionsDetailsByCompanyProductRequest.data[0];
        console.log('itemDetailExternal', itemDetailExternal);
        
        // const itemViewType = productCompanyTypes.PRODUCT_COMPANY_MANUFACTURER;
        // const itemCategory = DOSE_FORM.productType;
        const itemCategory = API.productType;
        const itemDetail = toCompanyProductItemDetailsInfoObj(itemDetailExternal, itemCategory);

        const reduxState = Store.createProductPageStore({
            userReducer: {
                user: req.user
            },
            // quotationReducer: {
            //     quotationDetail: quotationDetail,
            //     buyerdocs: buyer
            // },
            itemsReducer: {
                itemDetail, 
                rfqFormDropdowns
            }
        }).getState();

        const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        const app = reactDom.renderToString(<CreateRfqComponent user={req.user} itemDetail={itemDetail} rfqFormDropdowns={rfqFormDropdowns} />);

        res.send(template('page-seller page-settings new-search-settings', seoTitle, app, 'create-rfq', reduxState));
        
    } catch (e) {
        console.log('productProfile createRFQ page Error', e);
    }

    
});

itemRouter.get('/:companyId/:productId/createlicensinginquiry', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;

    const {
        companyId,
        productId
    } = req.params;
    const normalizeDropdownData = (data = []) =>
        (data.map((el) =>
            typeof el === 'string' ? { value: el, label: el } : { value: el.abbreviation, label: el.description }));

    try {
        const productManufacturerData = await getManufacturerProductById(req, companyId, productId);
        const companyManufacturerData = await getCompanyById(req, companyId);
        const companyDetail = companyManufacturerData.data;
        const productInfo = productManufacturerData.data;
        const requiredDocsRequest = await getRequiredDocs();
        const rfqFormDropdowns = {
            requiredDocs: normalizeDropdownData(requiredDocsRequest.data),
        };
        console.log(productInfo, 'AAAA')
        const itemViewType = productCompanyTypes.PRODUCT_COMPANY_MANUFACTURER;
        const itemCategory = DOSE_FORM.productType;
        const itemDetail = toItemDetailObj(productInfo, itemCategory, itemViewType);

        const companyInfo = toUserCompanyInfoObj(companyDetail, false);
        const s = Store.createProductPageStore({
              userReducer: {
                user: req.user
            },
            itemsReducer: {
                itemDetail, 
                rfqFormDropdowns
            },
            companyReducer: {
                companyInfo
            }
        });

        const reduxState = s.getState();
        const appString = createLicensingInquiryPPs.appString;
        const CreateRFQApp = reactDom.renderToString(
            <CreateLicensingInquiry
                user={req.user}
                itemDetail={itemDetail}
                companyInfo={companyInfo}
                rfqFormDropdowns={rfqFormDropdowns}
            />
        );

        res.send(template(createLicensingInquiryPPs.bodyClass, createLicensingInquiryPPs.title, CreateRFQApp, appString, reduxState));
    } catch (e) {
        console.log('productProfile create Licensing Inquiry page Error', e);
    }
});

itemRouter.post('/create-rfq', authenticated, async (req, res) => {
    console.log('req', req.body);    
    const { chatId, buyerId, sellerId, documentsRequired } = req.body;

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

    client.Chat.createConversationChannel({
        channelName: chatId,
        buyerId: buyerId,
        sellerCompanyId: sellerId
        //channelName: 'chatcommon10121636949441970',
        //buyerId: 'c57b30a0-d26b-11ea-a606-8dbbd477c73c',
        //sellerCompanyId: '10092'
    }, async (err, response) => {
        console.log('createChannelResult', response);
        if (response.Result) {
            req.body.chatId = `${chatId}|${response.Sid}`;
            try {
                // post (create) rfq
                let rfq = {
                    ...req.body
                };
                rfq.documentsRequired = req.body.documentsRequired? JSON.parse(req.body.documentsRequired) : null;
                console.log('rfq', rfq);

                const createRfqRequest = await createRfq(req, rfq);
                const createdRfq = createRfqRequest.data;
                
                if (createdRfq) {
                    console.log('createdRfq', createdRfq);
                    const cgiCompanyId = createdRfq.cgiCompanyId;
                    const subsAccounts = await getSubsAccounts(cgiCompanyId);
                    if (subsAccounts) {
                        const merchantUsers = subsAccounts.filter(acct => acct.role === 'MerchantSubAccount').map(item => {
                            return {
                                email: item.email, clarivateUserId: item.clarivateUserId
                            }
                        });
                        const getUsersDetails = merchantUsers.map(recipient => {
                            return getAnotherUserDetails(recipient.clarivateUserId, recipient.email);
                        });
                        Promise.all(getUsersDetails).then(responses => {
                            const subscribers = responses.filter(acct => {
                                let isSubscriber = false;
                                if (acct.flags.notification && acct.flags.notification.rfqCreated) {
                                    isSubscriber = true;
                                }
                                if (acct.sku === 'Freemium') {
                                    isSubscriber = acct.flags.rfq.current < acct.flags.rfq.limit;
                                }
                                return isSubscriber;
                            })
                            console.log('subscribers', subscribers);
                            if (subscribers) {
                                const recipientEmails = subscribers.map(item => item.email);
                                console.log('recipientEmails', recipientEmails);
                                if (recipientEmails) {
                                    const edmData = {
                                        emails: recipientEmails,
                                        notificationTitle: rfqQuoteEmail.rfqCreated.notificationTitle,
                                        notificationMessage: rfqQuoteEmail.rfqCreated.notificationMessage,
                                        inboxLink: '/chat/inbox/requests-quotes',
                                        settingsLink: '/users/settings?activeTab=Notifications'
                                    }
                                    constructAndSendEmail(GetHorizonEdmTemplateTypes().Create_RFQ_QUOTE_EDM, edmData, (success) => {
                                        console.log('success', success);
                                        res.send({ rfq: createdRfq });
                                    });
                                }
                                else {
                                    res.send({ rfq: createdRfq });
                                }
                            }
                            else {
                                res.send({ rfq: createdRfq });
                            }
                            return;
                        });
                    }
                }
                //const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
                //const dataParams = EnumCoreModule.MapInvoiceToEdmParameters(response.Records[0], req.protocol, req.get('host'));
                //const params = marketplaceParams.concat(dataParams);
                //const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, template), params);
                //promiseEmails.push(new Promise((resolve, reject) => {
                //    const options = {
                //        from: edm.From,
                //        to: edm.To,
                //        subject: edm.Subject,
                //        body: edm.Body
                //    };

                //    client.Emails.sendEdm(options, function (err, result) {
                //        resolve(result);
                //    });
                //}));

                //Promise.all(promiseEmails).then((responses) => {
                //    res.send(true);
                //})                
            } catch (e) {
                console.log('productProfile create RFQ Error e', e);
            }            
        }
    });    
});

itemRouter.put('/update-rfq/:id', authenticated, async (req, res) => {
    const { id } = req.params;
    
    try {        
        await updateRfq(req, req.body, id);
        res.send({
            result: true
        });
    } catch (e) {
        console.log('productProfile update RFQ Error e', e);
    }
});

itemRouter.get('/viewRFQ/:rfqId/:chatId', authenticated, async (req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;

    const { rfqId, chatId } = req.params;
    getRfqById(rfqId)
        .then(result => {
            const rfqData = result.data;
            const customFields = [
                { ...rfqData }, 
                { chatId: chatId }
            ];
            const reduxState = Store.createProductPageStore({
                userReducer: {
                    user: req.user
                },
                quotationReducer: {
                    customFields: customFields
                },                
            }).getState();
    
            const seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            const app = reactDom.renderToString(<ViewRfqComponent user={req.user} customFields={customFields} chatId={chatId} />);
    
            res.send(template('page-seller page-settings new-search-settings', seoTitle, app, 'view-rfq', reduxState));
        });
});

itemRouter.get('/chatRFQ/:rfqId/:chatId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    try {
        const getInterlocutorCompanyInfo = async(role, rfq) => {
            const isSubmerchant = role === userRoles.subMerchant;
            if (isSubmerchant) {
                const interlocutorId = get(rfq, 'data.buyerId');
                const interlocutorCompany = await getAnotherUserInfo(interlocutorId);
                const interlocutorCompanyId = get(interlocutorCompany, 'data.clarivate_company_id');
                return await getCompanyById(req, interlocutorCompanyId);
            } else {
                const interlocutorCompanyId = get(rfq, 'data.cgiCompanyId');
                return await getCompanyById(req, interlocutorCompanyId);
            }
        };

        const userInfo = req?.user?.userInfo;

        const resCgiCompanyData = await getCompanyById(req);
        const companyInfo = resCgiCompanyData.data || {};

        const rfq = await getRfqById(req.params.rfqId);

        const interlocutorCompanyInfo = await getInterlocutorCompanyInfo(userInfo.role, rfq);

        const quoteId = get(rfq, 'data.quoteId', null);
        const resCgiProductData = await getCgiProductData(req);
        const productInfo = resCgiProductData.data || {};

        let quote = {};
        if (quoteId) {
            quote = await getQuoteDetails(userInfo.userid, quoteId);
        }

        const s = Store.createProductPageStore({
            userReducer: {
                user: req.user,
                userInfo,
                companyInfo
            },
            productInfoReducer: {
                rfqData: rfq.data,
                quoteData: quote.data,
                productInfo,
                chatId: req.params.chatId,
                interlocutorCompanyInfo: interlocutorCompanyInfo.data || {}
            }
        });
        const reduxState = s.getState();
        const appString = rfqChatPPs.appString;

        const ProductApp = reactDom.renderToString(<ChatRFQComponent chatId={req.params.chatId} user={req.user} />);

        res.send(template(rfqChatPPs.bodyClass, rfqChatPPs.title, ProductApp, appString, reduxState));
    } catch (e) {
        console.log('productChat Error', e);
    }
});

//itemRouter.get('/viewRfq/:rfqId', authenticated, )



itemRouter.post('/send-rfq', authenticated, async(req, res) => {
    const rfqId = get(req.body, 'form.rfqId', null);

    if (rfqId) {
        // put (update rfq)
        try {
            const updateRfqRequest = await updateRfq(req, req.body.form, rfqId);
        } catch (e) {
            console.log('productProfile update RFQ Error e', e);
        }
    } else {
        try {
            // post (create) rfq
            const userInfo = req?.user?.userInfo;
            req.body.form.buyerId = userInfo.userid;
            const createRfqRequest = await createRfq(req, req.body.form);
            res.send({ rfq: createRfqRequest.data });
        } catch (e) {
            console.log('productProfile create RFQ Error e', e);
        }
    }
});

itemRouter.get('/sources/:companyId', authenticated, async(req, res) => {
    const { companyId = null } = req.params;

    try {
        const data = await getCompanySources(companyId);
        res.json({ productAttributes: data });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

itemRouter.post('/addCart', function (req, res) {

    if (!req.user) {
        //Guest Users
        let guestID = '00000000-0000-0000-0000-000000000000';
        if (req.body['guestUserID'] !== "") {
            guestID = req.body['guestUserID'];
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    }

    const options = {
        userId: req.user.ID,
        quantity: req.body['quantity'],
        discount: req.body['discount'],
        itemId: req.body['itemId'],
        force: req.body['force']
    };

    var promiseCart = new Promise((resolve, reject) => {
        client.Carts.addCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        res.send(cart);
    });
});

itemRouter.put('/editCart', function (req, res) {
    if (!req.user) {
        //Guest Users
        let guestID = '00000000-0000-0000-0000-000000000000';
        if (req.body['guestUserID'] !== "") {
            guestID = req.body['guestUserID'];
        }
        req.user = {
            ID: guestID,
            Guest: true
        }
    }

    const options = {
        userID: req.user.ID,
        cartID: req.body['cartItemId'],
        quantity: req.body['quantity'],
        discount: req.body['discount'],
        itemID: req.body[['itemId']],
        forComparison: req.body['forComparison'],
    };

    var promiseCart = new Promise((resolve, reject) => {
        client.Carts.editCart(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCart]).then((responses) => {
        const cart = responses[0];
        res.send(cart);
    });
});

itemRouter.get('/getItemDetails', authenticated, function (req, res) {
    const itemId = req.query['itemId'];

    const promiseItem = new Promise((resolve, reject) => {
        const options = {
            itemId: itemId,
            activeOnly: true
        };

        client.Items.getItemDetails(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseItem]).then((responses) => {
        res.send(responses[0]);
    });
});

itemRouter.post('/addReplyFeedback', authenticated, function (req, res) {
    const merchantId = req.body['merchantId'];
    const feedbackId = req.body['feedbackId'];
    const message = req.body['message'];

    const promiseAddReplyFeedBack = new Promise((resolve, reject) => {
        const options = {
            merchantId: merchantId,
            feedbackId: feedbackId,
            message: message
        };

        client.Items.addReplyFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseAddReplyFeedBack]).then((responses) => {
        res.send(responses[0]);
    });
});


module.exports = itemRouter;
