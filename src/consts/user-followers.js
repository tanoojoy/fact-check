import { getAppPrefix } from '../public/js/common';
import { ColumnSize, ColumnType } from './table';

export const userFollowersMap = new Map([
    ['index', {
        name: '#',
        type: ColumnType.TEXT,
        size: ColumnSize.FIXED56,
        additionalClasses: ['company-settings__table-secondary-value'],
        additionalData: {
            format: (initValue) => ({ value: 0 })
        }
    }],
    ['companyName', {
        name: 'Company Name',
        type: ColumnType.LINK,
        size: ColumnSize.LARGE,
        additionalClasses: ['company-settings__edit-link'],
        additionalData: {
            additionalFields: ['companyId', 'companyName'],
            format: (initialValue, [companyId, companyName]) => {
                return {
                    link: `${getAppPrefix()}/company/${companyId}`,
                    target: '_blank',
                    value: companyName
                };
            }
        }
    }]
]);
