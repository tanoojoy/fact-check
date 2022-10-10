import React from 'react';
import { productTabs } from '../../../../consts/product-tabs';
import AddEditAPIProductMain from './API/index';
import AddDoseFormProductMain from './dose-form/index';

const { API, DOSE_FORM } = productTabs;

const AddEditProductMain = ({
    isEditPageType = false,
    user = {}, 
    predefinedValues = {},
    item = {},
    referenceItem = {},
    updateModalVisibility = () => null,
    updateItemData = () => null,
    updateSelectedRowInfo = () => null,
    specialOffer = {},
    alerts = {},
    manufacturerOfIntermediatesActive = false,
    manufacturerOfRawMaterialsActive = false,
    documents = [],
    doseForms = [],
    subsidaryType = '',
    countriesLaunched = [],
    handleStateChange = () => null
}) => {

    const { Categories = [] } = item;
    const category = (Categories && Categories[0] && Categories[0].Name) || '';
    return (
        <>
            {
                category === API.productType &&
                <AddEditAPIProductMain
                    user = {user}
                    predefinedValues={predefinedValues}
                    item={item}
                    referenceItem={referenceItem}
                    updateModalVisibility={updateModalVisibility}
                    updateItemData={updateItemData}
                    updateSelectedRowInfo={updateSelectedRowInfo}
                    handleStateChange={handleStateChange}
                    documents={documents}
                    alerts={alerts}
                    specialOffer={specialOffer}
                    manufacturerOfIntermediatesActive={manufacturerOfIntermediatesActive}
                    manufacturerOfRawMaterialsActive={manufacturerOfRawMaterialsActive}
                />
            }
            {
                category === DOSE_FORM.productType &&
                !isEditPageType &&
                <AddDoseFormProductMain 
                    doseForms={doseForms}
                    subsidaryType={subsidaryType}
                    countriesLaunched={countriesLaunched}
                    handleStateChange={handleStateChange}
                    updateSelectedRowInfo={updateSelectedRowInfo}
                    updateModalVisibility={updateModalVisibility}
                />
            }
        </>
    )

}

export default AddEditProductMain;