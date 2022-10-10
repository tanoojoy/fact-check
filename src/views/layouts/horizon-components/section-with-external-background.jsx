import React from 'react';

const BlockWithExternalBackground = (props) => {
    return (
        <div className='block-with-external-background' style={{ backgroundImage: `url(${props.image})` }}>
            {props.children}
        </div>
    );
};

export default BlockWithExternalBackground;
