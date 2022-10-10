'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

const DetailComponent = ({ itemDetail }) => {
    console.log('itemDetail', itemDetail);
    const customFields = itemDetail.CustomFields[0];
    const { Company, Categories } = customFields;
    const categoryName = Categories ? Categories[0].Name : null;

    return (
        <div className="bg-quota">
            <p><span>Supplier</span> <strong>{Company.name}</strong></p>
            <p><span>Product Name</span> <strong>{itemDetail.Name}</strong></p>
            <p><span>CAS Number</span> <strong>{itemDetail.SKU}</strong></p>
            <p><span>Product Type</span> <strong>{categoryName}</strong></p>
        </div>
    );    
};

module.exports = DetailComponent;