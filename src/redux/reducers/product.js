'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
   productInfo: {}
};

function productReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_PRODUCT_INFO: {
            return {
                ...state,
                productInfo: action.productInfo
            }
        }
        
        default:
            return state
    }
};

module.exports = {
    productReducer
}
