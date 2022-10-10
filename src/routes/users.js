'use strict';
import { 
    redirectUnauthorizedUser,
    toUserCompanyInfoObj,
} from '../utils';
import {
    GetHorizonEdmTemplateTypes,
    GetHorizonEdmTemplates,
    MapDataToHorizonEdmParameters,
    MapEdmParametersToTemplate,
    MapCustomEmailTemplateDataToTemplate
} from '../public/js/enum-core';
import { addFollower, removeFollower, getFollowerList, getProductFollowerList } from './horizon-api/entity-service/follower-controller';
import { getCompaniesByIds } from './horizon-api/entity-service/company-controller';
import { getUserInfo, updateUserInfo, inviteColleagues, shareCompany, shareProduct } from './horizon-api/auth-service/auth-controller';
import { generateTempId } from '../scripts/shared/common';
import { resolve } from 'path';


let React = require('react');
let reactDom = require('react-dom/server');
let template = require('../views/layouts/template');
let express = require('express');
let requestApi = require('../scripts/shared/request-api');
let userRouter = express.Router();
let authenticated = require('../scripts/shared/authenticated');
let authorizedUser = require('../scripts/shared/authorized-user');
let Store = require('../redux/store');
let UserSettingsIndexComponent = require('../views/user/settings/index').UserSettingsIndexComponent;

let client = require('../../sdk/client');
const multer = require('multer');
const uploadMulter = multer();
const FormData = require('form-data');

let passport = require('passport');
const ErrorComponent = require('../views/error');
const CommonModule = require('../public/js/common');

import { addAction } from './horizon-api/auth-service/user-limitation-controller';
import { productCompanyTypes } from '../consts/company-products';

const crypto = require('crypto');

function getHostname(req) {
    var fullUrl = req.protocol + '://' + req.get('host');
    return fullUrl;
}

function isValidHashKey(gateway, invoiceNo, hashKey, checkExpiry = false) {
    let isValid = false;
    const decoded = decodeURIComponent(hashKey);

    try {
        const decipher = crypto.createDecipher('aes128', process.env.CLIENT_SECRET);
        let decrypted = decipher.update(decoded, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        const token = JSON.parse(decrypted);

        if (token.code == gateway && token.invoiceNo == invoiceNo && (!checkExpiry || token.expirationDate >= Math.floor(new Date().getTime() / 1000))) {
            isValid = true;
        }
    } catch (err) {
        console.log(err);
    }

    return isValid;
}

export const getEmailTemplate = (title = '', callback) => {
    const tableName = 'Templates';
    const pluginId = process.env.EMAIL_TEMPLATES_PLUGIN_ID;

    const defaultTemplate = GetHorizonEdmTemplates()[title];

    if (typeof pluginId == 'undefined' || !pluginId) {
        console.log('NO PLUGIN ID')
        return callback(defaultTemplate);
    } else {
        const promiseEdmTemplate = new Promise((resolve, reject) => {
            const options = {
                pluginId,
                tableName,
                query: [{ Name: "title", Operator: "equal", Value: title }],
            }

            client.CustomTables.searchCustomTable(options, (err, templates) => {
                resolve(templates);
            });
        });

        Promise.all([promiseEdmTemplate])
            .then(responses => {
                const templateQuerySearchResults = responses[0];
                if (templateQuerySearchResults && templateQuerySearchResults.TotalRecords > 0) {
                    const templateData = templateQuerySearchResults.Records[0];
                    const template = MapCustomEmailTemplateDataToTemplate(templateData);
                    return callback(template);
                } else {
                    return callback(defaultTemplate);
                }
            })
            .catch(() => callback(defaultTemplate));
    }
}

export const constructAndSendEmail = (edmType = '', data, callback) => {
    if (edmType && data) {
        data.recipients = (data?.emails || '').join(',');
        getEmailTemplate(edmType, (template) => {
            if (template) {
                const parameters = MapDataToHorizonEdmParameters(edmType, data);
                const edm = MapEdmParametersToTemplate(template, parameters);
                const promiseSendEmail =  new Promise((resolve, reject) => {
                    client.Emails.sendEdm({
                        from: edm.From,
                        to: edm.To,
                        subject: edm.Subject,
                        body: edm.Body
                    }, (err, result) => resolve(result));
                });
                Promise.all([promiseSendEmail])
                    .then((responses) => {
                        const emailSent = responses[0];
                        return callback(emailSent?.Result || false);
                    })
                    .catch(() => callback(false));
            } else return callback(false);
        });
    } else return callback(false);
}

/* GET users listing. */
userRouter.get('/', authenticated, function(req, res) {
    console.log('user settings access: ', Date.now());
    res.send('respond with a resource');
});

userRouter.get('/settings', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const activeTab = req.query?.activeTab;
    
    var getUserInfoPromise = new Promise((resolve, reject) => {
        getUserInfo(req)
            .then(result => {
                resolve(result);
            });
    });
    
    var getFollowerListPromise = (clarivateUserId) => {
        return new Promise((resolve, reject) => {
            getFollowerList(clarivateUserId)
                .then(result => {
                    resolve(result);
                });
        });
    };

    var getFollowerProductsListPromise = (clarivateUserId) => {
        return new Promise((resolve, reject) => {
            getProductFollowerList(clarivateUserId)
                .then(result => {
                    resolve(result);
                });
        });
    };

    var getCompanyByIdsPromise = (companyIds, isShort) => {
        return new Promise((resolve, reject) => {
            getCompaniesByIds(companyIds, isShort)
                .then(result => {
                    resolve(result);
                });
        });
    };

    Promise.all([getUserInfoPromise]).then(responses => {
        const appString = 'user-setting';
        const [userInfoResp] = responses;
        const userInfo = userInfoResp.data;
        const clarivateUserId = userInfo?.userid;

        Promise.all([getFollowerListPromise(clarivateUserId), getFollowerList(clarivateUserId), getFollowerProductsListPromise(clarivateUserId)]).then((responses) => {
            const [followerCompanies, followers, followerProducts] = responses;

            const companiesIds = followerCompanies?.content.map(follower => follower.companyId);
            //const companies = await getCompaniesByIds(companiesIds, true);
            
            Promise.all([getCompanyByIdsPromise(companiesIds, true)]).then((responses) => {
                const [companies] = responses;
                
                const normalizeFollowerData = (content) => {
                    return content.map(follower => {
                        const company = companies.find(company => company.id === follower.companyId);
                        follower.companyName = company.name;
                        return follower;
                    })
                }
                const extendedFollowerCompanies = {
                    count: followerCompanies?.total,
                    followers: normalizeFollowerData(followerCompanies?.content || [])
                };

                const extendedFollowerProducts = {
                    count: followerProducts?.total,
                    followers: followerProducts?.content,
                }

                const userCompanyInfo = toUserCompanyInfoObj(userInfo, true, null, null, null, extendedFollowerCompanies, extendedFollowerProducts);

                const s = Store.createSettingsStore({
                    settingsReducer: {
                        user: userCompanyInfo                        
                    },
                    userReducer: { user: req.user, activeTab: activeTab }
                });
    
                let seoTitle = 'User Settings Page';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }
    
                const reduxState = s.getState();
                const settingsIndex = reactDom.renderToString(<UserSettingsIndexComponent user={req.user} userInfo={userCompanyInfo} activeTab={activeTab} />);
                res.send(template('page-settings new-search-settings', seoTitle, settingsIndex, appString, reduxState));
            });            
            
        });
    });
    
});

userRouter.put('/update', authenticated, function (req, res) {
    if (!req.user) {
        //Guest User
        if (req.body['guestUserID']) {
            req.user = { ID: req.body['guestUserID'] };
        }
    }
    let userID = req.user.ID;    
    if (req.body['updateSubAccount'] == true && req.user.AccountOwnerID !== null && req.user.SubBuyerID) {
        userID = req.user.SubBuyerID;
    }

    var promiseUpdateUserInfo = new Promise((resolve, reject) => {
        // client.Users.updateUser(userID, req.body, function(err, userInfo) {
        //     resolve(userInfo);
        // });
        updateUserInfo(req, req.body)
            .then(result => {
                resolve(result.data);
            });
    });

    Promise.all([promiseUpdateUserInfo]).then((responses) => {
        let userInfo = responses[0];
        getFollowerList(userInfo.userid)
            .then(followerCompanies => {
                const companiesIds = followerCompanies?.content.map(follower => follower.companyId);
                Promise.all([getCompaniesByIds(companiesIds, true)]).then((responses) => {
                    const [companies] = responses;

                    const extendedFollowerCompanies = {
                        count: followerCompanies?.total,
                        followers: followerCompanies?.content.map(follower => {
                            const company = companies.find(company => company.id === follower.companyId);
                            follower.companyName = company.name;
                            return follower;
                        })
                    };

                    const userCompanyInfo = toUserCompanyInfoObj(userInfo, true, null, null, null, extendedFollowerCompanies);
                    res.send(userCompanyInfo);
                });
            });       
        
    });
});

userRouter.get('/follower-list', authenticated, async (req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { page = 0, size = 10, companyId = null } = req.query;
        const followerCompanies = await getFollowerList(clarivateUserId, companyId, page, size);
        const companiesIds = followerCompanies?.content.map(follower => follower.companyId);
        const companies = await getCompaniesByIds(companiesIds, true);
        const followerCompaniesData = {
            followers: followerCompanies?.content.map(follower => {
                const company = companies.find(company => company.id === follower.companyId);
                follower.companyName = company.name;
                return follower;
            })
        };

        res.json({ followerCompanies: followerCompaniesData });
    } catch (e) {
        console.log('Error', e);
    }
});

userRouter.post('/follower', authenticated, async (req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { followCompanyId = null } = req.body;
        console.log(`follow ${clarivateUserId} - ${followCompanyId}`);
        
        if (followCompanyId) {
            const resp = await addFollower(clarivateUserId, followCompanyId);
            if (resp.status === 200) {
                res.json(resp.data);
                return;
            }

            console.log(`Error in ${req.originalUrl}`);
            res.sendStatus(500);
        }
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

userRouter.delete('/follower', authenticated, async (req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { followCompanyId = null } = req.body;
        console.log(`unfollow ${clarivateUserId} - ${followCompanyId}`);
        
        if (followCompanyId) {
            const resp = await removeFollower(clarivateUserId, followCompanyId);
            if (resp.status === 200) {
                res.json(resp.data);
                return;
            }

            console.log(`Error in ${req.originalUrl}`);
            res.sendStatus(500);
        }
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

userRouter.post('/register-with-username-and-password', passport.authenticate('login', { failureRedirect: '/accounts/buyer/sign-in?error=invalid-login' }), function (req, res) {
    var promiseUpdateUserInfo = new Promise((resolve, reject) => {
        client.Accounts.registerWithUsernameAndPassword(req.body, function (err, userInfo) {
            resolve(userInfo);
        });
    });

    Promise.all([promiseUpdateUserInfo]).then((responses) => {
        const result = responses[0];

        if (typeof result.access_token != 'undefined') {
            var maxAge = result.expires_in * 1000;
            res.cookie('webapitoken', result.access_token, { maxAge: maxAge, httpOnly: false });

            res.redirect(CommonModule.getAppPrefix()+'/');
        }
    });
});

userRouter.post('/profile/media', authenticated, uploadMulter.any(), function(req, res) {
    const file = req.files[0];

    const formData = new FormData();
    formData.append('userMedia', file.buffer, { filename: file.originalname });

    const options = {
        userId: req.user.ID,
        purpose: 'users',
        formData: formData
    };

    var promiseMedia = new Promise((resolve, reject) => {
        client.Media.uploadMedia(options, function(err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMedia]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

userRouter.get('/privatemarketplace/registration', function (req, res) {
    let token = req.query['token'];
    let isSeller = req.query['isSeller'];

    if (isSeller == 'True')
        res.redirect(CommonModule.getAppPrefix()+'/accounts/seller/register?token=' + token);
    else
        res.redirect(CommonModule.getAppPrefix()+'/accounts/buyer/register?token=' + token);

});

userRouter.post('/address/create', authenticated, function (req, res) {
    if (!req.user) {
        req.user = { ID: req.body.guestUserID };
    }

    let userId = req.user.ID;
    var promiseCreateAddress = new Promise((resolve, reject) => {
        client.Addresses.createAddress(userId, req.body, function (err, address) {
            resolve(address);
        });
    });

    Promise.all([promiseCreateAddress]).then((responses) => {
        const createAddress = responses[0];
        res.send(createAddress);
    });
});

userRouter.post('/address/delete', authenticated, function (req, res) {
    let userId = req.user.ID;
    let addressId = req.body.addressId;

    var promiseDeleteAddress = new Promise((resolve, reject) => {
        client.Addresses.deleteAddress(userId, addressId, function (err, address) {
            resolve(address);
        });
    });

    Promise.all([promiseDeleteAddress]).then((responses) => {
        const deleteAddress = responses[0];
        res.send(deleteAddress);
    });
});

userRouter.get('/checkout/order-details-old', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    const options = {
        url: getHostname(req) + `/${path}/order-details`,
        method: 'get',
        data: {
            gateway: req.query['gateway'],
            invoiceNo: req.query['invoiceNo'],
            payKey: req.query['paykey'],
            hashKey: req.query['hashkey']
        }
    };

    try {
        requestApi(options, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.send(result);
        });
    } catch (err) {
        res.send(err);
    }
});

userRouter.get('/checkout/order-details', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const { gateway, invoiceNo, paykey, hashkey } = req.query;

    if (gateway && invoiceNo && paykey && hashkey && isValidHashKey(gateway, invoiceNo, hashkey)) {
        const promiseInvoice = new Promise((resolve, reject) => {
            const options = {
                invoiceNo: invoiceNo,
                includes: 'Transaction.Orders.PaymentDetails'
            };

            client.Orders.getInvoiceNumberDetails(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseInvoice]).then((responses) => {
            const invoice = responses[0];
            let payeeInfos = [];

            invoice.Orders.forEach((order) => {
                order.PaymentDetails.forEach((payment) => {
                    if (payment.GatewayPayKey == paykey) {
                        if (payment.Payee.ID === order.MerchantDetail.ID) {
                            let items = [];

                            order.CartItemDetails.forEach((cart) => {
                                items.push({
                                    Id: order.ID + ' - ' + cart.ItemDetail.ID,
                                    ItemId: cart.ItemDetail.ID,
                                    Sku: cart.ItemDetail.SKU,
                                    Name: cart.ItemDetail.Name,
                                    Description: cart.ItemDetail.BuyerDescription,
                                    Currency: cart.CurrencyCode,
                                    Price: cart.ItemDetail.Price,
                                    Quantity: parseInt(cart.Quantity)
                                });
                            });

                            if (order.Freight && order.Freight > 0) {
                                items.push({
                                    Id: order.ID + ' - Freight',
                                    ItemId: '',
                                    Sku: '',
                                    Name: 'Freight Cost',
                                    Description: 'Freight Cost',
                                    Currency: order.CurrencyCode,
                                    Price: order.Freight,
                                    Quantity: 1
                                });
                            }

                            items.push({
                                Id: 'Admin Fee - Order ' + order.ID,
                                ItemId: '',
                                Sku: '',
                                Name: 'Fee (Deducted)',
                                Description: 'Admin Fee',
                                Currency: order.CurrencyCode,
                                Price: payment.Fee,
                                Quantity: 1
                            });

                            payeeInfos.push({
                                InternalUserId: payment.Payee.ID,
                                Total: payment.Total,
                                Currency: payment.CurrencyCode,
                                OrderId: order.ID,
                                Items: items,
                                Reference: invoice.InvoiceNo + '/' + order.ID,
                                Id: payment.Payee.ID,
                                Name: order.MerchantDetail.DisplayName || (order.MerchantDetail.FirstName + ' ' + order.MerchantDetail.LastName),
                                Email: order.MerchantDetail.Email
                            });
                        }
                    }
                });
            });

            let payer = null;

            if (invoice.Orders[0]) {
                const order = invoice.Orders[0];

                payer = {
                    Id: order.ConsumerDetail.ID,
                    Name: order.ConsumerDetail.DisplayName || (order.ConsumerDetail.FirstName + ' ' + order.ConsumerDetail.LastName),
                    Email: order.ConsumerDetail.Email
                }
            }

            res.send({
                PayeeInfos: payeeInfos,
                InvoiceNo: invoice.InvoiceNo,
                Payer: payer
            });
        });
    } else {
        res.send({});
    }
});

userRouter.post('/checkout/transaction-status', function (req, res) {
    const options = {
        url: getHostname(req) + '/checkout/transaction-status',
        method: 'post',
        data: {
            gateway: req.body['gateway'],
            invoiceNo: req.body['invoiceNo'],
            payKey: req.body['paykey'],
            hashKey: req.body['hashkey'],
            status: req.body['status']
        }
    };

    requestApi(options, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(result);
    });
});

userRouter.get('/checkout/current-status', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const { invoiceNo } = req.query;
    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    res.redirect(`${CommonModule.getAppPrefix()}/${path}/current-status?invoiceNo=${invoiceNo}`);
});

userRouter.get('/checkout/payment-success', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const payKey = req.query['paykey'];
    const hashKey = encodeURIComponent(req.query['hashkey']);
    const status = 'success';

    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    res.redirect(`${CommonModule.getAppPrefix()}/${path}/transaction-status?gateway=${gateway}&invoiceNo=${invoiceNo}&payKey=${payKey}&hashKey=${hashKey}&status=${status}`);
});

userRouter.get('/checkout/payment-failure', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const gateway = req.query['gateway'];
    const invoiceNo = req.query['invoiceNo'];
    const payKey = req.query['paykey'];
    const hashKey = encodeURIComponent(req.query['hashkey']);
    const status = 'failed';

    const path = process.env.CHECKOUT_FLOW_TYPE == 'b2c' ? 'checkout' : 'invoice';

    res.redirect(`${CommonModule.getAppPrefix()}/${path}/transaction-status?gateway=${gateway}&invoiceNo=${invoiceNo}&payKey=${payKey}&hashKey=${hashKey}&status=${status}`);
});

userRouter.get('/marketplace/be-seller', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    res.redirect(CommonModule.getAppPrefix()+'/accounts/non-private/be-seller');
});

userRouter.get('/marketplace/customlogin', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const isSeller = req.query['isSeller'] || false;

    res.redirect(CommonModule.getAppPrefix()+'/accounts/non-private/sign-in?isSeller=' + isSeller);
});

userRouter.get('/locations', authenticated, (req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseMarketplaceInfo]).then((responses) => {
        const marketplaceInfo = responses[0];

        const promiseLocationVariants = new Promise((resolve, reject) => {
            let locationVariantGroupId = null;

            if (marketplaceInfo && marketplaceInfo.CustomFields) {
                const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (locationCustomField && locationCustomField.Values.length > 0) {
                    locationVariantGroupId = locationCustomField.Values[0];
                }
            }

            if (locationVariantGroupId) {
                client.Items.getAdminVariantsByGroupId({ variantGroupId: locationVariantGroupId }, (err, result) => {
                    resolve(result);
                });
            } else {
                resolve([]);
            }
        });

        Promise.all([promiseLocationVariants]).then((responses) => {
            res.send(responses[0]);
        });
    });
});

userRouter.post('/customFieldDefinition', authenticated, (req, res) => {
    const data = {
        customField: {
            'Name': req.body['Name'],
            'DataInputType': req.body['DataInputType'],
            'DataFieldType': req.body['DataFieldType'],
            'ReferenceTable': req.body['ReferenceTable'],
            'IsMandatory': false,
            'IsComparable': false
        }
    };

    const promiseCustomFieldDefinition = new Promise((resolve, reject) => {
        client.CustomFields.create(data, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseCustomFieldDefinition]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

/* horizon endpoints */

userRouter.post('/increase-chat-counter', authenticated, async (req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const action = 'chatMessageSent';
        const resp = await addAction(clarivateUserId, action);
        if (resp.status === 200) {
            const updatedUser = await getUserInfo(req);
            req.user.flags = { ...updatedUser.data?.flags };
            res.json(updatedUser.data);
            return;
        }

        console.log(`Error in ${req.originalUrl}`);
        res.statusCode(500);
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.statusCode(500);
    }
});

userRouter.get('/payment-link', (req, res) => {
    const clarivateUserId = req.user?.UserLogins[0]?.ProviderKey;
    const cartId = process.env.CLEVERBRIDGE_CART_ID;
    const productId = process.env.CLERVERBRIDGE_PRODUCT_ID;
    const isPermanentLink = isNaN(productId);

    if (clarivateUserId) {
        const paymentLink = isPermanentLink
            ? `https://buy.clarivate.com/${cartId}/${productId}?x-userid=${clarivateUserId}`
            : `https://buy.clarivate.com/${cartId}/?scope=checkout&cart=${productId}&x-userid=${clarivateUserId}`;
        res.json({ paymentLink });
    } else {
        console.log('User id not provided');
        res.sendStatus(500);
    }
});

userRouter.post('/invite-colleagues', authenticated, async(req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { emails = [], comment = '' } = req.body;
        const clarivateUserEmail = req?.user?.Email;

        const edmData = {
            emails,
            comment,
            senderUserEmail: clarivateUserEmail,
        }
        constructAndSendEmail(GetHorizonEdmTemplateTypes().Invite_Colleagues_EDM, edmData, (success) => {
            res.send({ success });
        });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

userRouter.post('/share-product', authenticated, async(req,res) => {
    try{
        const clarivateUserId = req?.user?.userInfo?.userid;
        const clarivateUserEmail = req?.user?.Email;
        let productLink;
        const { emails = [], comment = '', companyId, productId, productType, companyName, productName } = req.body;
        if (productType === productCompanyTypes.PRODUCT_COMPANY_MANUFACTURER) {
            productLink = `/product-profile/Manufacturer/${companyId}/${productId}`;
        } else if (productType === productCompanyTypes.PRODUCT_COMPANY_MARKETER) {
            productLink = `/product-profile/Marketer/${companyId}/${productId}`;
        }
        else{
            productLink = `/product-profile/profile/${companyId}/${productId}`;
        }

        const edmData = {
            emails,
            comment,
            productName,
            companyName,
            productLink,
            senderUserEmail: clarivateUserEmail,
        }
        constructAndSendEmail(GetHorizonEdmTemplateTypes().Share_Product_EDM, edmData, (success) => {
            res.send({ success });
        });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

userRouter.post('/share-company', authenticated, async (req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { emails = [], comment = '', companyId, companyName } = req.body;
        const resp = await shareCompany(clarivateUserId, JSON.parse(emails), comment, companyId, companyName);
        res.sendStatus(200);
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

userRouter.get('/product-follower-list', authenticated, async(req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { page = 0, size = 10 } = req.query;
        const followerProducts = await getProductFollowerList(clarivateUserId, page, size);
        const companiesIds = followerProducts?.content.map(follower => follower.companyId);
        const companies = await getCompaniesByIds(companiesIds, true);
        const followerProductsData = {
            followers: followerProducts?.content.map(follower => {
                const company = companies.find(company => company.id === follower.companyId);
                follower.companyName = company.name;
                return follower;
            })
        };

        res.json({ followerProducts: followerProductsData });
    } catch (e) {
        console.log('Error in product follower list', e);
    }
});

export default userRouter;