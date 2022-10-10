'use strict';
var React = require('react');
import Currency from 'currency-symbol-map';
import BaseComponent from '../../../../../shared/base';
const CommonModule = require('../../../../../../public/js/common.js');

class OrderTotalComponent extends BaseComponent {
    getSubTotal() {
        const { invoiceDetails } = this.props;
        let subTotal = 0;
        if (invoiceDetails && invoiceDetails.Orders.length > 0) {
            const { Orders } = invoiceDetails;
            Orders.map(o =>
                o.CartItemDetails.map(cart =>
                    subTotal += parseFloat(cart.SubTotal) - parseFloat(cart.DiscountAmount || 0)
                )
            );
        }
        return subTotal;
    }

    getTotal() {
        const { invoiceDetails } = this.props;
        //let discount  = 0;
        //if (invoiceDetails && invoiceDetails.Orders.length > 0) {
        //    const { Orders } = invoiceDetails;
        //    Orders.map(o =>
        //        o.CartItemDetails.map(cart =>
        //            discount += parseFloat(cart.DiscountAmount || 0)
        //        )
        //    );
        //}
        return invoiceDetails.Total;
    }

    renderChargesAndDiscounts() {
        let charges = 0;
        let discount = 0;
        const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
        const QuantityOptions = ['Fixed', 'Percentage'];
        const { pendingOffer, invoiceDetails } = this.props;
        const currencyCode = invoiceDetails.CurrencyCode;
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
        if (self.props.orderSelectedDelivery && self.props.invoiceDetails.Orders) {
            self.props.invoiceDetails.Orders.forEach(function (order, i) {
                self.props.orderSelectedDelivery.forEach(function (delivery, i) {
                    if (delivery[order.ID] && delivery[order.ID].IsPickup === false) {
                        totalDeliveryCost = totalDeliveryCost + parseFloat(delivery[order.ID].ShippingCost);
                    }
                });
            });
        }

        return (
            //FIX ARC9207
            <div className="pcc-rigth pull-right">
                <div className="cbcir-box mobile_layout">
                    <div className="mobile-only text-center "> <span className="toggle_data">Click here for detail</span></div>
                    <div className="mobile-only   text-right"><img src={CommonModule.getAppPrefix() + "/assets/images/toggle_close.svg"} className="closer hide" /></div>
                    <div className="toggler_area">
                        <span className="cbcir-title">Order Total</span>
                        <div className="cbcir-text">
                            <div className="pccr-text2">
                                <span>
                                    <span className="title">Subtotal</span>
                                    <div className="item-price subTotal">
                                        {this.renderFormatMoney(this.props.invoiceDetails.CurrencyCode, this.getTotal())}
                                    </div>
                                </span>
                                {this.renderChargesAndDiscounts()}
                                <span>
                                    <span className="title">Shipping Cost</span>
                                    <div className="item-price deliveryCost">
                                        {this.renderFormatMoney(this.props.invoiceDetails.CurrencyCode, totalDeliveryCost)}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="sort-view-mobile">
                        <div className="pccr-total">
                            <span className="pccrt-sml">Total</span>
                            <span className="total-amount">
                                <div className="item-price totalCost">
                                    {this.renderFormatMoney(this.props.invoiceDetails.CurrencyCode, parseFloat(this.getTotal()) + parseFloat(totalDeliveryCost))}
                                </div>
                            </span>
                        </div>
                        <div className="pccr-btn">
                            <div className="btn-green full-btn-procced disable" onClick={(e) => this.props.handleProceedButton()} id="btnProceedPayment">Pay Now</div>
                            <div className="btn-white desktop-only"><a href={null} onClick={() => history.back()}>Cancel</a></div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}

module.exports = OrderTotalComponent;
