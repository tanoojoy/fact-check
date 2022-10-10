import React from 'react';
import { REQUEST_DEMO_LINK } from '../../consts/clarivate-links';

const MoreInformation = ({ moreInfoLink = '', description = '' }) => {
    return (
        <div className="store-new-con-more-info">
            <p className="right-title">More Information</p>
            <p className="more-info-common-text">{description}</p>
            <a 
                className="more-info-paragraph-small" 
                href={moreInfoLink || '/generics/'}
                target='_blank'
                rel='noopener noreferrer'
            >
                <i className="icon icon-more-info"></i>&nbsp;View Additional Details 
            </a>
            <hr />
            <p className="more-info-common-text small">If you do not have a subscription to Cortellis Generics
                Intelligence, you can </p>
            <a
                className="more-info-paragraph-small" 
                href={REQUEST_DEMO_LINK}
                target='_blank'
                rel='noopener noreferrer'
            >
                <i className="icon icon-more-info"/> &nbsp;request your free demo here
            </a>
        </div>
    );
}

export default MoreInformation;