'use strict';
var React = require('react');
const CommonModule = require('../../../../public/js/common');

class ExtraMenuComponent extends React.Component {
    renderComparisonIcon() {
        if (this.props.isDeliveryComponent == true && this.props.isMerchant == true) return null;
        return (
            <li className="h-cart">
                <a href={CommonModule.getAppPrefix()+"/comparison/list"}><i className="fa fa-th-list"></i></a>
            </li>
        )
    }

    render() {
        return (
            <React.Fragment>
                <li className="h-mail">
                    <a href={CommonModule.getAppPrefix()+"/chat/inbox"}>
                        <i className="fa fa-envelope"></i>
                        <span> (<span className="cart-count" id="unreadMessagesCount">{this.props.unreadCount || 0}</span>)</span>
                    </a>
                </li>
                {this.renderComparisonIcon()}
            </React.Fragment>
        )
    }

}

module.exports = ExtraMenuComponent;
