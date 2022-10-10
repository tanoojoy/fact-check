import React, { useEffect, useState } from 'react';
import { bool, func, string } from 'prop-types';

const CheckboxToggle = ({
    disabled,
    callback,
    name,
    isActive
}) => {
    const [isActiveState, setActiveState] = useState(null);

    useEffect(() => {
        setActiveState(isActive);
    },
    [disabled, isActive]);

    const handleClick = () => {
        setActiveState(!isActiveState);
        callback(name, !isActiveState);
    };

    return (
        <div className='checkbox-toggle' onClick={handleClick}>
            <div className={`checkbox-toggle__base${isActiveState ? '-active' : ''}`} />
            <div className={`checkbox-toggle__knob${isActiveState ? '-active' : ''}`} />
        </div>
    );
};

CheckboxToggle.propTypes = {
    disabled: bool,
    callback: func,
    name: string,
    isActive: bool
};

export default CheckboxToggle;
