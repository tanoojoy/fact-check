import React, { useState, useEffect } from 'react';
import { initFilterSidebar } from '../../../public/js/common';
import { Search } from '../../../consts/search-categories';
import { 
	FilterLabels,
	FiltersMap,
	FilterTypes,
	ApiSearchFilters,
	DoseFormSearchFilters,
	CompanySearchFilters,
	DefaultSearchFilters,
} from '../../../consts/search-filters'
import { isFreemiumUserSku } from '../../../utils';
import { 
	UPDATE_TYPES,
	FilterCheckbox,
	FilterDropdown
} from './common-components';

const { SEARCH_BY } = Search;

const FilterActionButtons = ({
	resetFilterSearch = () => null,
	applyFilterSearch = () => null,
}) => {
	return (
		<div className="fsc-container fsc-buttons">
            <div className="fsc-filter-action">
                <div className="btn-gray" onClick={resetFilterSearch}>Reset</div>
                <div className="btn-blue" onClick={applyFilterSearch}>Apply</div>
            </div>
        </div>
	);
}

const Filters = ({ 
	user,
    categories,
    countriesList,
    customFields,
    corporateApiRatingList,
    doseForms,
    updateSearchResultsFilters,
}) => {
	const [filters, updateFilters] = useState([]);

	useEffect(() => {
		if (typeof window !== 'undefined') initFilterSidebar();
	});

	const handleFiltersChange = (filterKey, value, toAdd = true, updateType = UPDATE_TYPES.MERGE) => {
		const filterToUpdate = filters.find(f => f.filterKey === filterKey);
		const currentFilterValues = filterToUpdate?.values || [];
		let updatedValues = [];
		switch (updateType) {
			case UPDATE_TYPES.MERGE:
				updatedValues = toAdd ? [...currentFilterValues, value] : currentFilterValues.filter(val => val !== value);
				break;
			case UPDATE_TYPES.REPLACE:
				updatedValues = value;
				break;
			default:
				break;
		}
		const unModifiedFilters = filters.filter(f => f.filterKey !== filterKey);
		updateFilters([
			...unModifiedFilters,
			{
				filterKey,
				values: updatedValues
			}
		]);
	}

	const getValueOfFilter = (key) => {
		return filters.find(({ filterKey }) => filterKey === key)?.values;
	}

	const isChecked = (key, label) => {
		const value = getValueOfFilter(key);
		return value?.includes(label) || false;
	}

    const clearFilters = () => {
        updateFilters([]);
        updateSearchResultsFilters([]);
    };

    const applyFilters = () => {
    	updateSearchResultsFilters(filters);
    }

    const getCategoryFilterNames = () => {
    	let filters = [];
    	switch (categories)  {
    		case SEARCH_BY.PRODUCTS:
				filters = ApiSearchFilters;
    			break;
    		case SEARCH_BY.DOSE_FORMS:
				filters = DoseFormSearchFilters;
    			break;
    		case SEARCH_BY.COMPANIES:
				filters = CompanySearchFilters;
    			break;
    		default:
    			filters = DefaultSearchFilters;
    			break;
    	}
    	return filters;
    }

    const categoryFilterNames = getCategoryFilterNames();

	const getSearchCheckboxFilterOptions = (name) => {
		const field = customFields.find(cfield => cfield.Name === name);
		let options =  (field?.Options || []).map(fieldOpt => ({ label: fieldOpt.Name }));

		const { values: valueConfig } = FiltersMap.get(name);
		if (valueConfig && valueConfig.length > 0) {
			options = options.map(opt => {
				const formattedValue = valueConfig?.find(v => v.label === opt.label)?.value || opt.label;
				return {
					...opt,
					value: formattedValue
				}
			});
		}
		return options;
	}

	const getSearchDropdownOptions = (name) => {
		let data = [];
		switch (name) {
			case FilterLabels.MANUFACTURER_LOCATION:
				data = countriesList;
				break;
			case FilterLabels.CORPORATE_API_RATING:
				data = corporateApiRatingList;
				break;
			case FilterLabels.DOSE_FORMS:
				data = doseForms;
				break;
			default:
				break;
		}
		return data;
	}

	const commonProps = {
		isChecked,
		disabled: isFreemiumUserSku(user),
		handleChange: handleFiltersChange
	}

	return (
		<>
			<div className="fixed-sidebar open clearfix">
				<div className="fs-content">
                	<div className="fs-scroll">
                		{
                			categoryFilterNames &&
                			categoryFilterNames.map((categoryFilterName, index) => {
								const { filterKey = name, popoverData, type = '' } = FiltersMap.get(categoryFilterName);
                				if (type === FilterTypes.CHECKBOX) {
                					return (
                						<FilterCheckbox
                							key={index}
			                				title={categoryFilterName}
			                				options={getSearchCheckboxFilterOptions(categoryFilterName)}
			                				popoverData={popoverData}
			                				filterKey={filterKey}
			                				{...commonProps}
			                			/>
			                		)
                				} else if (type === FilterTypes.DROPDOWN) {
                					return (
                						<FilterDropdown
                							key={index}
			                				title={categoryFilterName}
			                				selectedValues={getValueOfFilter(filterKey)}
			                				data={getSearchDropdownOptions(categoryFilterName)}
			                				popoverData={popoverData}
			                				filterKey={filterKey}
			                				{...commonProps}
			                			/>
            						)
                				} else return ''
                			})
                		}
	                	{
	                		categories &&
	                		!commonProps.disabled &&
		                	<FilterActionButtons
		                		resetFilterSearch={clearFilters}
		                		applyFilterSearch={applyFilters}
		                	/>
		                }
                	</div>
                </div>
			</div>
		</>
	);
}

export default Filters;
