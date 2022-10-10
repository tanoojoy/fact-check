'use strict';
var React = require('react');
var reactDom = require('react-dom/server');
var template = require('../../views/layouts/template');
var express = require('express');
var orderRouter = express.Router();
var store = require('../../redux/store');

var OrderHistoryComponent = require('../../views/merchant/order/history/index').OrderHistoryComponent;
var OrderDetailComponent = require('../../views/merchant/order/detail/index').OrderDetailComponent;

var authenticated = require('../../scripts/shared/authenticated');
var authorizedMerchant = require('../../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../../scripts/shared/onboarded-merchant');
var client = require('../../../sdk/client');

var EnumCoreModule = require('../../public/js/enum-core');

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

const { getUserPermissionsOnPage, isAuthorizedToAccessViewPage, isAuthorizedToPerformAction } = require('../../scripts/shared/user-permissions');

const viewOrderHistoryPage = {
    code: 'view-merchant-purchase-orders-api',
    renderSidebar: true
};

const viewOrderDetailPage = {
    code: 'view-merchant-purchase-order-details-api',
    renderSidebar: true
};

orderRouter.get('/history', ...handlers, isAuthorizedToAccessViewPage(viewOrderHistoryPage), function (req, res) {
    let user = req.user;

    if (req.user === null) {
        return;
    }

    var promiseHistory = null;

    //b2b
    if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
        promiseHistory = new Promise((resolve, reject) => {
            let options = {
                userId: user.ID,
                keywords: null,
                pageNumber: 1,
                pageSize: 20,
            }
            client.Orders.getHistoryB2B(options, function (err, result) {
                resolve(result);
            });
        });
    } else {
        //ARC9981
        promiseHistory = new Promise((resolve, reject) => {
            let options = {
                userId: user.ID,
                keyword: '',
                pageNumber: 1,
                pageSize: 20,
                status: 'paid,waiting for payment,acknowledged,refunded,pending,processing'
            }
            client.Orders.getHistory(options, function (err, result) {
                resolve(result);
            });
        });
    }

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
    const promiseBookingDuration = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getBookingDuration(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseHistory, promiseStatus, promiseFulfilmentStatus, promiseBookingDuration]).then((responses) => {

        let history = responses[0];
        const statuses = responses[1];
        const fStatuses = responses[2];
        const bookingDuration = responses[3];
        const appString = 'merchant-order-history';
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
        let bookings = "";

        let statusToPass = [];
        if (statuses && statuses.Records && process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            statuses.Records.forEach(function (status) {

                if (status.Name.toLowerCase() === 'created' ||
                    status.Name.toLowerCase() === 'acknowledged' ||
                    status.Name.toLowerCase() === 'delivered' ||
                    status.Name.toLowerCase() === 'rejected') {
                    statusToPass.push(status);
                }
            });
            statuses.Records = statusToPass;
            statuses.TotalRecords = statusToPass.length;
        }

        if (fStatuses && fStatuses.Records && process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
            fStatuses.Records.map(function (status) {
                if (status.Name.toLowerCase() === 'created') {
                    status.SortOrder = 1;
                }

                if (status.Name.toLowerCase() === 'acknowledged') {
                    status.SortOrder = 2;
                }

                if (status.Name.toLowerCase() === 'shipped') {
                    status.SortOrder = 3;
                }
                if (status.Name.toLowerCase() === 'completed') {
                    status.SortOrder = 4;
                }

                if (status.Name.toLowerCase() === 'ready for consumer collection') {
                    status.SortOrder = 5;
                }

                if (status.Name.toLowerCase() === 'cancelled') {
                    status.SortOrder = 7;
                }

                if (status.Name.toLowerCase() === 'collected') {
                    status.SortOrder = 6;
                }

                if (status.Name.toLowerCase() === 'created' ||
                    status.Name.toLowerCase() === 'ready for consumer collection' ||
                    status.Name.toLowerCase() === 'cancelled' ||
                    status.Name.toLowerCase() === 'collected' ||
                    status.Name.toLowerCase() === 'completed' ||
                    status.Name.toLowerCase() === 'shipped' ||
                    status.Name.toLowerCase() === 'acknowledged') {
                    statusToPass.push(status);
                }

            });
            statusToPass.sort((a, b) => (a.SortOrder > b.SortOrder) ? 1 : -1)
            fStatuses.Records = statusToPass;
            fStatuses.TotalRecords = statusToPass.length;
        }
        //ARC8304
        let suppliers = [];
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            if (history && history.Records) {
                history.Records.forEach(function (data) {
                    if (suppliers) {
                        //remove dups
                        suppliers.map(function (supplier, i) {
                            if (data.ConsumerDetail && supplier.ID === data.ConsumerDetail.ID) {
                                suppliers.splice(i, 1);
                            }
                        });
                        if (data.ConsumerDetail) {
                            suppliers.push(data.ConsumerDetail);
                        }

                    }
                });
            }
        } else {
            if (history && history.Records) {
                history.Records.forEach(function (data) {
                    if (suppliers) {
                        //remove dups
                        suppliers.map(function (supplier, i) {
                            if (data.Orders && data.Orders[0] && data.Orders[0].ConsumerDetail && supplier.ID === data.Orders[0].ConsumerDetail.ID) {
                                suppliers.splice(i, 1);
                            }
                        });
                        if (data.Orders && data.Orders[0] && data.Orders[0].ConsumerDetail) {
                            suppliers.push(data.Orders[0].ConsumerDetail);
                        }

                    }
                });
            }
        }

        getUserPermissionsOnPage(user, 'Purchase Orders', 'Merchant', (pagePermissions) => {
            const s = store.createOrderStore({
                userReducer: {
                    user: user,
                    pagePermissions: pagePermissions
                },
                orderReducer: {
                    history: history,
                    keyword: keyword,
                    selectedOrders: [],
                    selectedFulfillmentStatuses: [],
                    selectedSuppliers: selectedSuppliers,
                    selectedOrderStatuses: selectedOrderStatuses,
                    statuses: process.env.CHECKOUT_FLOW_TYPE === 'b2c' ? fStatuses : statuses,
                    suppliers: suppliers,
                    selectedDates: selectedDates,
                    bookings: bookingDuration
                }
            });

            const reduxState = s.getState();

            let seoTitle = 'Order History';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const app = reactDom.renderToString(<OrderHistoryComponent
                context={context}
                pagePermissions={pagePermissions}
                user={req.user} history={history} selectedOrders={[]}
                selectedFulfillmentStatuses={[]} suppliers={suppliers}
                selectedSuppliers={selectedSuppliers} selectedOrderStatuses={selectedOrderStatuses}
                selectedDates={selectedDates}
                bookingDuration={bookingDuration}
                statuses={statuses} />);
            res.send(template('page-seller purchase-order-history page-sidebar', seoTitle, app, appString, reduxState));
        });
    });
});

orderRouter.get('/detail/orderid/:id', authenticated, isAuthorizedToAccessViewPage(viewOrderDetailPage), function (req, res) {
    let user = req.user;
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
        client.Orders.getHistoryB2B(options, function (err, result) {
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
        let enableReviewAndRating = marketPlaceInfo && marketPlaceInfo.ControlFlags ? marketPlaceInfo.ControlFlags.ReviewAndRating : null;
        const appString = 'merchant-order-detail';
        const context = {};
        let cartIds = [];
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
        let promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));

        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            let feedback = responses[0];
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
            let purchaseDetail = detail.Records[0];

            getUserPermissionsOnPage(user, 'Purchase Order Details', 'Merchant', (pagePermissions) => {
                const s = store.createOrderStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    orderReducer: { detail: purchaseDetail, enableReviewAndRating: enableReviewAndRating },
                    marketplaceReducer: { locationVariantGroupId: req.LocationVariantGroupId }
                });
                const reduxState = s.getState();

                let seoTitle = 'Purchase Order';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const app = reactDom.renderToString(<OrderDetailComponent pagePermissions={pagePermissions} context={context} categories={[]} user={req.user} detail={purchaseDetail} enableReviewAndRating={enableReviewAndRating} locationVariantGroupId={req.LocationVariantGroupId} />);
                res.send(template('page-seller page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
            });
        });
    });
});

orderRouter.get('/detail/:id', ...handlers, isAuthorizedToAccessViewPage(viewOrderDetailPage), function (req, res) {
    let user = req.user;

    const options = {
        userId: user.ID,
        invoiceNo: req.params.id
    }

    if (req.params.id === 'undefined') {
        return;
    }

    var promiseDetail = new Promise((resolve, reject) => {
        client.Orders.getHistoryDetail(options, function (err, result) {
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
    const promiseBookingDuration = new Promise((resolve, reject) => {
        const options = {
            version: 'v2'
        };
        client.Orders.getBookingDuration(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseDetail, promiseMarketplace, promiseBookingDuration]).then((responses) => {
        const detail = responses[0];
        let marketPlaceInfo = responses[1];
        let bookingDuration = responses[2];
 
        let enableReviewAndRating = marketPlaceInfo && marketPlaceInfo.ControlFlags ? marketPlaceInfo.ControlFlags.ReviewAndRating : null;
        const appString = 'merchant-order-detail';
        const context = {};
        let cartIds = [];
    
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
        let promiseCartItemsFeedback = Promise.all(cartIds.map(c => promiseCartItemFeedback(c)));

        Promise.all([promiseCartItemsFeedback]).then((responses) => {
            let feedback = responses[0];
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

            getUserPermissionsOnPage(user, 'Purchase Order Details', 'Merchant', (pagePermissions) => {
                const s = store.createOrderStore({
                    userReducer: {
                        user: user,
                        pagePermissions: pagePermissions
                    },
                    orderReducer: { detail: detail, enableReviewAndRating: enableReviewAndRating, bookings: bookingDuration },
                    marketplaceReducer: { locationVariantGroupId: req.LocationVariantGroupId }
                });

                const reduxState = s.getState();

                let seoTitle = 'Purchase Order';
                if (req.SeoTitle) {
                    seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
                }

                const app = reactDom.renderToString(<OrderDetailComponent context={context}
                    pagePermissions={pagePermissions}
                    categories={[]} user={req.user} detail={detail} enableReviewAndRating={enableReviewAndRating}
                    locationVariantGroupId={req.LocationVariantGroupId}
                    bookingDuration={bookingDuration} />);
                res.send(template('page-seller page-purchase-order-details page-sidebar', seoTitle, app, appString, reduxState));
            });
        });
    });
});

orderRouter.get('/history/search', ...handlers, isAuthorizedToAccessViewPage(viewOrderHistoryPage), function (req, res) {
    const options = {
        userId: req.user.ID,
        keyword: req.query['keyword'],
        pageNumber: req.query['pageNumber'],
        pageSize: req.query['pageSize'],
        startDate: req.query['startDate'],
        endDate: req.query['endDate'],
        supplier: req.query['supplier'],
        status: req.query['status']
    };
    var promiseHistory = null;
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

            client.Orders.getHistoryB2B(options, function (err, result) {
                resolve(result);
            });
        });
    } else {
        // TODO: align all api parameter names to prevent confusion
        //ARC9981
        options.cartItemFulfilmentStatuses = options.status;
        options.status = 'paid,waiting for payment,acknowledged,refunded,pending,processing';

        promiseHistory = new Promise((resolve, reject) => {
            client.Orders.getHistory(options, function (err, history) {
                resolve(history);
            });
        });
    }

    Promise.all([promiseHistory]).then((responses) => {
        const history = responses[0];
        res.send(history);
    });
});

orderRouter.post('/history/updateStatus', ...handlers, isAuthorizedToPerformAction('edit-merchant-purchase-orders-api'), function (req, res) {
    const options = {
        userId: req.user.ID,
        invoices: req.body['invoices'],
        status: req.body['status'],
        decrementStock: req.body['decrementStock'] ? req.body['decrementStock']: null
    };

    var promiseUpdate = new Promise((resolve, reject) => {
        client.Orders.updateHistoryOrderStatus(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateStatus', ...handlers, function (req, res) {
    const options = {
        userId: req.user.ID,
        invoiceNo: req.body['invoiceNo'],
        status: req.body['status']
    };
    var promiseUpdate = new Promise((resolve, reject) => {
        client.Orders.updateOrderStatus(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateTransactionInvoiceStatus', ...handlers, function (req, res) {
    const options = {
        invoiceNo: req.body['invoiceNo'],
        fulfilmentStatus: req.body['fulfilmentStatus'],
        paymentStatus: req.body['paymentStatus']
    };

    var promiseUpdate = new Promise((resolve, reject) => {
        client.Transactions.updateTransactionInvoiceStatus(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateStatusb2b', ...handlers, function (req, res) {
    const options = {
        orderId: req.body['orderId'],
        status: req.body['status']
    };
    var promiseUpdate = new Promise((resolve, reject) => {
        client.Orders.updateOrderStatusb2b(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUpdate]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/revertPayment', ...handlers, function (req, res) {
    let user = req.user;
    let body = req.body;

    const options = {
        orderId: req.body['id'],
        balance: req.body['balance'],
        fulfilmentStatus: req.body['fulfilmentStatus'],
        paymentStatus: req.body['paymentStatus'],
    };

    var promiseRefund = new Promise((resolve, reject) => {
        client.Orders.revertPayment(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRefund]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/detail/updateBooking', ...handlers, function (req, res) {
 
    let user = req.user;
    let body = req.body;

    const options = {
        userId: req.user['ID'],
        cartitemid: req.body['ID'],
        Notes: req.body['Notes'],
        Quantity: req.body['Quantity'],
        ItemDetail: req.body['ItemDetail'],
        BookingSlot: req.body['BookingSlot'],
        ItemDetailID: req.body['ItemDetailID'],
    };
    var promiseBooking = new Promise((resolve, reject) => {
        client.Orders.updateBooking(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseBooking]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

orderRouter.post('/edm/sendStatusEdm', ...handlers, function (req, res) {
    const user = req.user;
    const invoices = req.body['invoices'];
    const status = req.body['status'];
    const orderId = req.body['orderId'];

    if (EnumCoreModule.GetEdmOrderStatuses().indexOf(status) > -1) {
        let template = {};
        if (status === 'Acknowledged') {
            template = EnumCoreModule.GetEdmTemplates().OrderAcknowledged;
        } else if (status === 'Delivered') {
            template = EnumCoreModule.GetEdmTemplates().OrderShipped;
        } else if (status === 'Ready For Consumer Collection') {
            template = EnumCoreModule.GetEdmTemplates().OrderPickup;
        }

        var promiseMarketplace = new Promise((resolve, reject) => {
            const options = {
                includes: 'BusinessProfile'
            };

            client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseMarketplace]).then((responses) => {
            const marketplace = responses[0];
            let promiseDetails = [];
            let promiseEmails = [];
            if (invoices && process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
                invoices.forEach(function (invoice) {
                    promiseDetails.push(new Promise((resolve, reject) => {
                        const options = {
                            userId: user.ID,
                            invoiceNo: invoice
                        }

                        client.Orders.getHistoryDetail(options, function (err, result) {
                            resolve(result);
                        });
                    }));
                });
            }

            if (orderId && process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                //b2b
                promiseDetails.push(new Promise((resolve, reject) => {
                    let options = {
                        userId: user.ID,
                        keyword: orderId,
                        pageNumber: 1,
                        pageSize: 20,
                    }
                    client.Orders.getHistoryB2B(options, function (err, result) {
                        resolve(result);
                    });
                }));
            }

            Promise.all(promiseDetails).then((responses) => {
                if (orderId && process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                    //b2b
                    var response = responses[0];
                    const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
                    const dataParams = EnumCoreModule.MapInvoiceToEdmParameters(response.Records[0], req.protocol, req.get('host'));
                    const params = marketplaceParams.concat(dataParams);
                    const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, template), params);
                    promiseEmails.push(new Promise((resolve, reject) => {
                        const options = {
                            from: edm.From,
                            to: edm.To,
                            subject: edm.Subject,
                            body: edm.Body
                        };

                        client.Emails.sendEdm(options, function (err, result) {
                            resolve(result);
                        });
                    }));

                    Promise.all(promiseEmails).then((responses) => {
                        res.send(true);
                    })
                } else {
                    responses.forEach(function (invoice) {
                        const marketplaceParams = EnumCoreModule.MapMarketplaceToEdmParameters(marketplace);
                        const invoiceParams = EnumCoreModule.MapInvoiceToEdmParameters(invoice, req.protocol, req.get('host'));
                        const params = marketplaceParams.concat(invoiceParams);
                        const edm = EnumCoreModule.MapEdmParametersToTemplate(Object.assign({}, template), params);

                        promiseEmails.push(new Promise((resolve, reject) => {
                            const options = {
                                from: edm.From,
                                to: edm.To,
                                subject: edm.Subject,
                                body: edm.Body
                            };

                            client.Emails.sendEdm(options, function (err, result) {
                                resolve(result);
                            });
                        }));
                    });
                }


                Promise.all(promiseEmails).then((responses) => {
                    res.send(true);
                })
            });
        });
    } else {
        res.send(true);
    }
});

module.exports = orderRouter;