'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../../views/layouts/header/index').HeaderLayoutComponent;
const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const AddEditComponent = require('../../../views/features/checkout_flow_type/' + process.env.CHECKOUT_FLOW_TYPE + '/invoice/add-edit/index');
const InvoiceActions = require('../../../redux/invoiceActions');

const OrderDiary = require('../../order-diary/index');
const OrderDiaryWithBorder = require('../../order-diary/index-with-border');
const OrderDiaryActions = require('../../../redux/orderDiaryActions');

const sections = [
    { key: 'Comment', value: 'Comment' },
];

class AddEditInvoiceComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    getAllEvents() {
        return (this.props.events || []).concat((this.props.otherEvents || []));
    }

    isUserMerchant() {
        const { user } = this.props;

        if (user) {
            if (user.Roles && (user.Roles.includes('Merchant') || user.Roles.includes('Submerchant'))) {
                return true;
            }
        }

        return false;
    }

    render() {
        const OrderDiaryComponent = this.isUserMerchant() ? OrderDiaryWithBorder : OrderDiary;
        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={null} user={this.props.user} />
                </div>
                <aside className="sidebar" id="sidebar-section">
                    <SidebarLayout user={this.props.user} />
                </aside>
                <div className="main-content">
                    <div className="main">
                        <div className="orderlist-container">
                            <div className="container-fluid">
                                <AddEditComponent
                                    invoiceDetail={this.props.invoiceDetail}
                                    renderFormatMoney={this.renderFormatMoney}
                                    createInvoice={this.props.createInvoice}
                                />
                                <OrderDiaryComponent
                                    sections={sections}
                                    eventCustomField={this.props.eventCustomField}
                                    events={this.getAllEvents()}
                                    page={"create-invoice"}
                                    selectedSection={this.props.selectedSection}
                                    selectedTabSection={this.props.selectedTabSection}
                                    uploadFile={this.props.uploadFile}
                                    isValidUpload={this.props.isValidUpload}
                                    isSuccessCreate={this.props.isSuccessCreate}
                                    fetchEvents={this.props.fetchEvents}
                                    updateSelectedSection={this.props.updateSelectedSection}
                                    updateSelectedTabSection={this.props.updateSelectedTabSection}
                                    setUploadFile={this.props.setUploadFile}
                                    createEvent={this.props.createEvent}
                                    showDropdownPlaceholder={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        invoiceDetail: state.invoiceReducer.invoiceDetail,
        // Order Diary
        eventCustomField: state.orderDiaryReducer.eventCustomField,
        events: state.orderDiaryReducer.events,
        otherEvents: state.orderDiaryReducer.otherEvents,
        selectedSection: state.orderDiaryReducer.selectedSection,
        selectedTabSection: state.orderDiaryReducer.selectedTabSection,
        uploadFile: state.orderDiaryReducer.uploadFile,
        isValidUpload: state.orderDiaryReducer.isValidUpload,
        isSuccessCreate: state.orderDiaryReducer.isSuccessCreate
    };
}

function mapDispatchToProps(dispatch) {
    return {
        createInvoice: (options, callback) => dispatch(InvoiceActions.createInvoice(options, callback)),
        // Order Diary
        fetchEvents: (page) => dispatch(OrderDiaryActions.fetchEvents(page)),
        updateSelectedSection: (section) => dispatch(OrderDiaryActions.updateSelectedSection(section)),
        updateSelectedTabSection: (section) => dispatch(OrderDiaryActions.updateSelectedTabSection(section)),
        setUploadFile: (file, isValid) => dispatch(OrderDiaryActions.setUploadFile(file, isValid)),
        createEvent: (event, formData, page) => dispatch(OrderDiaryActions.createEvent(event, formData, page))
    };
}

const AddEditInvoiceComponentHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(AddEditInvoiceComponent);

module.exports = {
    AddEditInvoiceComponentHome,
    AddEditInvoiceComponent
};