'use strict';
import { redirectUnauthorizedUser } from '../utils';

var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');
var express = require('express');
var purchaseRouter = express.Router();
var Store = require('../redux/store');

var PurchaseHistoryComponent = require('../views/purchase/history/index').PurchaseHistoryComponent;
var PurchaseDetailComponent = require('../views/purchase/detail/index').PurchaseDetailComponent;

var authenticated = require('../scripts/shared/authenticated');
var authorizedUser = require('../scripts/shared/authorized-user');
var client = require('../../sdk/client');

purchaseRouter.get('/history', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;

    if (req.user === null) {
        return;
    }

    const orderStatuses = ['created', 'acknowledged', 'delivered', 'rejected'];
    const fulfilmentStatuses = ['created', 'ready for consumer collection', 'delivered', 'collected', 'acknowledged'];

    const promiseStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getStatuses(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseFulfilmentStatus = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getFulfilmentStatuses(options, function (err, result) {
            resolve(result);
        });
    });
    let promiseHistory = null;
    let getAllOrders = false;

    //b2b
    if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
        promiseHistory = new Promise((resolve, reject) => {
            let options = {
                userId: user.ID,
                keywords: null,
                pageNumber: 1,
                pageSize: 20,
                status: orderStatuses
            }
            client.Purchases.getHistoryB2B(options, function (err, result) {
                resolve(result);
            });
        });
    } else {
        let pStatus = 'success,waiting for payment,acknowledged,pending';
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
            pStatus += ',refunded';
        }
        getAllOrders = true;
        promiseHistory = new Promise((resolve, reject) => {
            let options = {
                userId: user.ID,
                keyword: '',
                pageNumber: 1,
                pageSize: 20,
                status: fulfilmentStatuses,
                pStatus: pStatus
            };
            client.Purchases.getHistory(options, function (err, result) {
                resolve(result);
            });
        });
    }

    const promiseSuppliers = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID
        };

        client.Orders.getMerchantsFromOrdersB2B(options, (err, result) => {
            resolve(result);
        });
    });

    Promise.all([promiseHistory, promiseStatus, promiseFulfilmentStatus, promiseSuppliers]).then((responses) => {
        let history = responses[0];
        const statuses = responses[1];
        const fStatuses = responses[2];
        const appString = 'purchase-history';
        const context = {};

        //EMpty History
        if (!history) {
            history = {
                TotalRecords: 0
            };
        }
        let selectedSuppliers = "";
        let selectedOrderStatuses = "";
        let selectedDates = {};
        let keyword = "";

        let statusToPass = [];
        if (statuses && statuses.Records && process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            statuses.Records.forEach(function (status) {
                const orderStatus = orderStatuses.find(o => o === status.Name.toLowerCase());
                if (orderStatus != null || typeof orderStatus !== 'undefined') {
                    statusToPass.push(status);
                }
            });
            statuses.Records = statusToPass;
            statuses.TotalRecords = statusToPass.length;
        }

        if (fStatuses && fStatuses.Records && process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
            fStatuses.Records.map(function (status) {
                switch (status.Name.toLowerCase()) {
                    case 'created':
                        status.SortOrder = 1;
                        break;
                    case 'acknowledged':
                        status.SortOrder = 2;
                        break;
                    case 'ready for consumer collection':
                        status.SortOrder = 3;
                        break;
                    case 'delivered':
                        status.SortOrder = 4;
                        break;
                    case 'collected':
                        status.SortOrder = 5;
                        break;
                }

                const fulfilmentStatus = fulfilmentStatuses.find(o => o === status.Name.toLowerCase());
                if (fulfilmentStatus != null || typeof fulfilmentStatus !== 'undefined') {
                    statusToPass.push(status);
                }
            });

            statusToPass.sort((a, b) => (a.SortOrder > b.SortOrder) ? 1 : -1)
            fStatuses.Records = statusToPass;
            fStatuses.TotalRecords = statusToPass.length;
        }

        //ARC8304
        let suppliers = [];
        let purchaseRecords = [];
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
           suppliers = responses[3] || [];
        } else {
            if (history && history.Records) {
                history.Records.forEach(function (data) {
                    if (suppliers) {
                        //remove dups
                        suppliers.map(function (supplier, i) {
                            if (data.Orders && data.Orders[0] && data.Orders[0].MerchantDetail && supplier.ID === data.Orders[0].MerchantDetail.ID) {
                                suppliers.splice(i, 1);
                            }
                        });
                        if (data.Orders && data.Orders[0] && data.Orders[0].MerchantDetail) {
                            suppliers.push(data.Orders[0].MerchantDetail);
                        }
                    }
                    if (data.Orders && getAllOrders) {
                        data.Orders.map(function (order, i) {
                            let transaction = {
                                'InvoiceNo': data.InvoiceNo,
                                'CurrencyCode': data.CurrencyCode,
                                'Total': data.Total,
                                'Fee': data.Fee,
                                'Orders': [order]
                            };
                            purchaseRecords.push(transaction);
                        });
                    }
                });

                if (purchaseRecords.length > 0 && getAllOrders) {
                    history.Records = purchaseRecords;
                }
            }
        }

        const s = Store.createPurchaseStore({
            userReducer: { user: user },
            purchaseReducer: {
                history: history,
                keyword: keyword,
                suppliers: suppliers,
                statuses: process.env.CHECKOUT_FLOW_TYPE === 'b2c' ? fStatuses : statuses ,
                selectedSuppliers: selectedSuppliers,
                selectedOrderStatuses: selectedOrderStatuses,
                selectedDates: selectedDates
            }
        });
        const reduxState = s.getState();

        let seoTitle = 'Purchase History';
          if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        const app = reactDom.renderToString(<PurchaseHistoryComponent context={context} user={req.user}
            history={history} suppliers={suppliers} statuses={statuses}
            selectedSuppliers={selectedSuppliers} selectedOrderStatuses={selectedOrderStatuses}
            selectedDates={selectedDates}/>);
        res.send(template('page-seller page-purchase-history page-sidebar', seoTitle, app, appString, reduxState));
    });
});

purchaseRouter.get('/history/search', authenticated, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

   // const status = process.env.TEMPLATE !== 'bespoke'? 'success' : null;
    let pStatus = 'success,waiting for payment,acknowledged,pending';
    if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
        pStatus += ',refunded';
    }
    const options = {
        userId: req.user.ID,
        keyword: req.query['keyword'],
        pageNumber: req.query['pageNumber'],
        pageSize: req.query['pageSize'],
        startDate: req.query['startDate'],
        endDate: req.query['endDate'],
        supplier: req.query['supplier'],
        status: req.query['status'],
        pStatus: pStatus
    };

    var promiseHistory = null;
    let getAllOrders = false;
    //b2b
    if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {

        promiseHistory = new Promise((resolve, reject) => {
            if (options.supplier) {
                let suppliersplit = options.supplier.split(",");
                let suppliers = [];

                suppliersplit.map(function (supplier) {
                    suppliers.push(supplier);
                });
                options.supplier = suppliers;
            }

            if (options.status) {
                let statussplit = options.status.split(",");
                let statuspass = [];

                statussplit.map(function (status) {
                    statuspass.push(status);
                });
                options.status = statuspass;
            }
            client.Purchases.getHistoryB2B(options, function (err, result) {
                resolve(result);
            });
        });
    } else {
        getAllOrders = true;
        promiseHistory = new Promise((resolve, reject) => {
            client.Purchases.getHistory(options, function (err, result) {
                resolve(result);
            });
        });
    }

    Promise.all([promiseHistory]).then((responses) => {
        const history = responses[0];

        let purchaseRecords = [];
        if (getAllOrders && history && history.Records) {
            history.Records.forEach(function (data) {
                if (data.Orders) {
                    data.Orders.map(function (order, i) {
                        var transaction = data;
                        transaction.Orders = [];
                        transaction.Orders.push(order);
                        purchaseRecords.push(transaction);
                    });
                }
            });

            if (purchaseRecords.length > 0) {
                history.Records = purchaseRecords;
            }
        }

        res.send(history);
    });
});

purchaseRouter.get('/detail/orderid/:id', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    //FOR B2B
    let user = req.user;
    if (user == null || user == undefined || typeof user == undefined) {
        return res.redirect('/accounts/sign-in');
    }
    if (req.params.id === 'undefined') {
        return;
    }
    var promiseHistory = new Promise((resolve, reject) => {
        let options = {
            userId: user.ID,
            keyword: req.params.id,
            pageNumber: 1,
            pageSize: 20,
        }
        client.Purchases.getHistoryB2B(options, function (err, result) {
            resolve(result);
        });
    });
    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });
    Promise.all([promiseHistory, promiseMarketplace]).then((responses) => {
        const detail = responses[0];
        let marketPlaceInfo = responses[1];
        let enableReviewAndRating = marketPlaceInfo.ControlFlags.ReviewAndRating;
        let promiseShippingMethod = null;
        let promiseShippingOptionsAdmin = null;
        let promiseCartItemsFeedback = null;
        const cartIds = [];
        if (process.env.PRICING_TYPE === 'variants_level') {
            const shippingMethodMap = new Map();

            detail.Records.map(o => {
                if (o.CartItemDetails) {
                    cartIds.push(...o.CartItemDetails.map(c => c.ID));
                }

                if (o.CartItemDetails && o.CartItemDetails[0].ShippingMethod) {
                    shippingMethodMap.set(o.MerchantDetail.ID, o.CartItemDetails[0].ShippingMethod.ID)
                }
            });
            const promiseCartItemFeedback = (cartId) =>
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                        resolve({ cartId, feedback });
                    })
                });

            const promiseMerchantShippingMethod = (merchantID, shippingID) =>
                new Promise((resolve, reject) => {
                    client.ShippingMethods.getShippingMethodObject(merchantID, shippingID, function (err, shipping) {
                        resolve(shipping);
                    });
                });
            const map = new Map();
            promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));
            promiseShippingMethod = Promise.all(Array.from(shippingMethodMap.keys()).map(merchantID => promiseMerchantShippingMethod(merchantID, shippingMethodMap.get(merchantID))));
            promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
                client.ShippingMethods.getShippingOptions(function (err, shipping) {
                    resolve(shipping);
                });
            });
        } else {
            const purchaseShippingMethod = detail.Records[0].CartItemDetails[0].ShippingMethod;

            promiseShippingMethod = new Promise((resolve, reject) => {
                if (purchaseShippingMethod) {
                    client.ShippingMethods.getShippingMethodObject(detail.Records[0].MerchantDetail.ID, purchaseShippingMethod.ID, function (err, shipping) {
                        resolve(shipping);
                    });
                } else {
                    resolve(null);
                }
            });

            detail.Records.map(o => {
                if (o.CartItemDetails) {
                    cartIds.push(...o.CartItemDetails.map(c => c.ID));
                }

            });
            const promiseCartItemFeedback = (cartId) =>
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                        resolve({ cartId, feedback });
                    })
                });

            promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));
        }
        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            const feedback = responses[0];
            let shippingMethod = null;
            if (feedback && feedback.length > 0) {
                detail.Records.map(o => {
                    if (o.CartItemDetails && o.CartItemDetails.length > 0) {
                        o.CartItemDetails.map(cartItem => {
                            const cartFeedback = feedback.find(x => x.cartId === cartItem.ID);
                            if (cartFeedback != null || typeof cartFeedback !== 'undefined') {
                                cartItem.Feedback = cartFeedback.feedback;
                            }
                        })
                    }
                })
            }
            //ADD additional Shippings
            Promise.all([promiseShippingMethod, promiseShippingOptionsAdmin]).then((responses) => {
                shippingMethod = responses[0];
                const shippingMethodAdmin = responses[1];
                if (process.env.PRICING_TYPE === 'variants_level') {

                    if (shippingMethod && shippingMethodAdmin)
                        shippingMethod.push(...responses[1]);

                }
            });

            const appString = 'purchase-history-detail';
            const context = {};

            let purchaseDetail = detail.Records[0];
            const s = Store.createPurchaseStore({
                userReducer: { user: user },
                purchaseReducer: {
                    detail: purchaseDetail, shippingMethod: shippingMethod,
                    enableReviewAndRating: enableReviewAndRating
                }
            });

            const reduxState = s.getState();

            let seoTitle = 'Purchase History Details';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const app = reactDom.renderToString(<PurchaseDetailComponent context={context} user={req.user} detail={purchaseDetail} shippingMethod={shippingMethod} />);
            res.send(template('page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
        });

    });
});

purchaseRouter.get('/detail/:id', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;

    if (user == null || user == undefined || typeof user == undefined) {
        return res.redirect('/accounts/sign-in');
    }

    if (req.params.id === 'undefined') {
        return;
    }

    const options = {
        userId: user.ID,
        invoiceNo: req.params.id
    };
    var promiseDetail = new Promise((resolve, reject) => {
        client.Purchases.getHistoryDetail(options, function (err, result) {
            resolve(result);
        });
    });
    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });
    Promise.all([promiseDetail, promiseMarketplace]).then((responses) => {
        const detail = responses[0];
        let marketPlaceInfo = responses[1];
        let enableReviewAndRating = marketPlaceInfo.ControlFlags.ReviewAndRating;
        let promiseShippingMethod = null;
        let promiseShippingOptionsAdmin = null;
        let promiseCartItemsFeedback = null;
        const cartIds = [];
        if (process.env.PRICING_TYPE === 'variants_level') {
            const shippingMethodMap =  new Map();

            detail.Orders.map(o => {
                if (o.CartItemDetails) {
                    cartIds.push(...o.CartItemDetails.map(c => c.ID));
                }

                if (o.CartItemDetails && o.CartItemDetails[0].ShippingMethod) {
                    shippingMethodMap.set(o.MerchantDetail.ID, o.CartItemDetails[0].ShippingMethod.ID)
                }
            });
            const promiseCartItemFeedback = (cartId) =>
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId}, function (err, feedback) {
                        resolve({ cartId, feedback });
                    })
                });

            const promiseMerchantShippingMethod = (merchantID, shippingID) =>
                new Promise((resolve, reject) => {
                    client.ShippingMethods.getShippingMethodObject(merchantID, shippingID, function (err, shipping) {
                        resolve(shipping);
                    });
                });
            const map = new Map();
            promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));
            promiseShippingMethod = Promise.all(Array.from(shippingMethodMap.keys()).map(merchantID => promiseMerchantShippingMethod(merchantID, shippingMethodMap.get(merchantID))));
            promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
                client.ShippingMethods.getShippingOptions(function (err, shipping) {
                    resolve(shipping);
                });
            });
        } else {
            const purchaseShippingMethod = detail.Orders[0].CartItemDetails[0].ShippingMethod;
            promiseShippingMethod = new Promise((resolve, reject) => {
                if (purchaseShippingMethod) {
                    client.ShippingMethods.getShippingMethodObject(detail.Orders[0].MerchantDetail.ID, purchaseShippingMethod.ID, function (err, shipping) {
                        resolve(shipping);
                    });
                } else {
                    resolve(null);
                }
            });

            detail.Orders.map(o => {
                if (o.CartItemDetails) {
                    cartIds.push(...o.CartItemDetails.map(c => c.ID));
                }

            });
            const promiseCartItemFeedback = (cartId) =>
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                        resolve({ cartId, feedback });
                    })
                });

            promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));
        }
        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            const feedback = responses[0];
            let shippingMethod = null;
            if (feedback && feedback.length > 0) {
                detail.Orders.map(o => {
                    if (o.CartItemDetails && o.CartItemDetails.length > 0) {
                        o.CartItemDetails.map(cartItem => {
                            const cartFeedback = feedback.find(x => x.cartId === cartItem.ID);
                            if (cartFeedback != null || typeof cartFeedback !== 'undefined') {
                                cartItem.Feedback = cartFeedback.feedback;
                            }
                        })
                    }
                })
            }
            //ADD additional Shippings
            Promise.all([promiseShippingMethod, promiseShippingOptionsAdmin]).then((responses) => {
                shippingMethod = responses[0];
                const shippingMethodAdmin = responses[1];
                if (process.env.PRICING_TYPE === 'variants_level') {

                    if (shippingMethod && shippingMethodAdmin)
                        shippingMethod.push(...responses[1]);

                }
            });

            const appString = 'purchase-history-detail';
            const context = {};


            const s = Store.createPurchaseStore({
                userReducer: { user: user },
                purchaseReducer: { detail: detail, shippingMethod: shippingMethod, enableReviewAndRating: enableReviewAndRating  }
            });

            const reduxState = s.getState();

            let seoTitle = 'Purchase History Details';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const app = reactDom.renderToString(<PurchaseDetailComponent context={context} user={req.user} detail={detail} shippingMethod={shippingMethod} enableReviewAndRating={enableReviewAndRating}  />);
            res.send(template('page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
        });

    });
});

purchaseRouter.get('/detail/:id/merchant/:merchantId', authenticated, authorizedUser, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let user = req.user;

    if (user == null || user == undefined || typeof user == undefined) {
        return res.redirect('/accounts/sign-in');
    }

    if (req.params.id === 'undefined') {
        return;
    }

    const options = {
        userId: user.ID,
        invoiceNo: req.params.id,
        merchantId: req.params.merchantId === 'undefined' ? null : req.params.merchantId
    };
    var promiseDetail = new Promise((resolve, reject) => {
        client.Purchases.getHistoryDetail(options, function (err, result) {
            resolve(result);
        });
    });
    const promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'ControlFlags'
        };
        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });
    Promise.all([promiseDetail, promiseMarketplace]).then((responses) => {
        const detail = responses[0];
        let marketPlaceInfo = responses[1];
        let enableReviewAndRating = marketPlaceInfo.ControlFlags.ReviewAndRating;
        let promiseShippingMethod = null;
        let promiseShippingOptionsAdmin = null;
        let promiseCartItemsFeedback = null;
        const cartIds = [];
        if (process.env.PRICING_TYPE === 'variants_level') {
            const shippingMethodMap = new Map();

            detail.Orders.map(o => {
                if (o.CartItemDetails) {
                    cartIds.push(...o.CartItemDetails.map(c => c.ID));
                }

                if (o.CartItemDetails && o.CartItemDetails[0].ShippingMethod) {
                    shippingMethodMap.set(o.MerchantDetail.ID, o.CartItemDetails[0].ShippingMethod.ID)
                }
            });
            const promiseCartItemFeedback = (cartId) =>
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                        resolve({ cartId, feedback });
                    })
                });

            const promiseMerchantShippingMethod = (merchantID, shippingID) =>
                new Promise((resolve, reject) => {
                    client.ShippingMethods.getShippingMethodObject(merchantID, shippingID, function (err, shipping) {
                        resolve(shipping);
                    });
                });
            const map = new Map();
            promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));
            promiseShippingMethod = Promise.all(Array.from(shippingMethodMap.keys()).map(merchantID => promiseMerchantShippingMethod(merchantID, shippingMethodMap.get(merchantID))));
            promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
                client.ShippingMethods.getShippingOptions(function (err, shipping) {
                    resolve(shipping);
                });
            });
        } else {
            const purchaseShippingMethod = detail.Orders[0].CartItemDetails[0].ShippingMethod;
            promiseShippingMethod = new Promise((resolve, reject) => {
                if (purchaseShippingMethod) {
                    client.ShippingMethods.getShippingMethodObject(detail.Orders[0].MerchantDetail.ID, purchaseShippingMethod.ID, function (err, shipping) {
                        resolve(shipping);
                    });
                } else {
                    resolve(null);
                }
            });

            detail.Orders.map(o => {
                if (o.CartItemDetails) {
                    cartIds.push(...o.CartItemDetails.map(c => c.ID));
                }

            });
            const promiseCartItemFeedback = (cartId) =>
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId }, function (err, feedback) {
                        resolve({ cartId, feedback });
                    })
                });

            promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));
        }
        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            const feedback = responses[0];
            let shippingMethod = null;
            if (feedback && feedback.length > 0) {
                detail.Orders.map(o => {
                    if (o.CartItemDetails && o.CartItemDetails.length > 0) {
                        o.CartItemDetails.map(cartItem => {
                            const cartFeedback = feedback.find(x => x.cartId === cartItem.ID);
                            if (cartFeedback != null || typeof cartFeedback !== 'undefined') {
                                cartItem.Feedback = cartFeedback.feedback;
                            }
                        })
                    }
                })
            }
            //ADD additional Shippings
            Promise.all([promiseShippingMethod, promiseShippingOptionsAdmin]).then((responses) => {
                shippingMethod = responses[0];
                const shippingMethodAdmin = responses[1];
                if (process.env.PRICING_TYPE === 'variants_level') {

                    if (shippingMethod && shippingMethodAdmin)
                        shippingMethod.push(...responses[1]);

                }
            });

            const appString = 'purchase-history-detail';
            const context = {};


            const s = Store.createPurchaseStore({
                userReducer: { user: user },
                purchaseReducer: { detail: detail, shippingMethod: shippingMethod, enableReviewAndRating: enableReviewAndRating }
            });

            const reduxState = s.getState();

            let seoTitle = 'Purchase History Details';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const app = reactDom.renderToString(<PurchaseDetailComponent context={context} user={req.user} detail={detail} shippingMethod={shippingMethod} enableReviewAndRating={enableReviewAndRating} />);
            res.send(template('page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
        });

    });
});

purchaseRouter.post('/detail/:id/feedback/:cartId', authenticated, function (req, res) {
    const { id, cartId } = req.params;
    const { ItemRating, Message } = req.body;
    const options = {
        userId: req.user.ID,
        cartId: cartId,
        ItemRating,
        Message,
    };

    const promiseLeaveFeedback = new Promise((resolve, reject) => {
        client.Carts.addCartFeedback(options, function (err, result) {
            resolve(result);
        });
    });
    Promise.all([promiseLeaveFeedback]).then(responses => {
        const result = responses[0];
        if (result > 0) {
            const promiseCartItemFeedback =
                new Promise((resolve, reject) => {
                    client.Carts.getCartFeedback({ userId: req.user.ID, cartId}, function (err, feedback) {
                        resolve(feedback);
                    })
                });
            Promise.all([promiseCartItemFeedback]).then(responses => {
                const feedback = responses[0];
                if (feedback && feedback.FeedbackID) {
                    res.send({ success: true, message: 'Thank you, you have successfully submitted a feedback.', feedback });
                } else {
                    res.send({ success: false, message: '' });
                }
            })
        } else res.send({ success: false, message: '' });
    });
});

module.exports = purchaseRouter;
