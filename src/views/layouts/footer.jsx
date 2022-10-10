'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { authorizeCgiUser, getLogoutUrl } from '../../redux/accountAction';
import { logoutUser } from '../../utils';

class FooterLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logoutUrl: null,
        };
    }

    signOutUser = async() => await logoutUser();

    componentDidUpdate() {
        const { logoutUrl } = this.state;
        const { user } = this.props;

        if (logoutUrl && user && !user.userInfo ) {
            this.signOutUser().finally(() => { location.href = logoutUrl; });
        }
    }

    componentDidMount() {
        const self = this;

        let logoutUrl = this.state.logoutUrl;
        if (!logoutUrl && typeof this.props.getLogoutUrl === 'function') {
            this.props.getLogoutUrl((url) => {
                if (url && url !== 'undefined') {
                    logoutUrl = `${url}/logout?app=scn&refferer=%2Farcadier_supplychain`;
                    self.setState({ logoutUrl });
                }
            });
        }

        if (localStorage) {
            const tokenData = JSON.parse(localStorage.getItem('ls.token'));
            const cgiTokenIndex = document.cookie.split(';').findIndex(cookie => cookie.indexOf('cgitoken') !== -1);
            if (tokenData && cgiTokenIndex === -1) {
                const { email, userid: userId, token: cgiToken } = tokenData;
                self.props.authorizeCgiUser({ cgiToken, userId, email });
            }
        }
    }

    render() {
        return (
           <div className='container-fluid'>
            <div className='row'>
                <div className='col-md-12 col-sm-12'>
                    <ul className="footer-navigation">
                        <li>
                            <a className='copy-right' style={{ color: '#9D9D9C !important'}} href='https://clarivate.com/legal/copyright-notice/' target='_blank' rel='noreferrer'>
                                © 2021 Clarivate
                            </a>
                        </li>
                        <li><a target='_blank' rel='noreferrer' href='https://clarivate.com/legal-center/terms-of-business/'>Terms of Use</a></li>
                        <li><a target='_blank' rel='noreferrer' href='https://clarivate.com/privacy-center/notices-policies/privacy-policy/'>Privacy Statement</a></li>
                        <li><a target='_blank' rel='noreferrer' href='https://clarivate.com/privacy-center/notices-policies/cookie-policy/'>Cookie Policy</a></li>
                        <li>
                            <button 
                                id="ot-sdk-btn"
                                className="ot-sdk-show-settings"
                            >
                                Manage cookie preferences
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        authorizeCgiUser: (options) => dispatch(authorizeCgiUser(options)),
        getLogoutUrl: (callback) => dispatch(getLogoutUrl(callback)),
    }
}

const FooterLayout = connect(
    mapStateToProps,
    mapDispatchToProps
)(FooterLayoutComponent)

module.exports = {
    FooterLayout,
    FooterLayoutComponent
}
