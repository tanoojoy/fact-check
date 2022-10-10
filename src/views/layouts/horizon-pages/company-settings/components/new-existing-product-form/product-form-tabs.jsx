import React, { useState, useEffect } from 'react';
import addProductTabs from './add-product-tabs';
import { BodyConfirmModal } from '../../../product-profile/components/body-confirm-modal';
import { getAppPrefix } from '../../../../../../public/js/common';
import { any, func, string } from 'prop-types';

const addProductTabsEntries = Object.entries(addProductTabs);

const ProductFormTabs = ({
    searchResults,
    searchString,
    setSearchString,
    chooseProduct,
    chosenProduct,
    clearProduct
}) => {
    const [activeTab, setActiveTab] = useState(addProductTabs.API.tab);
    const [searchStringState, setSeachStringState] = useState(searchString);
    useEffect(() => {
        setSeachStringState(searchString);
    }, [searchString]);

    const chooseTab = (tab) => {
        clearProduct();
        setActiveTab(tab);
    };

    return (
        <BodyConfirmModal>
            <div className='new-existing-product-form__tab-titles'>
                {
                    addProductTabsEntries.map(([key, value]) => {
                        const { tab } = value;

                        return (
                            <div
                                key={`add_product_tab-title__${key}`}
                                className={activeTab === tab ? 'company-settings__tab--active' : 'company-settings__tab--non-active'}
                                onClick={() => { chooseTab(tab); }}
                            >
                                {tab}
                            </div>
                        );
                    })
                }
            </div>
            <div className='new-existing-product-form__tab-content'>
                {
                    addProductTabsEntries.map(([key, value]) => {
                        const { tab, content: ContentTab } = value;
                        if (activeTab === tab) {
                            return (
                                <div key={`add_product_tab-content__${key}`}>
                                    <ContentTab
                                        tab={key}
                                        searchResults={searchResults}
                                        searchString={searchStringState}
                                        setSearchString={setSearchString}
                                        chooseProduct={chooseProduct}
                                        chosenProduct={chosenProduct}
                                    />
                                </div>
                            );
                        }
                        return null;
                    })
                }
            </div>
            <div className='new-existing-product-form__tab-info-message'>
                <img
                    src={getAppPrefix() + '/assets/images/horizon/exclamation.svg'}
                    alt='info msg'
                    className='new-existing-product-form__tab-info-message-icon'
                />Update the product attributes using the 'Edit Product' feature
            </div>
        </BodyConfirmModal>
    );
};

ProductFormTabs.displayName = 'ProductFormTabs';

ProductFormTabs.propTypes = {
    searchResults: any,
    searchString: string,
    setSearchString: func,
    chooseProduct: func,
    chosenProduct: string,
    clearProduct: func
};

export default ProductFormTabs;
