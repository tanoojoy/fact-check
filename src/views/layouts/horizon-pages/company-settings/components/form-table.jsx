import React, { useState, useEffect, useRef } from 'react';
import { DaterangepickerField, InputField } from '../../../horizon-components/components-of-form';
import { getAppPrefix } from '../../../../../public/js/common';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { objectsEqual } from '../../../../../utils';

import { object, arrayOf, string, bool, func } from 'prop-types';
import { ColumnType } from '../../../../../consts/table';
import HorizonDropdown from '../../../horizon-components/dropdown';
import LockSymbol from '../../../horizon-components/lock-symbol';
import { VerifiedStatus } from '../../../horizon-components/verified-status';

const prepareCorrectDate = (value, yearOnly) => {
    const inspectionDate = value && !yearOnly ? moment.utc(value).format('DD-MMM-YYYY') : value;
    let inspectionValue = inspectionDate !== 'Invalid date' ? inspectionDate : undefined;
    if (yearOnly && inspectionValue) {
        inspectionValue = moment.utc(inspectionValue).year() + ' Fiscal year';
    }
    return inspectionValue;
};

const NonEditableComponent = ({ type, inspection }) => {
    switch (type) {
    case ColumnType.DATE:
        return (
            <div className='company-settings__inspection-value'>
                {prepareCorrectDate(inspection.value, inspection.yearOnly) ||
                <span style={{ color: '#DADADA' }}>None Reported</span>}
            </div>
        );
    case ColumnType.LOCK_SYMBOL:
        return (
            <div className='company-settings__inspection-value'>
                <LockSymbol />
            </div>
        );
    default:
        return <div className='company-settings__inspection-value'>{inspection.value}</div>;
    }
};

const FormRow = (props) => {
    const {
        inspectionRow,
        verified = false,
        verificationStatusClickable,
        verificationStatusVisible,
        onDeleteClick,
        onEdit,
        edit = false,
        removable,
        editable,
        resetInputs
    } = props;
    const textRef = useRef();
    const dateRef = useRef();
    const dropdownRef = useRef();
    const [editing, setEditing] = useState(edit);

    const inspectionDatapickerId = uuid();
    const inspectionLabelId = uuid();
    const dropdownId = uuid();

    const cleanInputField = (ref, defaultValue) => {
        if (ref && ref.value !== defaultValue) {
            ref.value = defaultValue || '';
        }
    };

    const cleanDateField = (ref, defaultValue) => {
        if (ref) {
            const formattedDefaultValue = defaultValue ? moment.utc(defaultValue).format('MM/DD/YYYY') : defaultValue;

            if (formattedDefaultValue !== ref.value) {
                ref.value = formattedDefaultValue || '';
            }
        }
    };

    const cleanFormFields = (inputRef, dateRef) => {
        inspectionRow.forEach(insp => {
            insp.type === ColumnType.TEXT && cleanInputField(inputRef, insp.value);
            insp.type === ColumnType.DATE && cleanDateField(dateRef, insp.value);
        });
    };

    useEffect(() => {
        const currentInput = textRef?.current?.querySelector('input');
        const currentDatapicker = dateRef?.current?.querySelector('input');
        cleanFormFields(currentInput, currentDatapicker);

        if (resetInputs) {
            setEditing(false);
        }
    });

    const inspRow = inspectionRow.map((inspection) => {
        if (inspection.hidden) return null;

        return editing ? (
            <>
                {inspection.type === ColumnType.TEXT &&
                <div className='company-settings__inspection-value' ref={textRef}>
                    <InputField
                        value={inspection.value}
                        nameClass={inspectionLabelId + '-' + inspection.colName}
                        onChangeValue={(value) => onEdit({
                            ...inspection,
                            value
                        })}
                        placeholder={inspection.value}
                        waitInterval={200}
                        widthClass={inspection.colSizeClass || 'col-xs-11'}
                    />
                </div>}
                {inspection.type === ColumnType.DATE &&
                <div className='company-settings__inspection-value' ref={dateRef}>
                    <DaterangepickerField
                        setInitDate
                        nameClass={inspectionDatapickerId + '-' + inspection.colName}
                        onChangeValue={(value) => onEdit({
                            ...inspection,
                            value
                        })}
                        value={inspection.value}
                        widthClass={inspection.colSizeClass || 'col-xs-11'}
                        additionalClass='company-settings__inspection-value--datepicker'
                    />
                </div>}
                {inspection.type === ColumnType.DROPDOWN &&
                <div className='company-settings__inspection-value company-settings__inspection-value--dropdown' ref={dropdownRef}>
                    <HorizonDropdown
                        nameClass={dropdownId + '-' + inspection.colName}
                        data={inspection.predefinedValues}
                        currentValue={inspection.value}
                        callback={(filterKey, value) => onEdit({
                            ...inspection,
                            value
                        })}
                        additionalClass='company-settings__inspection-table-value--dropdown'
                    />
                </div>}
            </>
        ) : (<NonEditableComponent type={inspection.type} inspection={inspection} />);
    });

    return (
        <>
            {verificationStatusVisible && <VerifiedStatus status={verified} hasPermissions={verificationStatusClickable} />}
            {inspRow}
            {editable && <button className='company-settings__inspection-edit' onClick={() => setEditing(!editing)} />}
            {removable && <button className='company-settings__inspection-delete' onClick={() => onDeleteClick()} />}
        </>
    );
};

FormRow.propTypes = {
    inspectionRow: arrayOf(object),
    verified: bool,
    verificationStatusClickable: bool,
    verificationStatusVisible: bool,
    onDeleteClick: func,
    onEdit: func,
    edit: bool,
    removable: bool,
    editable: bool,
    resetInputs: bool
};

const FormTable = (props) => {
    const {
        data,
        verificationStatusVisible = true,
        columnTitles,
        title,
        extendable = false,
        removable = false,
        editable = false,
        onInspectionsChange,
        resetForm = false
    } = props;

    const [inspections, setInspections] = useState(data);

    const handleDelete = (itemIndex) => {
        const newInspections = [...inspections.slice(0, itemIndex), ...inspections.slice(itemIndex + 1)];

        setInspections(newInspections);
        onInspectionsChange(newInspections);
    };

    const handleAdd = () => {
        const newInspections = [...inspections, []];
        setInspections(newInspections);
        onInspectionsChange(newInspections);
    };

    const handleEdit = (index, inspection) => {
        const currentInspections = inspections[index]?.filter(insp => insp.colName !== inspection.colName);
        const newInspections = [...inspections.slice(0, index), [...currentInspections, inspection], ...inspections.slice(index + 1)];
        setInspections(newInspections);

        onInspectionsChange(newInspections);
    };

    useEffect(() => {
        if (!objectsEqual(data, inspections)) {
            setInspections(data);
        }

        if (resetForm) {
            const fulfilledInspections = data?.filter(insp => insp.length);
            setInspections(fulfilledInspections);
            onInspectionsChange(fulfilledInspections);
        }
    });
    return (
        <div className='company-settings__inspection-table'>
            <h2 className='company-settings__inspection-title'>{title}</h2>
            <div className='company-settings__inspection-table-header'>
                {columnTitles?.map((title, index) => {
                    return <div className='company-settings__inspection-column-title' key={index}>{title}</div>;
                })}

            </div>
            {data?.map((insp, index) => {
                const isNewInspection = !insp.some(inspection => Boolean(inspection.value));
                const verificationStatus = insp.find(inspection => inspection.name === 'VerificationStatus');
                return (
                    <div className='company-settings__inspection-row' key={index}>
                        <FormRow
                            inspectionRow={insp}
                            verified={verificationStatus?.value}
                            verificationStatusClickable={verificationStatus?.hasAccess}
                            verificationStatusVisible={verificationStatusVisible}
                            onEdit={(inspection) => handleEdit(index, inspection)}
                            onDeleteClick={() => handleDelete(index)}
                            removable={removable}
                            editable={editable}
                            edit={isNewInspection}
                            resetInputs={resetForm}
                        />
                    </div>);
            })}
            {extendable && (
                <div className='company-settings__inspection-actions'>
                    <button className='company-settings__button' onClick={handleAdd}>
                        <img
                            src={getAppPrefix() + '/assets/images/horizon/round_plus_blue.svg'} alt='add row'
                            className='company-settings__link-icon'
                        />
                        Add Row
                    </button>
                </div>
            )}
        </div>
    );
};

FormTable.propTypes = {
    data: arrayOf(arrayOf(object)),
    columnTitles: arrayOf(string),
    verificationStatusVisible: bool,
    title: string,
    extendable: bool,
    removable: bool,
    editable: bool,
    onInspectionsChange: func,
    resetForm: bool
};

NonEditableComponent.propTypes = {
    type: string,
    inspection: object
};

export default FormTable;
