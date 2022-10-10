import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const addFollower = (userId = null, followCompanyId = null) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/follower`, {
            method: 'post',
            data: {
                userId,
                followCompanyId
            }
        })).catch(console.log);
};

export const removeFollower = (userId = null, followCompanyId = null) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/follower`, {
            method: 'delete',
            data: {
                userId,
                followCompanyId
            }
        })).catch(console.log);
};

export const getFollowerList = (userId, companyId = null, page = 0, size = 15) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/followers_list`, {
            method: 'get',
            params: {
                user_id: userId,
                company_id: companyId,
                page,
                size
            }
        })).then(res => res.data).catch(console.log);
};

export const getFollowers = (userId, companyId = null, page = 0, size = 100) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/followers`, {
            method: 'get',
            params: {
                user_id: userId,
                company_id: companyId,
                page,
                size
            }
        })).then(res => res.data).catch(console.log);
};

export const getProductFollowerList = (userId, page = 0, size = 10) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/follow-products`, {
            method: 'get',
            params: {
                user_id: userId,
                page,
                size
            }
        })).then(res => res.data).catch(err => console.log(err));
};
