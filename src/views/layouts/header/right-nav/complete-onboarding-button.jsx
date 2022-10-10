'use strict';
import React from 'react';
import {
	isCompanyAttachRequestSend,
	isCompleteOnBoarding,
	userRole,
	userHasCompany
} from '../../../../utils';

import { getAppPrefix } from '../../../../public/js/common';


if (typeof window !== 'undefined') {
    var $ = window.$;
}

class CompleteOnboardingButton extends React.Component {
	constructor(props) {
		super(props);
		this.getCompleteOnboardingLink = this.getCompleteOnboardingLink.bind(this);
	}

	getCompleteOnboardingLink() {
		const appPrefix = getAppPrefix();
		if (this.props.user) {
			if (!userRole(this.props.user)) {
		        return `${appPrefix}/choice-user-role?prevPage=${window.location.pathname}`;
		    } else if (!userHasCompany(this.props.user) || !isCompanyAttachRequestSend(this.props.user)) {
		       return `${appPrefix}/choice-user-company?prevPage=${window.location.pathname}`;
		    }
		}
	    return '#';
	}

	render() {
		const { user = {} } = this.props;
		if (isCompanyAttachRequestSend(user)) return null;
		return (
			<li className="be-seller">
				<a 
					className="complete-onboarding"
					onClick={() => window.location = this.getCompleteOnboardingLink()}
					href="#"
				>
                	Complete Your User Setup
				</a>
			</li>		
		);
	}
}

export default CompleteOnboardingButton;