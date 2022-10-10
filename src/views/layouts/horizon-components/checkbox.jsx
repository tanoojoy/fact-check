import React, { useEffect, useState } from 'react';

const HorizonCheckbox = ({
    label,
    callback,
    value = label,
    checked = false,
    filterKey,
    disabled = false
}) => {
    const [isBlocked, setBlock] = useState(null);
    useEffect(() => setBlock(disabled), [disabled]);

    return (
        <label className={`checkbox-container${isBlocked ? '__disabled' : ''}`}>{label}
            <input disabled={isBlocked} type='checkbox' className='checkbox__default' checked={checked} onChange={(state) => callback(filterKey, value, state.target.checked, false)} />
            <span className={`checkbox__custom${isBlocked ? '__disabled' : ''}`} />
        </label>);
};

export default HorizonCheckbox;
