'use strict';
var React = require('react');
const CommonModule = require('../../public/js/common.js');

class HeaderLayoutBottomComponent extends React.Component {
    searchMessages(e) {
        if (e.keyCode == 13) {
            this.gotoSearch(e);
        }
    }
    gotoSearch(event) {
        if (event.target.tagName.toLowerCase() === 'input' && event.which !== 13) {
            return;
        }

        const keywords = $('.h-search-bar input').val();
        let categories = $('.h-search-bar option:selected').text();
        if (categories === "All Catgories") {
            categories = "";
        }

        window.location.href = CommonModule.getAppPrefix() + '/search/cgi-search?keywords=' + encodeURIComponent(keywords) + '&categories=' + encodeURIComponent(categories);
    }

    renderCategories() {
        if (this.props.categories != null && Array.isArray(this.props.categories)) {
            var categoryViews = this.props.categories.map(function (item, index) {
                return (
                    <option value={item.ID} key={item.ID}>{item.Name}</option>);
            });
            return categoryViews;
        } else {
            return '';
        }
    }

    renderHomepageUrl() {
        if (this.props.homepageUrl) {
            if (this.props.homepageUrl.startsWith('http')) {

                return this.props.homepageUrl;
            }

            return process.env.PROTOCOL + '://' + this.props.homepageUrl;
        }

        return '/';
    }

    render() {
        const self = this;
        return (
            <div className="header-bottom">
                <div className="container">
                    <ul className="header-menus">
                        <li className="h-logo">
                            <a href={this.renderHomepageUrl()}>
                                <img src={this.props.logoUrl} />
                            </a>
                        </li>
                        <li className="h-search">
                            <div className="h-search-bar">
                                <div className="h-search-input">
                                    <input type="text" placeholder="Search..." onKeyDown={(e) => self.searchMessages(e)} defaultValue={decodeURIComponent(this.props.keyword.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'))} />
                                    <i className="fa fa-search" onClick={(e) => self.gotoSearch(e)}></i>
                                </div>
                                <div className="h-search-category">
                                    <select>
                                        <option value="All Catgories">All Categories</option>
                                        {this.renderCategories()}
                                    </select>
                                    <i className="fa fa-angle-down"></i>
                                </div>
                            </div>
                        </li>
                        <li className="h-mobi-search mobi-show" onClick={(e) => this.props.searchMobile(e)}>
                            <i className="fa fa-search"></i>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

module.exports = HeaderLayoutBottomComponent;
