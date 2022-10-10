'use strict';

import React from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import panelActions from '../../redux/panelAction';
import categoryActions from '../../redux/categoryActions';
import marketplaceActions from '../../redux/marketplaceActions';
import inboxActions from '../../redux/inboxAction';
import cartActions from '../../redux/cartActions';
import HeaderMenuComponentTemplate from './horizon-components/header/header-menu';
import HeaderLayoutBottomComponent from '../layouts/header-bottom';
import UpgradeToPremiumTopBanner from './horizon-components/upgrade-to-premium-top-banner';
import commonModule from '../../public/js/common';
import { gotoSearchResultsPage, setSearchCategory, setSearchString } from '../../redux/searchActions';
import { isFreemiumUserSku } from '../../utils';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class HeaderLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: ''
        };
    }

    componentDidMount() {
        var self = this;

        if (typeof window !== 'undefined') {

            if ((this.props.panels == null || this.props.panels.length === 0) && this.props.loadPanels != null) {
                this.props.loadPanels();
            }
            if ((this.props.categories == null || this.props.categories.length === 0) && this.props.loadCategories != null) {
                this.props.loadCategories();
            }

            if (typeof this.props.loadMarketplaceInfo == 'function' && (this.props.logoUrl === '' || typeof this.props.logoUrl == 'undefined' || !this.props.logoUrl)) {
                this.props.loadMarketplaceInfo();
            }
            if (this.props.user) {
                if (typeof this.props.getUnreadCount === 'function') {
                    this.props.getUnreadCount();
                }

                if (typeof this.props.getUserCarts === 'function') {
                    // Pull Guest Cart When Inside Cart page
                    if (this.props.user.Guest !== undefined) {
                        let guestUserID = '';
                        if (commonModule.getCookie('guestUserID') && commonModule.getCookie('guestUserID') !== '') {
                            guestUserID = commonModule.getCookie('guestUserID');
                        }

                        this.props.getUserCarts({ pageSize: 1000, pageNumber: 1, includes: null, guestUserID: guestUserID }, null);
                    } else {
                        this.props.getUserCarts({ pageSize: 1000, pageNumber: 1, includes: null }, null);
                    }
                }
            } else {
                // Pull Guest Cart
                if (typeof this.props.getUserCarts === 'function') {
                    let guestUserID = '';

                    if (this.props.user && this.props.user.Guest !== undefined) {
                        if (commonModule.getCookie('guestUserID') && commonModule.getCookie('guestUserID') !== '') {
                            guestUserID = commonModule.getCookie('guestUserID');
                        }
                    }
                    if (!this.props.user) {
                        if (commonModule.getCookie('guestUserID') && commonModule.getCookie('guestUserID') !== '') {
                            guestUserID = commonModule.getCookie('guestUserID');
                        }
                    }

                    this.props.getUserCarts({ pageSize: 1000, pageNumber: 1, includes: null, guestUserID: guestUserID }, null);
                }
            }

            if (window.location.search !== '') {
                let keyword = window.location.search.split('keywords=')[1];
                if (keyword === undefined) {
                    keyword = '';
                } else {
                    keyword = window.location.search.split('keywords=')[1].split('&')[0];
                }
                this.setState({ keyword: keyword });
            }
            this.bindWindowClick();
            commonModule.init();
            if (self.props.googleAnalytics && self.props.googleAnalytics == null) {
                self.props.loadMarketplaceInfo();
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        commonModule.initHeaderMenuScroll();
    }

    loadGoogleAnalytics() {
        var self = this;
        if (self.props.googleAnalytics) {
            ReactGA.initialize(self.props.googleAnalytics['google-trackid']);
            ReactGA.pageview(window.location.pathname + window.location.search);
        }
    }

    renderUpgradeToPremiumTop() {
        return this.props?.user && isFreemiumUserSku(this.props?.user) ? <UpgradeToPremiumTopBanner /> : null;
    }

    bindWindowClick() {
        const $menu = $('.h-st-menus');
        $(document).mouseup(e => {
            if (!$menu.is(e.target) && $menu.has(e.target).length === 0) {
                $menu.hide();
            }
        });
        $(window).on('click', function(e) {
            $('.h-dd-menu').hide();
        });
    }

    signOut() {
        event.stopPropagation();
        $('a#signout-form').closest('form').submit();
    }

    searchMobile() {
        $('.header-bottom ul.header-menus > li.h-search').toggle();
        if ($('.header-bottom ul.header-menus > li.h-search').css('display') == 'list-item') {
            $('.h-mobi-search.mobi-show').find('i').removeClass('fa-search').addClass('fa-times');
        } else {
            $('.h-mobi-search.mobi-show').find('i').removeClass('fa-times').addClass('fa-search');
        }
    }

    renderSidebarToggle() {
        return $('body').hasClass('page-sidebar')
            ? (
                <div className='tog-box' id='toggle-mobile-menu'>
                    <span />
                    <span />
                    <span />
                </div>
            ) : '';
    }

    getGuestUserID() {
        let guestUserID = '';
        if (this.props.user && this.props.user.Guest !== undefined) {
            if (commonModule.getCookie('guestUserID') && commonModule.getCookie('guestUserID') !== '') {
                guestUserID = commonModule.getCookie('guestUserID');
            }
        }
        if (!this.props.user) {
            if (commonModule.getCookie('guestUserID') && commonModule.getCookie('guestUserID') !== '') {
                guestUserID = commonModule.getCookie('guestUserID');
            }
        }
        return guestUserID;
    }

    renderHeaderBottom() {
        const guestUserID = this.getGuestUserID();
        if (!$('body').hasClass('page-sidebar')) {
            return (
                <HeaderLayoutBottomComponent
                    categories={this.props.categories}
                    keyword={this.state.keyword}
                    panels={this.props.panels}
                    searchMobile={this.searchMobile}
                    logoUrl={this.props.logoUrl}
                    user={this.props.user}
                    homepageUrl={this.props.homepageUrl}
                    guestUserID={guestUserID}
                />
            );
        }
        return '';
    }

    render() {
        var self = this;
        const isMerchant = typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'));
        let guestUserID = '';
        if (typeof window !== 'undefined') {
            guestUserID = this.getGuestUserID();
            return (
                <>
                    {self.loadGoogleAnalytics()}
                    {this.renderUpgradeToPremiumTop()}
                    <div className='header-top'>
                        <div className='container-fluid'>
                            {this.renderSidebarToggle()}
                            <HeaderMenuComponentTemplate
                                user={this.props.user}
                                languages={this.props.languages}
                                panels={this.props.panels}
                                isPrivateEnabled={this.props.isPrivateEnabled}
                                merchantSubAccountActive={this.props.merchantSubAccountActive}
                                guestUserID={guestUserID}
                                isMerchantRestrictedOnly={this.props.isMerchantRestrictedOnly}
                                ControlFlags={this.props.ControlFlags}
                                logoUrl={this.props.logoUrl}
                                setSearchCategory={setSearchCategory}
                                gotoSearchResultsPage={gotoSearchResultsPage}
                                setSearchString={setSearchString}
                            />
                        </div>
                    </div>
                    {/* {this.renderHeaderBottom()} */}
                </>
            );
        } else {
            return '';
        }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        categories: state.categoryReducer.categories,
        user: state.userReducer.user,
        panels: state.panelsReducer.panels,
        logoUrl: state.marketplaceReducer.logoUrl,
        languages: state.marketplaceReducer.languages,
        homepageUrl: state.marketplaceReducer.homepageUrl,
        unreadCount: state.inboxReducer.unreadCount,
        isPrivateEnabled: state.marketplaceReducer.isPrivateEnabled,
        merchantSubAccountActive: state.marketplaceReducer.merchantSubAccountActive,
        googleAnalytics: state.marketplaceReducer.googleAnalytics,
        isMerchantRestrictedOnly: state.marketplaceReducer.isMerchantRestrictedOnly,
        ControlFlags: state.marketplaceReducer.ControlFlags,
        searchCategory: state.searchReducer.searchCategory,
        searchResults: state.searchReducer.searchResults
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadPanels: () => dispatch(panelActions.asyncLoadingPanels()),
        loadCategories: () => dispatch(categoryActions.asyncLoadingCategories()),
        loadMarketplaceInfo: () => null,
        getUnreadCount: () => dispatch(inboxActions.getUnreadCount()),
        getUserCarts: (options, callback) => null,
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy) => dispatch(gotoSearchResultsPage(searchString, searchBy)),
        setSearchString: (searchString, searchBy) => dispatch(setSearchString(searchString, searchBy))
    };
}

const HeaderLayout = connect(
    mapStateToProps,
    mapDispatchToProps
)(HeaderLayoutComponent);

module.exports = {
    HeaderLayout,
    HeaderLayoutComponent
};
