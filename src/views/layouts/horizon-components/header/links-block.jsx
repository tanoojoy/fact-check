import React from 'react';
import { UnreadIndicator } from './unread-indicator';
import { getAppPrefix } from '../../../../public/js/common';
import { object } from 'prop-types';
import { isCompanyAttachRequestSend, isCompleteOnBoarding } from '../../../../utils';
import OnboardingButton from './onboarding-button';

const LinksBlock = ({ user = {} }) => {
    if (isCompleteOnBoarding(user)) {
        return (
            <div className='links-block'>
                <div className='page-link'>
                    <UnreadIndicator />
                    <a href={getAppPrefix() + '/inbox'}>Inbox</a>
                </div>
            </div>
        );
    } else {
        return (
            <div className='links-block'>
                {!isCompanyAttachRequestSend(user) && <OnboardingButton user={user} />}
                <div className='page-link__disabled'>
                    <a>Inbox</a>
                </div>
            </div>
        );
    }
};

LinksBlock.propTypes = {
    user: object
};

export default LinksBlock;
