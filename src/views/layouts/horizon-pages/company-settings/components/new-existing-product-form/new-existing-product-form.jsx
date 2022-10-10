import React, { Component } from 'react';
import axios from 'axios';
import { getAppPrefix } from '../../../../../../public/js/common';
import { ConfirmModalWindow, windowSizes } from '../../../../horizon-components/confirm-modal-window';
import ProductFormTabs from './product-form-tabs';
import { FooterConfirmModal } from '../../../product-profile/components/footer-confirm-modal';
import { bool, func } from 'prop-types';

class NewExistingProductForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: {
                productId: null,
                companyId: null,
                type: '',
                companyType: '',
                chemicalName: ''
            },
            productName: '',
            isProductCorrect: false,
            searchResults: [],
            searchString: ''
        };
    }

    chooseProduct = (searchString = '', searchBy, productType = '', subsidiaryType = '') => {
        const { product, searchResults } = this.state;
        const companyId = this.props?.user?.companyInfo?.id;
        const products = searchResults?.products || [];
        const searchResultProduct = products.find((product) => product.name === searchString);

        product.productId = searchResultProduct ? searchResultProduct.dictId : product.productId;
        product.chemicalName = searchResultProduct?.name || null;
        product.type = productType || null;
        product.companyId = companyId || null;
        product.companyType = subsidiaryType || null;

        this.setState({
            product: { ...product },
            productName: searchString,
            isProductCorrect: !!searchResultProduct,
            searchString
        });
    }

    handleCancelAddProduct = () => {
        this.props?.hide();
        this.clearProduct();
    }

    handleApproveAddProduct = () => {
        this.sendNewProduct();
        this.chooseProduct('');
        this.setState({
            product: {},
            searchResults: [],
            searchString: ''
        });
    }

    sendNewProduct = () => {
        if (this.state?.product?.productId) {
            this.props?.addNewProduct({ ...this.state.product });
        } else {
            console.log('product is not correct');
        }
    }

    normalizeData = (data = [], recordType = '') => {
        return {
            count: data.length,
            products: data.map((product) => {
                return {
                    uid: product?.fields?.recordId[0],
                    name: product?.fields?.recordName[0],
                    recordType: Array.isArray(recordType) ? recordType.join() : recordType,
                    dictId: product?.fields?.dictId[0]
                };
            })
        };
    }

    getSearchResults = (searchString, category, recordType) => {
        if (!searchString) return;
        this.setState({
            searchString: searchString
        }, () => {
            axios({
                url: `${getAppPrefix()}/autosuggest/srp-find`,
                params: { searchString, category, recordType }
            })
                .then((res) => {
                    if (this.props.isShow && this.state.searchString) {
                        this.setState({
                            searchResults: this.normalizeData(res?.data?.products?.hits, recordType)
                        });
                    }
                });
        });
    }

    clearProduct = () => {
        this.chooseProduct('');
        this.setState({
            product: {},
            searchResults: [],
            searchString: ''
        });
    }

    render() {
        const { isShow, addNewProduct } = this.props;
        return (
            <ConfirmModalWindow
                title='Add Product'
                show={isShow}
                size={windowSizes.sm}
                hideModal={() => console.log('to discard click "Cancel"')}
                body={<ProductFormTabs
                    chosenProduct={this.state?.productName}
                    chooseProduct={this.chooseProduct}
                    setSearchString={this.getSearchResults}
                    searchResults={this.state.searchResults}
                    searchString={this.state.searchString}
                    addNewProduct={addNewProduct}
                    clearProduct={this.clearProduct}
                />}
                footer={
                    <FooterConfirmModal
                        approveText='Add Product'
                        discardText='Cancel'
                        onApproveChanges={this.handleApproveAddProduct}
                        onDiscardChanges={this.handleCancelAddProduct}
                        primaryButtonDisabled={!this.state.isProductCorrect}
                    />
                }
            />
        );
    }
}

NewExistingProductForm.propTypes = {
    isShow: bool,
    hide: func,
    addNewProduct: func
};

export default NewExistingProductForm;
