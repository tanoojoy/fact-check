import React, { useState } from 'react';
import axios from 'axios';

import { getAppPrefix } from '../../../../public/js/common';
const appPrefix = getAppPrefix();

const LoginBtn = () => {
    const [loginUrl, setLoginUrl] = useState();

    if (!loginUrl) {
        axios.get(`${appPrefix}/accounts/auth-url`).then(({ data: url }) => {
            setLoginUrl(url + '/login?app=scn&refferer=%2Farcadier_supplychain');
        }).catch(e => console.log('Error while trying to get login link', e));
    }

    return (
        <a href={loginUrl} className='login-btn'>
            <span>Log In</span>
        </a>
    );
};

export default LoginBtn;
