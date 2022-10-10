import { SEARCH_RESULTS_POPOVER } from './popover-content';

export const FilterLabels = {
	VERIFIED_MANUFACTURER: 'Verified Manufacturer',
	COMPANY_TYPES: 'Marketer or Manufacturer',
	API_MANUFACTURING_STATUS: 'API Manufacturing Status',
	CONTRACT_MANUFACTURER: 'Contract Manufacturer',
	CORPORATE_API_RATING: 'Corporate API Rating',
	MANUFACTURER_LOCATION: 'Manufacturer Location',
	DOSE_FORMS: 'Dose Forms',
}


export const FilterTypes = {
	CHECKBOX: 'checkbox',
	DROPDOWN: 'dropdown'
}

export const FiltersMap = new Map([
	[FilterLabels.VERIFIED_MANUFACTURER, {
		filterKey: 'verified_flag',
		popoverData: SEARCH_RESULTS_POPOVER.VERIFIED_MANUFACTURER_FILTER,
		type: FilterTypes.CHECKBOX,
	}],
	[FilterLabels.COMPANY_TYPES, {
		filterKey: 'co_type',
		type: FilterTypes.CHECKBOX,
	}],
	[FilterLabels.CONTRACT_MANUFACTURER, {
		filterKey: 'subsidiary_types',
		type: FilterTypes.CHECKBOX,
		values: [
			{
				label: 'Contract Manufacturers Only',
				value: 'CMO/CDMO'
			}
		]
	}],
	[FilterLabels.API_MANUFACTURING_STATUS, {
		filterKey: 'manufacturing_status',
		type: FilterTypes.CHECKBOX,
		popoverData: SEARCH_RESULTS_POPOVER.MANUFACTURING_STATUS_FILTER,
	}],
	[FilterLabels.CORPORATE_API_RATING, {
		filterKey: 'corporate_api_ratg',
		type: FilterTypes.DROPDOWN,
		popoverData: SEARCH_RESULTS_POPOVER.API_RATING_FILTER,
	}],
	[FilterLabels.MANUFACTURER_LOCATION, {
		filterKey: 'co_cntry',
		type: FilterTypes.DROPDOWN,
	}],
	[FilterLabels.DOSE_FORMS, {
		filterKey: 'dose_forms',
		type: FilterTypes.DROPDOWN,
	}],
]);

export const ApiSearchFilters = [
	FilterLabels.VERIFIED_MANUFACTURER,
	FilterLabels.MANUFACTURER_LOCATION,
	FilterLabels.API_MANUFACTURING_STATUS,
	FilterLabels.CONTRACT_MANUFACTURER,
];

export const DoseFormSearchFilters = [
	FilterLabels.VERIFIED_MANUFACTURER,
	FilterLabels.COMPANY_TYPES,
	FilterLabels.CONTRACT_MANUFACTURER,
	FilterLabels.MANUFACTURER_LOCATION,
	FilterLabels.DOSE_FORMS
];

export const CompanySearchFilters = [
	FilterLabels.MANUFACTURER_LOCATION,
	FilterLabels.CORPORATE_API_RATING,
];

export const DefaultSearchFilters = [
	FilterLabels.MANUFACTURER_LOCATION,
];