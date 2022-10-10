import React from 'react';
import { oneOf } from 'prop-types';
import { getAppPrefix } from '../../../public/js/common';

const SkipStepOnboarding = ({ step = 1 }) => {
    return <a className='skip-step-link' href={getAppPrefix() + '/'}>Skip step</a>;
};

SkipStepOnboarding.propTypes = {
    step: oneOf([1, 2]).isRequired
};

export default SkipStepOnboarding;
