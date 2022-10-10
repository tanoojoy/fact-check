import React, { useState } from 'react';
import $ from 'jquery';
import LeftBlock from './left-block';
import RightBlock from './right-block';
import axios from 'axios';
import CommonModule from '../../../../public/js/common';
import { logoutUser } from '../../../../utils';
const appPrefix = CommonModule.getAppPrefix();

const showMenu = (event, className) => {
    event.stopPropagation();
    $('.horizon-header-menu .h-dd-menu')
        .filter(function() {
            return !$(this).attr('class').includes(className);
        })
        .each(function() {
            $(this).slideUp();
        });
    $(`.${className}`).find('.h-dd-menu').slideToggle();
    $('.h-st-menus').hide();
    $('.h-cart .h-cart-menu').hide();
    $('.h-more .h-dd-menu').hide();
    $('.h-user .h-dd-menu').hide();
};

const renderLink = (linkParams = {}) => {
    const {
        link = '',
        text = '',
        isBorder = false,
        targetBlank = false,
        active = true
    } = linkParams;
    return (
        <li className={!active && 'disabled'} style={{ borderBottom: isBorder ? '1px solid #DADADA' : 'none' }}>
            {active && <a href={link} rel='noreferrer' target={targetBlank ? '_blank' : '_self'}>{text}</a>}
            {!active && <span>{text}</span>}
        </li>
    );
};

const HeaderMenuComponentTemplate = (props) => {
    const [logoutUrl, setLogoutUrl] = useState();

    if (!logoutUrl) {
        axios.get(`${appPrefix}/accounts/auth-url`).then(({ data: url }) => {
            setLogoutUrl(url + '/logout?app=scn&refferer=%2Farcadier_supplychain');
        }).catch(e => console.log('Error while trying to get logout link', e));
    }

    const signOutHandler = async() => {
        await logoutUser();
        location.href = logoutUrl;
    };

    return (
        <>
            <div className='horizon-header-menu'>
                <LeftBlock showMenu={showMenu} renderLink={renderLink} {...props} />
                <RightBlock
                    showMenu={showMenu}
                    renderLink={renderLink}
                    signOut={signOutHandler}
                    {...props}
                />
            </div>
        </>
    );
};

export default HeaderMenuComponentTemplate;
