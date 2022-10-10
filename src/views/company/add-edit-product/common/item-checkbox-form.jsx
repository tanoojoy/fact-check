import React, { useEffect } from 'react';

const ItemCheckboxForm = ({
	id = '',
    addedCheckboxContainerClass = '',
    data = [],
    formName = '',
    selected = '',
    onChange = () => null,
}) => {

    useEffect(() => {
        $('[data-toggle="tooltip"]').tooltip();
    });

    return (
        <div className={`item-upload-checkbox ${addedCheckboxContainerClass}`} id={id} >
            {
                data.map((option, ix) => 
                    <div
                        key={ix}
                        className={`fancy-checkbox checkbox-sm ${option.containerClass}`}
                    >
                        <input
                            type="radio"
                            id={`${id}-${option.value}`}
                            value={option.value}
                            name={formName}
                            onChange={onChange}
                            checked={selected === option.value}
                            disabled={option.disabled || false}
                        />
                        <label
                            disabled={option.disabled}
                            htmlFor={`${id}-${option.value}`}
                        >
                            {option.label}
                        </label>
                        {option.popover}
                        {option.content}
                    </div>
                )
            }
        </div>
    );
}

export default ItemCheckboxForm;