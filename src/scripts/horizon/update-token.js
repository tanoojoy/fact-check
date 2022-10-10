import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { safeJsonParse, logoutUser } from '../../utils';
import { getAppPrefix } from '../../public/js/common';

const pingUrl = (location.hostname.includes('localhost') || location.hostname.includes('127.0.0.1')) ? '/testRoutePing/api/generics/api/info/ping' : '/api/generics/api/info/ping';

const requestPing = (token = '', redirectUrl = '') => {
    axios
        .get(pingUrl, {
            headers: {
                authorization: `Bearer ${token}`
            }
        }).then((result) => {
            console.log('ping result', result);
        })
        .catch((error) => {
            console.log('ping error');
            if (error.response.status === 419 || error.response.status === 401) {
                logoutUser(() => {
                    window.location = redirectUrl;
                });
            }
        });
};

const create = (claims, token) => {
    const expiration = claims.exp ? +new Date(claims.exp * 1000) : -1;

    const _user = {
        token,
        expire: expiration,
        userid: claims.sub,
        email: claims['1p:eml'],
        provider: claims['1p:prd'],
        truids: claims['1p:truids']
    };

    localStorage.setItem('ls.token', JSON.stringify(_user));
};

const updateTokenFromStorage = (token = '', url) => {
    const claims = jwtDecode(token);
    create(claims, token);
    requestPing(token, url);
};

(function(safeJsonParse) {
    axios.get(`${getAppPrefix()}/accounts/auth-url`).then(({ data: url }) => {
        const checkToken = () => {
            const lstoken = safeJsonParse(localStorage.getItem('ls.token'));
            if (lstoken && lstoken.token) {
                updateTokenFromStorage(lstoken.token, url + '/login?app=scn&refferer=%2Farcadier_supplychain');
                return true;
            }
            return false;
        };

        checkToken();

        const interval = setInterval(() => {
            return checkToken() ? 'token updated' : clearInterval(interval);
        }, 60 * 1000);
    }).catch(e => console.log('Error while trying to refresh token', e));
})(safeJsonParse);
