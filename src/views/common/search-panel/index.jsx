'use strict';
import React from 'react';
import { Search, typeOfSearchBlock } from '../../../consts/search-categories';
import BannerSearchComponent from './banner-search/index';
import HeaderSearchComponent from './header-search/index';
import { capitalize } from '../../../scripts/shared/common';

const { BANNER_SEARCH_BY } = Search;
const { DEFAULT_CATEGORY } = BANNER_SEARCH_BY;

class SearchPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	getSearchCategoryDisplayName(name) {
		const { COMPANIES } = BANNER_SEARCH_BY;
		return name === COMPANIES? 'Suppliers' : `${capitalize(name)}`;
	}

	getSearchCategories() {
		const self = this;
		const { searchCategory } = this.props;
		const activeSearchCategory = searchCategory || DEFAULT_CATEGORY;
		const categories = Object.keys(BANNER_SEARCH_BY)
		  .filter(key => key !== 'DEFAULT_CATEGORY')
		  .map(key => ({
		  		active: activeSearchCategory == BANNER_SEARCH_BY[key],
		  		value: BANNER_SEARCH_BY[key],
		  		name: self.getSearchCategoryDisplayName(BANNER_SEARCH_BY[key])
		  }))
		return categories;
	}

    render() {
    	const searchCategories = this.getSearchCategories();

    	switch(this.props.type) {
    		case typeOfSearchBlock.BANNER: 
		        return (
		        	<BannerSearchComponent
		        		searchCategories={searchCategories}
		        		getSearchTabName={this.getSearchCategoryDisplayName}
		        		activeSearchCategory={this.props.searchCategory || DEFAULT_CATEGORY}
		        		searchResults={this.props.searchResults}
	                    searchString={this.props.searchString}
	                    gotoSearchResultsPage={this.props.gotoSearchResultsPage}
	                    setSearchString={this.props.setSearchString}
		        		setSearchCategory={this.props.setSearchCategory}
		            />
		        );
		    case typeOfSearchBlock.HEADER:
		    	return (
		    		<HeaderSearchComponent
		    			hideLimitationToRoles={this.props.hideLimitationToRoles}
		    			position={this.props.position}
    					user={this.props.user}
		    			searchCategories={searchCategories}
		        		getSearchTabName={this.getSearchCategoryDisplayName}
		        		activeSearchCategory={this.props.searchCategory || DEFAULT_CATEGORY}
		        		searchResults={this.props.searchResults}
	                    searchString={this.props.searchString}
	                    gotoSearchResultsPage={this.props.gotoSearchResultsPage}
	                    setSearchString={this.props.setSearchString}
		        		setSearchCategory={this.props.setSearchCategory}
		    		/>
		    	);
			default:
				return null;
		}
    }
}

export default SearchPanel;