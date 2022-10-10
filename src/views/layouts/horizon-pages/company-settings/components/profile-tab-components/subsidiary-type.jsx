import React from 'react';
import { arrayOf, string, bool, func } from 'prop-types';
import { InfoItem } from '../common-components';

const TypeLi = ({ label, isSelect, onChange }) => {
    return (
        <div className='company-settings__info-item-value'>
            <label className='col-xs-12 checkbox-inline'>
                <input id={label} type='checkbox' value={isSelect} onChange={onChange} checked={isSelect} />
                {label}
            </label>
        </div>
    );
};

const SubsidiaryType = ({
    keyStr,
    selectedSubsidiaryTypes = [],
    subsidiaryTypes = [],
    onChange
}) => {
    const commonSubsidiaryTypes = subsidiaryTypes.map((type) => {
        const subsidiaryType = {
            label: type,
            isSelect: false
        };
        subsidiaryType.isSelect = selectedSubsidiaryTypes.some(selectedType => selectedType === type);
        return subsidiaryType;
    });

    const selectSubsidiaryType = (label, checked, index) => {
        if (checked) {
            selectedSubsidiaryTypes.push(subsidiaryTypes[index]);
        } else {
            const index = selectedSubsidiaryTypes.indexOf(label);
            if (index !== -1) {
                selectedSubsidiaryTypes.splice(index, 1);
            }
        }
        onChange(keyStr, selectedSubsidiaryTypes);
    };

    return (
        <InfoItem title='Subsidiary Type'>
            <div className='company-settings__info-item-list'>
                {commonSubsidiaryTypes.map((type, ix) => {
                    return <TypeLi key={`${type.label}-${ix}`} label={type.label} isSelect={type.isSelect} onChange={(e) => selectSubsidiaryType(type.label, e.target.checked, ix)} />
                })}
            </div>
        </InfoItem>
    );
};

SubsidiaryType.propTypes = {
    keyStr: string,
    selectedSubsidiaryTypes: arrayOf(string),
    subsidiaryTypes: arrayOf(string),
    onChange: func
};

TypeLi.propTypes = {
    label: string,
    isSelect: bool,
    onChange: func
};

export default SubsidiaryType;
