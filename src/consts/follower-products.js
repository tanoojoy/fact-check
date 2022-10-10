import moment from 'moment';
import { getAppPrefix } from '../public/js/common';
import { ColumnSize, ColumnType } from './table';
import { productCompanyTypes } from './company-products';

export const userFollowersProductsMap = new Map([
    ['index', {
        name: '#',
        type: ColumnType.TEXT,
        size: ColumnSize.FIXED56,
        additionalClasses: ['grey-col'],
        customStyles: {
            width: '50px'
        },
        additionalData: {
            format: (initValue) => ({ value: 0 })
        }
    }],
    ['productName', {
        name: 'Product Name',
        type: ColumnType.LINK,
        size: ColumnSize.SMALL,
        additionalClasses: ['product-name'],
        additionalData: {
            additionalFields: ['companyId', 'productId', 'productName', 'productType'],
            format: (initialValue, [companyId, productId, productName, productType]) => {
                let productLink = '';
                if (productType === productCompanyTypes.PRODUCT_COMPANY_MANUFACTURER) {
                    productLink = `${getAppPrefix()}/product-profile/Manufacturer/${companyId}/${productId}`;
                } else if (productType === productCompanyTypes.PRODUCT_COMPANY_MARKETER) {
                    productLink = `${getAppPrefix()}/product-profile/Marketer/${companyId}/${productId}`;
                }
                else{
                    productLink = `${getAppPrefix()}/product-profile/profile/${companyId}/${productId}`;
                }
                return {
                    link: productLink,
                    value: productName,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                };
            }
        }
    }],
    ['productType', {
        name: 'Product Type',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL,
    }],
    ['companyName', {
        name: 'Company Name',
        type: ColumnType.LINK,
        size: ColumnSize.SMALL,
        additionalClasses: ['product-name'],
        additionalData: {
            additionalFields: ['companyId', 'companyName'],
            format: (initialValue, [companyId, companyName]) => {
                let link = `${getAppPrefix()}/company/${companyId}`;
                return {
                    link: link,
                    value: companyName,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                };
            }
        }
    }],
    ['manufacturingStatus', {
        name: 'Manufacturing Status',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL,
    }],
    ['lastUpdatedDate', {
        name: 'Last Updated Date',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL,
        additionalData: {
            additionalFields: ['lastUpdatedDate'],
            format: (initialValue, [lastUpdatedDate]) => {
                return {
                    value : moment.utc(lastUpdatedDate).format('DD-MMM-YYYY')
                };
            } 
        }
    }],
    ['alerts', {
        name: 'Alerts',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL,
    }],
]);


