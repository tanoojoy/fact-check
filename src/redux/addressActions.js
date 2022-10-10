'use strict';

const prefix  = require('../public/js/common.js').getAppPrefix();

var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function createAddress(newAddress, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/users/address/create',
            type: 'POST',
            data: newAddress,
            success: function (address) {
                var returnValue = dispatch({
                    type: actionTypes.CREATE_ADDRESS,
                    address: address
                });

                if (callback)
                    callback();

                return returnValue;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function deleteAddress(addressId) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/users/address/delete',
            type: 'POST',
            data: {
                addressId: addressId
            },
            success: function (address) {
                let addresses = getState().settingsReducer.addresses;
                addresses.map(function (address,i) {
                    if (address.ID === addressId) {
                        addresses.splice(i, 1);
                    }
                });
                return dispatch({
                    type: actionTypes.DELETE_ADDRESS,
                    addresses: addresses
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function updateUserToOnboard(isOnboarded, hasRedirection = true) {
    return function (dispatch, getState) {
        if (isOnboarded === true) {
            if (hasRedirection) {
                window.location = prefix+"/merchants/dashboard";
            } else {
                window.location = prefix+"/";
            }

            return dispatch({ type: '' });
        } else {
            const userAjaxOptions = {
                url: prefix+'/users/update',
                type: 'PUT',
                data: JSON.stringify({ Onboarded: true }),
                contentType: 'application/json'
            };
            $.ajax(userAjaxOptions)
                .done(function (data) {
                    if (data) {
                        if (hasRedirection) {
                            window.location = prefix+"/merchants/items";
                        } else {
                            window.location = prefix+"/";
                        }
                    }

                    return dispatch({ type: '' });
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                });
        }
    }
}

module.exports = {
    createAddress: createAddress,
    deleteAddress: deleteAddress,
    updateUserToOnboard: updateUserToOnboard
};
