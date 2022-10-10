'use strict';
import React, { useState, useEffect } from 'react';
import AutoSuggest from '../auto-suggest/index';
import { productTabs } from '../../../../consts/product-tabs';
import { Search } from '../../../../consts/search-categories';

const { SEARCH_BY } = Search;

const SearchBar = ({ 
    activeSearchCategory = '',
    getSearchTabName = () => '',
    searchResults = null,
    searchString = '',
    gotoSearchResultsPage = () => null,
    setSearchString = () => null
}) => {
    const [searchStr, setSearchStr] = useState(searchString);
    const [selectedProductType, setSelectedProductType] = useState(productTabs.API.productType);

    const placeholder = `Search ${getSearchTabName(activeSearchCategory)}`;

    const handleInputChange = (text) => {
        setSearchStr(text);
        setSearchString(text, activeSearchCategory, selectedProductType);
    }

    const handleProductTypeChange = (e) => {
       setSelectedProductType(e.target.value);
    }

    useEffect(() => {
        setSearchString(searchStr, activeSearchCategory, selectedProductType);
    }, [selectedProductType])

    useEffect(() => {
        setSearchStr(searchString);
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

    const isAutoSuggestActive = searchResults && searchResults.count > 0;
    const productSearchTabTypes = Object.values(productTabs);

    return (
        <div id="search" className="tabcontent active">
            <div className={`h-search-bar ${(isAutoSuggestActive && 'active') || ''}`}>
                <div className="flexing">
                    {
                        activeSearchCategory ===  SEARCH_BY.PRODUCTS &&
                        <div className="h-search-category flexing">
                            <select onChange={handleProductTypeChange}>
                                {
                                    productSearchTabTypes.map(productType => 
                                        <option 
                                            key={productType.tab}
                                            value={productType.productType}
                                        >
                                            {productType.tab}
                                        </option>
                                    )
                                }

                            </select>
                            <i className="icon icon-angle-down" />
                            <span className="divider-right"/>
                        </div>
                    }
                    <div className='h-search-input'>
                        <input 
                            type="text"
                            value={searchStr}
                            placeholder={placeholder}
                            onChange={(e) => handleInputChange(e.target.value)}
                        />
                        {searchStr && <a className="clear-btn" href="#" onClick={() => handleInputChange('')}>Clear</a>}
                    </div>
                </div>
                <AutoSuggest 
                    activeSearchCategory={activeSearchCategory}
                    getSearchTabName={getSearchTabName}
                    searchResults={searchResults}
                    searchString={searchString}
                    gotoSearchResultsPage={gotoSearchResultsPage}
                />
            </div>
        </div>
    );

}
export default SearchBar;