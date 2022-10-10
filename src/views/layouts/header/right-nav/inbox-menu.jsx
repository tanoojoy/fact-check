'use strict';
import React from 'react';
import {
	isCompleteOnBoarding,
	isCompanyAttachRequestSend,
	userHasCompany
} from '../../../../utils';
import { getAppPrefix } from '../../../../public/js/common';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

const appPrefix = getAppPrefix();

class InboxMenu extends React.Component {
	renderDisabledInboxMenu() {
		return (
			<li className="h-mail"> 
				<span className="your-company-name">Inbox</span>
			</li>
		);
	}

	render() {
		const { user, hasUnreadMessages } = this.props;
		if (!userHasCompany(user) && isCompanyAttachRequestSend(user)) return null;
		if (!isCompleteOnBoarding(user)) return this.renderDisabledInboxMenu();
		return (
			<li className="h-mail"> 
				<a href={`${appPrefix}/chat/inbox/requests-quotes`}>Inbox </a>
				{hasUnreadMessages && <i className="icon icon-active-mail" />}
			</li>
		);
	}
}

export default InboxMenu;