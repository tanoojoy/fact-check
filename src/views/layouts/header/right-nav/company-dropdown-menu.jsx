'use strict';
import React from 'react';
import { HEADER_POPOVER } from '../../../../consts/popover-content';
import {
	isCompanyAttachRequestSend,
	isCompleteOnBoarding,
} from '../../../../utils';
import { getAppPrefix } from '../../../../public/js/common';
import Popover from '../../../common/popover';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

const appPrefix = getAppPrefix();

const { PENDING_COMPANY_APPROVAL } = HEADER_POPOVER;

class CompanyDropdownMenu extends React.Component {

	getCompanyName() {
		if (this.props.user) {
			const { companyInfo = null } = this.props.user;
			return (companyInfo && companyInfo.name) || '';
		}
		return '';
	}

	renderTemporaryCompanyMenu() {
		if (isCompanyAttachRequestSend(this.props.user)) {
			return (
				<li className="h-username">
					<div className="request-processed  new-header" id='pending-company-popover-container'>
						<i className="icon icon-clock-blue"></i>
						<p>Your company request is being processed</p>
						<Popover
							id={PENDING_COMPANY_APPROVAL.id}
							iconClass={PENDING_COMPANY_APPROVAL.iconClass}
							trigger={PENDING_COMPANY_APPROVAL.trigger}
							autoHideIcon={PENDING_COMPANY_APPROVAL.autoHide}
							containerId={PENDING_COMPANY_APPROVAL.containerId}
							content={PENDING_COMPANY_APPROVAL.content}
							placement={PENDING_COMPANY_APPROVAL.placement}
						/>
					</div>
				</li>
			);
		}
		return (
			<li className="h-username">
				<span className="your-company-name">Your Company</span>
			</li>
		);
	}


	render() {
		if (!isCompleteOnBoarding(this.props.user)) return this.renderTemporaryCompanyMenu();
		return (
			<li className="h-username" onClick={(e) => this.props.handleMenuClick(e, "company-dropdown-menu")} >
				<span>
					<p>{this.getCompanyName()}</p>
					<i className="icon icon-down" />
				</span>
				<ul className="h-dd-menu hide-me" id="company-dropdown-menu">
					<li>
						<a href={`${appPrefix}/company`}>My Company Page</a>
					</li>
					<li>
						<a href={`${appPrefix}/company/settings`}>Update My Company Page</a>
					</li>
				</ul>
			</li>
		);
	}
}

export default CompanyDropdownMenu;