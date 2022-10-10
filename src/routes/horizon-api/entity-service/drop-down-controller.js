import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';

module.exports = {
    getCurrenciesInfo: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/currencies_info`
        }));
    },
    getRequiredDocs: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/docs_required`
        }));
    },
    getIncoterms: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/incotems`
        }));
    },
    getCompanyManufacturerCapabilities: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_manufacturer_capabilities`
        }));
    },
    getCompanyOtherServices: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_other_services`
        }));
    },
    getCompanySubsidiaryTypes: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_subsidiary_type`
        }));
    },
    getPredefinedCompanyAlerts: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/predefined_company_alerts`
        }));
    },
    getGmpStatuses: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_product_connection_gmp_statuses`
        }));
    },
    getGmpCertificates: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_product_connection_gmp_authorities`
        }));
    },
    getRegFilingsStatuses: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_product_connection_reg_filings_statuses`
        }));
    },
    getRegFilings: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_product_connection_reg_filings`
        }));
    },
    getManufacturingStatus: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/company_product_connection_manufacturing_status`
        }));
    },
    getCountriesList: () => {
        return getServiceAddress(microservices.entity).then(entityServiceAddress => axios({
            url: `${entityServiceAddress}/api/dropdown/countries_info`
        }));
    }
};
