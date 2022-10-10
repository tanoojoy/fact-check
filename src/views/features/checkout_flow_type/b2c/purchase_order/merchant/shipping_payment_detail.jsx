var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class ShippingPaymentDetailComponent extends BaseComponent {

    render() {
        const detail = this.props.detail;
        const order = detail.Orders[0];
        const isRefunded = order.PaymentStatus === 'Refunded' ? true : false;
        let shippingMethod = '';
        let shippingMethodMinimumLeadTime = 'N/A';
        let shippingMethodID = null;
        const cartItem = order.CartItemDetails[0];

        if (cartItem.PickupAddress) {
            shippingMethod = cartItem.PickupAddress.Line1;
        } else if (cartItem.ShippingMethod) {
            shippingMethod = cartItem.ShippingMethod.Description;
            shippingMethodID = cartItem.ShippingMethod.ID;
        }

        // if (this.props.shippingMethod && this.props.shippingMethod.length > 0 && shippingMethodID) {
        //     var shipping = this.props.shippingMethod.find(s => s && s.ID === shippingMethodID);
        //     if (shipping && shipping.CustomFields) {
        //         var customFieldValue = JSON.parse(shipping.CustomFields[0].Values[0]);
        //         shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
        //     }
        // }
        if (cartItem.ShippingMethod && cartItem.ShippingMethod.CustomFields) {
            var customFieldValue = JSON.parse(cartItem.ShippingMethod.CustomFields[0].Values[0]);
            shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
        }

        let orderNo = "-";
        if (order.PurchaseOrderNo) {
            orderNo = order.PurchaseOrderNo;
        }

        let paymentStatusTableBase = '';
        if (order.PaymentDetails != null && order.PaymentDetails.length > 0) {
            paymentStatusTableBase = order.PaymentDetails[0].Status == "Success" ? 'Paid' : order.PaymentDetails[0].Status
        }

        return (
            <div className="col-md-4">
                <table className="canon-table">
                    <tbody><tr>
                        <th>Order No. : </th>
                        <td data-th="Invoice No. :">{orderNo}</td>
                    </tr>
                        <tr>
                            <th>Invoice No. :</th>
                            <td data-th="Invoice No. :">{detail.InvoiceNo}</td>
                        </tr>
                        <tr>
                            <th>Payment Type :</th>
                            <td data-th="Invoice No. :">{order.PaymentDetails[0].Gateway ? order.PaymentDetails[0].Gateway.Gateway : "N / A"}</td>
                        </tr>
                        <tr>
                            <th>Payment Status :</th>
                            <td data-th="Invoice No. :">{paymentStatusTableBase}</td>
                        </tr>
                        <tr>
                            <th>Shipping Method:</th>
                            <td data-th="Invoice No. :">{shippingMethod}</td>
                        </tr>
                        <tr>
                            <th>Minimum Lead Time:</th>
                            <td data-th="Invoice No. :">{shippingMethodMinimumLeadTime}</td>
                        </tr>
                        <tr>
                            <th>Order Status:</th>
                            <td data-th="Invoice No. :">
                                <div className="select-wrapper osg mxw">
                                    {this.props.renderStatusDropdown(order)}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Refund:</th>
                            <div className="slrordrlst-refnd-act">
                                <div className="fancy-checkbox">
                                    <input className="slrordrlst-refnd-chk" type="checkbox" id="refund-1" name="item-options[]" checked={isRefunded} onChange={(e) => this.props.onCheckboxChange(e, cartItem.ID)} />
                                    <label htmlFor="refund-1" />
                                </div>
                            </div>
                        </tr>
                    </tbody></table>
            </div>
        );
    }
}

module.exports = ShippingPaymentDetailComponent;

