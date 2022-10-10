import React from 'react';
import { getAppPrefix } from '../../../../public/js/common';
import { SNOWPLOW_ACTION, SNOWPLOW_CATEGORY, SNOWPLOW_LABEL } from '../../../../consts/snowplow';
import { Search } from '../../../../consts/search-categories';

const { SEARCH_BY } = Search;

const AutoSuggestCompanyListItem = ({
	company = {},
	searchString = '',
    gotoSearchResultsPage = () => null,
}) => {

	let { 
		co_ids = '',
        rel_grp_name = '',
        co_name = ''
	} = company;

    const companyIds = co_ids.split(',');

    const substrLen = searchString.length;
	const firstPartName = co_name.substr(0, substrLen);
    const lastPartName = co_name.substr(substrLen, co_name.length);
	const firstPartGrp = rel_grp_name ? rel_grp_name.substr(0, substrLen) : '';
    const lastPartGrp = rel_grp_name ? rel_grp_name.substr(substrLen, rel_grp_name.length) : '';

    const handleCompanyClick = () => {
    	if (companyIds.length === 1) {
    		window.location.href = `${getAppPrefix()}/company/${companyIds[0]}`;
    	} else {
            gotoSearchResultsPage(co_name, SEARCH_BY.COMPANIES);
    	}
    }

    const CompanyNameComponent = () => (
    	<>
			<span 
				className="search-selected"
				data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_SEARCH}
                data-event-action={SNOWPLOW_ACTION.QUICK_SEARCH}
                data-event-label={co_name}
			>{firstPartName}</span>{lastPartName}
		</>
	);

    const CompanyGroupComponent = () => (
        <span>
            (
            <span style={{ fontWeight: 'bolder' }}>{firstPartGrp}</span>
            <span>{lastPartGrp}</span>
            )
        </span>
    );
	return (

		<li 
			onClick={() => handleCompanyClick()}
			data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_SEARCH}
            data-event-action={SNOWPLOW_ACTION.QUICK_SEARCH}
            data-event-label={co_name}
		>
			{
				rel_grp_name === co_name ?
					<CompanyNameComponent />
				: 
					<>
						<CompanyNameComponent />&nbsp;
						<CompanyGroupComponent />

					</>
			}
		</li>
	)
}

const AutoSuggestCompanies = ({ 
	companies = [],
	searchString = '',
    gotoSearchResultsPage = () => null,
}) => {
	return (
		<div className="autocom-box-list">
			{
				companies.map((company, index) => 
					<AutoSuggestCompanyListItem
						key={`company-${index}`}
						company={company}
                        searchString={searchString}
                        gotoSearchResultsPage={gotoSearchResultsPage}
					/>
				)
			}
			<div className="view-more-con">
				<a 
					onClick={() => gotoSearchResultsPage(searchString, SEARCH_BY.COMPANIES)} 
					className="view-more-btn"
					data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_SEARCH_VIEW_ALL}
	                data-event-action='View all'
	                data-event-label={SNOWPLOW_LABEL.COMPANY_SEARCH_VIEW_ALL}
				>
					View All
				</a>
			</div>
		</div>
	);
}

export default AutoSuggestCompanies;