'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var BaseComponent = require('../../../../../../shared/base');
var Moment = require('moment');
let BookingDetailHeaderComponent = require('../../../purchase_order/merchant/order_history_list/' + process.env.PRICING_TYPE + '/bookingheader');
let BookingDetailComponent = require('../../../purchase_order/merchant/order_history_list/' + process.env.PRICING_TYPE + '/index');

const PermissionTooltip = require('../../../../../../common/permission-tooltip');

class MerchantFeaturePurchaseOrderListB2cComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            invoiceNo: ''
        };
    }

    onDropdownChange(e) {
        var self = this;
        const target = e.target;

        this.props.validatePermissionToPerformAction("edit-merchant-purchase-orders-api", () => {
            self.setState({ status: target.value, invoiceNo: target.id });
            self.renderModalPopup();
            self.props.updateHistoryOrders(target.id, target.value);
        });
    }
    onCheckboxChange(e, cartitemId) {
        const self = this;
        const checked = e.target.checked;

        this.props.validatePermissionToPerformAction("edit-merchant-purchase-orders-api", () => {
            self.props.revertPaymentOrderList(checked, cartitemId);
        });
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

    formatDateTimeMerchantPO(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().format(format);
        } else {
            return Moment.utc(timestamp).local().format(format);
        }
    }
    getLatestFulfillmentStatus(cartItem) {
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

        return status;
    }

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
        return status;
    }


    renderStatusDropdown(order) {

        if (order && order.CartItemDetails) {
            const cartItem = order.CartItemDetails[0];
            const orderStatus = this.getLatestFulfillmentStatus(cartItem);

           
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


            if (cartItemType === "delivery") {
                statuses = process.env.DELIVERY_FULFILLMENT_STATUSES.split(',');

             

            } else if (cartItemType === "pickup") {
                statuses = process.env.PICKUP_FULFILLMENT_STATUSES.split(',');

              

            } else if (cartItemType === null) {
                statuses = process.env.DELIVERY_FULFILLMENT_STATUSES.split(',');
                statuses = statuses.filter(s => s !== 'Delivered');


            }
            else {

              

                statuses = process.env.DELIVERY_FULFILLMENT_STATUSES.split(',');
            }

          

            //if the status is not present add it?
            //https://arcadier.atlassian.net/browse/ARC-10273
            var statusCheck = statuses.find(d => d == orderStatus);
            if (!statusCheck) {
                statuses.push(orderStatus)
            }

            var isInternalCodOrOfflinePayment = true;
            if (order.PaymentDetails && order.PaymentDetails.length > 0) {
                const paymentDetail = order.PaymentDetails[0];
                if (paymentDetail && paymentDetail.Gateway) {
                    const gateway = paymentDetail.Gateway;
                    if (gateway && gateway.Code) {
                        if (!gateway.Code.includes('cash-on-delivery') && !gateway.Code.includes('offline-payments')) {
                            isInternalCodOrOfflinePayment = false;
                        }
                    }
                }
            }

            

            if (!isInternalCodOrOfflinePayment) {
                statuses = statuses.filter(s => s.toLowerCase() !== 'created');
            }

           

            return (
                <PermissionTooltip isAuthorized={this.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                    <div className="select-wrapper mxw">
                        <select className="order-item-status-popup" disabled={orderStatus == 'Cancelled'} id={cartItem.ID} defaultValue={orderStatus} onChange={(e) => this.onDropdownChange(e)}>
                            {
                                statuses.map(function (status, index) {
                                    let statusText = status;
                                    if (statusText === 'Ready For Consumer Collection') {
                                        statusText = 'Ready for Pick-up';
                                    }
                                    if (statusText === 'Delivered' && process.env.PRICING_TYPE === 'service_level') {
                                        statusText = 'Shipped';
                                    }
                                    if (status == orderStatus) {
                                        return (
                                            <option key={index} selected="selected" value={status}>{statusText}</option>
                                        )
                                    }
                                    else {
                                        return (
                                            <option key={index} value={status}>{statusText}</option>
                                        )
                                    }
                                })
                            }
                        </select>
                    </div>
                </PermissionTooltip>
            )
        } else {
            return "";
        }

    }

    renderRecords() {
        var self = this;
        if (self.props.Records != null && self.props.Records.length > 0) {

            var html = this.props.Records.map(function (obj, index) {
                let isRefunded = obj.Orders[0].PaymentStatus === 'Refunded' ? "checked" : "";

                //ARC8930 need to adjust here, since the FailedTransaction is using the same Manager as PO here
                if (obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Processing" ||
                    obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Failed" ||
                    obj.Orders && obj.Orders[0].PaymentDetails && obj.Orders[0].PaymentDetails[0].Status === "Created")
                    return ""
                // let fromDateTime = obj.Orders[0].CartItemDetails[0].BookingSlot ? self.formatDateTimeMerchantPO(obj.Orders[0].CartItemDetails[0].BookingSlot.FromDateTime) : '';
                // let toDateTime = obj.Orders[0].CartItemDetails[0].BookingSlot ? self.formatDateTimeMerchantPO(obj.Orders[0].CartItemDetails[0].BookingSlot.ToDateTime) : '';
                return <tr href="javascript:void(0)" className="account-row " data-key="item" data-id={1}>
                    <td><a href={"/merchants/order/detail/" + obj.InvoiceNo}>{obj.Orders[0].CosmeticNo != null && obj.Orders[0].CosmeticNo != "" ? obj.Orders[0].CosmeticNo : obj.Orders[0].PurchaseOrderNo}</a></td>
                    <td><a href={"/merchants/order/detail/" + obj.InvoiceNo}>{self.formatDateTime(obj.Orders[0].CreatedDateTime)}</a></td>
                    <td><a href={"/merchants/order/detail/" + obj.InvoiceNo}>{obj.Orders[0].ConsumerDetail.DisplayName}</a></td>
                    <BookingDetailComponent invoice={obj} />
                    <td className="text-right">
                        <a href={"/merchants/order/detail/" + obj.InvoiceNo}>
                            <div className="item-price"><span className="currencyCode"></span> <span className="currencySymbol"></span><span className="priceAmount">{self.formatMoney(obj.Orders[0].CurrencyCode, obj.Orders[0].GrandTotal)}</span></div>
                        </a>
                    </td>
                    <td className="no-click">{self.renderStatusDropdown(obj.Orders[0])}</td>
                    <td className="no-click">
                        <div className="slrordrlst-refnd-act">
                            <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                <div className="fancy-checkbox">
                                    <input type="checkbox" id={'refund-' + index} className="slrordrlst-refnd-chk" checked={isRefunded} onChange={(e) => self.onCheckboxChange(e, obj.Orders[0].CartItemDetails[0].ID)} />
                                    <label htmlFor={'refund-' + index} />
                                </div>
                            </PermissionTooltip>
                        </div>
                    </td>
                </tr>
            });
            return html;
        }
    }
    renderUpdatePopup() {
        return (<div className="popup-area order-itemstatus-popup">
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
                                <BookingDetailHeaderComponent />
                                <th>Total</th>
                                <th>Order Status</th>
                                <th>Refund</th>
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