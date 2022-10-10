import React from 'react';
import { string, func, number } from 'prop-types';
import { InfoItem } from '../common-components';
import { InputField } from '../../../../horizon-components/components-of-form';

const TextInput = ({
    title,
    keyStr,
    webPage,
    rows,
    onChange
}) => {
    return (
        <InfoItem title={title}>
            <InputField
                nameClass={`company-settings__input${keyStr ? '--' + keyStr : ''}`}
                additionalClass='company-settings__input'
                value={webPage}
                onChangeValue={(value) => onChange(keyStr, value)}
                rows={rows}
            />
        </InfoItem>
    );
};

TextInput.propTypes = {
    title: string,
    keyStr: string,
    webPage: string,
    rows: number,
    onChange: func
};

export default TextInput;
