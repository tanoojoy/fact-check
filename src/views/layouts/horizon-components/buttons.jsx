import React, { useState, useEffect } from 'react';
import { func, oneOfType, arrayOf, node, bool, string } from 'prop-types';
import Button from 'react-bootstrap/Button';

export const PrimaryButton = ({ onClick, disabled = false, addClasses = '', disabledText = '', children }) => {
    const [classes, setClasses] = useState('primary-btn__disabled');
    const [disableButton, setDisableButton] = useState(null);
    useEffect(() => {
        setDisableButton(disabled);
        setClasses(`${disabled ? 'primary-btn__disabled' : 'primary-btn'} ${addClasses}`);
    }, [addClasses, disabled]);

    return (
        <Button
            className={classes}
            onClick={onClick}
            disabled={disableButton}
            title={disableButton && disabledText ? disabledText : ''}
        >
            {children}
        </Button>
    );
};

export const SecondaryButton = ({ onClick, disabled = false, addClasses = '', children }) => {
    const [classes, setClasses] = useState(`secondary-btn ${addClasses}`);

    useEffect(() => {
        setClasses(`secondary-btn ${addClasses}`);
    }, [addClasses, disabled]);

    return (
        <Button
            className={classes}
            onClick={onClick}
            variant='outline-primary'
            disabled={disabled}
        >
            {children}
        </Button>
    );
};

PrimaryButton.propTypes = {
    onClick: func,
    disabled: bool,
    disabledText: string,
    addClasses: string,
    children: oneOfType([
        arrayOf(node),
        node
    ])
};

SecondaryButton.propTypes = {
    onClick: func,
    disabled: bool,
    addClasses: string,
    children: oneOfType([
        arrayOf(node),
        node
    ])
};
