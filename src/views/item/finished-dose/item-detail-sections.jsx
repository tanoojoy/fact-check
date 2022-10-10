import React from 'react';
import { productCompanyTypes } from '../../../consts/company-products';
import { getCustomFieldValues } from '../../../utils';
import { ItemInfoBox, ItemInfoTable, ItemInfoTags } from '../common-components';
import { UpstreamSupplySectionLabel } from '../../company/add-edit-product/add-edit-product-main/API/upstream-supply';
import LockSymbol from '../../common/lock-symbol';

export const AvailableDoseForms = ({ customFields = [] }) => {
    const doseForms = customFields.filter(cf => cf.Code.startsWith('doseForms'));
    const data = doseForms.map(doseForm => ({ 'Dose Form': doseForm.Name, Strength: doseForm.Values.join(', ')}));

	return (
        <ItemInfoBox title="Available Dose Forms" colWidth={12}>
            <ItemInfoTable
                columnNames={['Dose Form', 'Strength']}
                data={data}
            />
        </ItemInfoBox>
	);
}

export const BrandNames = ({ customFields = [] }) => {
	const brandNames = getCustomFieldValues(customFields, 'tradeNames');

	return (
        <ItemInfoTags 
            title='Brand Names'
            colWidth={12}
            data={brandNames.map(brand => ({ name: brand }))}
        />
	);
}

export const CountriesLaunched = ({ customFields = [], itemID  }) => {
    const countries = getCustomFieldValues(customFields, 'launchCountries');
    const title = (
        <>
            Launched in Countries
            <a 
                className="pull-right"
                target='_blank' href={itemID ? `/generics/product/${itemID}/launches&packprices` : '/generics/'}
                rel='noreferrer'
            >
                Discover Pack Prices &nbsp;
                <i className="icon icon-linker-gray" />
            </a>
        </>
    );

	return (
        <ItemInfoTags 
            title={title}
            colWidth={12}
            data={countries.map(country => ({ name: country }))}
        />
	);
}

export const AssociatedCompanies = ({ customFields = [], itemViewType = '' }) => {
    let title = '';
    let companies = [];
    if (itemViewType === productCompanyTypes.PRODUCT_COMPANY_MANUFACTURER) {
        title = 'Associated Dose Marketers';
        companies = getCustomFieldValues(customFields, 'marketerCompanies');
    } else if (itemViewType === productCompanyTypes.PRODUCT_COMPANY_MARKETER) {
        title = 'Associated Dose Manufacturers';
        companies = getCustomFieldValues(customFields, 'manufacturerCompanies');
    }

    const data = companies.map(company => ({
        Name: <span className="blue-names">{company.name}</span>,
        'Country / Territory': company.country || '-',
        City: company.city || '-',
    }));

    return (
        <ItemInfoBox title={title} colWidth={12}>
            <ItemInfoTable
                columnNames={['Name', 'Country / Territory', 'City']}
                data={data}
            />
        </ItemInfoBox>
	);
}


export const UpstreamSupply = ({ customFields = [] }) => {

    const data = [];

    return (
        <>
            <UpstreamSupplySectionLabel />
            <div className="single-row-fix">
                <ItemInfoTags title='Manufacturer of API' colWidth={12} data={data} />
                <ItemInfoTags title='Manufacturer of Inactive Ingredients' colWidth={12} data={data} />
                <ItemInfoTags title='Included Inactive Ingredients' colWidth={12} data={data} />
            </div>
        </>
    );
}
