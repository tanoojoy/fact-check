'use strict';

import { utils } from '../public/js/snowplow/utils';
import { deleteCookies } from '../utils';

const prefix = require('../public/js/common.js').getAppPrefix();
const actionTypes = require('./actionTypes');
const LOGIN_REJECTED = 'login rejected';

function logout() {
    return {
        type: actionTypes.LOGOUT
    };
}

const authorizeCgiUser = options => dispatch => {
    deleteCookies();

    const { userId } = options;
    fetch(prefix + '/accounts/cgi-sign-in', {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(options),
        method: 'POST'
    })
        .then(response => {
            if (response.status === 500) throw Error(LOGIN_REJECTED);
            return response.json();
        }).then(result => {
            setTimeout(() => {
                if (window.snowplow) {
                    utils.setUserId(userId);
                    utils.trackEventFull('get-permanent-token', 'successful', undefined, undefined, 0);
                }
            }, 5000);
            return result;
        })
        .then(result => {
            window.location.href = result.redirectUrl || prefix + '/';
        })
        .catch(err => {
            if (err.message === LOGIN_REJECTED) localStorage.removeItem('ls.token');
            console.log('Error while trying to login', err);
        });
};

const getLogoutUrl = callback => dispatch => {
    const requestOptions = {
        url: prefix + '/accounts/auth-url',
        type: 'GET',
    };
    $.ajax(requestOptions)
        .done((result) => {
            callback(result);
            return dispatch({ type: ''});
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
            callback(null);
        });
}

function changeUserPassword(options, callback) {
    return function(dispatch) {
        const userAjaxOptions = {
            url: prefix + '/accounts/change-password',
            type: 'POST',
            data: JSON.stringify(options),
            contentType: 'application/json'
        };

        $.ajax(userAjaxOptions)
            .done(function(result) {
                const {
                    Result,
                    user
                } = result;
                var dispatchedData = dispatch({
                    type: actionTypes.RESET_PASSWORD,
                    user
                });
                callback(Result);

                return dispatchedData;
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
    };
}

function registerWithUsernameAndPassword(options, callback) {
    return function(dispatch) {
        const userAjaxOptions = {
            url: prefix + '/users/register-with-username-and-password',
            type: 'POST',
            data: JSON.stringify(options),
            contentType: 'application/json'
        };

        $.ajax(userAjaxOptions)
            .done(function(user) {
                var dispatchedData = dispatch({
                    type: actionTypes.RESET_PASSWORD,
                    user: user
                });

                callback(user);

                return dispatchedData;
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
    };
}

function createInterestedUser(options, callback) {
    return function(dispatch) {
        const userAjaxOptions = {
            url: prefix + '/accounts/interested-user',
            type: 'POST',
            data: JSON.stringify(options),
            contentType: 'application/json'
        };

        $.ajax(userAjaxOptions)
            .done(function(result) {
                const { Result } = result;

                if (Result === true) {
                    window.sessionStorage.setItem('isSuccessInterestedUser', true);
                    window.location.href = prefix + '/';
                } else {
                    callback(result);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
    };
}

function switchLoginMethod(dispatch, userInfo) {
    return dispatch({
        type: actionTypes.SWITCH_LOGIN_METHOD

    });
}

module.exports = {
    authorizeCgiUser,
    logUserOut: logout,
    changeUserPassword: changeUserPassword,
    registerWithUsernameAndPassword: registerWithUsernameAndPassword,
    createInterestedUser: createInterestedUser,
    switchLoginMethod,
    getLogoutUrl
};
