import React from 'react';
import { connect } from 'react-redux';
import UpgradeToPremiumTopBanner from '../common/upgrade-to-premium-top-banner';
import { HeaderLayoutComponent as HeaderLayout } from '../../views/layouts/header/index';
import HomepageWithPanel from './home-page-panels';
import { FooterLayoutComponent as FooterLayout } from '../layouts/footer';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString 
} from '../../redux/searchActions';
import { getUpgradeToPremiumPaymentLink, sendInviteColleaguesEmail } from '../../redux/userActions';

class HomepageComponent extends React.Component {
    render() {
        return (
            <>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className='header mod' id='header-section'>
                    <HeaderLayout 
                        user={this.props.user}
                        sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail}
                        customContainerClass='container-fluid'
                    />
                </div>
                <div className='main' id='homepage-list'>
                     <HomepageWithPanel
                        categories={this.props.categories}
                        user={this.props.user}
                        panels={this.props.panels}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                </div>
                <div className='footer fixed' id='footer-section'>
                    <FooterLayout  user={this.props.user} />
                </div>
            </>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        categories: state.categoryReducer.categories,
        panels: state.panelsReducer.panels,
        searchCategory: state.searchReducer.searchCategory,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        setSearchString: (searchString, searchBy, productType) => dispatch(setSearchString(searchString, searchBy, productType)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
    }
}

const Homepage = connect(
    mapStateToProps,
    mapDispatchToProps
)(HomepageComponent);

module.exports = {
    Homepage,
    HomepageComponent
};
