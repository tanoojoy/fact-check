import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

module.exports = {
    getAllRfq: (req, buyerId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/rfq`,
            params: { buyerId }
        }));
    },
    createRfq: (req, request) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress =>
            axios.post(`${entityServiceAddress}/api/rfq`, { ...request }));
    },
    updateRfq: (req, request, rfqId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress =>
            axios.put(`${entityServiceAddress}/api/rfq/${rfqId}`, { ...request }));
    },
    getRfqById: (rfqId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/rfq/${rfqId}`
        }));
    }
};
