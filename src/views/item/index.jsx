'use strict';
import React from 'react';
import { connect } from 'react-redux';

import { Search } from '../../consts/search-categories';
import { productCompanyTypes } from '../../consts/company-products';
import { getSearchResultsPageRedirectUrl } from '../../utils';
import UpgradeToPremiumTopBanner from '../common/upgrade-to-premium-top-banner';
import { HeaderLayoutComponent } from '../../views/layouts/header/index';
import { FooterLayoutComponent } from '../../views/layouts/footer';
import BreadcrumbsComponent from '../common/breadcrumbs';
import ItemDetailContainer from './item-detail-container';
import VerificationStatusModal from '../company/add-edit-product/modals/verification-status';

import BaseComponent from '../../views/shared/base';

const { SEARCH_BY } = Search;

import { 
    getUpgradeToPremiumPaymentLink,
    sendInviteColleaguesEmail,
    shareProductProfile
} from '../../redux/userActions';

import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../redux/searchActions';

class ItemDetailComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            showVerificationModal: false,
        }
    }
    getMerchantProfileUrl() {
        if (this.props.itemDetails && this.props.itemDetails.MerchantDetail) {
            return `/company/${this.props.itemDetails.MerchantDetail.ID}`;
        }
        return null;
    }

    getBreadCrumbValues() {
        if (this.props.itemDetails && this.props.itemDetails.ID) {
            const { Name, MerchantDetail } = this.props.itemDetails;
            const { PRODUCT_COMPANY_MANUFACTURER, PRODUCT_COMPANY_MARKETER } = productCompanyTypes;
            
            let searchBy = SEARCH_BY.PRODUCTS;
            if ([PRODUCT_COMPANY_MANUFACTURER, PRODUCT_COMPANY_MARKETER].some(str => str === this.props.itemViewType)) {
                searchBy = SEARCH_BY.DOSE_FORMS;
            }

            return [
                {
                    name: 'Search Results',
                    redirectUrl: getSearchResultsPageRedirectUrl(Name, searchBy)
                },
                {
                    name: MerchantDetail?.DisplayName || '',
                    redirectUrl: this.getMerchantProfileUrl()
                },
                {
                    name: Name
                }
            ];
        }
    }

    setVerificationModalVisible(value) {
        this.setState({ showVerificationModal: value }, () => {
            if (value) {
                $('#root').parent().addClass('modal-open');
            } else {
                $('#root').parent().removeClass('modal-open');
            }
        });
    }

    render() {
        const { showVerificationModal } = this.state;
        return (
            <>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent 
                        user={this.props.user}
                        sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail}
                    />
                </div>
                <div className="main">
                    <BreadcrumbsComponent
                        trails={this.getBreadCrumbValues()}
                    />
                    <ItemDetailContainer 
                        itemDetails={this.props.itemDetails}
                        user={this.props.user}
                        getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                        itemViewType={this.props.itemViewType}
                        handleVerifyClick={() => this.setVerificationModalVisible(true)}
                        shareProductProfile={this.props.shareProductProfile}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                </div>
                <div className="footer grey" id="footer-section">
                    <FooterLayoutComponent user={this.props.user} />
                </div>
                <VerificationStatusModal 
                    showModal={showVerificationModal}
                    setShowModal={(value) => this.setVerificationModalVisible(value)}
                />
            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        itemDetails: state.itemsReducer.itemDetail,
        itemViewType: state.itemsReducer.itemViewType,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
};

const mapDispatchToProps = dispatch => ({
    getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
    shareProductProfile: (data, callback) => dispatch(shareProductProfile(data, callback)),
    setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
    setSearchCategory: (category) => dispatch(setSearchCategory(category)),
    gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),

});


const ItemDetailsHome = connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemDetailComponent)

module.exports = {
    ItemDetailsHome,
    ItemDetailComponent
}