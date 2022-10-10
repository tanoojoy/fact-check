import React from 'react';
import { oneOfType, arrayOf, node, string, bool } from 'prop-types';
import { getAppPrefix } from '../../../../../public/js/common';

export const ProfileBlock = ({ title, additionalTitle, locked, children }) => {
    return (
        <div className='company-settings__profile-block'>
            <div className='company-settings__header-block'>
                {locked &&
                <span className='company-settings__header-block-lock-icon-container'>
                    <img
                        src={getAppPrefix() + '/assets/images/horizon/lock.svg'}
                        alt='Content locked icon'
                        className='company-settings__header-block-lock-icon'
                    />
                </span>}
                <div className='company-settings__title-container'>
                    <h3 className='company-settings__info-title'>{title}</h3>
                    {additionalTitle && <span className='company-settings__additional-title'>{additionalTitle}</span>}
                </div>
            </div>
            {!locked && children}
        </div>
    );
};

export const InfoItem = ({ title, hint, children }) => {
    return (
        <>
            {hint && <div className='company-settings__hint'>{hint}</div>}
            <div className='company-settings__info-item'>
                {title && <div className='company-settings__info-item-title'>{title}</div>}
                <div className='company-settings__info-item-value'>
                    {children}
                </div>
            </div>
        </>
    );
};

ProfileBlock.propTypes = {
    title: string,
    additionalTitle: string,
    locked: bool,
    children: oneOfType([
        arrayOf(node),
        node
    ])
};

InfoItem.propTypes = {
    title: string,
    hint: string,
    children: oneOfType([
        arrayOf(node),
        node
    ])
};
