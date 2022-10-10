import React from 'react';
import DoseFormBasicInfo from './dose-form-basic-info';
import AvailableDoseForms from './available-dose-forms';

const AddDoseFormProductMain = ({
    doseForms = [],
    subsidaryType = '',
    countriesLaunched = [],
    handleStateChange = () => null,
    updateModalVisibility = () => null,
    updateSelectedRowInfo = () => null,
}) => {
    return (
        <div className="container">
            <div className="section-description new-cortellis-design">
                <div className="h-body display-Flex">
                    <DoseFormBasicInfo
                        subsidaryType={subsidaryType}
                        countriesLaunched={countriesLaunched}
                        handleStateChange={handleStateChange}
                    />
                    <AvailableDoseForms 
                        doseForms={doseForms}
                        handleStateChange={handleStateChange}
                        updateSelectedRowInfo={updateSelectedRowInfo}
                        updateModalVisibility={updateModalVisibility}
                    />
                </div>
            </div>
        </div>
    )
}


export default AddDoseFormProductMain;