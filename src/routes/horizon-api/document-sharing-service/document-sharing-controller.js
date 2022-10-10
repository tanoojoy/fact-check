import { getServiceAddress } from '../../../public/js/common';
import { microservices } from '../../../horizon-settings';
import axios from 'axios';
import { Readable } from 'stream';
const FormData = require('form-data');

export const uploadFile = (companyId, file) => {
    const formData = new FormData();
    const fileStream = Readable.from(file?.buffer);
    formData.append('file', fileStream, file.originalname);
    return getServiceAddress(microservices.document).then(docsSharingServiceAddress => axios({
        url: `${docsSharingServiceAddress}/api/docs/company/${companyId}`,
        headers: {
            ...formData.getHeaders()
        },
        method: 'post',
        data: formData
    })
        .then(res => res.data));
};

export const getFilesList = (companyId) => {
    return getServiceAddress(microservices.document).then(docsSharingServiceAddress => axios({
        url: `${docsSharingServiceAddress}/api/docs/company/${companyId}/list_files`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'get'
    })
        .then(res => res.data));
};

export const deleteFile = (companyId, filename) => {
    return getServiceAddress(microservices.document).then(docsSharingServiceAddress => axios({
        url: `${docsSharingServiceAddress}/api/docs/company/${companyId}?fileName=${filename}`,
        headers: {
            'content-type': 'application/json'
        },
        method: 'delete'
    })
        .then(res => res.data));
};
