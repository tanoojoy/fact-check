import React from 'react';
import { arrayOf, node, oneOfType } from 'prop-types';

const BreadcrumbsBlock = ({ children }) => {
    if (!children) return null;

    return (
        <div className='breadcrumbs-block'>
            {children}
        </div>
    );
};

BreadcrumbsBlock.propTypes = {
    children: oneOfType([
        arrayOf(node),
        node
    ])
};

export default BreadcrumbsBlock;
