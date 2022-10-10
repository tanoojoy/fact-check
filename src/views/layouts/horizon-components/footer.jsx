import React, { useEffect, useState } from 'react';
import AccountActions from '../../../redux/accountAction';
import { logoutUser } from '../../../utils';
import CommonModule from '../../../public/js/common';
import axios from 'axios';
const appPrefix = CommonModule.getAppPrefix();

const FooterLinks = () => {
    return (
        <>
            <li><a target='_blank' rel='noreferrer' href='https://clarivate.com/legal-center/terms-of-business/'>Terms of Use</a></li>
            <li><a target='_blank' rel='noreferrer' href='https://clarivate.com/privacy-center/notices-policies/privacy-policy/'>Privacy Statement</a></li>
            <li><a target='_blank' rel='noreferrer' href='https://clarivate.com/privacy-center/notices-policies/cookie-policy/'>Cookie Policy</a></li>
        </>
    );
};

const HorizonFooterComponent = () => {
    const [logoutUrl, setLogoutUrl] = useState();
    if (!logoutUrl) {
        axios.get(`${appPrefix}/accounts/auth-url`).then(({ data: url }) => {
            setLogoutUrl(url + '/logout?app=scn&refferer=%2Farcadier_supplychain');
        }).catch(e => console.log('Error while trying to get logout link for user redirect', e));
    }
    useEffect(() => {
        if (localStorage) {
            const tokenData = JSON.parse(localStorage.getItem('ls.token'));
            const cgiTokenIndex = document.cookie.split(';').findIndex(cookie => cookie.indexOf('cgitoken') !== -1);
            if (tokenData && cgiTokenIndex === -1) {
                const { email, userid: userId, token: cgiToken } = tokenData;
                AccountActions.authorizeCgiUser({ cgiToken, userId, email })();
            }
        }

        const { user } = window.REDUX_DATA.userReducer;
        if (logoutUrl && user && !user.userInfo) {
            signOutUser().finally(() => { location.href = logoutUrl; });
        }
    });

    const signOutUser = async() => await logoutUser();

    return (
        <div className='container-fluid footer-container'>
            <div className='row'>
                <div className='col-md-2 col-sm-2 text-center'>
                    <p className='copy-right'>
                        <a href='https://clarivate.com/legal/copyright-notice/' target='_blank' rel='noreferrer'>
                            © 2021 Clarivate
                        </a>
                    </p>
                </div>
                <div className='col-md-10 col-sm-10'>
                    <ul className='footer-navigation'>
                        <FooterLinks />
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HorizonFooterComponent;
