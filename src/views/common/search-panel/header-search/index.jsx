'use strict';
import React, { useState, useEffect } from 'react';
import AutoSuggest from '../auto-suggest/index';
import { Search } from '../../../../consts/search-categories';
import { productTabs } from '../../../../consts/product-tabs';
import { FreemiumLimitationBlock } from '../../../chat/limitation';
import { isFreemiumUserSku } from '../../../../utils';

const { SEARCH_BY } = Search;
const stringCountToTriggerSearch =  3;
const emptySearchResults = { count: 0, companies: [], products: [] };

const HeaderSearchComponent = ({
    activeSearchCategory = '',
    getSearchTabName = () => '',
    searchCategories = [],
    searchResults = null,
    searchString = '',
    gotoSearchResultsPage = () => null,
    setSearchString = () => null,
    setSearchCategory = () => null,
    position = '',
    user = {}, 
    hideLimitationToRoles = []
}) => {
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchStr, setSearchStr] = useState(searchString);
    const [selectedProductType, setSelectedProductType] = useState(productTabs.API.productType);
    const [suggestions, setSuggestions] = useState(emptySearchResults);

    const placeholder = `Search ${getSearchTabName(activeSearchCategory)}`;

    const handleInputChange = (text) => {
        setSearchStr(text);
        setSearchString(text, activeSearchCategory, selectedProductType, stringCountToTriggerSearch);
    }

    const handleProductTypeChange = (e) => {
        setSuggestions(emptySearchResults);
        setSelectedProductType(e.target.value);
    }

    const toggleHeaderSearchView = (e) => {
        setShowSearchBar(!showSearchBar);
        e.preventDefault();
    }
       
    const setActiveTab = (category) => {
        setSearchString('');
        setSearchCategory(category);
    }

    useEffect(() => {
        if (!showSearchBar) {
            setSearchString('');
        }
    }, [showSearchBar]);

    useEffect(() => {
        setSearchString(searchStr, activeSearchCategory, selectedProductType, stringCountToTriggerSearch);
    }, [selectedProductType])

    useEffect(() => {
        setSearchStr(searchString);
        if (!searchString) {
            setSuggestions(emptySearchResults);
        }
    }, [searchString]);

    useEffect(() => {
        if (activeSearchCategory !== SEARCH_BY.PRODUCTS) {
            setSelectedProductType(null);
        } else {
            if (!selectedProductType) {
                setSelectedProductType(productTabs.API.productType);
            }
        }
    }, [activeSearchCategory])

    useEffect(() => {
        setSuggestions(searchResults);
    }, [searchResults])
    const isAutoSuggestActive = suggestions && suggestions.count > 0;
    const productSearchTabTypes = Object.values(productTabs);

    const isLimitationBlockDisplayed = position && isFreemiumUserSku(user) && !hideLimitationToRoles.includes(user?.userInfo?.role);
    return (
        <div className={isLimitationBlockDisplayed ? 'counter-with-search-con' : 'generic-search-con margin-top-fix margin-bottom-negative-fix'}>
            {
                isLimitationBlockDisplayed &&
                <FreemiumLimitationBlock position={position} user={user} />
            }     
            <div className='h-search'>
                <form id="productSearch" action=''>
                    <div className={`h-search-bar ${!showSearchBar ? 'hide':''} ${isAutoSuggestActive ? 'active' : ''}`}>
                        <div className="flexing">
                            <div className="h-search-category">
                                <select value={activeSearchCategory} onChange={(e) => setActiveTab(e.target.value)}>
                                    {
                                        searchCategories && searchCategories.map((opt, index) => <option key={index} value={opt.value}>{opt.name}</option>)
                                    }
                                </select>
                                <i className="icon icon-angle-down"></i>
                            </div>
                            {
                                activeSearchCategory ===  SEARCH_BY.PRODUCTS &&
                                <div className="h-search-category">
                                    <select onChange={handleProductTypeChange}>
                                        {
                                            productSearchTabTypes.map(searchType => 
                                                <option 
                                                    key={searchType.tab}
                                                    value={searchType.productType}
                                                >
                                                    {searchType.tab}
                                                </option>
                                            )
                                        }

                                    </select>
                                    <i className="icon icon-angle-down" />
                                </div>
                            }
                            <div className="h-search-input">
                                <input 
                                    type="text" 
                                    placeholder={placeholder} 
                                    onChange={(e) => handleInputChange(e.target.value)} 
                                    value={searchStr}
                                />
                                {
                                    searchStr ?
                                        <a className="clear-btn" href="#" onClick={() => handleInputChange('')}>Clear</a>
                                        :
                                        <i className="icon icon-cortellis-search" />
                                }

                            </div>
                        </div>
                        <AutoSuggest 
                            activeSearchCategory={activeSearchCategory}
                            getSearchTabName={getSearchTabName}
                            searchResults={suggestions}
                            searchString={searchString}
                            gotoSearchResultsPage={gotoSearchResultsPage}
                        />
                    </div>
                </form>
                <a 
                    className="search-close-button" 
                    onClick={toggleHeaderSearchView} 
                    href="#"
                >
                    <i className={`icon ${showSearchBar ? 'icon-blue-close' : 'icon-blue-search'}`} />
                </a>
            </div>
        </div>
    );
}

export default HeaderSearchComponent;