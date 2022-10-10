'use strict';
var actionTypes = require('./actionTypes');
var EnumCoreModule = require('../public/js/enum-core');
const Moment = require('moment');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function searchOrder(filters) {
    return function (dispatch, getState) {
        let keyword = getState().orderReducer.keyword;
        let suppliers = getState().orderReducer.selectedSuppliers;
        let status = getState().orderReducer.selectedOrderStatuses;
        let date = getState().orderReducer.selectedDates;
        if (!filters.supplier) {
            filters.supplier = suppliers;
        }
        if (!filters.status) {
            filters.status = status;
        }
        if (filters.status.includes('Shipped')){
            filters.status = filters.status.replace('Shipped','Delivered')
        }
       
        if (!filters.keyword) {
            filters.keyword = keyword;
            if (!filters.keyword) {
                filters.keyword = $("#keywords").val();
            }
        }
        if (!filters.startDate) {
            filters.startDate = date.StartDate;
            filters.endDate = date.EndDate;
        }
        if (!filters.pageNumber) {
            //should go to page1 for changing of pageSize
            filters.pageNumber = 1;
        }

        $.ajax({
            url: '/merchants/order/history/search',
            type: 'GET',
            data: {
                keyword: filters.keyword,
                startDate: filters.startDate,
                endDate: filters.endDate,
                supplier: filters.supplier,
                status: filters.status,
                pageNumber: 1,
                pageSize: filters.pageSize

            },
            success: function (history) {
                return dispatch({
                    type: actionTypes.FETCH_ORDERS,
                    history: history,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}



function goToPage(pageNo) {
    return function (dispatch, getState) {
        let keyword = getState().orderReducer.keyword;
        let pageSize = getState().orderReducer.history.PageSize;
        let suppliers = getState().orderReducer.selectedSuppliers;
        let status = getState().orderReducer.selectedOrderStatuses;
        let date = getState().orderReducer.selectedDates;

        let startDate = "";
        let endDate = "";
        if (date) {
            startDate = date.StartDate;
            endDate = date.EndDate;
        }

        if (!keyword) {
            keyword = $("#keywords").val();
        }

        $.ajax({
            url: '/merchants/order/history/search',
            type: 'GET',
            data: {
                keyword: keyword,
                pageNumber: pageNo,
                pageSize: pageSize,
                supplier: suppliers,
                startDate: startDate,
                endDate: endDate,
                status: status
            },
            success: function (history) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    history: history
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function selectUnselectOrder(id, isSelect) {
    return function (dispatch, getState) {
        let selectedOrders = [];

        if (isSelect === true) {
            selectedOrders = getState().orderReducer.selectedOrders.concat(id);
        } else {
            const current = getState().orderReducer.selectedOrders;

            current.map(function (currentId) {
                if (currentId !== id) {
                    selectedOrders.push(currentId);
                }
            });
        }

        return dispatch({
            type: actionTypes.SELECT_UNSELECT_ORDER,
            selectedOrders: selectedOrders,
        });
    };
}

function updateSelectedOrderStatus(status) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_ORDER_STATUS,
            selectedOrderStatuses: status
        });
    };
}

function updateSelectedSuppliers(suppliers) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_SUPPLIERS,
            selectedSuppliers: suppliers
        });
    };
}

function updateSelectedDates(date) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_DATES_PO,
            selectedDates: {
                StartDate: date.StartDate,
                EndDate: date.EndDate
            }
        });
    };
}

function updateKeyword(keyword) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_SELECTED_WORD_PO,
            keyword: keyword
        });
    };
}


function updateHistoryOrdersB2B(id, status) {
    return function (dispatch, getState) {
        let history = getState().orderReducer.history;
        let idsToUpdate = [];

        let request = {
            invoices: [],
            orderId: id,
            status: status
        }

        if (typeof id !== 'undefined') {
            idsToUpdate.push(id);
          //  request.status = status;
        } else {
            idsToUpdate = selectedOrders;
        }

        history.Records.map(function (invoice) {
            if (invoice.Orders) {
                invoice.Orders.map(function (order) {
                        if (idsToUpdate.includes(order.ID)) {
                            request.invoices.push(invoice.InvoiceNo);
                        }
                });
            }
        });

        $.ajax({
            url: '/merchants/order/detail/updateStatusb2b',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                if (result) {
                    if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
                        history.Records.map(function (order) {
                            if (order.ID === id) {
                                order.CartItemDetails.map(function (cartItem) {
                                    let tempStatus = {
                                        Name: request.status,
                                        Type: 'Order'
                                    };
                                    cartItem.Statuses.push(tempStatus);
                                });
                            }
                        });
                    } else {
                        history.Records.map(function (invoice) {
                            if (invoice.Orders) {
                                invoice.Orders.map(function (order) {
                                    if (order.ID === id) {
                                        order.CartItemDetails.map(function (cartItem) {
                                            let tempStatus = {
                                                Name: request.status,
                                                Type: 'Order'
                                            };
                                            cartItem.Statuses.push(tempStatus);
                                        });
                                    }
                                });
                            }
                        });
                    }

                    var theDispatch = dispatch({
                        type: actionTypes.UPDATE_HISTORY_ORDERS,
                        history: history,
                        selectedFulfillmentStatuses: [],
                        selectedOrderStatus: '',
                        selectedDeliveryTypeName: '',
                        isShowChangeStatus: false,
                        isShowSuccessMessage: true,
                        theInvoices: request.invoices,
                        theStatus: request.status
                    });

                    return theDispatch;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });

    }
}
function setToDatetime(toDate, duration, durationUnit) {
    var array = durationUnit.trim().split(' ');
    if (array.length > 1) {
        duration = duration * array[0];
    }

    if (durationUnit.toLowerCase().includes("minute")) {
        toDate.add(duration, 'minutes');
    } else if (durationUnit.toLowerCase().includes("hour")) {
        toDate.add(duration, 'hours');
    } else if (durationUnit.toLowerCase().includes("day")) {
        toDate.add(duration, 'days');
    } else if (durationUnit.toLowerCase().includes("week")) {
        toDate.add(duration, 'weeks');
    } else if (durationUnit.toLowerCase().includes("month")) {
        toDate.add(duration, 'months');
    } else if (durationUnit.toLowerCase().includes("night")) {
        toDate.add(duration, 'days');
    }
    return toDate;
}
function onUpdateBookingSlot(bookDate,bookTime) {

    return function (dispatch, getState) {

        let detail = getState().orderReducer.detail;
        let cartItemDetails = getState().orderReducer.detail.Orders[0].CartItemDetails;
       
        let duration = cartItemDetails[0].BookingSlot.Duration;
        let durationUnit = cartItemDetails[0].BookingSlot.DurationUnit;
        let timeZoneID = cartItemDetails[0].BookingSlot.TimeZoneID;
        let timeZoneOffset = cartItemDetails[0].BookingSlot.TimeZoneOffset;
        var fromDate = Moment(bookDate + ' ' +bookTime, 'MM/DD/YYYY hh:mm A');
        var toDate = Moment(bookDate + ' ' + bookTime, 'MM/DD/YYYY hh:mm A');
        toDate = setToDatetime(toDate, duration, durationUnit);

        let request = {
            ID: cartItemDetails[0].ID,
            ItemDetailID: cartItemDetails[0].ItemDetail.ID,
            Quantity: cartItemDetails[0].Quantity,
            Notes: cartItemDetails[0].Notes,
            BookingSlot: {
                Duration : duration,
                DurationUnit : durationUnit,
                FromDateTime: fromDate.toDate().getTime() / 1000,
                ToDateTime: toDate.toDate().getTime() / 1000,
                TimeZoneID : timeZoneID,
                TimeZoneOffset : timeZoneOffset
            }
        };

        $.ajax({
            url: '/merchants/order/detail/updateBooking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                detail.Orders[0].CartItemDetails[0].BookingSlot.FromDateTime = fromDate.toDate().getTime() / 1000;
                detail.Orders[0].CartItemDetails[0].BookingSlot.ToDateTime = toDate.toDate().getTime() / 1000;
                return dispatch({
                    type: actionTypes.UPDATE_BOOKING_SLOT,
                    detail: detail,
                    isShowSuccessMessage:true
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateHistoryOrders(id, status) {
    return function (dispatch, getState) {
        let history = getState().orderReducer.history;
        let selectedOrders = getState().orderReducer.selectedOrders;
        let orderStatus = getState().orderReducer.selectedOrderStatus;
        let idsToUpdate = [];

        let request = {
            invoices: [],
            status: status,
            decrementStock: true
        };

        if (typeof id !== 'undefined') {
            idsToUpdate.push(id);
            request.status = status;
        } else {
            idsToUpdate = selectedOrders;
        }

        history.Records.map(function (invoice) {
            if (invoice.Orders) {
                invoice.Orders.map(function (order) {
                    if (order && order.CartItemDetails) {
                        if (process.env.TEMPLATE == 'variants_level') {
                            if (idsToUpdate.includes(order.ID)) {
                                request.invoices.push(invoice.InvoiceNo);
                            }
                        } else {
                            order.CartItemDetails.map(function (cartItem) {
                                if (idsToUpdate.includes(cartItem.ID)) {
                                    request.invoices.push(invoice.InvoiceNo);
                                }
                            });
                        }
                    }
                });
            }                 
        });

        $.ajax({
            url: '/merchants/order/history/updateStatus',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                if (typeof message !== 'undefined' && message.Result === true) {

                    history.Records.map(function (invoice) {
                        invoice.Orders.map(function (order) {
                            if (order && order.CartItemDetails) {
                                if (process.env.TEMPLATE == 'variants_level') {
                                    if (idsToUpdate.includes(order.ID)) {
                                        order.CartItemDetails.map(function (cartItem) {
                                            let tempStatus = {
                                                Name: request.status,
                                                Type: 'Fulfilment'
                                            }
                                            cartItem.Statuses.push(tempStatus);
                                        });
                                    }
                                } else {
                                    order.CartItemDetails.map(function (cartItem) {
                                        if (idsToUpdate.includes(cartItem.ID)) {
                                            let tempStatus = {
                                                Name: request.status,
                                                Type: 'Fulfilment'
                                            }
                                            cartItem.Statuses.push(tempStatus);
                                        }
                                    });
                                }
                            }
                        })
                    });

                    //update payment status

                    var theDispatch = dispatch({
                        type: actionTypes.UPDATE_HISTORY_ORDERS,
                        history: history,
                        selectedFulfillmentStatuses: [],
                        selectedOrderStatus: '',
                        selectedDeliveryTypeName: '',
                        isShowChangeStatus: false,
                        isShowSuccessMessage: true,
                        theInvoices: request.invoices,
                        theStatus: request.status
                    });

                    return theDispatch;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function showHideChangeStatus(isShow) {
    return function (dispatch, getState) {
        if (isShow) {
            const invoices = getState().orderReducer.history.Records;
            const selectedOrders = getState().orderReducer.selectedOrders;

            let withDelivery = false;
            let withPickup = false;
            let statuses = [];
            let deliveryTypeName = '';

            invoices.map(function (invoice) {
                invoice.Orders.map(function (order) {
                    if (order && order.CartItemDetails) {
                        if (process.env.TEMPLATE == 'bespoke') {
                            if (selectedOrders.includes(order.ID)) {
                                order.CartItemDetails.map(function (cartItem) {
                                    let cartItemType = cartItem.CartItemType;
                                    if (!cartItemType) {
                                        if (order.CustomFields) {
                                            const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];
                                            const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                                            cartItemType = customFieldValue.DeliveryType;
                                        }
                                    }

                                    if (cartItemType === 'delivery') {
                                        withDelivery = true;
                                    } else if (cartItemType === 'pickup') {
                                        withPickup = true;
                                    }
                                });
                            }
                        } else {
                            order.CartItemDetails.map(function (cartItem) {
                                if (selectedOrders.includes(cartItem.ID)) {
                                    let cartItemType = cartItem.CartItemType;
                                    if (!cartItemType) {
                                        if (order.CustomFields) {
                                            const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];
                                            const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                                            cartItemType = customFieldValue.DeliveryType;
                                        }
                                    }

                                    if (cartItemType === 'delivery') {
                                        withDelivery = true;
                                    } else if (cartItemType === 'pickup') {
                                        withPickup = true;
                                    }
                                }
                            });
                        }
                    }
                });
            });
            if (withDelivery && withPickup) {
                statuses = process.env.COMMON_FULFILLMENT_STATUSES.split(',');
                deliveryTypeName = 'Delivery and Pick-Up';
            } else if (withDelivery) {
                statuses = process.env.DELIVERY_FULFILLMENT_STATUSES_b2b.split(',');
                deliveryTypeName = 'Delivery';
            } else if (withPickup) {
                statuses = process.env.PICKUP_FULFILLMENT_STATUSES_b2b.split(',');
                deliveryTypeName = 'Pick-Up';
            }

            return dispatch({
                type: actionTypes.SHOW_HIDE_CHANGE_STATUS,
                selectedFulfillmentStatuses: statuses,
                selectedOrderStatus: statuses[0],
                selectedDeliveryTypeName: deliveryTypeName,
                isShowChangeStatus: true,
                isShowSuccessMessage: false
            })
        } else {
            return dispatch({
                type: actionTypes.SHOW_HIDE_CHANGE_STATUS,
                selectedFulfillmentStatuses: [],
                selectedOrderStatus: '',
                selectedDeliveryTypeName: '',
                isShowChangeStatus: false,
                isShowSuccessMessage: false
            })
        }
    };
}

function showHideSuccessMessage(isShow) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
            isShowSuccessMessage: isShow
        });
    };
}

function updateCheckoutSelectedDeliveryAddress(orderID, addressID) {
    return function (dispatch, getState) {
        let request = {
            orderID: orderID,
            addressID: addressID
        };

        $.ajax({
            url: '/checkout/updateCheckoutSelectedDeliveryAddress',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                return dispatch({
                    type: actionTypes.UPDATE_CHECKOUT_SELECTED_DELIVERY_ADDRESS
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function updateInvoicePaymentStatus(options, callback) {

    return function (dispatch, getState) {

        let request = {
            invoiceNo: options.invoiceNo,
            status: options.status
        };

        $.ajax({
            url: '/merchants/order/detail/updateStatus',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                if (typeof message !== 'undefined' && message.Result === true) {

                    $.ajax({
                        url: '/merchants/order/detail/updateTransactionInvoiceStatus',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            fulfilmentStatus: '',
                            paymentStatus: 'Paid',
                            invoiceNo: options.invoiceNo
                        }),
                        success: function (message) {

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });

                    callback()

                    return dispatch({
                        type: "PaymentUpdate"
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function updateOrderStatusb2binDetails(status) {
    return function (dispatch, getState) {
        let detail = getState().orderReducer.detail;
        let orderId = "";
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            orderId = detail.ID;
        } else {
            orderId = detail.Orders[0].ID;
        }
        let request = {
            orderId: orderId,
            invoiceNo: getState().orderReducer.detail.InvoiceNo,
            status: status
        };

        $.ajax({
            url: '/merchants/order/detail/updateStatusb2b',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (data) {
                if (data) {

                    if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
                        $.ajax({
                            url: '/merchants/order/detail/updateTransactionInvoiceStatus',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                fulfilmentStatus: '',
                                paymentStatus: 'Paid',
                                invoiceNo: request.invoiceNo
                            }),
                            success: function (message) {

                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                    }

                    if (detail.Orders) {
                        detail.Orders.map(function (order) {
                            order.CartItemDetails.map(function (cartItem) {
                                let tempStatus = {
                                    Name: request.status,
                                    Type: 'Order'
                                };
                                cartItem.Statuses.push(tempStatus);
                            });
                        });
                    } else {
                        //b2b
                        detail.CartItemDetails.map(function (cartItem) {
                            let tempStatus = {
                                Name: request.status,
                                Type: 'Order'
                            };
                            cartItem.Statuses.push(tempStatus);
                        });
                    }


                    return dispatch({
                        type: actionTypes.UPDATE_DETAIL_ORDER,
                        detail: detail,
                        isShowSuccessMessage: true
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}


function updateDetailOrder(status) {
    return function (dispatch, getState) {
        let detail = getState().orderReducer.detail;

        let request = {
            invoiceNo: detail.InvoiceNo,
            status: status,
            orderId: detail.Orders[0].ID
        };

        $.ajax({
            url: '/merchants/order/detail/updateStatus',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (message) {
                if (typeof message !== 'undefined' && message.Result === true) {

                    $.ajax({
                        url: '/merchants/order/detail/updateTransactionInvoiceStatus',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            fulfilmentStatus: '',
                            paymentStatus: status === 'Cancelled' ? 'Cancelled': 'Paid',
                            invoiceNo: request.invoiceNo
                        }),
                        success: function (message) {
                            const order = message.Orders[0];
                            return dispatch({
                                type: actionTypes.UPDATE_DETAIL_ORDER_PAYMENT_STATUS,
                                paymentStatus: order.PaymentStatus,
                                isShowSuccessMessage: true
                            });
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });

                    if (detail.Orders) {
                        detail.Orders.map(function (order) {
                            order.CartItemDetails.map(function (cartItem) {
                                var d = new Date();
                                let tempStatus = {
                                    Name: request.status,
                                    Type: 'Fulfilment',
                                    CreatedDateTime: d.toISOString()
                                };
                                cartItem.Statuses.push(tempStatus);
                            });
                        });
                    } else {
                        //b2b
                        detail.CartItemDetails.map(function (cartItem) {
                            let tempStatus = {
                                Name: request.status,
                                Type: 'Fulfilment'
                            };
                            cartItem.Statuses.push(tempStatus);
                        });
                    }

                    return dispatch({
                        type: actionTypes.UPDATE_DETAIL_ORDER,
                        detail: detail,
                        isShowSuccessMessage: true
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function revertPayment(isRefund, cartItemID) {
    return function (dispatch, getState) {
        let detail = Object.assign({}, getState().orderReducer.detail);
        let orderID, paymentStatuses, status;
        let paymentStatus = "";
        detail.Orders.map(function (order) {
            order.CartItemDetails.map(function (cartItem) {
                if (cartItem.ID === cartItemID) {
                    orderID = order.ID;
                    paymentStatuses = cartItem.Statuses.filter(s => s.Type === 'Payment' && s.Name !== 'Refunded');
                }
            });
            order.PaymentDetails.map(function (payment) {
                paymentStatus = payment.Status;
            });
        });

        if (isRefund) {
            status = 'Refunded';
        } else {
            if (paymentStatuses.length > 0) {
                status = paymentStatuses[paymentStatuses.length - 1].Name;
                if (paymentStatus && paymentStatus.toLowerCase() === "success") {
                    paymentStatus = "Paid";
                }
            }
            if (!status) {
                if (paymentStatus && paymentStatus.toLowerCase() === "success") {
                    paymentStatus = "Paid";

                } else {
                    if (paymentStatus) {
                        status = paymentStatus;
                    } else {
                        status = "Waiting For Payment";
                    }
                }

            }

        }

        let request = {
            id: orderID,
            balance: null,
            fulfilmentStatus: null,
            paymentStatus: status
        };

        $.ajax({
            url: '/merchants/order/detail/revertPayment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {
                detail.Orders.map(function (order) {
                    order.CartItemDetails.map(function (cartItem) {
                        if (cartItem.ID === cartItemID) {
                            order.PaymentStatus = status;
                            return dispatch({
                                type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
                                isShowSuccessMessage: true
                            });
                        }
                    })
                });

                return dispatch({
                    type: actionTypes.REVERT_ORDER_PAYMENT,
                    detail: detail
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}
function revertPaymentOrderList(isRefund, cartItemID) {
    return function (dispatch, getState) {
        let orderList = Object.assign({}, getState().orderReducer.history);
        let orderID, paymentStatuses, status;
        let paymentStatus = "";
        orderList.Records.map(function (list) {
            list.Orders.map(function (order) {
                order.CartItemDetails.map(function (cartItem) {
                    if (cartItem.ID === cartItemID) {
                        orderID = order.ID;
                        paymentStatuses = cartItem.Statuses.filter(s => s.Type === 'Payment' && s.Name !== 'Refunded');
                    }
                });
                order.PaymentDetails.map(function (payment) {
                    paymentStatus = payment.Status;
                });
            });

        });
        if (isRefund) {
            status = 'Refunded';
        } else {
            if (paymentStatuses.length > 0) {
                status = paymentStatuses[paymentStatuses.length - 1].Name;
                if (paymentStatus && paymentStatus.toLowerCase() === "success") {
                    paymentStatus = "Paid";
                }
            }
            if (!status) {
                if (paymentStatus && paymentStatus.toLowerCase() === "success") {
                    paymentStatus = "Paid";

                }  else {
                    if (paymentStatus) {
                        status = paymentStatus;
                    } else {
                        status = "Waiting For Payment";
                    }
                }

            }

        }

        let request = {
            id: orderID,
            balance: null,
            fulfilmentStatus: null,
            paymentStatus: status
        };

        $.ajax({
            url: '/merchants/order/detail/revertPayment',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (result) {

                orderList.Records.map(function (list) {
                    list.Orders.map(function (order) {
                        order.CartItemDetails.map(function (cartItem) {
                            if (cartItem.ID === cartItemID) {
                                orderID = order.ID;
                                order.PaymentStatus = status;
                                return dispatch({
                                    type: actionTypes.SHOW_HIDE_SUCCESS_MESSAGE,
                                    isShowSuccessMessage: true
                                });
                            }
                        });
                    });

                });
                return dispatch({
                    type: actionTypes.REVERT_ORDER_PAYMENT,
                    detail: orderList
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}
module.exports = {
    searchOrder: searchOrder,
    goToPage: goToPage,
    selectUnselectOrder: selectUnselectOrder,
    updateSelectedSuppliers: updateSelectedSuppliers,
    updateSelectedOrderStatus: updateSelectedOrderStatus,
    updateSelectedDates: updateSelectedDates,
    updateKeyword: updateKeyword,
    updateHistoryOrders: updateHistoryOrders,
    updateHistoryOrdersB2B: updateHistoryOrdersB2B,
    showHideChangeStatus: showHideChangeStatus,
    showHideSuccessMessage: showHideSuccessMessage,
    updateDetailOrder: updateDetailOrder,
    revertPayment: revertPayment,
    onUpdateBookingSlot: onUpdateBookingSlot,
    revertPaymentOrderList: revertPaymentOrderList,
    updateCheckoutSelectedDeliveryAddress: updateCheckoutSelectedDeliveryAddress,
    updateInvoicePaymentStatus: updateInvoicePaymentStatus,
    updateOrderStatusb2binDetails: updateOrderStatusb2binDetails
}