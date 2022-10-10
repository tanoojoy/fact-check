'use strict'
const React = require('react');
const CommonModule = require('../../../../../public/js/common.js');

class SidebarNav extends React.Component {

	renderSubAccountMenu() {
		return (
			<li className="has-sub">
				<a href="#">
					<i className="fas fa-key fa-fw" />
					<span>Sub Account</span>
				</a>
				<ul>
					<li>
						<a href={CommonModule.getAppPrefix()+"/subaccount/list"}>
							<i className="fas icon-spacer fa-fw" />
							<span>Account List</span>
						</a>
					</li>
					<li>
						<a href={CommonModule.getAppPrefix()+"/activity-logs"}>
							<i className="fas icon-spacer fa-fw" />
							<span>Activity Log</span>
						</a>
					</li>
				</ul>
			</li>
		);
	}

	renderMerchantSubAccountMenu() {
		if (this.props.isMerchantSubAccountActive) {
			return this.renderSubAccountMenu();
		}
		return;
	}

	renderMerchantNav() {
		return (
			<ul className="sidebar-nav">
		        <li>
		            <a href={CommonModule.getAppPrefix()+"/merchants/dashboard"}>
		            	<i className="fas fa-tachometer-alt fa-fw" />
		            	<span>Dashboard</span>
		            </a>
		        </li>
		        <li>
		            <a href={CommonModule.getAppPrefix()+"/merchants/items"}>
			            <i className="fas fa-cubes fa-fw" />
			            <span>Inventory</span>
		            </a>
		        </li>
		        <li>
		            <a href={CommonModule.getAppPrefix()+"/merchants/upload"}>
		            	<i className="fas fa-plus fa-fw" />
		            	<span>Create new listing</span>
		            </a>
		        </li>
		        <li className="has-sub">
		            <a href="#">
		            	<i className="fas fa-file-alt fa-fw" />
		            	<span>Documents</span>
		            </a>
		            <ul>
		            	<li>
	                        <a active-on-route={CommonModule.getAppPrefix()+"/quotation"} href={CommonModule.getAppPrefix()+"/quotation/list"}>
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Quotation</span>
	                        </a>
	                    </li>
		                <li>
		                    <a active-on-route={CommonModule.getAppPrefix()+"/merchants/order"} href={CommonModule.getAppPrefix()+"/merchants/order/history"}>
		                    	<i className="fas icon-spacer fa-fw" />
		                    	<span>Purchase Order</span>
		                    </a>
		                </li>
		            </ul>
		        </li>
		        {this.renderMerchantSubAccountMenu()}
		        <li>
		            <a active-on-route={CommonModule.getAppPrefix()+"/delivery"} href={CommonModule.getAppPrefix()+"/delivery/settings"}>
		            	<i className="fas fa-shipping-fast fa-fw" />
		            	<span>Shipping</span>
		            </a>
		        </li>
	    	</ul>
	    )
	}

	renderBuyerNav() {
		return (
			<ul className="sidebar-nav">
	            <li>
	                <a href={CommonModule.getAppPrefix()+"/"}>
	                	<i className="fas fa-home fa-fw"/>
	                	<span>Homepage</span>
	                </a>
	            </li>
	            <li className="has-sub">
	                <a href="#">
	                	<i className="fas fa-file-alt fa-fw" />
	                	<span>Documents</span>
	                </a>
	                <ul>
	                	<li>
							<a active-on-route={CommonModule.getAppPrefix()+"/quotation/"} href={CommonModule.getAppPrefix()+"/quotation/list?buyer=true"}>
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Quotation</span>
	                        </a>
	                    </li>
	                    <li>
	                        <a active-on-route={CommonModule.getAppPrefix()+"/purchase"} href={CommonModule.getAppPrefix()+"/purchase/history"}>
	                        	<i className="fas icon-spacer fa-fw" />
	                        	<span>Purchase Order</span>
	                        </a>
	                    </li>
	                </ul>
	            </li>
	            {this.renderSubAccountMenu()}
	        </ul>
		);
	}

	render() {
		return (
			<React.Fragment>
				{
					typeof this.props.isMerchant !== 'undefined' ?
						this.props.isMerchant == true ? this.renderMerchantNav() : this.renderBuyerNav()
					: ''
				}

			</React.Fragment>
		)
	}
}

module.exports = SidebarNav;
