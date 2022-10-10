import React from 'react';
import { bool, object } from 'prop-types';
import { get } from 'lodash';

const ProductMainInfo = ({ onlyView = false, productDetails = null, rfqDetails = null }) => {
    const emptyData = onlyView ? '-' : '';

    const supplierName = onlyView ? get(rfqDetails, 'sellerCompanyName', emptyData) : get(productDetails, 'company.name', emptyData);
    const productName = onlyView ? get(rfqDetails, 'productName', emptyData) : get(productDetails, 'product.mainName', emptyData);
    const cas = onlyView ? get(rfqDetails, 'casNumber', emptyData) : get(productDetails, 'product.cas', emptyData);

    // ToDo: not use for fix bug https://jira.clarivate.io/browse/LSGH-575
    const productType = onlyView ? get(rfqDetails, 'productType', 'API') : get(productDetails, 'company.groupType', 'API');

    return (
        <div className='form-group rfq-form-main-info'>
            <div className='row'>
                <div className='col-xs-4 product-field-name'>Supplier</div>
                {/* ToDo: field is not yet available */}
                <div className='col-xs-8 product-main-field-value'>{supplierName}</div>
            </div>
            <div className='row'>
                <div className='col-xs-4 product-field-name'>Product Name</div>
                <div className='col-xs-8 product-main-field-value'>{productName}</div>
            </div>
            <div className='row'>
                <div className='col-xs-4 product-field-name'>CAS Number</div>
                <div className='col-xs-8 product-main-field-value'>{cas}</div>
            </div>
            <div className='row'>
                <div className='col-xs-4 product-field-name'>Product Type</div>
                <div className='col-xs-8 product-main-field-value'>API</div>
            </div>
        </div>
    );
};

ProductMainInfo.propTypes = {
    onlyView: bool,
    productDetails: object,
    rfqDetails: object
};

export default ProductMainInfo;
