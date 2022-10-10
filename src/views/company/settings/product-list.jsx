'use strict';

var React = require('react');
import BaseComponent from '../../shared/base';

import { generateTempId, capitalize } from '../../../scripts/shared/common';
import { getAppPrefix } from '../../../public/js/common';
import debounce from 'lodash/debounce';
const Moment = require('moment');
import { productTabs } from '../../../consts/product-tabs';

class CompanySettingsProductListComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            companyProducts: props.companyProducts || []
        }        
    }

    getDisplayProduct = (type) => {
        const displayType = {
            active: true,
            name: type
        }

        if (type) {
            switch (type.toUpperCase()) {
                case productTabs.API.productType.toUpperCase():
                    displayType.name = type.toUpperCase();
                    displayType.active = true;
                    break;
                case productTabs.INTERMEDIATE.productType.toUpperCase():
                    displayType.name = `${type} / Reagent`;
                    displayType.active = false;
                    break;
                case productTabs.INACTIVE_INGREDIENTS.productType.toUpperCase():
                    displayType.name = type;
                    displayType.active = false;
                    break;
                default:
                    displayType.name = type;
                    displayType.active = true;
                    break;
            }
        } else {
            displayType.active = false;
            displayType.name = ''
        }

        return displayType;
    }

    render() {
        const { companyProducts } = this.state;
        return (
            <div id="ProductList" className="tab-pane fade">

                <div className="company-section product-list">
                    <div className="pull-left">
                        <h4>{companyProducts.length} Products Total</h4>
                    </div>
                    <div className="pull-right">
                        <a href={`${getAppPrefix()}/company/product/create`} className="add-product-btn"><i className="icon icon-cross-pale-blue"></i>Add New Product</a>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th width="50">#</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Last Update Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                companyProducts && companyProducts.map((product, index) => {
                                    console.log('product', product);
                                    const key = generateTempId();
                                    let updateDate = product.updateDate?.split('T')[0];
                                    if (updateDate) {
                                        updateDate = Moment(updateDate).format('DD-MMM-yyyy');
                                    }
                                    else {
                                        updateDate = 'Not Available';
                                    }
                                    let productUrl = `${getAppPrefix()}/company/product/${product.id}/settings`;
                                    const displayProduct = this.getDisplayProduct(product.type);
                                    if (!displayProduct.active) {
                                        productUrl = 'javascript:void(0)';
                                    }

                                    return (
                                        <tr key={key}>
                                            <td><span className="grey-col">{index + 1}</span></td>
                                            <td><a href="#" className="product-name">{product.name}</a></td>
                                            <td><span className="grey-col">{displayProduct.name}</span></td>
                                            <td><span className="grey-col">{updateDate}</span></td>
                                            <td><a href={productUrl} className="edit-button"><i className="icon icon-button-gear-blue"></i> Edit</a></td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }    
}

module.exports = CompanySettingsProductListComponent;