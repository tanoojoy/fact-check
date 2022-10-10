import React from 'react';
import { string, bool } from 'prop-types';
import { getAppPrefix } from '../../../public/js/common';

const PreviousPageBtn = ({ prevPageUrl = `${getAppPrefix()}/`, fill, text = 'Previous Page' }) => {
    return (
        <a href={prevPageUrl} className='previous-page-btn'>
            <div className={`icon-back ${fill ? 'icon-back-fill' : ''}`}>
                <span><i className='fas fa-chevron-left'></i></span>
            </div>
            <span className={`text-back ${!fill ? 'text-back-blue' : ''}`}>{text}</span>
        </a>
    );
};

PreviousPageBtn.propTypes = {
    prevPageUrl: string,
    text: string,
    fill: bool
};

export default PreviousPageBtn;
