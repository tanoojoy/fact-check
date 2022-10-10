import axios from 'axios';
import { getServiceAddress } from '../../../public/js/common';
import { microservices } from '../../../horizon-settings';

export const subscribe = (userClarivateId, startDate, endDate) => {
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .post(`${authServiceAddress}/subscription`, { userClarivateId, startDate, endDate })
            .catch(err => err)
        );
};
