import { getAppPrefix } from '../public/js/common';
import { ColumnSize, ColumnType } from './table';
import { productTabs } from './product-tabs';

export const companyProductsMap = new Map([
    ['index', {
        name: '#',
        type: ColumnType.TEXT,
        size: ColumnSize.FIXED56,
        additionalClasses: ['company-settings__table-secondary-value'],
        additionalData: {
            format: (initValue) => ({ value: 0 })
        }
    }],
    ['name', {
        name: 'Product Name',
        type: ColumnType.TEXT,
        size: ColumnSize.LARGE
    }],
    ['type', {
        name: 'Category',
        type: ColumnType.TEXT,
        size: ColumnSize.EXTRA_SMALL,
        additionalClasses: ['company-settings__table-secondary-value'],
        additionalData: {
            format: (initValue) => {
                const getDisplayValue = () => {
                    switch (initValue) {
                    case productTabs.API.productType:
                        return initValue.toUpperCase();
                    case productTabs.INTERMEDIATE.productType:
                        return `${initValue} / Reagent`;
                    default:
                        return initValue;
                    }
                };
                return { value: getDisplayValue() };
            }
        }
    }],
    ['updateDate', {
        name: 'Last Update Date',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL,
        additionalClasses: ['company-settings__table-secondary-value'],
        additionalData: {
            format: (initValue) => {
                return { value: initValue === 'Invalid date' ? 'Not Available' : initValue };
            }
        }
    }],
    ['edit', {
        name: 'Action',
        type: ColumnType.LINK,
        size: ColumnSize.EXTRA_SMALL,
        additionalClasses: (item) => {
            return (item?.type === productTabs.INACTIVE_INGREDIENTS.productType || item?.type === productTabs.INTERMEDIATE.productType)
                ? ['company-settings__edit-link__disabled']
                : ['company-settings__edit-link'];
        },
        additionalData: {
            additionalFields: ['id', 'type'],
            format: (
                initialValue,
                [id, type]
            ) => {
                const link = (type === productTabs.INACTIVE_INGREDIENTS.productType || type === productTabs.INTERMEDIATE.productType)
                    ? null
                    : `${getAppPrefix()}/company/product/${id}/settings`;
                return {
                    link,
                    icon: 'none fas fa-cog',
                    value: 'Edit'
                };
            }
        }
    }]
]);

export const productCompanyTypes = {
    PRODUCT_COMPANY_MANUFACTURER: 'PRODUCT_COMPANY_MANUFACTURER',
    PRODUCT_COMPANY_MARKETER: 'PRODUCT_COMPANY_MARKETER'
};

export const NO_ALERTS_VALUE = 'No Alerts Reported';

export const alertFields = ['alert1', 'alert2'];
