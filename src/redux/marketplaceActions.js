'use strict';
const prefix  = require('../public/js/common.js').getAppPrefix();
var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function getInfo() {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/marketplace/getInfo',
            type: 'GET',
            data: {},
            success: function (result) {
                return dispatch({
                    type: actionTypes.GET_MARKETPLACE_INFO,
                    name: result.Name,
                    seoTitle: result.SeoTitle,
                    logoUrl: result.LogoUrl,
                    languages: result.Languages,
                    homepageUrl: result.HomepageUrl,
                    merchantSubAccountActive: result.MerchantSubAccountEnabled,
                    isMerchantRestrictedOnly: result.IsMerchantRestrictedOnly,
                    customFields: result.CustomFields,
                    isPrivateEnabled: result.IsPrivateEnabled,
                    googleAnalytics: result.GoogleAnalytics,
                    favIconData: result.FavIconData,
                    ControlFlags: result.ControlFlags
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

module.exports = {
    getInfo: getInfo
}
