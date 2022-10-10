import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const updateUpstreamSupply = (userId, companyId, productId, upstreamSupply) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios(`${entityServiceAddress}/api/upstream/company/${companyId}/product/${productId}`, {
            headers: {
                'content-type': 'application/json'
            },
            method: 'put',
            data: { clarivateUserId: userId, upstreamSupply }
        }))
        .then(res => res.data)
        .catch(console.log);
};
