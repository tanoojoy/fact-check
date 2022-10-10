import React from 'react';
import { v4 as uuid } from 'uuid';
import { camelCase, groupBy, flatMap } from 'lodash';
import { object, func, any, string } from 'prop-types';
import { InfoItem, ProfileBlock } from '../common-components';
import ContractManufacturingOrganization from './contract-manufacturing-organization';
import { MultiSelect } from '../../../../horizon-components/components-of-form';

const ManufacturingCapabilityRow = ({
    type = '',
    capabilities = [],
    predefinedCapabilities = [],
    onChanged
}) => {
    const selectedCapabilities = capabilities.map(capability => capability.value);
    const predefinedCapabilitiesValues = predefinedCapabilities.map(capability => ({ name: capability, value: capability }));
    const capabilitiesList = predefinedCapabilitiesValues.map(capability => {
        const capabilityValue = !selectedCapabilities.some(selectedCapability => camelCase(selectedCapability) === camelCase(capability.value));
        return { value: capabilityValue, name: capability.value };
    });

    const handleChangeCapabilities = (values) => onChanged(type, values);

    return (
        <div className='company-settings__info-item-value company-settings__info-item-value-with-title'>
            <div className='col-xs-8'>
                <MultiSelect
                    onChangeValue={handleChangeCapabilities}
                    placeholder='None selected'
                    options={capabilitiesList}
                    name={type}
                    nameClass={camelCase(type)}
                    dataLiveSearch={false}
                    dataSelectedTextFormat='count'
                    dataSize={6}
                />
            </div>
        </div>
    );
};

const ManufacturingCapabilities = ({
    company = {},
    predefinedValues = {},
    handleProfileDataChange
}) => {
    const capabilities = company.capabilities ? Object.assign(company.capabilities) : [];
    const changeDataContractManufacturingOrganization = (keyStr, contract) => {
        handleProfileDataChange(keyStr, contract);
    };

    const changeDataCapabilityRow = (type, values) => {
        const groups = groupBy(capabilities, capability => capability.type);
        groups[type] = values.map(value => ({ type, value }));
        const newCapabilities = flatMap(groups, (group) => group);
        handleProfileDataChange('capabilities', newCapabilities);
    };

    return (
        <ProfileBlock title='Manufacturing Capabilities'>
            <InfoItem title='Contract Manufacturing Organization (CMO / CDMO)?'>
                <ContractManufacturingOrganization
                    keyStr='contractManufacturingOrganization'
                    contractManufacturingOrganization={company.contractManufacturingOrganization}
                    contractManufacturingOrganizationList={predefinedValues.contractManufacturingOrganizationList}
                    onChange={changeDataContractManufacturingOrganization}
                />
                {predefinedValues.manufacturerCapabilities && predefinedValues.manufacturerCapabilities.map((predefinedCapabilities) => {
                    return <ManufacturingCapabilityRow
                        key={uuid()}
                        type={predefinedCapabilities.type}
                        capabilities={capabilities}
                        predefinedCapabilities={predefinedCapabilities.values}
                        onChanged={changeDataCapabilityRow}
                    />;
                })}
            </InfoItem>
        </ProfileBlock>
    );
};

ManufacturingCapabilityRow.propTypes = {
    type: string,
    capabilities: any,
    predefinedCapabilities: object,
    onChanged: func
};

ManufacturingCapabilities.propTypes = {
    company: object,
    predefinedValues: object,
    handleProfileDataChange: func
};

export default ManufacturingCapabilities;
