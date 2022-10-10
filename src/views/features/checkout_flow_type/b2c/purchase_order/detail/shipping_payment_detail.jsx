var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class ShippingPaymentDetailComponent extends BaseComponent {
    getLatestOrderStatus(cartItem) {
        //let status = "";
        //let fulfilmentStatus = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        //if (fulfilmentStatus.length > 0) {
        //    status = fulfilmentStatus[fulfilmentStatus.length - 1].Name;
        //} else if (fulfilmentStatus.length === 0) {
        //    let orderStatus = cartItem.Statuses.filter(s => s.Type === 'Order');
        //    if (orderStatus.length > 0) {
        //        status = orderStatus[orderStatus.length - 1].Name;
        //    }
        //}
        //b2b
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
        //return status === 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status;
    }

    componentDidMount() {
        //TODO: POGI GO BACK HERE IN MONDAY
        var self = this;
    }

    render() {
        const detail = this.props.detail;
        const order = detail.Orders[0];

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

        if (cartItem.ShippingMethod && cartItem.ShippingMethod.CustomFields) {
            var customFieldValue = JSON.parse(cartItem.ShippingMethod.CustomFields[0].Values[0]);
            shippingMethodMinimumLeadTime = customFieldValue.MinimumLeadTime;
        }

        let orderNo = "-";
        if (order.PurchaseOrderNo) {
            orderNo = order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo : order.PurchaseOrderNo;
        }

        let paymentStatusTableBase = order.PaymentStatus || '';
        //if (order.PaymentDetails != null && order.PaymentDetails.length > 0) {
        //    paymentStatusTableBase = order.PaymentDetails[0].Status == "Success" ? 'Paid' : order.PaymentDetails[0].Status
        //}

        return (
            <div className="col-md-4">
                <table className="canon-table">
                    <tbody><tr>
                        <th>Order No. : </th>
                        <td data-th="Invoice No. :">{orderNo}</td>
                    </tr>
                        <tr>
                            <th>Invoice No. :</th>
                            <td data-th="Invoice No. :">{order.PaymentDetails[0].CosmeticNo != null && order.PaymentDetails[0].CosmeticNo != "" ? order.PaymentDetails[0].CosmeticNo : detail.InvoiceNo}</td>
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
                            <th>Minimum Lead Time: </th>
                            <td data-th="Invoice No. :">{shippingMethodMinimumLeadTime}</td>
                        </tr>
                        <tr>
                            <th>Order Status:</th>
                            <td data-th="Invoice No. :">{this.getLatestOrderStatus(cartItem) ? this.getLatestOrderStatus(cartItem) : "N / A"}</td>
                        </tr>
                    </tbody></table>
            </div>
        );
    }
}

module.exports = ShippingPaymentDetailComponent;

