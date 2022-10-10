'use strict';
var React = require('react');
var ReactRedux = require('react-redux');
var PickUpOption = require('../settings/pickup-option');
var DeliveryOptionSettings = require('../settings/delivery-option-settings');
var modal = require('../settings/modal');

var HeaderLayout = require('../../../views/layouts/header/index').HeaderLayoutComponent;
var SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
var FooterLayout = require('../../../views/layouts/footer').FooterLayoutComponent;
var addressActions = require('../../../redux/addressActions');
var shippingActions = require('../../../redux/shippingActions');
var userActions = require('../../../redux/userActions');

class DeliverySettingsComponent extends React.Component {

    componentDidMount() {
        var self = this;
    }
    renderMenu() {
        if (typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Roles != null) {
            if (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant')) {
                return (
                    <HeaderLayout categories={this.props.categories} user={this.props.user} />
                )
            }
            return <HeaderLayout categories={this.props.categories} user={this.props.user} />
        }

        return '';
    }

    render() {
        var self = this;
        return (
            <React.Fragment>
         
                    <div className="header mod" id="header-section">
                    {this.renderMenu()}
                    </div>
                    <aside className="sidebar" id="sidebar-section">
                        <SidebarLayout user={this.props.user} />
                    </aside>
                    <div className="main-content">
                    <div className="main">
                        <div className="delivery-setting-container">
                            <div className="container-fluid">
                                <span className="h-title">Shipping Settings</span>
                                <DeliveryOptionSettings customFieldDefinition={self.props.customFieldDefinition} updateUserInfo={self.props.updateUserInfo} deleteShippingMethod={self.props.deleteShippingMethod} user={this.props.user} shippingOptionsMerchant={self.props.shippingOptionsMerchant} shippingOptionsAdmin={self.props.shippingOptionsAdmin} pickupLocations={self.props.pickupLocations} />
                                <PickUpOption createAddress={this.props.createAddress} user={this.props.user} deleteAddress={self.props.deleteAddress} shippingOptionsMerchant={self.props.shippingOptionsMerchant} shippingOptions={self.props.shippingOptionsAdmin} pickupLocations={self.props.pickupLocations} />
                            </div>
                        </div>
                    </div>
                    </div>
                    <modal />
              
                <div className="footer" id="footer-section">
                    <FooterLayout panels={this.props.panels} />
                </div>
            </React.Fragment>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        shippingOptionsMerchant: state.deliverySettingsReducer.shippingOptionsMerchant,
        shippingOptionsAdmin: state.deliverySettingsReducer.shippingOptionsAdmin,
        pickupLocations: state.deliverySettingsReducer.pickupLocations,
        customFieldDefinition: state.deliverySettingsReducer.customFieldDefinition
    };
}

function mapDispatchToProps(dispatch) {
    return {
        deleteAddress: (addressId) => dispatch(addressActions.deleteAddress(addressId)),
        createAddress: (body) => dispatch(addressActions.createAddress(body)),
        deleteShippingMethod: (merchantID, shippingmethodID) => dispatch(shippingActions.deleteShippingOptions(merchantID, shippingmethodID)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo))
    };
}

const DeliverySettingsIndexReduxConnect = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(DeliverySettingsComponent);

module.exports = {
    DeliverySettingsIndexReduxConnect,
    DeliverySettingsComponent
};