import React from 'react';
import { v4 as uuid } from 'uuid';
import { func, object } from 'prop-types';
import { InfoItem, ProfileBlock } from '../common-components';
import { MultiSelect } from '../../../../horizon-components/components-of-form';
import { camelCase } from 'lodash';

const OtherServices = ({
    company = {},
    predefinedValues = {},
    handleProfileDataChange
}) => {
    const KEY_STRING = 'otherServices';

    const selectedServices = company.otherServices ? Object.assign(company.otherServices) : [];

    const handleChange = (values) => {
        handleProfileDataChange(KEY_STRING, values);
    };

    const otherServices = predefinedValues.otherServices ? predefinedValues.otherServices.map(service => {
        const otherServicesValue = !selectedServices.some(selectedService => camelCase(selectedService) === camelCase(service));
        return { value: otherServicesValue, name: service };
    }) : [];

    return (
        <ProfileBlock key={uuid()} title='Other Services'>
            <InfoItem>
                <div className='company-settings__info-item-value company-settings__info-item-value-with-title'>
                    <div className='col-xs-8'>
                        <MultiSelect
                            onChangeValue={handleChange}
                            placeholder='None selected'
                            options={otherServices}
                            nameClass={KEY_STRING}
                            name=''
                            widthClass='col-xs-12'
                            dataLiveSearch={false}
                            dataSelectedTextFormat='count'
                            dataSize={6}
                        />
                    </div>
                </div>
            </InfoItem>
        </ProfileBlock>
    );
};

OtherServices.propTypes = {
    company: object,
    predefinedValues: object,
    handleProfileDataChange: func
};

export default OtherServices;
