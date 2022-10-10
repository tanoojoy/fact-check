﻿'use strict';
var React = require('react');

var UserMenuComponentTemplate = require('./user-menu')
var SellerMenuComponentTemplate = require('./seller-menu')
var LanguageMenuComponentTemplate = require('./language-menu')

class HeaderMenuComponentTemplate extends React.Component {
    renderSellerMenu() {
        if (typeof this.props.user !== 'undefined' && this.props.user != null && this.props.user.Roles != null && (this.props.user.Roles.includes('Merchant') || this.props.user.Roles.includes('Submerchant'))) {
            return (
                <SellerMenuComponentTemplate {...this.props}/>    
            )
        }

        return '';
    }

    render() {
        return (
            <div className="pull-right">
                <ul className="header-menus">
                    {this.renderSellerMenu()}
                    <LanguageMenuComponentTemplate {...this.props} />
                    <UserMenuComponentTemplate {...this.props} />
                </ul>
            </div>
        );
    }
}

module.exports = HeaderMenuComponentTemplate;