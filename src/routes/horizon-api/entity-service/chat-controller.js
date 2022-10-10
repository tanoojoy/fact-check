import { getServiceAddress } from '../../../public/js/common';
import { microservices } from '../../../horizon-settings';
import axios from 'axios';

export const getChatsByParams = ({
    userId = '',
    chatId = '',
    isInitiator = null,
    incomingCoId = '',
    outgoingCoId = '',
    page = 0,
    size = 15
}) => {
    const params = {
        user_id: userId,
        chat_id: chatId,
        is_initiator: isInitiator,
        incoming_co_id: incomingCoId,
        outgoing_co_id: outgoingCoId,
        page,
        size
    };

    return getServiceAddress(microservices.entity)
        .then(entityServiceAddress => axios.get(`${entityServiceAddress}/api/chat`, { params }))
        .then(res => res.data)
        .catch(console.log);
};

export const postChatParams = ({
    userClarivateId = '',
    twillioChatId = '',
    arcadierUserId = '',
    isInitiator = null,
    incomingCoId = 0,
    outgoingCoId = 0
}) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios
            .post(
                `${entityServiceAddress}/api/chat/connection`,
                {
                    userClarivateId,
                    arcadierUserId,
                    twillioChatId,
                    isInitiator,
                    incomingCoId,
                    outgoingCoId
                }
            )
    );
};

export const increaseChatCounter = (clarivateUserId, rfqId, chatId, type) => {
    return getServiceAddress(microservices.entity)
        .then(entityServiceAddress => axios
            .post(
                `${entityServiceAddress}/api/chat/message-request`,
                {
                    clarivateUserId,
                    rfqId,
                    chatId,
                    type
                }
            )
            .catch(err => err));
};
