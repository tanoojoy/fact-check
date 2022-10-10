'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
   companyInfo: {},
   companyProducts: []
};

function companyReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_COMPANY_INFO: {
            return {
                ...state,
                companyInfo: action.companyInfo,
            }
        }
        case actionTypes.GET_COMPANY_PRODUCTS: 
            return {
                ...state,
                companyProducts: action.companyProducts,
            }
        
        default:
            return state
    }
};

module.exports = {
    companyReducer
}
