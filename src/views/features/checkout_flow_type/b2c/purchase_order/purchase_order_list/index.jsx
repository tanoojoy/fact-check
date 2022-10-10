'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');
var Moment = require('moment');
const Currency = require('currency-symbol-map');
const PurchaseTableContents = require('./' +  process.env.PRICING_TYPE + '/index');

class FeaturePurchaseOrderListB2cComponent extends PurchaseTableContents {
    
    getLatestOrderStatus(cartItem) {
        let status = "";
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');

        if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
            orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        }

        if (orderStatuses.length > 0) {
            orderStatuses.sort((a, b) => (a.CreatedDateTime > b.CreatedDateTime) ? 1 : -1)
            status = orderStatuses[orderStatuses.length - 1].Name;
        } else if (orderStatuses.length === 0) {
            let fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
            if (fulfillmentStatuses.length > 0) {
                status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
            }
        } 
        switch (status) {
            case 'Ready For Consumer Collection':
                status = 'Ready for Pick-up';
                break;
            case 'Delivered':
                if (cartItem.BookingSlot != 'undefined' && cartItem.BookingSlot != null) {
                    status = 'Shipped';
                }
                break;
        }
        return status;
    }

    renderHeader() {
        if (typeof this.renderCustomHeader == 'function') return this.renderCustomHeader();
        return (
            <thead>
                <tr>
                    <th>Order No.</th>
                    <th>Timestamp</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Order Status</th>
                </tr>
            </thead>
        );
    }

    renderCustomListItemContent(contentCode, invoice) {
        if (contentCode == 'BOOKING_DETAILS') {
            if (typeof this.renderBookingDetails == 'function') {
                return this.renderBookingDetails(invoice);
            }
        }
        return;
    }

    render() {
        const self = this;
        if (this.props.Records) {
            return (
                <React.Fragment>
                    <div className="subaccount-data-table table-responsive">
                        <table className="table order-data1 sub-account tb-left clickable">
                            {this.renderHeader()}
                            <tbody>
                                {
                                    this.props.Records.map(function (obj, index) {
                                        //ARC8930 need to adjust here, since the FailedTransaction is using the same Manager as PO here
                                        if (obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Processing" || 
                                            obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Failed" ||
                                            obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Created")
                                            return ""
                                        return <tr className="account-row " data-key="item" data-id={1}>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{obj.Orders[0].CosmeticNo != null && obj.Orders[0].CosmeticNo != "" ? obj.Orders[0].CosmeticNo : obj.Orders[0].PurchaseOrderNo}</a></td>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{self.formatDateTime(obj.Orders[0].CreatedDateTime)}</a></td>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{obj.Orders[0].MerchantDetail.DisplayName}</a></td>
                                            {self.renderCustomListItemContent('BOOKING_DETAILS', obj)}
                                            <td className="text-right">
                                                <div className="item-price test">
                                                    <span className="currencyCode"></span>
                                                    <span className="currencySymbol"></span>
                                                    <span className="priceAmount">{self.formatMoney(obj.Orders[0].CurrencyCode, obj.Orders[0].GrandTotal)}</span>
                                                </div>
                                            </td>
                                            {
                                                obj.Orders[0].CartItemDetails ? 
                                                    <td>{self.getLatestOrderStatus(obj.Orders[0].CartItemDetails[0]) ? self.getLatestOrderStatus(obj.Orders[0].CartItemDetails[0]) : "N / A"}</td>
                                                    : <td> N/A </td> 
                                            }
                                            
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                </React.Fragment>
            );
        } else {
            return "";
        }

    }
}

module.exports = FeaturePurchaseOrderListB2cComponent;