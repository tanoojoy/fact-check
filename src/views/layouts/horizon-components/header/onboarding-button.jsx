import React from 'react';
import { object } from 'prop-types';
import { PrimaryButton } from '../buttons';
import { getAppPrefix } from '../../../../public/js/common';
import { isCompleteOnBoarding, userRole, userHasCompany, isCompanyAttachRequestSend } from '../../../../utils';

const continueOnboarding = (user = {}) => {
    if (!userRole(user)) {
        window.location = `${getAppPrefix()}/choice-user-role?prevPage=${window.location.pathname}`;
    } else if (!userHasCompany(user) || !isCompanyAttachRequestSend(user)) {
        window.location = `${getAppPrefix()}/choice-user-company?prevPage=${window.location.pathname}`;
    }

    console.error('The user is connected to the company and has a role in it.');
};

const OnboardingButton = ({ user = {} }) => {
    if (isCompleteOnBoarding(user)) return null;

    return (
        <div className='onboarding-button'>
            <PrimaryButton onClick={() => continueOnboarding(user)}>
                Complete Onboarding
            </PrimaryButton>
        </div>
    );
};

OnboardingButton.propTypes = {
    user: object
};

export default OnboardingButton;
