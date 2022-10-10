import React from 'react';
import { arrayOf, string, bool, func } from 'prop-types';

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

const SubsidiaryType = ({ selectedSubsidiaryTypes = [], subsidiaryTypes = [] }) => {
    const commonSubsidiaryTypes = subsidiaryTypes.map((type) => {
        const subsidiaryType = {
            label: type,
            isSelect: false
        };
        subsidiaryType.isSelect = selectedSubsidiaryTypes.some(selectedType => selectedType === type);
        return subsidiaryType;
    });

    return (
        <div className='company-settings__info-item'>
            <div className='company-settings__info-item-title'>Subsidiary Type</div>
            <div className='company-settings__info-item-list'>
                {commonSubsidiaryTypes.map((type, ix) => {
                    return <TypeLi key={`${type.label}-${ix}`} label={type.label} isSelect={type.isSelect} onChange={() => console.log('change')} />
                })}
            </div>
        </div>
    );
};

SubsidiaryType.propTypes = {
    selectedSubsidiaryTypes: arrayOf(string),
    subsidiaryTypes: arrayOf(string)
};

TypeLi.propTypes = {
    label: string,
    isSelect: bool,
    onChange: func
};

export default SubsidiaryType;
