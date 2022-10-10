import React from 'react';
import BlockWithExternalBackground from '../layouts/horizon-components/section-with-external-background';
import { any } from 'prop-types';

const CommonModule = require('../../public/js/common');
const BackgroundLoginPage = ({ children }) => (
    <>
        <div className='login-page-bg'>
            <div className='login-page__form-container'>
                <BlockWithExternalBackground image={CommonModule.getAppPrefix() + '/assets/images/horizon/banner.svg'}>
                    {children}
                </BlockWithExternalBackground>
            </div>
        </div>

    </>
);

BackgroundLoginPage.propTypes = {
    children: any
};

export default BackgroundLoginPage;
