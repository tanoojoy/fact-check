import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

const getCompanyId = (req, id) => {
    let companyId;
    if (id) {
        companyId = id;
    } else {
        companyId = req.user ? req.user.companyId : null;
    }
    return companyId;
};

// id - specific companyId, not related with current user
export const getCompanyById = (req, id) => {
    const companyId = getCompanyId(req, id);
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/company/${companyId}`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'get'
    }));
};

export const updateCompany = (req) => {
    const companyInfo = req.body;
    const { ID: userId } = req?.user;

    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/company?clarivateUserId=${userId}`, {
            headers: {
                'content-type': 'application/json'
            },
            method: 'put',
            data: companyInfo
        })).then(res => res.data).catch(err => console.log(err));
};

export const getCompaniesByIds = (ids = [], short = false) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios.get(`${entityServiceAddress}/api/company?ids=${ids.join()}&short=${short}`))
        .then(res => res.data)
        .catch(err => console.log(err));
};

export const getCompanyInfoSources = (companyId) => getServiceAddress(microservices.entity).then(entityServiceAddress => {
    return axios.get(`${entityServiceAddress}/api/company/${companyId}/sources`)
        .then(({ data }) => data)
        .catch(console.log);
});

export const getUpdatedCompanies = (updatedDate = new Date(+0).toISOString()) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/company/updatedCompanies?updatedDate=${updatedDate}`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'get'
    }));
};