import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const attachUserToCompany = (req, userId, companyId) => {
    return getServiceAddress(microservices.auth)
        .then(searchServiceAddress => axios
            .post(
                `${searchServiceAddress}/api/user/${userId}/company/${companyId}`,
                undefined,
                {
                    headers: {
                        Authorization: `Bearer ${req.cookies.cgitoken}`
                    }
                }));
};

export const attachUserToUnknownCompany = (userId, unknownCompanyData) => {
    return getServiceAddress(microservices.auth)
        .then(searchServiceAddress => axios
            .post(
                `${searchServiceAddress}/api/user/${userId}/company-request`,
                unknownCompanyData
            ));
};
