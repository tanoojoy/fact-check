import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

const getProductId = (req, id) => {
    let productId;
    if (id) {
        productId = id;
    } else {
        // TODO make dynamic
        productId = 11030;
    }

    return productId;
};

module.exports = {
    getProducts: (req, limit = 10, offset = 0) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/product`,
            params: { limit, offset }
        }));
    },
    getProductById: (req, productId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/product/${productId}`
        }));
    },
    getCgiProductData: (req, id) => {
        const productId = getProductId(req, id);

        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/product/${productId}`,
            headers: {
                'content-type': 'application/json'
            },
            method: 'get'
        }));
    },
    getManufacturerProductById: (req, manufacturerId, productId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/finished-dose/api/${productId}/manufacturer/${manufacturerId}`
        }));
    },
    getMarketerProductById: (req, marketerId, productId) => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/finished-dose/api/${productId}/marketer/${marketerId}`
        }));
    },
};
