import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const getConnections = (req, limit = 10, offset = 0) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/connection`,
        params: { limit, offset }
    }));
};

export const getConnectionsDetailsByCompanyProduct = (req, companyId, productId, limit = 10, offset = 0) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/connection/company/${companyId}/product/${productId}`,
        params: { limit, offset }
    }));
};

export const getConnectionsByCompany = (companyId, limit = 1000, offset = 0) => {
    return getServiceAddress(microservices.entity)
        .then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/connection/company-profile/${companyId}`,
            params: { limit, offset }
        })
            .then(response => response.data)
            .catch(console.log));
};

export const getConnectionsByProduct = (req, productId, limit = 10, offset = 0) => {
    return getServiceAddress(microservices.entity)
        .then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/connection/product/${productId}`,
            params: { limit, offset }
        })
            .then(response => response.data)
            .catch(console.log));
};

export const createProduct = (userId, productInfo) => {
    return getServiceAddress((microservices.entity))
        .then(entityServiceAddress =>
            axios(`${entityServiceAddress}/api/connection/company-profile/product`, {
                headers: {
                    'content-type': 'application/json'
                },
                method: 'post',
                data: productInfo
            }))
        .then(res => res.data)
        .catch(console.log);
};

export const updateProduct = (userId, productInfo) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/connection?clarivateUserId=${userId}`, {
            headers: {
                'content-type': 'application/json'
            },
            method: 'put',
            data: productInfo
        })).then(res => res.data).catch(err => console.log(err));
};

export const getCompanySources = (companyId, customLimit = null) => getServiceAddress(microservices.entity).then(entityServiceAddress => {
    const RECORDS_LIMIT = 1000;
    const limit = customLimit !== null ? customLimit : RECORDS_LIMIT;
    return axios.get(`${entityServiceAddress}/api/connection/company/${companyId}/sources?limit=${limit}`).then(({ data }) => data);
});

export const getAddedProductCompanies = (addedDate = new Date(+0).toISOString()) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/connection/updatedProductCompanies?addedDate=${addedDate}`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'get'
    }));
};

export const getUpdatedProducts = (updatedDate = new Date(+0).toISOString()) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/connection/updatedProducts?updateDat=${updatedDate}`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'get'
    }));
};
