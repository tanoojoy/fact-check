import React from 'react';
import { oneOfType, arrayOf, node } from 'prop-types';
import { getAppPrefix } from '../../../public/js/common';

export const InfoMessage = ({ children }) => {
    return (
        <div className='info-message'>
            <img
                src={`${getAppPrefix()}/assets/images/horizon/attention_icon.svg`}
                alt='attention icon' className='info-message__attention-icon'
            />
            <span className='info-message__text'>
                {children}
            </span>
        </div>
    );
};

InfoMessage.propTypes = {
    children: oneOfType([
        arrayOf(node),
        node
    ])
};
