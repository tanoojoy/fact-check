import React, { useState } from 'react';
import { string, arrayOf, func } from 'prop-types';
import { InfoItem } from '../common-components';
import { InputField, Select } from '../../../../horizon-components/components-of-form';
import { NO_ALERTS_VALUE, alertFields } from '../../../../../../consts/company-products';

const ChooseAlert = ({ label = '', options = [], onChange, customStyles = {}, value = '' }) => {
    const [isCustomAlert, setFlagCustomAlert] = useState(false);
    const handleChange = (value) => {
        onChange(value);
    };
    const optionsWithSelected = options.map(option=>{ return option.value === value ? { ...option, selected: true } : { ...option }; });
    return (
        <div className='row' style={customStyles}>
            <div className='col-xs-1 company-settings__alerts-count'>{label}</div>
            <div className='col-xs-7'>
                <Select
                    className={label}
                    onChangeValue={(value) => handleChange(value)}
                    options={optionsWithSelected}
                    placeholder={'No Alerts Reported'}
                />
                {isCustomAlert && <InputField
                    widthClass='col-xs-12'
                    onChangeValue={handleChange}
                />}
            </div>
        </div>
    );
};

const CompanyAlerts = ({ keyStr = '', alerts = [], onChange, selectedAlerts }) => {
    const firstAlerts = alerts.map(alert => ({ label: alert, value: alert }));
    firstAlerts.unshift({ label: NO_ALERTS_VALUE, value: NO_ALERTS_VALUE });
    selectedAlerts = selectedAlerts || [];
    const secondAlerts = firstAlerts.slice();
    const [secondAlertVisibility, setSecondAlertVisibility] = useState(false);
    const handleChange = (alertCount, value) => {
        if (alertCount === alertFields[0]) {
            value === NO_ALERTS_VALUE ? setSecondAlertVisibility(false) : setSecondAlertVisibility(true);
        }
        onChange(alertCount, value);
    };
    const showSecondAlert = secondAlertVisibility || !!selectedAlerts[0] || !!selectedAlerts[1];
    return (
        <InfoItem hint='Add up to 2 alerts to display on your company page'>
            <ChooseAlert
                label='1st'
                options={firstAlerts}
                onChange={(value) => handleChange(alertFields[0], value)}
                value={selectedAlerts[0]}
                customStyles={{ marginTop: '16px', marginBottom: '16px' }}
            />
            { showSecondAlert && <ChooseAlert
                label='2nd'
                options={secondAlerts}
                value={selectedAlerts[1]}
                onChange={(value) => handleChange(alertFields[1], value)}
            />}
        </InfoItem>
    );
};

CompanyAlerts.propTypes = {
    keyStr: string,
    alerts: arrayOf(string),
    onChange: func
};

export default CompanyAlerts;
