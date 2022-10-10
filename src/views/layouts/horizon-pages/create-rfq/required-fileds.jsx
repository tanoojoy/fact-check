import React, { useState, useEffect } from 'react';
import { func, bool, object } from 'prop-types';
import { CellText, InputField } from '../../horizon-components/components-of-form';

const ViewMode = ({ rfqDetails }) => {
    return (
        <div className='col-xs-8' style={{ display: 'flex' }}>
            <CellText text={rfqDetails.quantity} specifyClasses='bold' />
            &nbsp;
            <CellText text={rfqDetails.unit} specifyClasses='normal' />
        </div>
    );
};

const EditMode = ({ setQuantity, setUnit }) => {
    const inputTypes = {
        quantity: 'Quantity',
        unit: 'Unit'
    };

    const onChangeValue = (value = null, inputType = '') => {
        (inputType === inputTypes.quantity) && setQuantity(Number(value));
        (inputType === inputTypes.unit) && setUnit(value);
    };

    return (
        <>
            <div className='col-xs-4'>
                <InputField
                    type='number'
                    className='form-control'
                    widthClass='col-xs-12'
                    placeholder={inputTypes.quantity}
                    onBlur={(value) => setQuantity(Number(value))}
                    onChangeValue={(value) => onChangeValue(value, inputTypes.quantity)}
                    required
                />
            </div>
            <div className='col-xs-4'>
                <InputField
                    type='text'
                    className='form-control'
                    widthClass='col-xs-12'
                    placeholder={inputTypes.unit}
                    onBlur={(value) => setUnit(value)}
                    onChangeValue={(value) => onChangeValue(value, inputTypes.unit)}
                    required
                />
            </div>
        </>
    );
};

const RequiredFields = ({ onChangeForm, onlyView, rfqDetails }) => {
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState('');
    useEffect(() => {
        onChangeForm(quantity, unit);
    }, [quantity, unit]);

    return (
        <div className='required-fields'>
            <div className='row'>
                <div className='col-xs-4 required-fields-names product-field-name'>
                    <span>Quantity & Unit {!onlyView && <sup>*</sup>}</span>
                </div>
                {onlyView ? <ViewMode rfqDetails={rfqDetails} /> : <EditMode setQuantity={setQuantity} setUnit={setUnit} />}
            </div>
        </div>
    );
};

RequiredFields.propTypes = {
    onChangeForm: func,
    onlyView: bool,
    rfqDetails: object
};

EditMode.propTypes = {
    setQuantity: func,
    setUnit: func
};

ViewMode.propTypes = {
    rfqDetails: object
};

export default RequiredFields;
