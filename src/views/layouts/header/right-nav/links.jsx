'use strict';
import React from 'react';
import CompleteOnboardingButton from './complete-onboarding-button';
import InviteColleaguesButton from './invite-colleagues-button';
import { isCompleteOnBoarding } from '../../../../utils';
import InboxMenu from './inbox-menu';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class Links extends React.Component {
	render() {
		return (
			<li className="h-extramenus hide-mobile">
				<ul>
					
					{
						isCompleteOnBoarding(this.props.user) ? 
							<InviteColleaguesButton 
								handleInviteButtonClick={this.props.handleInviteButtonClick}
							/>
						: 
							<CompleteOnboardingButton user={this.props.user} />
					}
					<InboxMenu
						user={this.props.user}
                        hasUnreadMessages={this.props.hasUnreadMessages}
					/>
					<li className="h-compare hide" />
				</ul>
			</li>
		);
	}
}

export default Links;