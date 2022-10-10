'use strict';
import React from 'react';
import { connect } from 'react-redux';
import EnumCoreModule from '../../public/js/enum-core';
import CommonModule from '../../public/js/common';
import AccountActions from '../../redux/accountAction';
import BackgroundLoginPage from './background-login-page';
import HorizonFooterComponent from '../layouts/horizon-components/footer';

// ARC-8702
const iconStyles = {
    fontFamily: 'FontAwesome',
    fontWeight: 'normal'
};

class NonPrivateLoginComponent extends React.Component {
    componentDidMount() {
        const self = this;
        this.state = { isClarivatelogin: false };
        if (typeof window !== 'undefined') {
            var $ = window.$;
        }

        if (this.props.errorMessage) {
            this.showMessage({
                type: 'error',
                body: this.props.errorMessage
            });
            window.history.pushState('', '', CommonModule.getAppPrefix() + '/accounts/non-private/sign-in?error=1');
        } else {
            if (this.props.error && this.props.error === '2') {
                this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_TOKEN);
            } else if (this.props.error && typeof this.props.error != 'undefined' && this.props.error != 'undefined') {
                this.showMessage(EnumCoreModule.GetToastStr().Error.INVALID_LOGIN_CREDENTIALS);
            }
        }

        console.log('the errors', this.props);
    }

    loginWithUsernameAndPassword() {
        const username = $('input[name="username"]').val().trim();
        const password = $('input[name="password"]').val().trim();

        if (username == '' || password == '') {
            this.showMessage(EnumCoreModule.GetToastStr().Error.REQUIRED_LOGIN_CREDENTIALS);
            return;
        }

        $('#frmlogin').submit();
    }

    handleKeyPress(event) {
        if (event.which === 13 || event.keyCode == 13) {
            if ($('#password').val() == '' || $('#username').val() == '') {
                this.showMessage(EnumCoreModule.GetToastStr().Error.REQUIRED_LOGIN_CREDENTIALS);
            } else {
                $('#frmlogin').submit();
            }
        }
    }

    getSortedLogins() {
        const sortedLogins = [];

        if (this.props.loginConfigurationSettings) {
            const loginConfigurationSettings = this.props.loginConfigurationSettings;

            Object.keys(loginConfigurationSettings).forEach(function(key) {
                if (key.indexOf('enable-') >= 0 && loginConfigurationSettings[key] == 'true') {
                    const loginType = key.replace('enable-', '');

                    if (loginConfigurationSettings['sort-' + loginType]) {
                        sortedLogins.push({
                            key: loginType,
                            value: loginConfigurationSettings['sort-' + loginType]
                        });
                    }
                }
            });
        }

        return sortedLogins.sort((a, b) => (a.value > b.value) ? 1 : -1);
    }

    renderLogins() {
        const self = this;

        const sortedLogins = this.getSortedLogins();
        const logins = [];

        sortedLogins.forEach(function(config, index) {
            if (config.key.toLowerCase() === 'facebook') {
                logins.push(self.renderFacebook());
            } else if (config.key.toLowerCase() === 'google') {
                logins.push(self.renderGoogle());
            } else if (config.key.toLowerCase() === 'custom-facebook') {
                logins.push(self.renderCustomFacebook());
            } else if (config.key.toLowerCase() === 'custom-google') {
                logins.push(self.renderCustomGoogle());
            } else if (config.key.toLowerCase() === 'custom-login') {
                if (logins.length > 0) {
                    logins.push(self.renderDivider(1));
                }

                logins.push(self.renderCustomLogin());

                if (index < sortedLogins.length - 1) {
                    logins.push(self.renderDivider(2));
                }
            }
        });

        if (logins.length == 0) {
            logins.push(self.renderFacebook());
            logins.push(self.renderGoogle());
            logins.push(self.renderDivider(1));
            logins.push(self.renderCustomLogin());
        }

        return logins;
    }

    renderGoogle() {
        return (
            <div key='google' className='btn-google'>
                <a href={this.props.googleLoginUrl}>
                    <i style={iconStyles} className='fa fa-google' /><span>Continue with Google</span>
                </a>
            </div>
        );
    }

    renderFacebook() {
        return (
            <div key='facebook' className='btn-fb'>
                <a href={this.props.facebookLoginUrl}>
                    <i style={iconStyles} className='fa fa-facebook-square' /><span>Continue with Facebook</span>
                </a>
            </div>
        );
    }

    renderCustomLogin() {
        if (typeof window !== 'undefined') {
            const urlAction = CommonModule.getAppPrefix() + '/accounts/non-private/sign-in';
            const query = new URLSearchParams(window.location.search);
            // const isSeller = query.get('isSeller');
            let isMerge = false;
            if (this.props) {
                isMerge = this.props.isMerge;
            }

            if (!isMerge && window.location.href.indexOf('returnUrl=' + CommonModule.getAppPrefix() + '/cart') > 0) {
                isMerge = true;
            }

            const returnUrl = query.get('returnUrl');

            return (
                <form
                    key='custom-login' id='frmlogin' action={urlAction} className='custom-login' method='post'
                    autoComplete='off'
                >
                    <div className='lbb-input'>
                        <input type='hidden' id='returnUrl' name='returnUrl' value={returnUrl} />
                        <input type='hidden' id='isMerge' name='isMerge' value={isMerge} />
                        <input
                            type='text' className='input-text' placeholder='Email/Username' id='username'
                            name='username' onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)}
                            onKeyPress={(e) => this.handleKeyPress(e)}
                        />
                        <input
                            type='password' className='input-text' placeholder='Password' id='password'
                            name='password' onKeyDown={(e) => this.avoidWhiteSpaceOnKeyDown(e)}
                            onKeyPress={(e) => this.handleKeyPress(e)} autoComplete='off'
                        />
                        <input
                            type='isSeller' className='hidden' id='isSeller' name='isSeller'
                            value={this.props.isSeller || false}
                        />
                    </div>
                    <span className='lbb-text'>
                        <a href={`${CommonModule.getAppPrefix()}/accounts/non-private/forgot-password?isSeller=${this.props.isSeller || false}`}>Forgotten your password?</a>
                    </span>
                    <div className='btn-signin'>
                        <a href='#' onClick={(e) => this.loginWithUsernameAndPassword()}>Sign In</a>
                    </div>
                    <div className='signup-btn'>
                        <a href={`${CommonModule.getAppPrefix()}/accounts/non-private/register?isSeller=${this.props.isSeller || false}`}>Create
                            Account
                        </a>
                    </div>
                </form>
            );
        }
    }

    renderCustomFacebook() {
        return (
            <div key='custom-facebook' className='btn-fb'>
                <a href={this.props.customFacebookLoginUrl}>
                    <i
                        style={iconStyles}
                        className='fa fa-facebook-square'
                    /><span>{this.props.customFacebookDisplayName || 'Continue with Admin Facebook'}</span>
                </a>
            </div>
        );
    }

    renderCustomGoogle() {
        return (
            <div key='custom-google' className='btn-google'>
                <a href={this.props.customGoogleLoginUrl}>
                    <i
                        style={iconStyles}
                        className='fa fa-google'
                    /><span>{this.props.customGoogleDisplayName || 'Continue with Admin Google'}</span>
                </a>
            </div>
        );
    }

    renderDivider(index) {
        return (
            <span key={'divider-' + index} className='lbb-line or-container'>
                <p>or</p>
            </span>
        );
    }

    acceptCookie() {
        CommonModule.createCookie('acceptCookiePolicy', 1, 1);
        $('.cookie-bar').fadeOut(1000, function() {
            $('.cookie-bar').remove();
        });
    }

    switchLoginMethod() {
        console.log(this);
        this.setState(prevState => ({
            isClarivatelogin: !prevState.isClarivatelogin
        })
        );
    }

    render() {
        return (
            <React.Fragment key='login-component'>
                <BackgroundLoginPage>
                    <div className='login-additional-info'>
                        <a href='#' className='login-additional-info__link'>Not yet a subscriber? Learn more</a>
                    </div>
                </BackgroundLoginPage>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        type: state.type,
        host: state.host,
        facebookLoginUrl: state.facebookLoginUrl,
        googleLoginUrl: state.googleLoginUrl,
        customFacebookLoginUrl: state.customFacebookLoginUrl,
        customGoogleLoginUrl: state.customGoogleLoginUrl,
        marketplaceLogoUrl: state.marketplaceLogoUrl,
        error: state.error,
        loginConfigurationSettings: state.loginConfigurationSettings,
        cookieData: state.cookieData,
        customFacebookDisplayName: state.customFacebookDisplayName,
        customGoogleDisplayName: state.customGoogleDisplayName,
        guestUserID: state.guestUserID,
        isMerge: state.isMerge,
        isSeller: state.isSeller,
        errorMessage: state.errorMessage,
        isClarivatelogin: state.isClarivatelogin
    };
}

function mapDispatchToProps(dispatch) {
    return {
        switchLoginMethod: isClarivatelogin => dispatch(AccountActions.switchLoginMethod(isClarivatelogin)),
        authorizeCgiUser: cgiOptions => dispatch(AccountActions.authorizeCgiUser(cgiOptions))
    };
}

const NonPrivateLoginHome = connect(
    mapStateToProps,
    mapDispatchToProps
)(NonPrivateLoginComponent);

module.exports = {
    NonPrivateLoginHome,
    NonPrivateLoginComponent
};
