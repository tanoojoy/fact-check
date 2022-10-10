'use strict';
var React = require('react');
const CommonModule = require('../../../../public/js/common');

class SellerMenuComponentTemplate extends React.Component {
    renderSubAccount() {

        if (this.props.merchantSubAccountActive == true) {
            return (
                <li><a href={CommonModule.getAppPrefix()+"/subaccount/list"}>Sub-Accounts</a></li>
            )
        }

        return null;
    }

    componentDidMount() {
    }

    render() {
        return (
            <li className="h-user seller-user" onClick={(e) => this.props.showSellerMenu(e)}>
                <a href="#">Seller</a>
                <ul className="h-dd-menu hide-me" style={{ overflow: 'hidden', outline: 'currentcolor none medium' }} tabIndex={1}>
                    <li><a href={CommonModule.getAppPrefix()+"/merchants/dashboard"}>Dashboard</a></li>
                    <li><a href={CommonModule.getAppPrefix()+"/merchants/items"}>Your Item</a></li>
                    <li><a href={CommonModule.getAppPrefix()+"/merchants/upload"}>Add Item</a></li>
                    <li><a href={CommonModule.getAppPrefix()+"/merchants/order/history"}>Orders</a></li>
                    {this.renderSubAccount()}
                    <li><a href={CommonModule.getAppPrefix()+"/delivery/settings"}>Delivery</a></li>
                </ul>
                <i className="fa fa-angle-down" />
            </li>
        )
    }
}

module.exports = SellerMenuComponentTemplate;
