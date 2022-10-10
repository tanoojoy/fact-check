'use strict';
var actionTypes = require('../actionTypes');

const initialState = {
    cartList: [],
    cartPageModel: []
};

function cartReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.GET_USER_CARTS: {
            return Object.assign({}, state, {
                cartList: action.cartList,
            });
        }

        case actionTypes.GET_CART_STATES: {
            return Object.assign({}, state, {
                cartPageModel: action.cartPageModel
            });
        }
       
        default:
            return state
    }
};

module.exports = {
    cartReducer: cartReducer
}