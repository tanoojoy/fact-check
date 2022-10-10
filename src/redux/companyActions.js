const prefix  = require('../public/js/common.js').getAppPrefix();

var actionTypes = require('./actionTypes');
if (typeof window !== 'undefined') {
    var $ = window.$;
}

import { generateTempId } from '../scripts/shared/common';
import { toExternalUserCompanyInfo } from '../utils';

const uploadFile = (id, file) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        $.ajax({
            url: prefix + '/company/files/' + id + '/upload',
            type: 'POST',
            data: formData,
            success: function (result) {
                resolve(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    });
}

const uploadAllFiles = async (id, files) => {
    let results = [];
    for (let item of files) {
        let r = await uploadFile(id, item.file);
        results.push(r);
    }
    return results;
}

function updateCompanyInfo(companyInfo, filesList) {
    return function(dispatch, getState) {
        const company = toExternalUserCompanyInfo(companyInfo, false)
        const companyInfoAjaxOptions = {
            url: prefix+'/company/update',
            type: 'PUT',
            data: JSON.stringify(company),
            contentType: 'application/json'
        };
        $.ajax(companyInfoAjaxOptions)
            .done(function (data) {
                //upload filesList
                //let uploadPromise = [];
                //for (var i = 0; i < filesList.length; i++) {
                //    uploadPromise.push(uploadFile(company.id, filesList[i].file));
                //}
                //if (uploadPromise && uploadPromise.length > 0) {
                //    Promise.all(uploadPromise).then(responses => {
                //        //get the response which as most number of files
                //        const sortedResponses = responses.sort((a, b) => (a.files.length > b.files.length));
                //    });
                //}
                //console.log('data', data);
                const executeFileUpload = false;
                if (executeFileUpload && filesList && filesList.length > 0) {
                    uploadAllFiles(companyInfo.id, filesList)
                        .then(results => {
                            return dispatch({
                                type: actionTypes.GET_USERCOMPANY_DETAILS,
                                payload: data,
                                userDetailsKey: generateTempId()
                            });
                        });
                }
                else {
                    return dispatch({
                        type: actionTypes.GET_USERCOMPANY_DETAILS,
                        payload: data,
                        userDetailsKey: generateTempId()
                    });
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });
    }
}

module.exports = {
    updateCompanyInfo, updateCompanyInfo
}