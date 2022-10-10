import React, { useEffect } from 'react';
import { Search } from '../../../../consts/search-categories';
import { initAutoSuggestScroll } from '../../../../public/js/common';
import AutoSuggestProducts from './auto-suggest-products';
import AutoSuggestCompanies from './auto-suggest-companies';

const { SEARCH_BY } = Search;

const AutoSuggest = ({ 
	activeSearchCategory = '',
	getSearchTabName = () => '',
	searchResults = {},
	searchString = '',
	gotoSearchResultsPage = () => null,
	showLabelAndCount = true,
}) => {	

	const searchResultsCount = (searchResults && searchResults.count) || 0;
	const label = getSearchTabName(activeSearchCategory);
	const iconType = label.toLowerCase() === 'suppliers' ? 'suppliers' : 'product';

	useEffect(() => initAutoSuggestScroll())
    
	return (
		<div className="autocom-box">
			{
				showLabelAndCount &&
				<>
					<div className="image-counter-con">
						<i className={`icon icon-search-${iconType}-icon`} />
			            <span className="current-search-title">{label}</span>
						<span className="count-search-con">
							<span className="count-search">{searchResultsCount}</span>&nbsp; matches
						</span>
					</div>
					<hr />
				</>
			}
			{
				activeSearchCategory === SEARCH_BY.PRODUCTS ?
					<AutoSuggestProducts 
						products={searchResults?.products || []}
	                    searchString={searchString}
	                    gotoSearchResultsPage={gotoSearchResultsPage}
                    />
                :
                	<AutoSuggestCompanies 
					 	companies={searchResults?.companies || []}
						searchString={searchString}
					    gotoSearchResultsPage={gotoSearchResultsPage}
					/>
			}
		</div>
	);
}

export default AutoSuggest;