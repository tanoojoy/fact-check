import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../../header';
import HorizonFooterComponent from '../../horizon-components/footer';
import BreadcrumbsBlock from '../../horizon-components/breadcrumbs-block';
import MainContent from '../../horizon-components/main-content';
import MyProfileTab from './tabs/my-profile-tab';
import NotificationsTab from './tabs/notifications-tab';
import ChangePassword from './tabs/change-password-tab';
import FollowedCompaniesTab from './tabs/followed-companies-tab';
import { arrayOf, number, object, shape, string } from 'prop-types';
import { getAppPrefix } from '../../../../public/js/common';
import debounce from 'lodash/debounce';
import { userRole } from '../../../../utils';

const TABS = {
    myProfile: 'My Profile',
    notifications: 'Notifications',
    changePassword: 'Change Password',
    followedCompanies: 'Followed Companies'
};

export class UserSettingsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: props?.activeTab || TABS.followedCompanies,
            touched: false,
            needReset: false,
            userInfo: {}
        };
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            activeTab: this.props?.activeTab || TABS.followedCompanies,
            userInfo: Object.assign({}, this.props?.userInfo, this.state?.userInfo)
        }, this.addActiveTabToUrl);
    }

    addActiveTabToUrl = () => {
        if (history.pushState) {
            const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?activeTab=${this.state.activeTab}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    }

    setActiveTab(tab) {
        this.setState({ activeTab: tab }, this.addActiveTabToUrl);
    }

    update = (newSettings) => {
        axios
            .put(`${getAppPrefix()}/users/settings/update`, newSettings)
            .then(res => {
                debounce(() => {
                    this.setState({
                        userInfo: Object.assign({}, res.data)
                    });
                }, 1000);
            })
            .catch(console.log);
    }

    render() {
        const { user = {}, followerCompanies = {} } = this.props;
        const { activeTab, userInfo = {} } = this.state;

        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={user} />
                </div>
                <MainContent className='user-settings' user={user}>
                    <BreadcrumbsBlock />
                    <div className='user-settings__header'>
                        <h1 className='user-settings__header-title'>User Settings</h1>
                        <div className='user-settings__tab-titles'>
                            <div
                                className={activeTab === TABS.myProfile ? 'user-settings__tab--active' : 'user-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.myProfile);
                                }}
                            >
                                {TABS.myProfile}
                            </div>
                            <div
                                className={activeTab === TABS.notifications ? 'user-settings__tab--active' : 'user-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.notifications);
                                }}
                            >
                                {TABS.notifications}
                            </div>
                            <div
                                className={activeTab === TABS.changePassword ? 'user-settings__tab--active' : 'user-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.changePassword);
                                }}
                            >
                                {TABS.changePassword}
                            </div>
                            <div
                                className={activeTab === TABS.followedCompanies ? 'user-settings__tab--active' : 'user-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.followedCompanies);
                                }}
                            >
                                {TABS.followedCompanies}
                            </div>
                        </div>
                    </div>
                    <div className='user-settings__content'>
                        {activeTab === TABS.myProfile && <MyProfileTab />}
                        {activeTab === TABS.notifications && <NotificationsTab userInfo={userInfo} updateSettings={this.update} role={userRole(user)} />}
                        {activeTab === TABS.changePassword && <ChangePassword />}
                        {activeTab === TABS.followedCompanies && <FollowedCompaniesTab followerCompanies={followerCompanies} />}
                    </div>
                </MainContent>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </>
        );
    }
}

UserSettingsPage.propTypes = {
    user: object,
    userInfo: object,
    followerCompanies: shape({
        count: number,
        followers: arrayOf({
            id: number,
            userId: string,
            companyId: number,
            createdAt: string,
            updatedAt: string,
            companyName: string
        })
    }),
    activeTab: string
};

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        userInfo: state.userReducer.userInfo,
        followerCompanies: state.userReducer.followerCompanies,
        activeTab: state.userReducer.activeTab
    };
};

const mapDispatchToProps = dispatch => ({});

export const UserSettingsContainer = connect(mapStateToProps, mapDispatchToProps)(UserSettingsPage);
