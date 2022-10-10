const React = require('react');
const BaseComponent = require('../shared/base');
const cartActions = require('../../redux/cartActions');
const CheckoutButtonComponent  = require('../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/checkout-button/' + process.env.CHECKOUT_TYPE + '/index');
const CommonModule = require('../../public/js/common');

class OrderSummary extends BaseComponent {
	getSummary() {
		let subTotal = 0;
	    let currencyCode = '';
	    let cartIDs = [];
	    const self = this;
	    const merchantsOfSelected = [];
	    const cartDataArr = [];
	    this.props.cartPageModel.cartList.forEach(function (merchants) {
	        if (self.props.cartPageModel.isArranged === true) {
	            merchants.forEach(function (cart) {
	                if (cart.isChecked === "checked") {
	                    subTotal = subTotal + (cart.SubTotal - (cart.DiscountAmount || 0));
	                    cartIDs.push(cart.ID);
	                    cartDataArr.push({
	                        ID: cart.ID,
	                        Quantity: cart.Quantity,
	                        ItemID: cart.ItemDetail.ID,
	                        ItemParentID: cart.ItemDetail.ParentID,
	                    });
	                    if (!merchantsOfSelected.includes(cart.ItemDetail.MerchantDetail.ID)) merchantsOfSelected.push(cart.ItemDetail.MerchantDetail.ID)
	                }

	                currencyCode = cart.ItemDetail.CurrencyCode;
	            });
	        }
	    });
	    const merchantSelectedCount = merchantsOfSelected.length;
	    const isGuest = !this.props.user || this.props.user.Guest;
	    return { subTotal, currencyCode, cartIDs, merchantSelectedCount, isGuest, cartDataArr };
	}

	CheckoutButtonPressedWrapper(cartIDs, userId) {
		const self = this;
		if (self.user.Guest == true && self.controlFlags.GuestCheckoutEnabled == false) {
			let loc = (location.pathname + location.search).substr(1)
			location.href = `${CommonModule.getAppPrefix()}/accounts/non-private/sign-in?returnUrl=${loc}`;
		} else {
			return self.CheckoutButtonPressed(cartIDs, userId);
		}
	}

	render() {
		const { merchantSelectedCount, currencyCode, subTotal, cartIDs, isGuest, cartDataArr } = this.getSummary();
		if (!(this.props.cartPageModel.cartList && this.props.cartPageModel.cartList.length > 0 && this.props.cartPageModel.isArranged)) return "";
		return (
			<div className="idc-right">
				<div className="cbcir-box">
					<span className="cbcir-title">Order Summary</span>
					<div className="cbcir-text">
						<span>SubTotal</span>
						<span className="title">
							<div className="item-price">
								{this.renderFormatMoney(currencyCode, subTotal)}
							</div>
						</span>
					</div>
					<div className="cbcir-button">
						<CheckoutButtonComponent
							CheckoutButtonPressedWrapper={this.CheckoutButtonPressedWrapper}
							validateCarts={this.props.validateCarts}
							merchantSelectedCount={merchantSelectedCount}
							cartDataArr={cartDataArr}
							cartIDs={cartIDs}
							isGuest={isGuest}
							{...this.props}
						/>
						<div className="btn-continue"><a href={CommonModule.getAppPrefix()+"/"}>Continue Shopping</a></div>
					</div>
				</div>
			</div>
		);
	}
}

function customMapDispatchToProps(dispatch) {
	return {
		CheckoutButtonPressed: (cartIDs, userID) => dispatch(cartActions.CheckoutButtonPressed(cartIDs, userID)),
		validateCarts: (options, callback) => dispatch(cartActions.validateCarts(options, callback)),
	};
};

module.exports = {
	OrderSummary,
	customMapDispatchToProps,
};
