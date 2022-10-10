import $ from 'jquery';
import moment from 'moment';
import { DelayInput } from 'react-delay-input';
import React, { useEffect, useRef } from 'react';
import { arrayOf, node, oneOfType, string, func, number, bool, any, shape } from 'prop-types';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Currencies } from '../../../consts/currencies';
// eslint-disable-next-line import/no-named-default
import { default as ReactSelect, components } from 'react-select';

const DropdownIndicator = props => {
    return (
        <components.DropdownIndicator {...props}>
            <i className='fas fa-caret-down'></i>
        </components.DropdownIndicator>
    );
};

// https://react-select.com/
export const Select = ({
    className = '',
    options = [],
    onChangeValue = () => console.log('callback "onChangeValue" is not define'),
    value = null,
    placeholder = '',
}) => {
    const selectedOption = value || options.find(status => status.selected);
    const onChange = (el) => onChangeValue(el.value);
    return (
        <ReactSelect
            name={className}
            className={className}
            classNamePrefix='horizon-react-select'
            value={selectedOption}
            placeholder={placeholder}
            options={options.slice()}
            onChange={onChange}
            components={{ DropdownIndicator }}
            isOptionDisabled={option => !option.value}
        />
    );
};

export const Label = ({ name = '', htmlFor = '' }) => (
    <div className='col-xs-4'>
        <label htmlFor={htmlFor} className='cgi-form-label'>{name}</label>
    </div>
);

export const InputField = ({
    name = '',
    nameClass = '',
    additionalClass = nameClass,
    widthClass = 'col-xs-8',
    inputClass = '',
    placeholder = '',
    rows = 0,
    onChangeValue,
    type = 'text',
    minLength = 1,
    maxLength = 999,
    onlyView = false,
    value = '',
    waitInterval = 300,
    children
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = value;
        }
    }, [value]);

    const maxLengthCheck = (e) => {
        if (e.target.value.length > e.target.maxLength) {
            e.target.value = e.target.value.slice(0, e.target.maxLength);
        }
    };

    const getInput = () => {
        if (children) {
            return (
                <>
                    <DelayInput
                        inputRef={inputRef}
                        delayTimeout={waitInterval}
                        onChange={(e) => onChangeValue(e.target.value)}
                        onBlur={(e) => onChangeValue(e.target.value)}
                        value={value}
                        type={type}
                        placeholder={placeholder}
                        className={`form-control cgi-selector ${inputClass}`}
                        minLength={minLength}
                        maxLength={maxLength}
                        onInput={maxLengthCheck}
                    />
                    {children}
                </>
            );
        }
        return (
            <DelayInput
                inputRef={inputRef}
                delayTimeout={waitInterval}
                onChange={(e) => onChangeValue(e.target.value)}
                onBlur={(e) => onChangeValue(e.target.value)}
                value={value}
                type={type}
                placeholder={placeholder}
                className={`form-control cgi-selector ${inputClass}`}
                minLength={minLength}
                maxLength={maxLength}
                onInput={maxLengthCheck}
            />
        );
    };
    const getTextArea = () => (
        <DelayInput
            element='textarea'
            rows={rows}
            delayTimeout={waitInterval}
            onChange={(e) => onChangeValue(e.target.value)}
            onBlur={(e) => onChangeValue(e.target.value)}
            value={value}
            type={type}
            placeholder={placeholder}
            className={`form-control cgi-selector-area ${inputClass}`}
            minLength={minLength}
            maxLength={maxLength}
            onInput={maxLengthCheck}
        />
    );
    const getInputComponent = rows ? getTextArea : getInput;
    const Text = ({ value = '' }) => <CellText text={value} specifyClasses='bold' />;
    const fixedClasses = onlyView ? widthClass.replace(/cgi-selector/g, '') : widthClass;
    return (
        <div className={`row ${additionalClass}`}>
            {name && <Label name={name} htmlFor={additionalClass} />}
            <div className={fixedClasses}>
                {onlyView ? <Text value={value} /> : getInputComponent()}
            </div>
        </div>
    );
};

export const DaterangepickerField = ({
    name = '',
    nameClass = '',
    widthClass = 'col-xs-8',
    placeholder = '',
    onlyView = false,
    setInitDate = false,
    value = 0,
    onChangeValue,
    additionalClass
}) => {
    const datepickerClass = `cgi-selector ${widthClass}`;
    const changeDate = (date) => {
        const formattedDate = moment.utc(date).toISOString();
        onChangeValue(formattedDate);
    };
    const openCalendar = () => {
        $(`input#${nameClass}`).daterangepicker({
            singleDatePicker: true,
            minDate: setInitDate ? moment.utc([2000, 0, 1]) : moment.utc(),
            maxDate: moment.utc().add(10, 'y')
        }, (start, end) => { changeDate(end); })
            .on('apply.daterangepicker', (ev, picker) => { changeDate(picker.endDate); })
            .on('hide.daterangepicker', (ev, picker) => { changeDate(picker.endDate); });
    };

    return (
        <div className={`row ${nameClass}`}>
            {name && <Label name={name} htmlFor={nameClass} />}
            {
                onlyView
                    ? <CellText text={value ? moment.utc(value).format('DD/MM/YYYY') : '-'} classWidth='col-xs-8' specifyClasses='bold' />
                    : <div className={datepickerClass}>
                        <input id={nameClass} type='text' className={`form-control ${additionalClass || ''}`} placeholder={placeholder} name={nameClass} onFocus={openCalendar} />
                        <i className='far fa-calendar' />
                    </div>
            }
        </div>
    );
};

// https://developer.snapappointments.com/bootstrap-select/
export const MultiSelect = ({
    onlyView = false,
    values = [],
    options = [],
    name = '',
    nameClass = '',
    widthClass = 'col-xs-8',
    placeholder = '',
    dataLiveSearch = true,
    dataSelectedTextFormat = null,
    dataSize = null,
    onChangeValue
}) => {
    useEffect(() => {
        const multiselect = $(`select#${nameClass}`);
        multiselect.selectpicker();
        multiselect.on('hidden.bs.select', (e, clickedIndex, isSelected, previousValue) => {
            onChangeValue(multiselect.val().map((val) => {
                return val;
            }));
        });
    }, []);

    return (
        <div className={`row ${nameClass}`}>
            <Label name={name} htmlFor={nameClass} />
            {
                onlyView
                    ? <CellText text={values.join(', ')} classWidth='col-xs-8' specifyClasses='bold' />
                    : <div className={widthClass}>
                        <select
                            id={nameClass}
                            className='selectpicker form-control'
                            multiple
                            data-live-search={dataLiveSearch}
                            title={placeholder}
                            data-selected-text-format={dataSelectedTextFormat}
                            data-size={dataSize}
                        >
                            {options.map((option, ix) => {
                                return (
                                    <option
                                        key={`${nameClass}-${ix}`}
                                        value={option.name || option.label}
                                        selected={!option.value}
                                    >
                                        {option.name || option.label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
            }
        </div>
    );
};

export const CellText = ({ classWidth = '', text, specifyClasses = '' }) => (
    <div className={`cell-text ${classWidth}`}>
        <span className={`text ${specifyClasses}`}>{text || '-'}</span>
    </div>
);

export const Row = ({ classRow, children }) => (
    <div className={`row ${classRow}`}>
        {children}
    </div>
);

export const ClarificationCurrencyInput = ({ preferredCurrency, clearClasses }) => {
    const { codes } = Currencies;
    const symbol = getSymbolFromCurrency(codes[preferredCurrency] || '') || '';
    const code = codes[preferredCurrency] || '';
    return (
        <span className={!clearClasses && 'cgi-input-clarification'}>
            <span className='text'>{`${symbol} ${code}`}</span>
        </span>
    );
};

const select2OptionType = {
    label: string | number,
    value: string | number,
    selected: bool
};

const childrenType = oneOfType([
    arrayOf(node),
    node
]);

Select.propTypes = {
    options: arrayOf(
        shape(select2OptionType)
    ),
    className: string,
    onChangeValue: func,
    value: select2OptionType
};

Label.propTypes = {
    name: string,
    htmlFor: string
};

InputField.propTypes = {
    name: string,
    nameClass: string,
    additionalClass: string,
    widthClass: string,
    placeholder: string,
    rows: number,
    onChangeValue: func,
    type: string,
    minLength: number,
    maxLength: number,
    onlyView: bool,
    value: string,
    children: childrenType,
    waitInterval: number
};

DaterangepickerField.propTypes = {
    name: string,
    nameClass: string,
    additionalClass: string,
    widthClass: string,
    placeholder: string,
    onlyView: bool,
    value: number,
    setInitDate: bool,
    onChangeValue: func
};

MultiSelect.propTypes = {
    options: arrayOf(any),
    name: string,
    nameClass: string,
    widthClass: string,
    placeholder: string,
    onlyView: bool,
    values: arrayOf(string),
    dataLiveSearch: bool,
    dataSelectedTextFormat: null | string,
    dataSize: null | number,
    onChangeValue: func
};

CellText.propTypes = {
    classWidth: string,
    text: string,
    specifyClasses: string
};

Row.propTypes = {
    classRow: string,
    children: childrenType
};

ClarificationCurrencyInput.propTypes = {
    preferredCurrency: string,
    clearClasses: bool
};
