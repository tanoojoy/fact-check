import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

export const getDealsByUserId = (buyerId = null, page = 0, size = 15) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/deals/buyerId/${buyerId}?page=${page}&size=${size}`
    }));
};

export const getDealsByCompanyId = (companyId = '', page = 0, size = 15) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
        url: `${entityServiceAddress}/api/deals/company/${companyId}?page=${page}&size=${size}`
    }))
        .then((res) => res.data)
        .catch(console.log);
};

export const getDealsCountByBuyer = (userId = null, from = new Date(+0).toISOString(), to = new Date().toISOString()) => {
    return getServiceAddress(microservices.entity).then(entityServiceAddress =>
        axios.post(`${entityServiceAddress}/api/deals/count`, {
            clarivateUserId: [userId],
            from,
            to
        })
            .then((res) => res.data)
            .catch(console.log)
    );
};
