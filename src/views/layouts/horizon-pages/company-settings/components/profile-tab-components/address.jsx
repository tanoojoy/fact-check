import React from 'react';
import { string, arrayOf, func } from 'prop-types';
import { InfoItem } from '../common-components';
import { InputField } from '../../../../horizon-components/components-of-form';

const Address = ({ keyStr, addresses, onChange }) => {
    const handleChange = (value) => {
        const newAddresses = Object.assign([], addresses);
        newAddresses[0] = value;
        onChange(keyStr, newAddresses);
    };
    return (
        <InfoItem title='Address'>
            <InputField
                rows={4}
                nameClass='company-settings__input company-setting__textarea'
                value={addresses ? addresses[0] : ''}
                onChangeValue={(value) => handleChange(value)}
            />
        </InfoItem>
    );
};

Address.propTypes = {
    keyStr: string,
    addresses: arrayOf(string),
    onChange: func
};

export default Address;
