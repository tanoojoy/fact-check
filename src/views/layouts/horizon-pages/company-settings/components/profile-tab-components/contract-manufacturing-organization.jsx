import React from 'react';
import { string, arrayOf, func } from 'prop-types';
import { capitalize } from 'lodash';

const ContractManufacturingOrganization = ({
    keyStr = '',
    contractManufacturingOrganization = '',
    contractManufacturingOrganizationList = [],
    onChange
}) => {
    return (
        <div className='company-settings__radio-items'>
            {contractManufacturingOrganizationList.map(contract => {
                return (
                    <div key={contract} className='company-settings__radio-item' onClick={(e) => onChange(keyStr, contract)}>
                        {
                            contract === contractManufacturingOrganization &&
                            <div className='company-settings__radio-button selected'>
                                <div className='company-settings__radio-button--filled' />
                            </div>
                        }
                        {
                            contract !== contractManufacturingOrganization &&
                            <div className='company-settings__radio-button' />
                        }
                        <div className='company-settings__radio-value'>{capitalize(contract)}</div>
                    </div>
                );
            })}
        </div>
    );
};

ContractManufacturingOrganization.propTypes = {
    keyStr: string,
    contractManufacturingOrganization: string,
    contractManufacturingOrganizationList: arrayOf(string),
    onChange: func
};

export default ContractManufacturingOrganization;
