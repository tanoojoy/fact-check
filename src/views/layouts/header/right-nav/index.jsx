'use strict';
import React from 'react';
import Links from './links';
import UserDropdownMenu from './user-dropdown-menu';
import CompanyDropdownMenu from './company-dropdown-menu';
import LoginButton from './login-button';
import SendEmailModal, { EmailSentModal } from '../../../common/send-email-modal';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

const defaultMessage = 'Hello! I thought you might like to sign up for a free Cortellis Supply Chain Network account.';

class RightNavigationMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showInviteModal: false,
			showEmailSentModal: false,
			emailSuccessfullySent: false,
			processing: false,
		}

		this.handleMenuClick = this.handleMenuClick.bind(this);
		this.updateModalDisplay = this.updateModalDisplay.bind(this);
		this.handleInviteButtonClick = this.handleInviteButtonClick.bind(this);
		this.handleSendInviteEmail = this.handleSendInviteEmail.bind(this);
	}

	handleInviteButtonClick(e) {
		this.updateModalDisplay('showInviteModal', true);
		e.preventDefault();
	}

	updateModalDisplay(key, value) {
		this.setState({ [key] : value });
	}

	handleMenuClick(event, id) {
		event.stopPropagation();
		$(`#${id}`).slideToggle();
	}

	handleSendInviteEmail(data) {
		if (this.state.processing) return;
		if (typeof this.props.sendInviteColleaguesEmail === 'function') { 
			this.setState({ processing: true });
			this.props.sendInviteColleaguesEmail(data, (success) => {
				this.setState({ 
					showEmailSentModal: true,
					emailSuccessfullySent: success,
					processing: false
				});
			});
		}
	}

	render() {
		return (
			<div className='pull-right'>
				<ul className='header-menus'>
					{
						this.props.user ? 
							<>
								<Links 
									user={this.props.user}
				                    hasUnreadMessages={this.props.hasUnreadMessages}
				                    handleInviteButtonClick={this.handleInviteButtonClick}
								/>
								<UserDropdownMenu 
									user={this.props.user}
				                    handleMenuClick={this.handleMenuClick}
								/>
								<CompanyDropdownMenu 
									user={this.props.user}
									handleMenuClick={this.handleMenuClick}
								/>
							</>
						: <LoginButton />
					}
					<li className="mobile_top_toggler hide" />
				</ul>
				<SendEmailModal
					id='inviteColleague'
					title='Invite Colleagues To Join'
					cancelLabel='Cancel'
					confirmLabel='Send Invite'
					defaultEmailPlaceholder='eg: buyer@companyname.com, seller@companyname.com'
					defaultMessage={defaultMessage}
					showModal={this.state.showInviteModal}
					setShowModal={(show) => this.updateModalDisplay('showInviteModal', show)}
					onConfirm={this.handleSendInviteEmail}
				/>
				<EmailSentModal
					title='Invite Colleagues To Join'
					successMessage='Invite sent successfully.'
					success={this.state.emailSuccessfullySent}
					showModal={this.state.showEmailSentModal}
					setShowModal={(show) => this.updateModalDisplay('showEmailSentModal', show)}
				/>
			</div>
		);
	}
}

export default RightNavigationMenu;