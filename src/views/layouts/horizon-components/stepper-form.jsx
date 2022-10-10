import React from 'react';
import { arrayOf, node, number, oneOfType, string } from 'prop-types';
import BackgroundLoginPage from '../../login/background-login-page';
import HorizonFooterComponent from './footer';
import { getAppPrefix } from '../../../public/js/common';

const StepperForm = ({ title, step, children }) => {
    return (
        <>
            <BackgroundLoginPage>
                <div className='login-container stepper-form'>
                    <div className='stepper-from__logo-container'>
                        <img src={getAppPrefix() + '/assets/images/horizon/logo_clarivate_connect.png'} alt='cortellis logo' />
                    </div>
                    <div className='stepper-form__content-container'>
                        <div className='stepper-form__step-info-container'>
                            {title && <span className='stepper-form__step-title'>{title}</span>}
                            {step && <span className='stepper-form__current-step'>Step {step} of 2</span>}
                        </div>
                        <div className='stepper-form__content'>
                            {children}
                        </div>
                    </div>
                </div>
            </BackgroundLoginPage>
            <div className='footer' id='footer-section'>
                <HorizonFooterComponent />
            </div>
        </>
    );
};

StepperForm.propTypes = {
    title: string,
    step: number,
    children: oneOfType([
        arrayOf(node),
        node
    ])
};

export default StepperForm;
