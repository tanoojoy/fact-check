'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../../shared/base');
var Moment = require('moment');
class MerchantFeaturePurchaseOrderListB2cComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            invoiceNo:''
        };
    }

    onDropdownChange(e) {
        var self = this;
        self.setState({ status: e.target.value, invoiceNo: e.target.id });
        self.renderModalPopup();
        self.props.updateHistoryOrdersB2B(e.target.id, e.target.value);
    }
    onCheckboxChange(e,cartitemId) {
        const self = this;
        self.props.revertPaymentOrderList(e.target.checked, cartitemId);
    }
    renderModalPopup() {
        var target = jQuery(".popup-area.order-itemstatus-popup");
        var cover = jQuery("#cover");
        target.fadeIn();
        cover.fadeIn();
    }
    closeModalPopUp() {
        jQuery(".popup-area.order-pickup-dilvery-popup").fadeOut();
        jQuery(".popup-area.order-dilvery-popup").fadeOut();
        jQuery("#cover").fadeOut();
    }
    componentDidMount() {
        $('body').on('click', '.slrordrlst-refnd-chk', function () {
           order_itemstatus_popup(this);
        });
        
        $('body').on('change', '.order-item-status-popup', function () {



          // order_itemstatus_popup(this);



        });
        jQuery(".btn-saffron").click(function () {



            $(this).parents(".popup-area").hide();



            jQuery("#cover").hide();



        });
        $('body').on('click', function (e) {

            var $target = $(e.target);

            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {

                $('.advanced-select .dropdown').removeClass('open');

            }

        });
        $('body').on('click', '.close-status-change-popup', function () {



          //  closeStatusChangePopup();



        });
        function closeStatusChangePopup() {



            jQuery(".popup-area.order-pickup-dilvery-popup").fadeOut();



            jQuery(".popup-area.order-dilvery-popup").fadeOut();



            jQuery("#cover").fadeOut();







        }
        function order_itemstatus_popup(obj) {



            var target = jQuery(".popup-area.order-itemstatus-popup");



            var cover = jQuery("#cover");



            target.fadeIn();



            cover.fadeIn();



        }
    }

    

    formatDateTime(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().local().format(format);
        } else {
            return Moment.utc(timestamp).local().format(format);
        }
    }
    getLatestFulfillmentStatus(cartItem) {
        let status = '';
        const fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');

        if (fulfillmentStatuses.length > 0) {
            status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
        }

        return status;
    }

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


    renderStatusDropdown(order) {
        if (order && order.CartItemDetails) {
            //b2b
            const cartItem = order.CartItemDetails[0];
            const fulfillmentStatus = this.getLatestOrderStatus(cartItem);
            let statuses = [];
            let cartItemType = cartItem.CartItemType;

            if (!cartItemType) {
                if (order.CustomFields) {
                    const orderDeliveryOptionCustomField = order.CustomFields.filter(c => c.Name == 'OrderDeliveryOption')[0];

                    if (typeof orderDeliveryOptionCustomField != 'undefined' && orderDeliveryOptionCustomField && orderDeliveryOptionCustomField.Values) {
                        const customFieldValue = JSON.parse(orderDeliveryOptionCustomField.Values[0]);

                        cartItemType = customFieldValue.DeliveryType;
                    }
                }
            }

          //  if (cartItemType === "delivery") {
                statuses = process.env.DELIVERY_FULFILLMENT_STATUSES_b2b.split(',');
          // } else if (cartItemType === "pickup") {
          //      statuses = process.env.PICKUP_FULFILLMENT_STATUSES_b2b.split(',');
         //   }

            return (
               <div className="select-wrapper mxwr">
                <select className="order-item-status-popup" id={order.ID} value={fulfillmentStatus} onChange={(e) => this.onDropdownChange(e)}>
                    {
                        statuses.map(function (status, index) {
                            return (
                                <option key={index} value={status}>{status === 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status}</option>
                            )
                        })
                    }
                </select>
              </div>
            )

        } else {
            return "";
        }
        
    } 

    renderInvoiceList(order) {
        let links = [];
        if (order && order.PaymentDetails && order.PaymentDetails.length > 0) {
            let invoiceNos = order.PaymentDetails.map((payment) => payment.InvoiceNo);
            invoiceNos = [...new Set(invoiceNos)];

            invoiceNos.map((invoiceNo, index) => {
                links.push(<a href={`/invoice/detail/${invoiceNo}`} key={index}>{invoiceNo}</a>);
                links.push(<span key={'comma-' + index}> , </span>);
            });

            links.pop();

            return (
                <React.Fragment>
                    {links}
                </React.Fragment>
            )
        }

        return (<a href='#'>-</a>);
    }
    renderRecords() {
        var self = this;
        if (self.props.Records != null && self.props.Records.length > 0) {
           
            var html = this.props.Records.map(function (obj, index) {
                return <tr className="account-row " data-key="item" data-id={1}>
                    <td><a href={"/merchants/order/detail/orderid/" + obj.ID}>{obj.PurchaseOrderNo}</a></td>
                    <td><a href={"/merchants/order/detail/orderid/" + obj.ID}>{self.formatDateTime(obj.CreatedDateTime)}</a></td>
                    <td><a href={"/merchants/order/detail/orderid/" + obj.ID}>{obj.ConsumerDetail.DisplayName}</a></td>
                    <td className="wrap-col" data-th="Invoice No">
                        <div className="ids-wrap"> 
                            {self.renderInvoiceList(obj)}   
                        </div>
                    </td>
                    <td className="text-right">
                        <a href={"/merchants/order/detail/orderid/" + obj.ID}>
                            <div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.formatMoney(obj.CurrencyCode, obj.GrandTotal)}</span></div>
                        </a>
                    </td>
                    <td className="no-click">{self.renderStatusDropdown(obj)}</td>
                </tr>
            });
            return html;
        }
    }
    renderUpdatePopup() {
      return(  <div className="popup-area order-itemstatus-popup">
            <div className="wrapper">
                <div className="title-area text-capitalize">
                    <h1 className="text-center">STATUS CHANGED</h1>
                </div>
                <div className="content-area text-center">
                    <p>The order status for this item has been updated.</p>
                </div>
                <div className="btn-area text-center">
                    <input data-key data-id type="button" defaultValue="Okay" className="my-btn btn-saffron" />
                    <div className="clearfix" />
                </div>
            </div>
        </div>)
    }
    render() {
        var self = this;
        return (
            <React.Fragment>
                <div className="subaccount-data-table table-responsive">
                    <table className="table order-data1 tb-left sub-account clickable">
                        <thead>
                            <tr>
                                <th>Order No.</th>
                                <th>Timestamp</th>
                                <th>Buyer</th>
                                <th>Invoice No</th>
                                <th>Total</th>
                                <th>Order Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.renderRecords()
                            }
                        </tbody>
                    </table>
                </div>
                {self.renderUpdatePopup()}
            </React.Fragment>
        );
    }
}

module.exports = MerchantFeaturePurchaseOrderListB2cComponent;