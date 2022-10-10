import React, { useState, useEffect } from 'react';
import { isPremiumUserSku } from '../../../utils';
import { string, node, oneOfType, arrayOf, object } from 'prop-types';

const MainContent = ({
    user = {},
    baseClass = 'main-content',
    className = '',
    children,
    ...rest
}) => {
    const [classMainContent, setClassMainContent] = useState(baseClass);

    useEffect(() => {
        setClassMainContent(`${isPremiumUserSku(user) ? baseClass : `${baseClass}-freemium-user`} ${className}`);
    }, []);

    return (
        <div className={classMainContent} {...rest}>
            {children}
        </div>
    );
};

MainContent.propTypes = {
    user: object.isRequired,
    baseClass: string,
    className: string,
    children: oneOfType([
        arrayOf(node),
        node
    ]),
    rest: object
};

export default MainContent;
