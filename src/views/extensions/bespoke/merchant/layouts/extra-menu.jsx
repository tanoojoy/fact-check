'use strict';
var React = require('react');
const CommonModule = require('../../../../../public/js/common');

class ExtraMenuComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <li className="h-mail">
                    <a href={CommonModule.getAppPrefix()+"/chat/inbox"}>
                        <i className="fa fa-envelope"></i>
                        <span> (<span className="cart-count" id="unreadMessagesCount">{this.props.unreadCount || 0}</span>)</span>
                    </a>
                </li>
                <li>
                    <a href={CommonModule.getAppPrefix()+"/delivery/settings"}>Delivery</a>
                </li>
            </React.Fragment>
        )
    }

}

module.exports = ExtraMenuComponent;
