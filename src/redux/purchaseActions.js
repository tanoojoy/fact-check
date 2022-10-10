'use strict';
var actionTypes = require('./actionTypes');
const prefix  = require('../public/js/common.js').getAppPrefix();
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function searchPurchase(filters) {
    return function (dispatch, getState) {
        let keyword = getState().purchaseReducer.keyword;
        let suppliers = getState().purchaseReducer.selectedSuppliers;
        let status = getState().purchaseReducer.selectedOrderStatuses;
        let date = getState().purchaseReducer.selectedDates;
        if (!filters.supplier) {
            filters.supplier = suppliers;
        }
        if (!filters.status) {
            filters.status = status;
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
            url: prefix+'/purchase/history/search',
            type: 'GET',
            data: {
                keyword: filters.keyword,
                startDate: filters.startDate,
                endDate: filters.endDate,
                supplier: filters.supplier,
                status:filters.status,
                pageNumber: 1,
                pageSize: filters.pageSize

            },
            success: function (history) {
                return dispatch({
                    type: actionTypes.FETCH_PURCHASES,
                    history: history
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNumber, filters) {
    return function (dispatch, getState) {
        let keyword = getState().purchaseReducer.keyword;
        let pageSize = getState().purchaseReducer.history.PageSize;
        let suppliers = getState().purchaseReducer.selectedSuppliers;
        let status = getState().purchaseReducer.selectedOrderStatuses;
        let date = getState().purchaseReducer.selectedDates;

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
            url: prefix+'/purchase/history/search',
            type: 'GET',
            data: {
                keyword: keyword,
                pageNumber: pageNumber,
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

function submitFeedbackForCartItem(options, callback) {
    return function (dispatch, getState) {
        const { InvoiceNo, cartId, rating, feedback } = options;
        const info = Object.assign({}, getState().purchaseReducer.detail);
        $.ajax({
            url: prefix+`/purchase/detail/${InvoiceNo}/feedback/${cartId}`,
            type: 'POST',
            data: {
                ItemRating: rating,
                Message: feedback
            },
            success: function (result) {
                if (typeof callback === 'function') callback(result);
                if (info.Orders) {
                    info.Orders.map(order => {
                        order.CartItemDetails.map(cartItem => {
                            if (cartItem.ID == cartId) cartItem.Feedback = result.feedback || null;
                        });
                    })
                } else {
                    //b2b
                        info.CartItemDetails.map(cartItem => {
                            if (cartItem.ID == cartId) cartItem.Feedback = result.feedback || null;
                        });

                }

                return dispatch({
                    type: actionTypes.FETCH_DETAIL,
                    detail: info
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
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

module.exports = {
    searchPurchase: searchPurchase,
    goToPage: goToPage,
    submitFeedbackForCartItem,
    updateSelectedSuppliers: updateSelectedSuppliers,
    updateSelectedOrderStatus: updateSelectedOrderStatus,
    updateSelectedDates: updateSelectedDates,
    updateKeyword: updateKeyword,
}