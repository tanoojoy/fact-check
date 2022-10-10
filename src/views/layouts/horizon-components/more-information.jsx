import React from 'react';
import { getAppPrefix } from '../../../public/js/common';
import { REQUEST_DEMO_LINK } from '../../../consts/clarivate-links';
import { string } from 'prop-types';

export const MoreInformation = ({ description, detailsLink }) => {
    return (
        <div className='product-profile__cgi-product-more-info-container'>
            <div className='product-profile__cgi-product-more-info-title'>
                More Information
            </div>
            <div className='product-profile__cgi-product-more-info'>
                {description}
            </div>
            <div className='product-profile__cgi-product-more-info-link'>
                <img
                    src={getAppPrefix() + '/assets/images/horizon/outer_link_arrow-dark.svg'} alt=''
                    className='product-profile__alert-icon'
                />
                <a
                    className='product-profile__cgi-link-request-demo-link'
                    target='_blank'
                    href={detailsLink || '/generics/'}
                    rel='noreferrer'
                >
                    View Additional Details
                </a>
            </div>
            <div className='product-profile__cgi-product-more-info-divider' />
            <div className='product-profile__cgi-link-request-demo'>
                If you do not have a subscription to Cortellis Generics Intelligence, you can
                <div>
                    <img
                        src={getAppPrefix() + '/assets/images/horizon/outer_link_arrow-dark.svg'}
                        alt='' className='product-profile__alert-icon'
                    />
                    <a
                        className='product-profile__cgi-link-request-demo-link' href={REQUEST_DEMO_LINK}
                        target='_blank' rel='noreferrer'
                    >request your free demo
                        here
                    </a>
                </div>
            </div>
        </div>
    );
};

MoreInformation.propTypes = {
    description: string,
    detailsLink: string
};
