var React = require('react');
var BaseComponent = require('../../../../../../views/shared/base');

class ShippingPaymentDetailComponent extends BaseComponent {
    getLatestOrderStatus(cartItem) {
        //b2b
        let status = "";
        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');
        if (orderStatuses.length > 0) {
            status = orderStatuses[orderStatuses.length - 1].Name;
        } else if (orderStatuses.length === 0) {
            let fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
            if (fulfillmentStatuses.length > 0) {
                status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
            }
        }
        return status;
    }
    render() {
        const order = this.props.detail;
        let shippingMethod = '';
      //  let shippingMethodID = '';
        var cartItem = null;

        //Precaution cause 9532 was fix because of this but i had fix mine using the below error 9399
        if (order.CartItemDetails)
            cartItem = order.CartItemDetails[0];

        if (typeof cartItem == 'undefined' || cartItem == null) {
            cartItem = order.Orders[0].CartItemDetails[0];
        }


        if (cartItem.PickupAddress) {
            shippingMethod = cartItem.PickupAddress.Line1;
        } else if (cartItem.ShippingMethod) {
            shippingMethod = cartItem.ShippingMethod.Description;
          //  shippingMethodID = cartItem.ShippingMethod.ID;
        }

        let paymentTermName = "-";
        if (order.PaymentTerm) {
            paymentTermName = order.PaymentTerm.Name;
        }
        return (
            <div className="col-md-4">
                <table className="canon-table">
                    <tbody><tr>
                        <th>PO No. : </th>
                        <td data-th="Order Status :">{order.CosmeticNo != null && order.CosmeticNo != "" ? order.CosmeticNo : order.PurchaseOrderNo}</td>
                    </tr>
                        <tr>
                            <th>Order Status :</th>
                            <td data-th="Invoice No. :">{this.getLatestOrderStatus(cartItem) ? this.getLatestOrderStatus(cartItem) : "N / A"}</td>
                        </tr>
                        <tr>
                            <th>Payment Terms :</th>
                            <td data-th="Invoice No. :">{paymentTermName}</td>
                        </tr>
                        <tr>
                            <th>Shipping Method :</th>
                            <td data-th="Invoice No. :">{shippingMethod}</td>
                        </tr>
                    </tbody></table>
            </div>
        )
    }
}

module.exports = ShippingPaymentDetailComponent;

