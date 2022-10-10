'use strict';
import { redirectUnauthorizedUser } from '../utils';

var express = require('express');
var storeFrontRouter = express.Router();
var StoreFrontPage = require('../views/storefront/main').StoreFrontPageComponent;
var reactDom = require('react-dom/server');
var React = require('react');
var template = require('../views/layouts/template');
var client = require('../../sdk/client');
var Store = require('../redux/store');
var authenticated = require('../scripts/shared/authenticated');

storeFrontRouter.get('/:sellerid', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let currentUser = req.user;
    let keyword = req.query.keyword || '';
    let pageNo = req.query.pageNo || '1';

    let promiseMerchantDetail = new Promise((resolve, reject) => {
        const options = {
            token: null,
            userId: req.params.sellerid,
            includes: ''
        };

        client.Users.getUserDetails(options, function (err, details) {
            if (details) {
                resolve(details);
            } else {
                reject('USER_DETAILS_NOT_FOUND');
            }
        });
    });

    let promiseMerchantFeedback = new Promise((resolve, reject) => {
        const options = {
            merchantId: req.params.sellerid,
            keyword: '',
            pageNo: 1,
            pageSize: 15
        };

        client.Items.getMerchantFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    let promiseAllMerchantFeedback = new Promise((resolve, reject) => {
        const options = {
            merchantId: req.params.sellerid,
            keyword: '',
            pageNo: 1,
            pageSize: 1000000
        };

        client.Items.getMerchantFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    let promiseMarketplace = new Promise((resolve, reject) => {
        let options = {
            includes: 'ControlFlags'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMerchantDetail, promiseMerchantFeedback, promiseAllMerchantFeedback, promiseMarketplace]).then((responses) => {
        const appString = 'merchant-storefront';

        let merchantUser = responses[0];
        let merchantFeedback = responses[1];
        let allMerchantFeedback = responses[2];
        let marketplaceInfo = responses[3];
        let ReviewAndRating = marketplaceInfo.ControlFlags.ReviewAndRating;

        let sellerCountry = "";
        if (merchantUser) {
            if (merchantUser.CustomFields) {
                merchantUser.CustomFields.forEach(function (mu) {
                    sellerCountry = mu.Values[0];
                })
            }
        }

        let locationVariantGroupId = null;
        let userPreferredLocationId = null;
        if (process.env.PRICING_TYPE == 'country_level') {
            if (marketplaceInfo.CustomFields) {
                const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (locationCustomField && locationCustomField.Values.length > 0) {
                    locationVariantGroupId = locationCustomField.Values[0];
                }
            }

            if (currentUser) {
                if (currentUser.CustomFields && currentUser.CustomFields.length > 0) {
                    const customField = currentUser.CustomFields.find(c => c.Code.startsWith('user_preferred_location'));

                    if (customField) {
                        userPreferredLocationId = customField.Values[0];
                    }
                }
            }
        }

        let promiseItems = new Promise((resolve, reject) => {
            const options = {
                sellerId: req.params.sellerid,
                pageSize: 20,
                pageNumber: pageNo,
                tags: [],
                withChildItems: true,
                sort: 'created_desc',
                keyword: keyword,
                filterAvailable: true,
                filterVisible: true,
                variantGroupId: locationVariantGroupId,
                variantId: userPreferredLocationId
            };

            client.Items.getMerchantItems(options, function (err, details) {
                resolve(details);
            });
        });


        Promise.all([promiseItems]).then((responses) => {
            let items = responses[0];
            const s = Store.createStoreFrontStore({
                itemsReducer: { items: items, keyword: keyword },
                userReducer: { user: currentUser, userPreferredLocationId: userPreferredLocationId },
                merchantReducer: {
                    user: merchantUser,
                    sellerCountry: sellerCountry,
                    merchantFeedback: merchantFeedback,
                    ReviewAndRating: ReviewAndRating,
                    allMerchantFeedback: allMerchantFeedback
                },

            });
            const reduxState = s.getState();
            const storeFront = reactDom.renderToString(<StoreFrontPage
                items={items}
                merchantUser={merchantUser}
                user={currentUser}
                userPreferredLocationId={userPreferredLocationId}
                merchantFeedback={merchantFeedback}
                allMerchantFeedback={allMerchantFeedback}
                categories={[]} />);

            let seoTitle = 'StoreFront Page';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            res.send(template('page-store', seoTitle, storeFront, appString, reduxState));
        });

    })
    .catch(function (err) {
        if (err == "USER_DETAILS_NOT_FOUND") {
            if (req.query.redirectUrl && req.query.redirectUrl.length > 0) {
                res.redirect(req.query.redirectUrl + '?&error=merchant-not-found');
            }
            res.redirect("/?error=merchant-not-found");
        }
    })

});


storeFrontRouter.post('/getMerchantFeedback', function (req, res) {
    let currentUser = req.user;
    const keyword = req.body.keyword;
    const merchantID = req.body.merchantID;
    const pageNo = req.body.pageNo;
    const pageSize = req.body.pageSize;

    let promiseMerchantFeedback = new Promise((resolve, reject) => {
        const options = {
            merchantId: merchantID,
            keyword: keyword,
            pageNo: pageNo,
            pageSize: pageSize
        };

        client.Items.getMerchantFeedback(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseMerchantFeedback]).then((responses) => {
        let items = responses[0];
        res.send(items);
    });
});


storeFrontRouter.get('/:sellerid/storefrontsearch', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let currentUser = req.user;
    var keyword = req.query['keyword'];
    var pageNo = req.query['pageNo'];

    var promiseCurrentUserAddresses = new Promise((resolve, reject) => {
        if (!currentUser || process.env.PRICING_TYPE === 'variants_level') resolve(null);
        client.Addresses.getUserAddresses(currentUser.ID, function (err, addresses) {
            resolve(addresses);
        });
    });
    Promise.all([promiseCurrentUserAddresses]).then((responses) => {
        let currentUserAddress = responses[0];
        let promiseItems = new Promise((resolve, reject) => {
            if (typeof pageNo === 'undefined') {
                pageNo = 1;
            }
            const options = {
                sellerId: req.params.sellerid,
                pageSize: 20,
                pageNumber: pageNo,
                tags: currentUserAddress ? currentUserAddress.Records[0].CountryCode : null,
                withChildItems: true,
                sort: 'created_desc',
                keyword: keyword,
                filterAvailable: true,
                filterVisible: true
            };
            client.Items.getMerchantItems(options, function (err, details) {
                resolve(details);
            });
        });
        Promise.all([promiseItems]).then((responses) => {
            let items = responses[0];
            res.send(items);
        });
    });

});

module.exports = storeFrontRouter;
