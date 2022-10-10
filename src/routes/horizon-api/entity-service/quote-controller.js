import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

module.exports = {
    getAllQuotes: (clarivateUserId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress =>
            axios({
                url: `${entityServiceAddress}/api/quote`,
                params: { clarivateUserId }
            }));
    },
    createQuote: (request) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress =>
            axios.post(`${entityServiceAddress}/api/quote`, { ...request }));
    },
    updateQuote: (clarivateUserId, quoteId, request) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress =>
            axios.put(`${entityServiceAddress}/api/quote`, { ...request }, { params: { clarivateUserId, quoteId } }));
    },
    getQuoteDetails: (clarivateUserId, quoteId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress =>
            axios({
                url: `${entityServiceAddress}/api/quote/${quoteId}`,
                params: { clarivateUserId }
            }));
    }
};
