import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const cgiAuthenticate = (req) => {
    const { cgiToken, userId } = req.body;
    const config = {
        params: {
            clarivateUserId: userId
        },
        headers: {
            Authorization: `Bearer ${cgiToken}`
        }
    };
    return getServiceAddress(microservices.auth).then(authServiceAddress =>
        axios.post(`${authServiceAddress}/api/authenticate`, null, config));
};

export const getSubsAccounts = (companyId) => {
    return getServiceAddress(microservices.auth).then(authServiceAddress => axios({
        url: `${authServiceAddress}/api/company/${companyId}/subs`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'get'
    })
        .then(res => res.data))
        .catch(console.log);
};

export const cgiLogout = (req) => {
    const config = {
        params: {
            clarivateUserId: req.cookies.clarivateUserId
        },
        headers: {
            Authorization: `Bearer ${req.cookies.cgitoken}`
        },
        data: {
            arcadierToken: req.cookies.webapitoken
        }
    };

    return getServiceAddress(microservices.auth).then(authServiceAddress =>
        axios.delete(`${authServiceAddress}/api/logout`, config));
};

export const resolveClarivateUserId = (ids = []) => {
    return getServiceAddress((microservices.auth)).then(authServiceAddress =>
        axios.post(`${authServiceAddress}/api/resolve`, ids)
            .then(res => res.data)
            .catch(err => console.log('resolveClarivateUserId', err))
    );
};

export const getUserInfo = (req) => {
    const cgitoken = req.cookies.cgitoken;
    const clarivateUserId = req.cookies.clarivateUserId;
    return getServiceAddress(microservices.auth).then(authServiceAddress => axios({
        url: `${authServiceAddress}/api/user?clarivateUserId=${clarivateUserId}`,
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${cgitoken}`
        },
        method: 'get'
    }));
};

export const updateUserInfo = (req, data) => {
    const cgitoken = req.cookies.cgitoken;
    const clarivateUserId = req.cookies.clarivateUserId;
    const config = {
        params: {
            clarivateUserId: clarivateUserId
        },
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cgitoken}`
        }
    };
    return getServiceAddress(microservices.auth).then(authServiceAddress =>
        axios.put(`${authServiceAddress}/api/user`, data, config));
};

export const getAnotherUserInfo = (clarivateUserId) => {
    return getServiceAddress(microservices.auth).then(authServiceAddress =>
        axios.get(`${authServiceAddress}/api/user/${clarivateUserId}`));
};

// ToDo: need to use "updateUserInfo"
export const setLinkingFlag = (req, userId) => {
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .put(
                `${authServiceAddress}/api/user?clarivateUserId=${userId}`,
                {
                    flags: {
                        isCompanyAttachRequestSend: true,
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${req.cookies.cgitoken}`
                    }
                }));
};

export const inviteColleagues = (clarivateUserId, colleaguesEmails = [], comment = '') => {
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .post(`${authServiceAddress}/api/inviteColleagues`, {
                clarivateUserId,
                colleaguesEmails,
                comment
            })
            .catch(err => console.log('inviteColleagues', err)));
};

export const shareCompany = (clarivateUserId, emails = [], comment = '', companyId, companyName) => {
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .post(`${authServiceAddress}/api/shareCompany`, {
                clarivateUserId,
                emails,
                comment,
                companyId,
                companyName
            })
            .catch(err => console.log('shareCompanyProfile', err)));
};

export const shareProduct = (clarivateUserId, emails = [], comment = '', companyId, companyName, productName, productLink) =>{
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .post(`${authServiceAddress}/api/shareProduct`, {
                clarivateUserId,
                emails,
                comment,
                companyId,
                companyName,
                productName,
                productLink
            })
            .catch(err => console.log('shareProductProfile', err)));
};