'use strict';
import React from 'react';
import SearchTabPane from './search-tab-pane';
import SearchBar from './search-bar';

class BannerSearchComponent extends React.Component {
	constructor(props) {
		super(props);
        this.setActiveTab = this.setActiveTab.bind(this);
	}

    setActiveTab(category) {
        this.props.setSearchString('');
        this.props.setSearchCategory(category);
    }

    render() {
        return (
            <div className="search-tab">
	        	<SearchTabPane
	        		setActiveTab={this.setActiveTab}
	        		tabs={this.props.searchCategories}
	        	/>
	        	<SearchBar
	        		getSearchTabName={this.props.getSearchTabName}
	        		activeSearchCategory={this.props.activeSearchCategory}
	        		searchResults={this.props.searchResults}
                    searchString={this.props.searchString}
                    gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                    setSearchString={this.props.setSearchString}
	        	/>
        	</div>
        );
    }
}

export default BannerSearchComponent;