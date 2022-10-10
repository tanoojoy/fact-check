'use strict';

var React = require('react');
var ReactRedux = require('react-redux');
var ProfileSettingsComponent = require('../../user/settings/profile');
var NotificationSettingsComponent = require('../../user/settings/notifications');
var ChangePasswordSettingsComponent = require('../../user/settings/change-password');
var FollowedCompaniesSettingsComponent = require('../../user/settings/followed-companies');
// var FollowedProductsSettingsComponent = require('../../user/settings/followed-products');

var HeaderLayoutComponent = require('../../../views/layouts/header/index').HeaderLayoutComponent;

var addressActions = require('../../../redux/addressActions');
var userActions = require('../../../redux/userActions');
import { userRole } from '../../../utils';
import { typeOfSearchBlock } from '../../../consts/search-categories';

import BaseComponent from '../../shared/base';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { HeaderLayoutComponent as HeaderLayout } from '../../layouts/header/index';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import { getAppPrefix } from '../../../public/js/common';
import SearchPanel from '../../common/search-panel/index';
import FollowedProductsSettingsComponent from './followed-products';
import { 
    sendInviteColleaguesEmail,
    getFollowerProductsByPageAndSize,
    getUpgradeToPremiumPaymentLink
} from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';

const CommonModule = require('../../../public/js/common.js');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class UserSettingsIndexComponent extends BaseComponent {

    constructor(props) {
        super(props);

        // this.state = {
        //     userInfo: props ? props.userInfo : {},
        //     userInfoFormUniqueGuid: props ? props.userInfoFormUniqueGuid : ''
        // }
        this.state = {
            activeTab: props.activeTab
        }

        this.trails = [{name: 'Home', redirectUrl: '/'}, {name: 'Company Settings', redirectUrl: ''}]
    }

    componentDidMount() {
        const self = this;
        switch (this.props.activeTab) {
            case 'My Profile':
                $('#profile_tab').click();
                break;
            case 'Notifications':
                $('#notifications_tab').click();
                break;
            case 'Change Password':
                $('#change_password_tab').click();
                break
            case 'My Followed Companies':
                $('#followed_companies_tab').click();
                break;
            case 'My Followed Products':
                $('#followed_products_tab').click();
                break;
        }

        $('.mainTab').click(function () {
            const query = $(this).data('query')
            self.addActiveTabToUrl(query);
        });


    }

    addActiveTabToUrl = (query) => {
        this.setState({
            activeTab: query
        }, () => {
            const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?activeTab=${query}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        });
        
        //if (history.pushState) {
        //    const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?activeTab=${this.state.activeTab}`;
        //    window.history.pushState({ path: newUrl }, '', newUrl);
        //}
    }

    componentDidUpdate(prevProps) {
        if (this.props.userInfoFormUniqueGuid !== prevProps.userInfoFormUniqueGuid) {
            //alert('changes has been made');
        }
    }

    onProfileSave = () => {
        let userInfo = this.profileSettingsComponentRef.getProfileChanges();
        const notifications = this.notificationSettingsComponentRef.getSelectedNotifications();
        if (notifications) {
            let [otherInfo] = userInfo.CustomFields;
            otherInfo.notification = notifications;
            userInfo.CustomFields = [
                {
                    ...otherInfo
                }
            ]
        }
        this.props.updateUserInfo(userInfo);
    }

    
    render() {
        const { userInfo, user } = this.props;
        const otherInfo = userInfo.CustomFields[0];
        const { extendedFollowerCompanies, extendedFollowerProducts } = otherInfo;
        const { activeTab } = this.state;

        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                /> 
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main" style={{paddingTop: '95px'}}>
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />
                    <SearchPanel
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />  
                    <div className="settings-container">
                        <div className="settings-tab-container">
                            <div className="container">
                                <div className="settings-content">
                                    <div className="setting-top"> <span className="h-text">User Settings</span>
                                        <div className="setting-tab pull-left">
                                            <ul className="nav nav-pills" id="settings-tab">
                                                <li><a data-toggle="tab" href="#Profile" aria-expanded="false" id='profile_tab' className='mainTab' data-query='My Profile'>My Profile</a></li>
                                                <li><a data-toggle="tab" href="#Notifications" id='notifications_tab' className='mainTab' data-query='Notifications'>Notifications</a></li>
                                                <li><a data-toggle="tab" href="#ChangePassword" aria-expanded="false" id='change_password_tab' className='mainTab' data-query='Change Password'>Change Password <span class="notification-notif">Coming Soon</span></a></li>
                                                <li><a data-toggle="tab" href="#FollowedCompanies" aria-expanded="true" id='followed_companies_tab' className='mainTab' data-query='My Followed Companies'>My Followed Companies <span class="notification-notif">Beta</span></a></li>
                                                <li><a data-toggle="tab" href="#FollowedProducts" aria-expanded="true" id='followed_products_tab' className='mainTab' data-query='My Followed Products'>My Followed Products</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div className="container tabs-container">
                        <div className="setting-bot clearfix">
                            <div className="tab-content">
                                { 
                                    activeTab === 'My Profile' &&
                                    <ProfileSettingsComponent 
                                        userInfo={userInfo} 
                                        onProfileSave={this.onProfileSave}
                                        ref={(ref) => this.profileSettingsComponentRef = ref}
                                    />
                                }
                                { 
                                    activeTab === 'Notifications' &&
                                    <NotificationSettingsComponent 
                                        userInfo={userInfo} 
                                        role={userRole(user)}
                                        ref={(ref) => this.notificationSettingsComponentRef = ref}
                                        onProfileSave={this.onProfileSave}
                                    />
                                }
                                { 
                                    activeTab === 'Change Password' &&
                                    <ChangePasswordSettingsComponent />
                                }
                                {   
                                    activeTab === 'My Followed Companies' &&
                                    <FollowedCompaniesSettingsComponent
                                        extendedFollowerCompanies={extendedFollowerCompanies}
                                    />
                                }
                                { 
                                    activeTab === 'My Followed Products' &&
                                    <FollowedProductsSettingsComponent
                                        extendedFollowerProducts={extendedFollowerProducts}
                                        getFollowerProductsByPageAndSize={this.props.getFollowerProductsByPageAndSize}
                                    />
                                }
                            </div>
                        </div>
                    </div>    
                </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        userInfo: state.settingsReducer.user, 
        activeTab: state.userReducer.activeTab,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo)),
        getFollowedCompanies: (page, size) => dispatch(userActions.getFollowedCompanies(page, size)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        getFollowerProductsByPageAndSize: (page, size, callback) =>  dispatch(getFollowerProductsByPageAndSize(page, size, callback))
    };
}

const SettingsIndex = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(UserSettingsIndexComponent);

module.exports = {
    SettingsIndex,
    UserSettingsIndexComponent
};
