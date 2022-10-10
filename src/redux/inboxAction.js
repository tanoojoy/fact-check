'use strict';
var actionTypes = require('./actionTypes');
const prefix  = require('../public/js/common.js').getAppPrefix();
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function updateKeyWord(keyword) {
    return function (dispatch) {
        return dispatch({
            type: actionTypes.UPDATE_INBOXSEARCHTEXT,
            keyword: keyword
        });
    }
}

function getDetails(messages, keyword) {
    const msg = [];
    messages.Records.forEach(function (element) {
        if (element.CartItemDetail != null) {
            if (element.CartItemDetail.ItemDetail !== null) {
                msg.push(element)
            }
        }
        else {
                msg.push(element)
        }
    });
    messages.Records = msg;
    messages.TotalRecords = msg.length

    return messages;
}

function searchInbox(keyword) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/inbox/search',
            type: "get",
            data: {
                "keyword": keyword
            },
            success: function (result) {
                const msgs = keyword.length > 0 ? getDetails(result.messages, keyword) : result.messages;
                return dispatch({
                    type: actionTypes.UPDATE_INBOXSEARCHTEXT,
                    messages: msgs,
                    inboxDatas: result.inboxDatas,
                    keyword: keyword
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function goToPage(pageNo, filters) {
    return function (dispatch, getState) {
        const keyword = getState().inboxReducer.keyword;
        $.ajax({
            url: prefix+'/chat/inbox/paging',
            type: "get",
            data: {
                "pageNumber": pageNo,
                "keyword": keyword
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.GO_TO_PAGE,
                    messages: result.messages,
                    inboxDatas: result.inboxDatas
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getUnreadCount() {
    return function (dispatch) {
        $.ajax({
            url: prefix+'/chat/inbox/getUnreadCount',
            type: "GET",
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_UNREAD_COUNT,
                    unreadCount: parseInt(result)
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

const updateUnreadIndicator = () => dispatch => {
    const { UPDATE_UNREAD_INDICATOR } = actionTypes;
    const dispatchUpdateUnreadIndicator = (hasUnreadMessages = false) => dispatch({ type: UPDATE_UNREAD_INDICATOR, hasUnreadMessages });
    $.ajax({
        url: `${prefix}/inbox/getchats`,
        type: "GET",
        success: (chats) => {
            if (chats && chats.username) {
                $.ajax({
                    url: `${prefix}/product-profile/token/${chats.username}`,
                    type: "GET",
                    success: (data) => {
                        if (data && data.token) {
                            Twilio.Chat.Client.create(data.token).then(client => {
                                const chatClient = client;
                                chats.chatIds.forEach(channelName => {
                                    chatClient.getChannelByUniqueName(channelName)
                                    .then(function(channel) {
                                        channel.join().finally(() => {
                                            channel.getUnconsumedMessagesCount().then(res => {
                                                channel.getMessagesCount().then(msgCount => {
                                                    if (res !== 0 && msgCount !== 0 ) {
                                                        return dispatchUpdateUnreadIndicator(true);
                                                    }
                                                })
                                            });
                                        }).catch(() => {});
                                    }).catch(() => dispatchUpdateUnreadIndicator());
                                });
                            }).catch(() => dispatchUpdateUnreadIndicator());
                        } else {
                            return dispatchUpdateUnreadIndicator();
                        }
                    },
                    error: () => dispatchUpdateUnreadIndicator()
                });
            } else {
                return dispatchUpdateUnreadIndicator();
            }
        },
        error: () => dispatchUpdateUnreadIndicator()
    });
}

function getEnquiry(page, size) {
    return function (dispatch, getState) {        
        $.ajax({
            url: prefix+'/chat/inbox/get-enquiries',
            type: "get",
            data: {
                "page": page,
                "size": size
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.FETCH_ENQUIRIES,
                    payload: result.inboxes
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getRequestsQuotes(page, size) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+`/chat/inbox/get-requests-quotes?page=${page}&size=${size}`,
            type: "get",
            success: function (result) {
                dispatch({
                    type: actionTypes.FETCH_MESSAGES,
                    getUserMessages: result.inboxes
                });                
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    updateKeyWord,
    searchInbox: searchInbox,
    goToPage: goToPage,
    getUnreadCount: getUnreadCount,
    updateUnreadIndicator, 
    getEnquiry, 
    getRequestsQuotes
}
