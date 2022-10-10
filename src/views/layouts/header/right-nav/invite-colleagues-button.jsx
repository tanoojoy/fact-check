import React, { useState } from 'react';

const InviteColleaguesButton = ({
	handleInviteButtonClick = () => null,
}) => {

	return (
		<li className="be-seller">
			<a 
				id="invite-modal"
				onClick={handleInviteButtonClick}
				href="#"
			>
				<i className="icon icon-cross-extra-blue" />
				Invite Colleagues
			</a>
		</li>
	);
}

export default InviteColleaguesButton;