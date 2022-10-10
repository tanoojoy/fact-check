import React from 'react';
import moment from 'moment';
import { getAppPrefix } from '../public/js/common';
import { NoneReported } from '../views/search/results/table-content';
import { ColumnAdditionalType, ColumnSize, ColumnType } from './table';
import { SNOWPLOW_ACTION, SNOWPLOW_CATEGORY } from './snowplow';
import { OtherFilings } from '../views/search/results/result-table';
import { SEARCH_RESULTS_POPOVER } from './popover-content';

export const productCompaniesMap = new Map([
    ['co_name', {
        name: 'Manufacturer',
        type: ColumnType.LINK,
        size: ColumnSize.MEDIUM,
        additionalData: {
            additionalFields: ['co_id', 'api_grp_id', 'subs_count'],
            format: (
                initialValue,
                [companyId, productId, subsCount]
            ) => companyId && productId ? {
                link: `${getAppPrefix()}/product-profile/profile/${companyId}/${productId}`,
                iconSrc: subsCount ? `${getAppPrefix()}/assets/images/common_company_icon.svg` : '',
                popover: SEARCH_RESULTS_POPOVER.MANUFACTURER_ICON,
                analyticsData: {
                    category: SNOWPLOW_CATEGORY.PRODUCT_SEARCH_MANUFACTURER,
                    action: SNOWPLOW_ACTION.QUICK_SEARCH,
                    label: initialValue?.toString()
                }
            } : null
        }
    }],
    ['manufacturing_status', {
        name: 'Manufacturing Status',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM,
        popover: SEARCH_RESULTS_POPOVER.MANUFACTURING_STATUS
    }],
    ['subsidiary_types', {
        name: 'Subsidiary Type',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM,
        additionalData: {
            format: initialValue => ({ value: initialValue?.join(', ') })
        }
    }],
    ['co_cntry', {
        name: 'Country/Territory',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }],
    ['co_city', {
        name: 'City',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL
    }],
    ['reg_filing_list', {
        name: 'API Regulatory Filings',
        type: ColumnType.CHIPS,
        additionalTypes: [ColumnAdditionalType.WITH_TOOLTIP, ColumnAdditionalType.TAG],
        size: ColumnSize.MEDIUM,
        additionalData: {
            format: initialValue => ({
                value: initialValue?.map(({
                    filing,
                    filing_status: filingStatus
                }) => ({
                    value: filing,
                    tooltip: filingStatus
                }))
            })
        }
    }],
    ['gmp_certificates', {
        name: 'GMP Certificates',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }],
    ['rel_grp_name', {
        name: 'Corporate Group Name',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }],
    ['rel_grp_co_city', {
        name: 'Corporate Group Location',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }]
]);

export const doseFormsMap = new Map([
    ['co_name', {
        name: 'Manufacturer',
        type: ColumnType.LINK,
        size: ColumnSize.MEDIUM,
        additionalData: {
            additionalFields: ['co_id', 'api_grp_id', 'subs_count', 'co_type', 'marketer_id'],
            format: (
                initialValue,
                [companyId, productId, subsCount, companyType, marketerId]
            ) => {
                const supplierId = companyId || marketerId;
                return supplierId && productId ? {
                    link: `${getAppPrefix()}/product-profile/${companyType}/${supplierId}/${productId}`,
                    iconSrc: subsCount ? `${getAppPrefix()}/assets/images/common_company_icon.svg` : '',
                    popover: SEARCH_RESULTS_POPOVER.MANUFACTURER_ICON,
                    analyticsData: {
                        category: SNOWPLOW_CATEGORY.PRODUCT_SEARCH_DOSE_FORM,
                        action: SNOWPLOW_ACTION.QUICK_SEARCH,
                        label: initialValue?.toString()
                    }
                } : null;
            }

        }
    }],
    ['co_type', {
        name: 'Manufacturer/Marketer',
        type: ColumnType.LINK,
        size: ColumnSize.MEDIUM,
        additionalData: {
            additionalFields: ['co_id', 'api_grp_id', 'subs_count', 'co_type','marketer_id'],
            format: (
                initialValue,
                [companyId, productId, subsCount, companyType, marketerId]
            ) => {
                const supplierId = companyId || marketerId;
                return supplierId && productId ? {
                    link: `${getAppPrefix()}/product-profile/${companyType}/${supplierId}/${productId}`,
                    iconSrc: subsCount ? `${getAppPrefix()}/assets/images/common_company_icon.svg` : '',
                } : null;
            }
        }
    }],
    ['subsidiary_types', {
        name: 'Subsidiary Type',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM,
        additionalData: {
            format: initialValue => ({ value: initialValue?.join(', ') })
        }
    }],
    ['co_cntry', {
        name: 'Country/Territory',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }],
    ['co_city', {
        name: 'City',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL
    }],
    ['rel_grp_name', {
        name: 'Corporate Group Name',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }]
]);

export const companiesSortFields = {
    co_name: 'co_name.raw',
    rel_grp_name: 'rel_grp_name.raw',
    co_cntry: 'co_cntry',
    co_city: 'co_city',
    rel_grp_co_city: 'rel_grp_co_city'
};

export const companiesMap = new Map([
    ['co_name', {
        name: 'Manufacturer',
        type: ColumnType.LINK,
        size: ColumnSize.MEDIUM,
        additionalData: {
            additionalFields: ['co_id', 'subs_count'],
            format: (
                initialValue,
                [companyId, subsCount]
            ) => companyId ? {
                link: `${getAppPrefix()}/company/${companyId}`,
                iconSrc: subsCount ? `${getAppPrefix()}/assets/images/common_company_icon.svg` : '',
                popover: SEARCH_RESULTS_POPOVER.MANUFACTURER_ICON,
            } : null

        }
    }],
    ['subsidiary_type', {
        name: 'Subsidiary Type',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM,
        additionalData: {
            format: initialValue => ({ value: initialValue?.join(', ') })
        }
    }],
    ['co_cntry', {
        name: 'Country/Territory',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }],
    ['co_city', {
        name: 'City',
        type: ColumnType.TEXT,
        size: ColumnSize.SMALL
    }],
    ['insp_info', {
        name: 'Latest Inspection Dates',
        type: ColumnType.TEXT,
        size: ColumnSize.LARGE,
        additionalTypes: [ColumnAdditionalType.TAG],
        additionalClasses: ['insp_info-freemium'],
        additionalData: {
            additionalFields: ['fda_warng_letter_dt', 'gdufa_fee_paymt_yr', 'fclty_rgstrn_dt'],
            format: (initialValue, [fdaWarningLetterDate, gdufaFeePaymentYear, facilityRegistrationDate]) => ({
                value: prepareInspections(initialValue, fdaWarningLetterDate, gdufaFeePaymentYear, facilityRegistrationDate)
            })
        }
    }],
    ['rel_grp_name', {
        name: 'Corporate Group Name',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }],
    ['rel_grp_co_city', {
        name: 'Corporate Group Location',
        type: ColumnType.TEXT,
        size: ColumnSize.MEDIUM
    }]
]);

function prepareInspections(inspections) {
    const fdaInspectionDate = inspections?.find(inspection => inspection?.agncy_name[0] === 'US FDA')?.insptn_dt;
    const fdaInspectionString =
        <span>
            FDA Inspection: {Array.isArray(fdaInspectionDate) && fdaInspectionDate[0] ? moment.utc(fdaInspectionDate[0]).format('DD-MMM-YYYY') : <NoneReported />}
        </span>;
    const lock = <OtherFilings />;

    return [{ value: fdaInspectionString }, { value: lock }];
}
