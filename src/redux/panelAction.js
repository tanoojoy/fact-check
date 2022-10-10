'use strict';
var actionTypes = require('./actionTypes');
const prefix  = require('../public/js/common.js').getAppPrefix();
if (typeof window !== 'undefined') {
    var $ = window.$;
}

function asyncLoadingPanels() {
    return function (dispatch) {
        $.ajax({
            url: prefix+'/panel/getPanels',
            type: 'GET',
            data: {
                pageSize: 24,
                pageNumber: 1,
                type: 'all'
            },
            success: function (result) {
                return dispatch({
                    type: actionTypes.FETCH_PANELS,
                    payload: result.Records
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
};

module.exports = {
    asyncLoadingPanels: asyncLoadingPanels
}
