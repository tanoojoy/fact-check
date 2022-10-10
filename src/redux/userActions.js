'use strict';
import axios from 'axios';
var actionTypes = require('./actionTypes');
const prefix  = require('../public/js/common.js').getAppPrefix();
import { toExternalUserCompanyInfo } from '../utils';

import { generateTempId } from '../scripts/shared/common';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

const getUserInfo = (id, token) => dispatch => {
    axios({
        url: `/api/user?clarivateUserId=${id}`,
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        method: 'get'
    })
        .then(response => {
            dispatch({
                type: actionTypes.GET_USER_INFO,
                userInfo: response.data
            });
        })
        .catch(err => {
            console.log(err);
        });
};

function updateUserInfo(userInfo) {
    return function (dispatch) {
        const externalUserInfo = toExternalUserCompanyInfo(userInfo, true);
        if (externalUserInfo.MediaOriginalFileName != null && externalUserInfo.MediaOriginalFileName.length > 0) {
            const formData = new FormData();
            var block = externalUserInfo.MediaUrl.split(';');
            var contentType = block[0].split(':')[1];
            var realData = block[1].split(',')[1];
            const convertedBuffer = b64toBlob(realData, contentType);
            formData.append('userMedia', convertedBuffer, externalUserInfo.MediaOriginalFileName);
            $.ajax({
                url: prefix+'/users/profile/media',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                method: 'POST',
                type: 'POST'
            }).then(function(data, textStatus, jqXHR) {
                externalUserInfo.MediaOriginalFileName = null;
                externalUserInfo.MediaUrl = null;
                externalUserInfo.Media = [];
                externalUserInfo.Media.push({ ID: data[0].ID });
                delete externalUserInfo.MediaUrl;
                delete externalUserInfo.MediaOriginalFileName;

                return externalUserInfo;
            }).then(function(externalUserInfo) {
                ajaxUpdateInfo(dispatch, externalUserInfo);
            });
        } else {
            ajaxUpdateUserInfo(dispatch, externalUserInfo);
        }
    };
}

function getLocations(callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/user/locations',
            type: 'GET',
            success: function (result) {
                if (typeof callback == 'function') {
                    callback(result);
                }

                // empty dispatch only
                return dispatch({
                    type: '',
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function createCustomFieldDefinition(customFieldDefinition) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/user/customFieldDefinition',
            type: 'POST',
            data: customFieldDefinition,
            success: function (result) {
                return dispatch({
                    type: actionTypes.CREATE_USER_CUSTOM_FIELD,
                    CustomFields: result
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function ajaxUpdateUserInfo(dispatch, userInfo) {
    const userAjaxOptions = {
        url: prefix+'/users/update',
        type: 'PUT',
        data: JSON.stringify(userInfo),
        contentType: 'application/json'
    };
    $.ajax(userAjaxOptions)
        .done(function(user) {
            dispatch({
                type: actionTypes.UPDATE_USER_INFO_FORM_UNIQUE_GUID,
                payload: generateTempId()
            })
            return dispatch({
                type: actionTypes.UPDATE_USER_INFO,
                user: user
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

const getUpgradeToPremiumPaymentLink = (callback) => dispatch => {
    const requestOptions = {
        url: prefix + '/users/payment-link',
        type: 'GET',
    };
    $.ajax(requestOptions)
        .done((result) => {
            callback(result?.paymentLink);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.log(textStatus, errorThrown);
            callback(null);
        })
        .complete(() => dispatch({ type: ''}));
};

const requestLinkToCompany = (data, callback) => dispatch => {
    axios.post(`${prefix}/choice-user-company/update`, data)
        .then(response => {
            if (response.data.error) {
                callback({ success: false });
            } else {
                callback({ success: true });
            }
            return dispatch({
                type: '',
            });
        })
        .catch(err => {
            callback({ success: false });
            return dispatch({
                type: '',
            });
        });
}

const updateUserRole = (role, callback) => dispatch => {
    axios.post(`${prefix}/choice-user-role/update-user-role`, { role })
        .then((response) => {
            callback(response?.data?.redirectUrl);
            return dispatch({
                type: '',
            });
        })
        .catch((err) => {
            callback(null);
            return dispatch({
                type: '',
            });
        });
}

const getFollowedCompanies = (page, size) => dispatch => {
    $.ajax({
        url: `${prefix}/users/follower-list?page=${page}&size${size}`,
        type: 'GET',
        success: function (result) {
            console.log('result', result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

const sendInviteColleaguesEmail = (data, callback) => dispatch => {
    axios.post(`${prefix}/users/invite-colleagues`, data)
        .then(({ data }) => {
            callback(data?.success);
            return dispatch({
                type: '',
            });
        })
        .catch((err) => {
            callback(false);
            return dispatch({
                type: '',
            });
        });
}

const shareProductProfile = (data, callback) => dispatch => {
    axios.post(`${prefix}/users/share-product`, data)
        .then(({ data }) => {
            callback(data?.success);
            return dispatch({
                type: '',
            });
        })
        .catch((err) => {
            callback(false);
            return dispatch({
                type: '',
            });
        });
}

const shareCompanySendEmail = (data, callback) => dispatch => {
    $.ajax({
        url: `${prefix}/users/share-company`,
        type: 'POST',
        data: data,        
        success: function (result) {
            if (callback) {
                callback();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

const followCompany = (data, callback) => dispatch => {
    const { followCompanyId, isFollow } = data;
    let type = '';
    if (isFollow) {
        type = 'POST';
    }
    else {
        type = 'DELETE';
    }
    $.ajax({
        url: `${prefix}/users/follower`,
        type: type,
        data: {
            followCompanyId
        },
        success: function (result) {
            if (callback) {
                callback();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

const getFollowerProductsByPageAndSize = (page, size, callback) => dispatch => {
    axios.get(`${prefix}/users/product-follower-list?page=${page}&size=${size}`)
        .then(({ data }) => {
            callback(data?.followerProducts.followers || []);
            return dispatch({
                type: '',
            });
        })
        .catch((err) => {
            callback([]);
            return dispatch({
                type: '',
            });
        });
}

module.exports = {
    updateUserInfo: updateUserInfo,
    getLocations: getLocations,
    createCustomFieldDefinition: createCustomFieldDefinition,
    getUserInfo,
    getUpgradeToPremiumPaymentLink,
    requestLinkToCompany,
    updateUserRole,
    getFollowedCompanies,
    sendInviteColleaguesEmail,
    shareProductProfile,
    shareCompanySendEmail,
    followCompany,
    getFollowerProductsByPageAndSize
};
