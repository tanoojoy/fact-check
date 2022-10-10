'use strict';
var actionTypes = require('./actionTypes');
const prefix  = require('../public/js/common.js').getAppPrefix();

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function sendOffer(offer, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/send-offer',
            type: 'POST',
            data: offer,
            success: function (offer) {
                callback(offer);

                return dispatch({
                    type: actionTypes.SEND_OFFER,
                    offer: offer
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                callback();
            }
        });
    };
}

function declineOffer(offer, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/decline-offer',
            type: 'PUT',
            data: offer,
            success: function (result) {
                let chatDetail = getState().chatReducer.chatDetail;
                chatDetail.Channel.Offer = null;
                callback('<p><span class=\"offer-declined\">Offer has been declined!</span></p>');
                return dispatch({
                    type: actionTypes.UPDATE_OFFER,
                    chatDetail: chatDetail
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getUserChannels(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/get-channels',
            type: 'GET',
            data: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                includes: options.includes
            },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.GET_CHANNELS
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createChannel(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/create-channel',
            type: 'POST',
            data: {
                recipientId: options.recipientId,
                itemId: options.itemId,
                quantity: options.quantity,
                createCartItem: options.createCartItem
            },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.CREATE_CHAT_CHANNEL
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getRecipientAddresses(userId, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/get-recipient-addresses',
            type: 'GET',
            data: {
                recipientId: userId
            },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.GET_ADDRESS
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getOfferByCartItemId(cartItemId, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/get-offer',
            type: 'GET',
            data: { cartItemId: cartItemId },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.GET_OFFER
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function getChatDetails(channelId, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/get-chat-details',
            type: 'GET',
            data: { channelId: channelId },
            success: function (result) {
                callback(result);
                return dispatch({
                    type: ''
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function acceptOffer(options, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/accept-offer',
            type: 'PUT',
            data: options,
            success: function (result) {
                callback(result);
                return dispatch({
                    type: actionTypes.UPDATE_OFFER
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateMemberLastSeenMessage(memberId, messageId) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/chat/update-member-last-seen-message',
            type: 'PUT',
            data: {
                memberId: memberId,
                messageId: messageId
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.SEND_EMAIL
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function addMember(channelId, userId, callback) {
    return function (dispatch, getState) {
        let chatDetail = Object.assign({}, getState().chatReducer.chatDetail);

        $.ajax({
            url: prefix+'/chat/add-channel-member',
            type: 'POST',
            data: {
                channelId: channelId,
                userId: userId
            },
            success: function (result) {
                callback();

                let channelMembers = chatDetail.Channel.Members;
                if (channelMembers) {
                    channelMembers.push(result);
                }

                return dispatch({
                    type: actionTypes.ADD_CHANNEL_MEMBER,
                    chatDetail: chatDetail
                });
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function sendChatMessage(message, callback) {
    return function (dispatch, getState) {
        const options = {
            channelId: getState().chatReducer.channelId,
            message: message
        };

        $.ajax({
            url: prefix+'/chat/send-message',
            type: 'POST',
            data: options,
            success: function (chatMessage) {
                callback(chatMessage);

                return dispatch({
                    type: actionTypes.SEND_CHAT_MESSAGE
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function generateConversationToken(device, userid, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix + '/chat/generate-conversation-token',
            data: {
                device: device,
                identity: userid
            },
            type: 'GET',
            success: function (response) {
                console.log('response', response);
                if (callback) {
                    callback(response);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }    
}

function createChat(userClarivateId, arcadierUserId, twillioChatId, isInitiator, incomingCoId, outgoingCoId) {
    return function (dispatch, getState) {
        console.log('action createChat');
        $.ajax({
            url: prefix + '/chat/createChat',
            data: {
                userClarivateId,
                arcadierUserId,
                twillioChatId,
                isInitiator,
                incomingCoId,
                outgoingCoId
            },
            type: 'POST',
            success: function (response) {
                if (response) {
                    let chatId = response.chat.twillioChatId.split('|');
                    const friendlyName = chatId[0];
                    const sid = chatId[1];
                    window.location = `${prefix}/chat/${friendlyName}?interlocutor=${response.chat.outgoingCoId}&sid=${sid}`;
                }                
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}



function sendSystemMessage(channelName, sid, conversationData, senderName, message, callback) {
    let chatData = null;
    return function (dispatch, getState) {
        $.getJSON(`${prefix}/product-profile/token/${senderName}`, function (chData) {
            chatData = chData;
            let dataToken = null;
            if (sid) {
                dataToken = conversationData;
            }
            else {
                dataToken = chatData;
            }

            var accessManager = new window.Twilio.AccessManager(dataToken.token);
            window.Twilio.Conversations.Client.create(dataToken.token).then(client => {
                client.on("connectionStateChanged", (state) => {
                    if (state === "connected") {
                        client.getConversationByUniqueName(channelName).then(channel => {
                            const modifiedMsg = `${message}|${senderName}`;
                            channel.sendMessage(modifiedMsg);
                            if (callback) {
                                callback();
                            }
                        });
                    }
                    if (state === "disconnected") {

                    }
                    if (state === "denied") {

                    }
                });

                accessManager.on('tokenUpdated', am => {
                    // get new token from AccessManager and pass it to the library instance
                    client.updateToken(am.token);
                });

            });
        });
    }
}

function updateRfqData(rfqData) {
    return function (dispatch) {
        console.log('action createChat');
        $.ajax({
            url: prefix + '/chat/chat-update-rfq/' + rfqData.id,
            data: {
                chatId: rfqData.chatId,
                id: rfqData.id
            },
            type: 'PUT',
            success: function (response) {
                //if (response) {
                //    let chatId = response.chat.twillioChatId.split('|');
                //    const friendlyName = chatId[0];
                //    const sid = chatId[1];
                //    window.location = `${prefix}/chat/${friendlyName}?interlocutor=${response.chat.outgoingCoId}&sid=${sid}`;
                //}
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}

module.exports = {
    sendOffer: sendOffer,
    declineOffer: declineOffer,
    getUserChannels: getUserChannels,
    createChannel: createChannel,
    getRecipientAddresses: getRecipientAddresses,
    getOfferByCartItemId: getOfferByCartItemId,
    acceptOffer: acceptOffer,
    updateMemberLastSeenMessage: updateMemberLastSeenMessage,
    getChatDetails: getChatDetails,
    addMember: addMember,
    sendChatMessage: sendChatMessage, 
    generateConversationToken: generateConversationToken,
    createChat: createChat,
    sendSystemMessage: sendSystemMessage,
    updateRfqData: updateRfqData
}