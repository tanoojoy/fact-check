import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const addAction = (clarivateUserId, action, affectedUsers) => {
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .post(
                `${authServiceAddress}/api/user-limitation`,
                {
                    action,
                    affectedUsers,
                    clarivateUserId
                }
            )
            .catch(err => err));
};

export const clearAction = () => {
    return getServiceAddress(microservices.auth)
        .then(authServiceAddress => axios
            .delete(`${authServiceAddress}/api/user-limitation`)
            .then(res => res.data)
            .catch(err => err));
};
