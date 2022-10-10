import React, { useState } from 'react';
import moment from 'moment';
import HorizonSearchResultsContent from '../../../horizon-components/search-results/content';
import { companyProductsMap } from '../../../../../consts/company-products';
import { NewExistingProductForm } from '../components/new-existing-product-form';
import { PrimaryButton } from '../../../horizon-components/buttons';
import { array, object, func } from 'prop-types';

const ProductsTab = ({
    companyProducts = [],
    addNewProduct: addNewProductProp,
    user = {}
}) => {
    const [isShowNewExistingProductForm, setShowNewExistingProductForm] = useState(false);

    const formatted = companyProducts?.map((product, ix) => {
        product.index = ix + 1;
        product.updateDate = moment.utc(product.updateDate).format('DD-MMM-YYYY');
        return { fields: product };
    });

    const addNewProduct = (...rest) => {
        setShowNewExistingProductForm(false);
        addNewProductProp(...rest);
    };

    return (
        <>
            <NewExistingProductForm
                isShow={isShowNewExistingProductForm}
                hide={() => { setShowNewExistingProductForm(false); }}
                addNewProduct={addNewProduct}
                user={user}
            />
            <div className='company-settings__products'>
                <div className='company-settings__common-products-data'>
                    <div className='company-settings__products-count'>{`${companyProducts.length} Products Total`}</div>
                    <div className='company-settings__add-new-product'>
                        <PrimaryButton onClick={() => setShowNewExistingProductForm(true)}>
                            <i className='fas fa-plus company-settings__icon-plus' />
                            <span className='company-settings__add-new-btn-txt'>Add New Product</span>
                        </PrimaryButton>
                    </div>
                </div>
                {!!companyProducts.length &&
                <div className='company-settings__products-table'>
                    <HorizonSearchResultsContent config={companyProductsMap} items={formatted} additionalClassesContent='company-settings__table-row' />
                </div>}
            </div>
        </>
    );
};

ProductsTab.propTypes = {
    companyProducts: array,
    addNewProduct: func,
    user: object
};

export default ProductsTab;
