'use strict';
import React, { useState, useEffect } from 'react';
import { getAppPrefix } from '../../../../public/js/common';
import { HEADER_POPOVER } from '../../../../consts/popover-content';
import Popover from '../../../common/popover';
import { logoutUser } from '../../../../utils';

const appPrefix = getAppPrefix();

const { CHANGE_PASSWORD } = HEADER_POPOVER;

const logoutUrl = `${process.env.CLARIVATE_LOGIN_IFRAME_URL}/logout?app=scn&refferer=%2Farcadier_supplychain`;

const UserDropdownMenu = ({ 
	user,
	handleMenuClick = () => null,
}) => {
    const { hasCompany } = user;
    const userLinks = [
		{
			Name: 'Homepage',
			link: `${appPrefix}/`,
			visible: true,
		},
		{
			Name: 'Dashboard',
			link: `${appPrefix}/quotation/list`,
			disabled: true,
			visible: hasCompany,
		},
		{
			Name: 'Active Partners',
			link: `${appPrefix}/active-partners`,
			disabled: true,
			visible: hasCompany,
		},
		{
			Name: 'My Followed Companies',
			link: `${appPrefix}/users/settings?activeTab=My Followed Companies`,
			visible: true,
		},
		{
			Name: 'My Followed Products',
			link: `${appPrefix}/users/settings?activeTab=My Followed Products`,
			visible: true,
		},
		{
			Name: 'Separator',
			type: 'menu-separator',
			visible: true,
		},
		{
			Name: 'My Profile',
			link: `${appPrefix}/users/settings?activeTab=My Profile`,
			disabled: true,
			visible: true,
		},
		{
			Name: 'Notifications',
			link: `${appPrefix}/users/settings?activeTab=Notifications`,
			visible: hasCompany,
		},
		{
			Name: 'Change Password',
			link: `${appPrefix}/users/settings?activeTab=Change Password`,
			disabled: true,
			visible: true,
			popover: (
				<Popover 
					id={CHANGE_PASSWORD.id}
					iconClass={CHANGE_PASSWORD.iconClass}
					trigger={CHANGE_PASSWORD.trigger}
					autoHideIcon={CHANGE_PASSWORD.autoHide}
					content={CHANGE_PASSWORD.content}
					placement={CHANGE_PASSWORD.placement}
				/>
			)
		},
		{
			Name: 'Separator',
			type: 'menu-separator',
			visible: true,
		},
	];

	const getUserName = () => {
		let userName = '';
		if (user) {
			const { UserName, DisplayName, LastName, FirstName } = user;
		    if (UserName) {
		        userName = UserName;
		    } else if (LastName && FirstName) {
		        userName = `${FirstName} ${LastName}`;
		    } else {
		        userName = DisplayName;
		    }
		}
		return userName;
	}

    const signOut = async() => {
        await logoutUser();
        location.href = logoutUrl;
    }

    useEffect(() => {
    	$('#logout-btn').off().on('click', signOut)
    })

	return (
		<li className="h-username" onClick={(e) => handleMenuClick(e, "user-dropdown-menu")} >
			<span>
				<p>{getUserName()}</p>
				<i className="icon icon-down" />
			</span>
			<ul className="h-dd-menu hide-me" id="user-dropdown-menu">
				{
					userLinks
						.filter(userLink => userLink.visible)
						.map((userLink, i) => {
							if (userLink?.type === 'menu-separator') {
								return (<li key={i}><span className="h-dd-menu-separator" /> </li>);
							} else {
								return (
									<li key={i}>
										{userLink?.popover}
										<a href={userLink?.link || '#'} disabled={userLink?.disabled}>{userLink.Name}</a>
									</li>
								);
							}
						})
				}
				<li id='logout-btn' style={{ cursor: 'pointer' }}><a>Logout</a></li>
			</ul>
		</li>
	);
}

export default UserDropdownMenu;