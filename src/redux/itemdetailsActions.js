'use strict';
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}
var EnumCoreModule = require('../public/js/enum-core');
var CommonModule = require('../public/js/common.js');
const prefix  = require('../public/js/common.js').getAppPrefix();
/* BESPOKE API */

function updateSubTotal(quantity, price) {
    let priceValues = {
        subtotal: price * parseFloat(quantity),
        quantity
    }
    return function(dispatch) {
        return dispatch({
            type: actionTypes.UPDATE_ITEMDETAILQUANTITY,
            priceValues,
        });
    }
}



/* END OF BESPOKE API */

function updateQuantity(number, price, bulkDiscounts) {
    let priceValues = {
        originalPrice: price * number,
        bulkPrice: price * number,
        quantity: number,
        discount: 0
    }
    let breakNow = false;
    return function (dispatch) {
        //Computation for Bulk Discounts
        function inRange(x, min, max) {
            return ((x - min) * (x - max) <= 0);
        }

        if (bulkDiscounts != null) {
            bulkDiscounts.forEach(function (bulk) {
                if (breakNow == true) {
                    return false;
                }
                let bulkComputation = (price * number) - (number * bulk.Discount);
                if (bulk.isPercentage) {
                    bulkComputation = (price * number) - ((price * number) * bulk.Discount) / 100;
                }
                if (bulk.RangeStart !== undefined) {
                    if (inRange(number, parseInt(bulk.RangeStart), parseInt(bulk.RangeEnd)) == true) {
                        priceValues = {
                            originalPrice: price * number,
                            bulkPrice: bulkComputation,
                            quantity: number,
                            discount: (price * number) - bulkComputation
                        }
                        breakNow = true;
                    }
                } else {
                    //OnwardPrice
                    if (bulk.OnwardPrice !== undefined) {
                        if (number >= parseInt(bulk.OnwardPrice)) {
                            priceValues = {
                                originalPrice: price * number,
                                bulkPrice: bulkComputation,
                                quantity: number,
                                discount: (price * number) - bulkComputation
                            }
                            breakNow = true;
                        }
                    }
                }
            })
        }
        return dispatch({
            type: actionTypes.UPDATE_ITEMDETAILQUANTITY,
            priceValues: priceValues
        });
    }
}

function addOrEditCart(cartItemId, quantity, discount, itemId, force, isComparisonOnly, successCallback, failedCallback) {
    return function (dispatch, getState) {
        let item = getState().itemsReducer.items;
        const countryCode = getState().itemsReducer.countryCode;

        $.ajax({
            url: prefix+'/items/getItemDetails',
            type: 'GET',
            data: {
                itemId: item.ID
            },
            success: function (result) {
                item.IsVisibleToCustomer = result.IsVisibleToCustomer;
                item.IsAvailable = result.IsAvailable;
                item.Active = result.Active;

                if (item.IsVisibleToCustomer && item.IsAvailable && item.Active) {
                    let url = prefix+'/items/addCart';
                    let method = 'POST';

                    if (cartItemId) {
                        url = prefix+'/items/editCart';
                        method = 'PUT';
                    }
                    let guestUserID = "";
                    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                        guestUserID = CommonModule.getCookie("guestUserID");
                    }

                    $.ajax({
                        url: url,
                        type: method,
                        data: {
                            cartItemId: cartItemId,
                            quantity: quantity,
                            discount: discount,
                            itemId: itemId,
                            force: force,
                            guestUserID: guestUserID,
                            forComparison: isComparisonOnly
                        },
                        success: function (result) {
                            if (result.AccessToken && result.AccessToken.UserId) {
                                CommonModule.createCookie("guestUserID", result.AccessToken.UserId, 1);
                            }
                            if (item.HasChildItems && item.ChildItems) {
                                item.ChildItems.forEach(function (child) {
                                    const condition = process.env.PRICING_TYPE === 'variants_level' ? child.ID === itemId : child.Tags[0].toLowerCase() === countryCode.toLowerCase();
                                    if (condition) {
                                        if (child.StockLimited === true && !isComparisonOnly) {
                                            child.StockQuantity = parseInt(result.ItemDetail.StockQuantity) - parseInt(result.Quantity);
                                        }
                                    }
                                });
                            } else {
                                if (!isComparisonOnly) {
                                    item.StockQuantity = parseInt(item.StockQuantity) - parseInt(result.Quantity);
                                }
                            }

                            if (typeof successCallback === 'function') {
                                successCallback(result);
                            }

                            return dispatch({
                                type: actionTypes.ADD_EDIT_CART,
                                items: Object.assign({}, item)
                            });
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });
                } else {
                    if (typeof failedCallback === 'function') {
                        failedCallback(EnumCoreModule.GetToastStr().Error.FAILED_ADD_DISABLED_ITEM_TO_COMPARISON);
                    }

                    return dispatch({
                        type: actionTypes.ADD_EDIT_CART,
                        items: Object.assign({}, item)
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

function selectedFeedBack(feedbackId) {
    return function (dispatch, getState) {
        console.log("getstate: ", getState());
        let feedback = getState().itemsReducer.feedback;
        if (feedback) {
            feedback.ItemReviews.map(function (review) {
                if (review.FeedbackID === feedbackId) {
                    review.isSelected = true;
                } else {
                    review.isSelected = false;
                }
            });
        }
        return dispatch({
            type: actionTypes.FEEDBACK_REPLY_SELECTED,
            feedback: Object.assign({}, feedback)
        });
    }
}
function addReplyFeedBack(feedbackId) {
    return function (dispatch, getState) {
        let feedback = getState().itemsReducer.feedback;
        let user = getState().userReducer.user;
        let message = getState().itemsReducer.message;
        if (feedback) {
            feedback.ItemReviews.map(function (review) {
                if (review.isSelected === true) {
                    $.ajax({
                        url: prefix+'/items/addReplyFeedback',
                        type: 'post',
                        data: {
                            merchantId: user.ID,
                            feedbackId: feedbackId,
                            message: message
                        },
                        success: function (data) {

                            if (data === true) {
                                review.Replies.push(
                                    {
                                        CreatedDateTime: Math.floor(Date.now() / 1000),
                                        Message: message,
                                        User: user
                                    }
                                );
                                return dispatch({
                                    type: actionTypes.FEEDBACK_REPLY_SELECTED,
                                    feedback: Object.assign({}, feedback)
                                });
                            }

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });
                }
            });
        }
    }
}

function updateMessage(message) {
    return function (dispatch, getState) {
        return dispatch({
            type: actionTypes.UPDATE_MESSAGE,
            message: message
        });
    }
}

function createRFQ(rfq, callback) {
    return function(dispatch, getState) {
        $.ajax({
            url: prefix + '/product-profile/create-rfq',
            type: 'POST',
            data: rfq,
            success: function (result) {
                const rfqData = result.rfq
                const chatIdSplit = rfqData.chatId.split('|');
                const chatUrl = prefix + '/chat/chatRFQ/' + rfqData.id + '/' + chatIdSplit[0];
                if (callback) {
                    callback(rfqData, chatUrl);
                }
                else {
                    window.location.href = chatUrl;
                }                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });        
    }
}

function updateRFQ(rfqID, rfq, callback) {
    console.log('rfq', rfq);
    return function (dispatch, getState) {
        $.ajax({
            url: prefix + `/product-profile/update-rfq/${rfqID}`,
            type: 'PUT',
            data: rfq,
            success: function (response) {
                if (response.result) {
                    const chatUrl = prefix + '/chat/chatRFQ/' + rfqID + '/' + rfq.chatId;
                    if (callback) {
                        callback(chatUrl);
                    }
                    else {
                        window.location.href = chatUrl;
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    updateQuantity: updateQuantity,
    addOrEditCart: addOrEditCart,
    updateSubTotal: updateSubTotal,
    selectedFeedBack: selectedFeedBack,
    addReplyFeedBack: addReplyFeedBack,
    updateMessage: updateMessage, 
    createRFQ: createRFQ,
    updateRFQ: updateRFQ
}
