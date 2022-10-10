import axios from 'axios';
import actionTypes from './actionTypes';
import { getAppPrefix } from '../public/js/common';
const prefix = getAppPrefix();
import { chatConstants } from '../consts/chat-constants';
import { quoteStatuses } from '../consts/rfq-quote-statuses';

 
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function sendSystemMessage(message, chatId, redirectUrl){
    const systemName = chatConstants.systemName;
    return axios.get(`${getAppPrefix()}/product-profile/token/${systemName}`).then(data => {
        data = data.data;
        return Twilio.Chat.Client.create(data.token).then(client => {
            const chatClient = client;
            return chatClient.getChannelByUniqueName(chatId)
                .then(function(channel) {
                    channel.join().finally(() => {
                        return channel.sendMessage(message).then(()=>{
                            window.location.href = redirectUrl;
                        });
                    }).catch(() => {});
                }).catch(() => {});
        }).catch(error => {
            console.error(error);
        });
    })
}

function filterQuotations(filters) {
    return function(dispatch, getState) {
        $.ajax({
            url: prefix + '/quotation/filter',
            type: 'GET',
            data: filters,
            success: function(result) {
                return dispatch({
                    type: actionTypes.GET_QUOTATIONS,
                    quotationList: result,
                    filters: filters
                });
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNumber) {
    return function(dispatch, getState) {
        const filters = getState().quotationReducer.filters;
        $.ajax({
            url: prefix + '/quotation/paging',
            type: 'GET',
            data: Object.assign({ pageNumber: pageNumber }, filters),
            success: function(result) {
                return dispatch({
                    type: actionTypes.GET_QUOTATIONS,
                    quotationList: result,
                    filters: filters
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function cancelQuotation(quote) {
    return function(dispatch, getState) {
        const chatId = getState().quotationReducer.rfqDetails.chatId;
        axios
            .post(`${prefix}/cgi-quotation/cancel`, { quote, chatId })
            .then((response) => {
                const redirectUrl = response.data || prefix + '/';
                sendSystemMessage(chatConstants.RFQDeclinedMsg, chatId, redirectUrl);
            }, (error) => {
                console.log(error);
            });
    };
}

function createQuotation(quote, callback) {
    return function(dispatch, getState) {
        const chatId = getState().quotationReducer.rfqDetails.chatId;
        console.log('getState().quotationReducer.rfqDetails', getState().quotationReducer.rfqDetails);
        const buyerId = getState().quotationReducer.rfqDetails.buyerId;
        
        $.ajax({
            url: prefix + '/cgi-quotation/create',
            type: 'POST',
            data: {
                quote: JSON.stringify(quote),
                chatId,
                buyerId
            },
            success: function(result) {
                console.log('result createQuotation action', result);
                const chatUrl = `${prefix}/chat/chatRFQ/${quote.rfqId}/${chatId}`;
                if (result) {
                    if (callback) {
                        callback(chatUrl);
                    }
                    else {
                        window.location.href = chatUrl;
                    }                    
                }                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateQuotation(quote, callback) {
    return function(dispatch, getState) {
        const chatId = getState().quotationReducer.rfqDetails.chatId;
        const cgiCompanyId = getState().quotationReducer.rfqDetails.cgiCompanyId;
        
        $.ajax({
            url: prefix + '/cgi-quotation/update',
            type: 'POST',
            data: {
                quote: JSON.stringify(quote),
                chatId,
                cgiCompanyId
            },
            success: function (response) {
                if (response && quote && quote.OfferDetails) {
                    const [offerDetail] = quote.OfferDetails;
                    const [otherInfo] = offerDetail.CustomFields;
                    const url = `${prefix}/chat/chatRFQ/${otherInfo.rfqId}/${chatId}`;
                    if (callback) {
                        callback(url);
                    }
                    else {
                        window.location.href = url;
                    }                    
                }                
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function generateInvoiceByCartItem(cartItemIDs, callback) {
    return function(dispatch, getState) {
        const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
        const userID = getState().userReducer.user.ID;
        const quotationDetail = getState().quotationReducer.quotationDetail;

        if (isRequisition) { return dispatch({ type: '' }); }

        const defaultPaymentTerms = [];
        if (quotationDetail && quotationDetail.PaymentTerm) {
            defaultPaymentTerms.push({
                merchantId: quotationDetail.PaymentTerm.UserID,
                paymentTermId: quotationDetail.PaymentTerm.ID
            });
        }

        $.ajax({
            url: prefix + '/cart/generateInvoiceByCartIDs',
            type: 'POST',
            data: {
                userId: userID,
                cartId: cartItemIDs,
                defaultPaymentTerms: JSON.stringify(defaultPaymentTerms)
            },
            success: function(data) {
                callback(data.InvoiceNo);
                return dispatch({ type: '' });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function generateOrderByCartItem(cartItemIDs, callback) {
    return function(dispatch, getState) {
        const isRequisition = process.env.CHECKOUT_FLOW_TYPE == 'b2b';
        const userID = getState().userReducer.user.ID;
        const quotationDetail = getState().quotationReducer.quotationDetail;

        const defaultPaymentTerms = [];
        if (quotationDetail && quotationDetail.PaymentTerm) {
            defaultPaymentTerms.push({
                merchantId: quotationDetail.PaymentTerm.UserID,
                paymentTermId: quotationDetail.PaymentTerm.ID
            });
        }

        if (!isRequisition) { return dispatch({ type: '' }); }

        $.ajax({
            url: prefix + '/cart/generateOrderByCartIDs',
            type: 'POST',
            data: {
                userId: userID,
                cartId: cartItemIDs,
                defaultPaymentTerms: JSON.stringify(defaultPaymentTerms)
            },
            success: function(data) {
                if (data.length > 0) {
                    callback(data[0].ID);
                }

                return dispatch({ type: '' });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    filterQuotations: filterQuotations,
    goToPage: goToPage,
    generateInvoiceByCartItem: generateInvoiceByCartItem,
    generateOrderByCartItem: generateOrderByCartItem,

    createQuotation,
    cancelQuotation,
    updateQuotation
};
