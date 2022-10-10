'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    channel: null,
    channelId: null,
    chatDetail: null,
    offer: null,
    isItemDisabled: false,
    invoiceNo: null,
    paymentTerms: null, // for quotation
    availability: null, // for quotation
    customFields: []
};

function chatReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.SEND_OFFER: {
            return Object.assign({}, state, {
                offer: action.offer
            });
        }
        case actionTypes.UPDATE_OFFER: {
            return Object.assign({}, state, {
                offer: action.offer
            });
        }
        case actionTypes.ADD_CHANNEL_MEMBER: {
            return Object.assign({}, state, {
                chatDetail: action.chatDetail
            });
        }
        default:
            return state;
    }
};

module.exports = {
    chatReducer: chatReducer
}