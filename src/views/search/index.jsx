'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { typeOfSearchBlock } from '../../consts/search-categories';

import SearchPanel from '../common/search-panel/index';
import UpgradeToPremiumTopBanner from '../common/upgrade-to-premium-top-banner';
import { HeaderLayoutComponent } from '../../views/layouts/header/index';
import { FooterLayoutComponent } from '../../views/layouts/footer';
import BreadcrumbsComponent from '../common/breadcrumbs';

import Filters from './filters/index';
import Results from './results/index';

import { getUpgradeToPremiumPaymentLink, sendInviteColleaguesEmail } from '../../redux/userActions';
import {
    updateSearchResultsFilters,
    sortSearchResults,
    setSearchCategory,
    gotoSearchResultsPage,
    setSearchString,
} from '../../redux/searchActions';

export const SearchResults = ({
    user = {},
    categories = '',
    customFields = [],
    countriesList = [],
    corporateApiRatingList = [],
    doseForms = [],
    items,
    totalRecords,
    keywords = '',
    sortColumn, 
    sortDirection,
    searchCategory = '',
    searchResults = null,
    searchString = '',
    getUpgradeToPremiumPaymentLink = () => null,
    updateSearchResultsFilters = () => null,
    sortResults = () => null,
    setSearchCategory = () => null,
    sendInviteColleaguesEmail = () => null,
    setSearchString = () => null,
    gotoSearchResultsPage = () => null,
}) => {
    return (
        <>
            <UpgradeToPremiumTopBanner 
                user={user}
                getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
            />
            <div className="header mod" id="header-section">
                <HeaderLayoutComponent 
                    user={user}
                    sendInviteColleaguesEmail={sendInviteColleaguesEmail}
                />
            </div>
            <div className="main">
                <BreadcrumbsComponent
                    trails={[ { name: 'Search Results' } ]}
                />
                <SearchPanel
                    type={typeOfSearchBlock.HEADER}
                    searchCategory={searchCategory}
                    searchResults={searchResults}
                    searchString={searchString}
                    setSearchCategory={setSearchCategory}
                    gotoSearchResultsPage={gotoSearchResultsPage}
                    setSearchString={setSearchString}
                />
                <Filters
                    user={user}
                    categories={categories}
                    customFields={customFields}
                    countriesList={countriesList}
                    corporateApiRatingList={corporateApiRatingList}
                    doseForms={doseForms}
                    updateSearchResultsFilters={updateSearchResultsFilters}
                />
                <Results
                    user={user}
                    categories={categories}
                    items={items}
                    totalRecords={totalRecords}
                    keywords={keywords}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    sortResults={sortResults}
                    getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
                />
            </div>
            <div className="footer grey" id="footer-section">
                <FooterLayoutComponent user={user} />
            </div>
        </>
    );
}

const mapStateToProps = (state, ownProps) => {
    return {
        id: state.searchReducer.id,
        user: state.userReducer.user,
        items: state.searchReducer.items,
        totalRecords: state.searchReducer.totalRecords,
        categories: state.searchReducer.categories,
        keywords: state.searchReducer.keywords,
        countriesList: state.searchReducer.countriesList,
        doseForms: state.searchReducer.doseForms,
        corporateApiRatingList: state.searchReducer.corporateApiRatingList,
        sortColumn: state.searchReducer.sortBy,
        sortDirection: state.searchReducer.sortDirection,
        customFields: state.searchReducer.customFields,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
        updateSearchResultsFilters: (filters) => dispatch(updateSearchResultsFilters(filters)),
        sortResults: sortByColumn => dispatch(sortSearchResults(sortByColumn)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
    };
}

export const SearchResultsHome = connect(mapStateToProps, mapDispatchToProps)(SearchResults);
