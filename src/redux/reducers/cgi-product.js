'use strict';
const actionTypes = require('../actionTypes');

const initialState = {
    productDetails: {}
};

function productReducer(state = initialState, action) {
    switch (action.type) {
    case actionTypes.GET_PRODUCT: {
        return {
            ...state,
            productDetails: action.productDetails,
        };
    }
    default:
        return state;
    }
}

module.exports = {
    productReducer
};
