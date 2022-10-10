'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../shared/base');
var Moment = require('moment');
const Currency = require('currency-symbol-map');
class FeaturePurchaseOrderListB2cComponent extends BaseComponent {
    getLatestOrderStatus(cartItem) {
        let status = "";
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1].Name;
        }
        return status === 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status ;
    }
    render() {
        const self = this;
        if (this.props.Records) {
            return (
                <React.Fragment>
                    <div className="subaccount-data-table table-responsive">
                        <table className="table order-data1 sub-account tb-left clickable">
                            <thead>
                                <tr>
                                    <th>Order No.</th>
                                    <th>Timestamp</th>
                                    <th>Supplier</th>
                                    <th>Total</th>
                                    <th>Order Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.props.Records.map(function (obj, index) {
                                        //ARC8930 need to adjust here, since the FailedTransaction is using the same Manager as PO here
                                        if (obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Processing" || 
                                            obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Failed" ||
                                            obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Created")
                                            return ""

                                        return <tr className="account-row " data-key="item" data-id={1}>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{obj.Orders[0].PurchaseOrderNo}</a></td>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{self.formatDateTime(obj.Orders[0].CreatedDateTime)}</a></td>
                                            <td><a href={"/purchase/detail/" + obj.InvoiceNo + "/merchant/" + obj.Orders[0].MerchantDetail.ID}>{obj.Orders[0].MerchantDetail.DisplayName}</a></td>
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