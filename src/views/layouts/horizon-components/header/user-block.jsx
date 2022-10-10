import React from 'react';
import { func, objectOf, string } from 'prop-types';
import { getAppPrefix } from '../../../../public/js/common';
import { isPremiumUserSku } from '../../../../utils';

const UserBlock = ({ user, renderLink, showMenu, signOut }) => {
    const { UserName, DisplayName, LastName, FirstName, hasCompany } = user;
    let userName;
    if (UserName) {
        userName = UserName;
    } else if (LastName && FirstName) {
        userName = `${FirstName} ${LastName}`;
    } else {
        userName = DisplayName;
    }

    return (
        <div className='user-block h-username' onClick={(e) => showMenu(e, 'user-block')}>
            <span>{userName || ''}</span>
            <i className='fa fa-caret-down' aria-hidden='true'></i>
            <ul className={`h-dd-menu hide-me ${isPremiumUserSku(user) ? 'user-block-dropdown' : 'user-block-dropdown-freemium-user'}`}>
                {renderLink({ link: getAppPrefix() + '/', text: 'Homepage' })}
                {hasCompany && renderLink({ link: getAppPrefix() + '/quotation/list', text: 'Dashboard', active: false })}
                {hasCompany && renderLink({ link: getAppPrefix() + '/active-partners', text: 'Active Partners', active: false })}
                {hasCompany && renderLink({ link: getAppPrefix() + '/users/settings?activeTab=Followed Companies', text: 'My Followed Companies', active: true })}
                <hr className='solid' />
                {renderLink({ link: `${getAppPrefix()}/users/settings?activeTab=My Profile`, text: 'My Profile', active: false })}
                {hasCompany && renderLink({ link: `${getAppPrefix()}/users/settings?activeTab=Notifications`, text: 'Notifications', active: true })}
                {renderLink({ link: `${getAppPrefix()}/users/settings?activeTab=Change Password`, text: 'Change Password', active: false })}
                <hr className='solid' />
                <li style={{ cursor: 'pointer' }} onClick={signOut}>
                    <a>Log Out</a>
                </li>
            </ul>
        </div>
    );
};

UserBlock.propTypes = {
    user: objectOf({
        UserName: string,
        DisplayName: string,
        LastName: string,
        FirstName: string
    }),
    renderLink: func,
    showMenu: func,
    signOut: func
};

export default UserBlock;
