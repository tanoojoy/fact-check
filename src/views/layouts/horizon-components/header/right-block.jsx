import React from 'react';
import { func, object } from 'prop-types';
import LoginBtn from './login-btn';
import LinksBlock from './links-block';
import UserBlock from './user-block';
import CompanyBlock from './company-block';

const RightBlock = ({
    user = null,
    signOut = () => console.log('signOut function not existing'),
    showMenu = () => console.log('showMenu function not existing'),
    renderLink = () => console.log('renderLink function not existing')
}) => {
    if (!user) return <LoginBtn />;
    return (
        <>
            <LinksBlock user={user} />
            <div className='pull-right right-block'>
                <UserBlock
                    user={user}
                    showMenu={showMenu}
                    renderLink={renderLink}
                    signOut={signOut}
                />
                <CompanyBlock user={user} showMenu={showMenu} renderLink={renderLink} />
            </div>
        </>
    );
};

RightBlock.propTypes = {
    user: object,
    signOut: func,
    showMenu: func,
    renderLink: func
};

export default RightBlock;
