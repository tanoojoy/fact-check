'use strict';
import React from 'react';
import { typeOfSearchBlock } from '../../consts/search-categories';
import { PanelType } from '../../consts/panel-type';
import SearchPanel from '../common/search-panel/index';
import Categories from './categories';
import BaseComponent from '../shared/base';
import EnumCoreModule from '../../public/js/enum-core';

class HomepageWithPanel extends BaseComponent {
    constructor(props) {
        super(props);
        this.mainHeader = 'Source and Supply pharmaceutical ingredients, products or services globally';
    }

    componentDidMount() {
        const self = this;

        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');

        if (typeof error != 'undefined') {
            if (error == 'invalid-token') {
                self.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_TOKEN);
            }
            if (error == 'merchant-not-found') {
                self.showMessage({
                    type: 'error',
                    body: 'This page is no longer accessible.',
                    header: 'Sorry!'
                });
            }
        }
    }

    getSliderPanel() {
        return this.props.panels.find(panel => panel.Type === PanelType.SLIDER);
    }

    getHeader() {
        return this.getSliderPanel()?.Details[0].Title || this.mainHeader;
    }

    render() {
        return (
            <div className='home-pg-container'>
                <div className="clarivate-search">
                    <div className="container">
                        <h1>{this.getHeader()}</h1>
                        <SearchPanel
                            type={typeOfSearchBlock.BANNER}
                            searchCategory={this.props.searchCategory}
                            searchResults={this.props.searchResults}
                            searchString={this.props.searchString}
                            setSearchCategory={this.props.setSearchCategory}
                            gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                            setSearchString={this.props.setSearchString}
                        />
                    </div>
                </div>
                <div className="category-list-outer">
                    <div className="container-fluid">
                        <div className="row">
                            <Categories categories={this.props.categories} />
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }
}

export default HomepageWithPanel;