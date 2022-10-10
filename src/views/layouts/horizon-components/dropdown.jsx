import React, { useEffect, useState } from 'react';

const HorizonDropdown = ({
    data,
    defaultValue = undefined,
    currentValue,
    filterKey,
    callback,
    nameClass,
    additionalClass,
    disabled = false,
    placeholder = 'Select from the list'
}) => {
    const [isBlocked, setBlock] = useState(null);
    useEffect(() => setBlock(disabled), [disabled]);

    const currValue = currentValue ? currentValue[0] : '';

    const options = data?.map(value => (
            <li
                key={value}
                onClick={() => {
                    callback(filterKey, value);
                }}
                className={`option ${currValue === value ? 'option--selected' : ''}`}
            >
                <span>{value}</span>
            </li>
        ));

    const buttonMessage = <span className='horizon-dropdown__current-value'>{currentValue || placeholder}</span>

    return (
        <div className={`dropdown horizon-dropdown ${additionalClass || ''}`} id={nameClass}>
            <button
                className={`btn btn-default dropdown-toggle ${currentValue ? 'dropdown-toggle--selected' : ''}`}
                type='button'
                data-toggle='dropdown'
                aria-haspopup='true' aria-expanded='true'
                disabled={isBlocked}
            >
                {buttonMessage}
                <span className='caret'/>
            </button>
            <ul className='dropdown-menu'>
                {options}
            </ul>
        </div>
    );
};

export default HorizonDropdown;
