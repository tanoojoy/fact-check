'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    inbox: {},
    pageNumber: '',
    pageSize: '',
    filters: {},
    totalRecords: '',
    keyword: '',
    unreadCount: 0,
    inboxDatas: [],
    hasUnreadMessages: false,
    messages: {}, 
    enquiries: {}

};

function inboxReducer(state = initialState, action) {

    switch (action.type) {
        case actionTypes.FETCH_MESSAGES: {
            return Object.assign({}, state, {
                ...state,
                messages: action.getUserMessages
            })
        }
        case actionTypes.FETCH_ENQUIRIES: {
            return Object.assign({}, state, {
                ...state,
                enquiries: action.payload
            })
        }
        case actionTypes.UPDATE_INBOXSEARCHTEXT: {
            return Object.assign({}, state, {
                ...state,
                messages: action.messages,
                inboxDatas: action.inboxDatas,
                keyword: action.keyword
            })
        }
        case actionTypes.GO_TO_PAGE: {
            return Object.assign({}, state, {
                ...state,
                messages: action.messages,
                inboxDatas: action.inboxDatas
            })
        }
        case actionTypes.GET_UNREAD_COUNT: {
            return Object.assign({}, state, {
                unreadCount: action.unreadCount
            });
        }
        case actionTypes.UPDATE_UNREAD_INDICATOR: {
            return Object.assign({}, state, {
                hasUnreadMessages: action.hasUnreadMessages
            });
        }
        default:
            return state;
    }
};

module.exports = {
    inboxReducer: inboxReducer
}