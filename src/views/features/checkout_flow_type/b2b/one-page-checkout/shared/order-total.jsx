'use strict';
const React = require('react');
import Currency from 'currency-symbol-map';
import BaseComponent from '../../../../../shared/base';

class OrderTotalComponent extends BaseComponent {
    getOrderSubTotal() {
        const { orderDetails } = this.props;
        let subTotal = 0;
        if (orderDetails && orderDetails.CartItemDetails.length > 0) {
            const { CartItemDetails } = orderDetails;
            CartItemDetails.map(cart => subTotal += parseFloat(cart.ItemDetail.Price * cart.Quantity) - parseFloat(cart.DiscountAmount || 0));
        }   
        return subTotal;
    }

    getTotal() {
        const { orderDetails } = this.props;
        //let discount  = 0;
        //if (orderDetails && orderDetails.CartItemDetails.length > 0) {
        //    const { CartItemDetails } = orderDetails;
        //    CartItemDetails.map(cart => 
        //        discount += parseFloat(cart.DiscountAmount || 0)
        //    )
        //}   
        return orderDetails.GrandTotal;
    }

    renderChargesAndDiscounts() {
        let charges = 0;
        let discount = 0;
        const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
        const QuantityOptions = ['Fixed', 'Percentage'];
        const { pendingOffer, orderDetails } = this.props;
        const currencyCode = orderDetails.CurrencyCode;
        if (pendingOffer) {
            const { OfferDetails } = pendingOffer;
            if (OfferDetails && OfferDetails.length > 1) {
                const arr = OfferDetails.slice(1);
                if (arr && arr.length > 0) {
                    arr.map(quotation => {
                        if (quotation.IsDiscount) discount += parseFloat(quotation.TotalAmount);
                        else {
                            if (ChargeReasons.includes(quotation.Name)) {
                                charges += parseFloat(quotation.TotalAmount);
                            }
                        }
                    });
                }
            }
        }
        return (
            <React.Fragment>
                <span>
                    <span className="title">Charge(s)</span>
                    <div className="item-price deliveryCost">
                        <span className="item-price">
                            {this.renderFormatMoney(currencyCode, charges)}
                        </span>
                    </div>
                </span>
                <span>
                    <span className="title">Discount(s)</span>
                    <div className="item-price deliveryCost">
                        <span className="item-price">
                            - {this.renderFormatMoney(currencyCode, discount)}
                        </span>
                    </div>
                </span>
            </React.Fragment>
        );
    }

    render() {
        let self = this;
        let isDisabled = "disabled";
        let totalDeliveryCost = 0;
        if (self.props.orderSelectedDelivery && self.props.orderDetails) {
            const orderID = self.props.orderDetails.ID;
            self.props.orderSelectedDelivery.forEach(function (delivery, i) {
                if (delivery[orderID] && delivery[orderID].IsPickup === false) {
                    totalDeliveryCost = totalDeliveryCost + parseFloat(delivery[orderID].ShippingCost);
                }

            });
        }

        return (
             //FIX ARC9207
            <div className="pcc-rigth pull-right">
                <div className="cbcir-box mobile_layout">
                    <div className="mobile-only text-center "> <span className="toggle_data">Click here for detail</span></div>
                    <div className="mobile-only   text-right"><img src="images/toggle_close.svg" className="closer hide" /></div>
                    <div className="toggler_area">
                        <span className="cbcir-title">Order Total</span>
                        <div className="cbcir-text">
                            <div className="pccr-text2">
                                <span>
                                    <span className="title">Subtotal</span>
                                    <div className="item-price subTotal">
                                        {this.renderFormatMoney(this.props.orderDetails.CurrencyCode, this.getTotal())}
                                    </div>
                                </span>
                                {this.renderChargesAndDiscounts()}
                                <span>
                                    <span className="title">Shipping Cost</span>
                                    <div className="item-price deliveryCost">
                                        {this.renderFormatMoney(this.props.orderDetails.CurrencyCode, totalDeliveryCost)}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="sort-view-mobile">
                        <div className="pccr-total">
                            <span className="pccrt-sml">Total</span>
                            <span className="total-amount">
                                <div className="item-price totalCost" data-total-cost={parseFloat(this.getTotal()) + parseFloat(totalDeliveryCost)} data-grand-total={this.getTotal()}>
                                    {this.renderFormatMoney(this.props.orderDetails.CurrencyCode, parseFloat(this.getTotal()) + parseFloat(totalDeliveryCost))}
                                </div>
                            </span>
                        </div>
                        <div className="pccr-btn">
                            <div className="btn-green full-btn-procced disable" onClick={(e) => this.props.handleProceedButton()} id="btnProceedPayment">Send Request</div>
                            <div className="btn-white desktop-only"><a href={null} onClick={() => history.back()}>Cancel</a></div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}

module.exports = OrderTotalComponent;