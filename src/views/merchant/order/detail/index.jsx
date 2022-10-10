'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var OrderDiaryActions = require('../../../../redux/orderDiaryActions');
var OrderActions = require('../../../../redux/orderActions');

var HeaderLayoutComponent = require('../../../../views/layouts/header/index').HeaderLayoutComponent;
var SidebarLayoutComponent = require('../../../../views/layouts/sidebar').SidebarLayoutComponent;
var FooterLayout = require('../../../../views/layouts/footer').FooterLayoutComponent;
var BaseComponent = require('../../../../views/shared/base');

let TableItemsComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/' + process.env.PRICING_TYPE + '/order_detail/table-items.jsx');
let TransactionSummaryComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/transaction_summary.jsx');
let ModalSuccessChangeComponent = require('../../../features/checkout_flow_type/modal-success-change.jsx');
let OrderDiaryComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/order-diary');
let ShippingPaymentDetailComponent = require('../../../features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/purchase_order/merchant/shipping_payment_detail');
class OrderDetailComponent extends BaseComponent {

    componentDidUpdate() {
        if (this.props.isShowSuccessMessage === true) {
            $(".order-itemstatus-popup").modal("show");
        } else {
            $(".order-itemstatus-popup").modal("hide");
        }
    }

    componentDidMount() {
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    renderSupplierAddress() {
        let shippingAddress = null;
        let supplierDisplayName = null;

        if (this.props.detail.Orders) {
            shippingAddress = this.props.detail.Orders[0].DeliveryFromAddress;
            supplierDisplayName = this.props.detail.Orders[0].MerchantDetail.DisplayName;
        } else {
              //For B2b unxpected change of Model
            shippingAddress = this.props.detail.DeliveryFromAddress;
            supplierDisplayName = this.props.detail.MerchantDetail.DisplayName;
            
        }
        const supplierName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const line2 = shippingAddress.Line2 ? shippingAddress.Line2 : "";

        if (shippingAddress && shippingAddress.Name) {
            return (
                <div className="col-md-4">
                    <table className="canon-table">
                        <tbody><tr>
                            <th>Supplier :</th>
                        </tr>
                            <tr>
                                <td data-th="Supplier :">
                                    <span className="highlight-text">{supplierDisplayName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="highlight-text">{supplierName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {shippingAddress.Line1},<br />
                                    {line2}<br />
                                    {shippingAddress.City}<br />
                                    {shippingAddress.State}<br />
                                    {shippingAddress.Country}<br />
                                    {shippingAddress.PostCode}<br />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return "";
        }

    }
    renderShippingAddress() {
        let shippingAddress = null;
        if (this.props.detail.Orders) {
            shippingAddress = this.props.detail.Orders[0].DeliveryToAddress;
        } else {
            shippingAddress = this.props.detail.DeliveryToAddress;
        }

        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const line2 = shippingAddress.Line2 ? shippingAddress.Line2 : "";
        if (shippingAddress && shippingAddress.Name) {
            return (
                <div className="col-md-4">
                    <table className="canon-table">
                        <tbody><tr>
                            <th>Shipping Address :</th>
                        </tr>
                            <tr>
                                <td data-th="Shipping Address :">
                                    <span className="highlight-text">{buyerName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {shippingAddress.Line1},<br />
                                    {line2}<br />
                                    {shippingAddress.City}<br />
                                    {shippingAddress.State}<br />
                                    {shippingAddress.Country}<br />
                                    {shippingAddress.PostCode}<br />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return "";
        }
    }

    renderBillingAddress() {
        let shippingAddress = null;
        if (this.props.detail.Orders) {
            shippingAddress = this.props.detail.Orders[0].BillingToAddress;
        } else {
            shippingAddress = this.props.detail.BillingToAddress;
        }

        const buyerName = shippingAddress.Name && shippingAddress.Name.split('|').length > 1 ? shippingAddress.Name.replace('|', ' ') : shippingAddress.Name;
        const buyerDisplayName = this.props.user.DisplayName;
        const line2 = shippingAddress.Line2 ? shippingAddress.Line2 : "";

        let email = "";
        let number = "";

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail.Email) {
            email = this.props.detail.Orders[0].ConsumerDetail.Email;
        } else {
            email = this.props.detail.ConsumerDetail.Email;
        }

        if (this.props.detail.Orders && this.props.detail.Orders[0].ConsumerDetail.PhoneNumber) {
            number = this.props.detail.Orders[0].ConsumerDetail.PhoneNumber;
        } else {
            number = this.props.detail.ConsumerDetail.PhoneNumber;
        }

            return (
                <div className="col-md-4">
                    <table className="canon-table purchase-address-sec">
                        <tbody><tr>
                            <th>Billing Address :</th>
                            </tr>
                                <tr>
                                    <td className="billing-address" data-th="Billing Address :">  
                                        <span className="highlight-text">{buyerDisplayName}</span>
                                    </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="highlight-text">{buyerName}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {shippingAddress.Line1},<br />
                                    {line2}<br />
                                    {shippingAddress.City}<br />
                                    {shippingAddress.State}<br />
                                    {shippingAddress.Country}<br />
                                    {shippingAddress.PostCode}<br />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a href={"tel:+" + number}>+{number}</a><span className="text-spacer" />
                                </td>
                            </tr>
                            <tr>
                                <td>    
                                    <a href={"mailto:" + email}>{email}</a>
                                </td>
                            </tr>
                        </tbody></table>
                </div>
            );

    }
    
    getLatestFulfillmentStatus(cartItem) {
        let status = '';
        let fulfillmentStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        if (fulfillmentStatuses.length > 0) {
            status = fulfillmentStatuses[fulfillmentStatuses.length - 1].Name;
        }

        return status;
    }

    getLatestOrderStatus(cartItem) {
        //b2b
        let status = "";

        let orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Order');

        if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
            orderStatuses = cartItem.Statuses.filter(s => s.Type === 'Fulfilment');
        }

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

    onDropdownChange(e) {
        if (process.env.CHECKOUT_FLOW_TYPE === 'b2b') {
            this.updateOrderStatusb2binDetails(e.target.value);
        } else {
            this.updateDetailOrder(e.target.value);
        }
        
    }

    renderStatusDropdown(order) {
        const cartItem = order.CartItemDetails[0];
        let orderStatus = this.getLatestOrderStatus(cartItem);

        if (order && order.CartItemDetails) {
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

            if (process.env.CHECKOUT_FLOW_TYPE === 'b2c') {
                if (cartItemType === "delivery") {
                    statuses = process.env.DELIVERY_FULFILLMENT_STATUSES.split(',');
                } else if (cartItemType === "pickup") {
                    statuses = process.env.PICKUP_FULFILLMENT_STATUSES.split(',');
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

            } else {
               // if (cartItemType === "delivery") {
                    statuses = process.env.DELIVERY_FULFILLMENT_STATUSES_b2b.split(',');
              //  } else if (cartItemType === "pickup") {
              //      statuses = process.env.PICKUP_FULFILLMENT_STATUSES_b2b.split(',');
              //  }
            }


            return (
                <select className="order-item-status-popup" id="changeStatus" value={orderStatus} onChange={(e) => this.onDropdownChange(e)}>
                    {
                        statuses.map(function (status, index) {
                            return (
                                <option key={index} value={status}>{status === 'Ready For Consumer Collection' ? 'Ready for Pick-up' : status}</option>
                            )
                        })
                    }
                </select>
            )

        } else {
            return "";
        }      
    } 

    renderCommonView() {
        const detail = this.props.detail;
        let order = null;
        if (detail.Orders) {
            order = detail.Orders[0];
        } else {
            order = detail;
        }
         
        return (
            <div className="main" style={{ paddingTop: '46px' }}>
                <div className="orderlist-container">
                    <div className="container-fluid">
                        {/* title */}
                        <div className="sc-upper">
                            <div className="sc-u title-sc-u sc-u-mid full-width">
                                <div className="nav-breadcrumb">
                                    <i className="fa fa-angle-left" /> <a href="/merchants/order/history">Back</a>
                                </div>
                                <div className="flex-title">
                                    <span className="sc-text-big">Purchase Order Details</span>
                                    <div className="order-date pull-right">{this.formatDate(order.CreatedDateTime)} {this.formatTime(order.CreatedDateTime)}</div>
                                </div>
                            </div>
                        </div>
                        {/* title */}
                        <section className="sassy-box">
                            <div className="sassy-box-content box-order-detail">
                                <div className="row">
                                    {this.renderBillingAddress()}
                                    <div className="col-md-4" />
                                    <ShippingPaymentDetailComponent
                                        renderStatusDropdown={this.renderStatusDropdown}
                                        onDropdownChange={this.onDropdownChange}
                                        onCheckboxChange={this.onCheckboxChange}
                                        getLatestFulfillmentStatus={this.getLatestFulfillmentStatus}
                                        getLatestOrderStatus={this.getLatestOrderStatus}
                                        {...this.props} />
                                    <div className="spacer-20" />
                                    <div className="col-md-12">
                                        <div className="row">
                                            {this.renderSupplierAddress()}
                                            {this.renderShippingAddress()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="sassy-box no-border box-order-items">
                            <table className="table order-data table-items">
                                <thead>
                                    <tr>
                                        <th className="text-left">Item Description</th>
                                        {this.props.enableReviewAndRating === true ? <th>Review</th> : <th>&nbsp;</th>} 
                                        <th>Quantity</th>
                                        <th width="171px">Unit Price</th>
                                        <th width="171px">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TableItemsComponent {...this.props} enableReviewAndRating={this.props.enableReviewAndRating}/>
                                </tbody>
                            </table>
                        </section>
                        <TransactionSummaryComponent {...this.props} />
                        <OrderDiaryComponent
                            eventCustomField={this.props.eventCustomField}
                            events={this.getAllEvents()}
                            selectedSection={this.props.selectedSection}
                            selectedTabSection={this.props.selectedTabSection}
                            uploadFile={this.props.uploadFile}
                            isValidUpload={this.props.isValidUpload}
                            isSuccessCreate={this.props.isSuccessCreate}
                            fetchEvents={this.props.fetchEvents}
                            updateSelectedSection={this.props.updateSelectedSection}
                            updateSelectedTabSection={this.props.updateSelectedTabSection}
                            setUploadFile={this.props.setUploadFile}
                            createEvent={this.props.createEvent} />
                    </div>
                </div>
                <ModalSuccessChangeComponent showHideSuccessMessage={this.props.showHideSuccessMessage} />
            </div>
        );
    }

    onCheckboxChange(e, cartItemID) {
        this.revertPayment(e.target.checked, cartItemID);
    }

    render() {
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={this.props.categories} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayoutComponent user={this.props.user} />
                </aside>
                <div className="main-content">
                    {this.renderCommonView()}
                    <div className="footer" id="footer-section">
                        <FooterLayout panels={this.props.panels} />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        detail: state.orderReducer.detail,
        isShowSuccessMessage: state.orderReducer.isShowSuccessMessage,
        enableReviewAndRating: state.orderReducer.enableReviewAndRating,
        //Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateOrderStatusb2binDetails: (status) => dispatch(OrderActions.updateOrderStatusb2binDetails(status)),
        updateDetailOrder: (status) => dispatch(OrderActions.updateDetailOrder(status)),
        showHideSuccessMessage: (isShow) => dispatch(OrderActions.showHideSuccessMessage(isShow)),
        revertPayment: (isRefund, cartItemID) => dispatch(OrderActions.revertPayment(isRefund, cartItemID)),
        //Order Diary
        fetchEvents: () => dispatch(OrderDiaryActions.fetchEvents()),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData) => dispatch(OrderDiaryActions.createEvent(event, formData))
    }
}

const OrderDetailHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderDetailComponent)

module.exports = {
    OrderDetailHome,
    OrderDetailComponent
}