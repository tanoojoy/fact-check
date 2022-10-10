'use strict';

var React = require('react');

import BaseComponent from '../../shared/base';
import LockSymbol from '../../common/lock-symbol';
import { productTabs } from '../../../consts/product-tabs';
import debounce from 'lodash/debounce';

class CompanyDetailsProductListComponent extends BaseComponent {
    constructor(props) {
        super(props);

        const productsCount = props && props.companyProducts && props.companyProducts.length > 0 ? props.companyProducts.length : 0; //props.capabilities && props.capabilities.length > 0 ? props.capabilities.length : 0;
        this.state = {
            productsCount, 
            displayCount: 8,
            showMoreButton: true,
            hasMoreItems: productsCount > 8,
            companyProducts: props && props.companyProducts ? props.companyProducts : []
        }        
        this.delayProductSearch = debounce(this.delayProductSearch.bind(this), 300);
    }

    onSearchProductChanged = (e) => {
        this.delayProductSearch();
    }

    delayProductSearch = () => {
        const searchKey = this.productSearchRef.value;
        const productType = this.productTypeSearchRef.value;
        const { companyProducts } = this.props;
        if (companyProducts && companyProducts.length > 0) {
            const companyProducts = this.props.companyProducts.filter(product => {
                return (product.name.toLowerCase().includes(searchKey.toLowerCase())) && (productType ? (product.type.toLowerCase() === productType) : true);
            });
            this.setState({
                companyProducts,
                hasMoreItems: companyProducts.length > 8,
                productsCount: companyProducts.length
            });
        }
    }

    showMoreButtonClicked = (e) => {
        if (this.props.isFreemium) return;
        this.setState({
            displayCount: this.state.productsCount,
            showMoreButton: false
        });
    }

    getDisplayProduct = (type) => {
        const displayType = {
            active: true,
            name: type
        }

        if (type) {
            switch (type.toLowerCase()) {
                case productTabs.API.productType.toLowerCase():
                    displayType.name = type.toUpperCase();
                    displayType.active = true;
                    break;
                case productTabs.INTERMEDIATE.productType.toLowerCase():
                    displayType.name = `${type} / Reagent`;
                    displayType.active = false;
                    break;
                case productTabs.INACTIVE_INGREDIENTS.productType.toLowerCase():
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

    onFilterProductTypeChanged = (e) => {
        this.delayProductSearch();
    }

    render() {
        const { isFreemium } = this.props;
        const { displayCount, showMoreButton, companyProducts, hasMoreItems, filterProductType, productsCount } = this.state;
        const visibleProducts = companyProducts && showMoreButton ? companyProducts.slice(0, displayCount) : companyProducts;

        return (
            <React.Fragment>
                <div className="store-new-con" id="item-for-sale">
                    <div className="store-new-con-title">
                        <i className="icon icon-capsule-blue"></i>
                        Products
                        <span className="item-count">{productsCount} Total</span>
                        <div className="h-search">
                            <form action="search.html" method="get" onSubmit={e => { e.preventDefault(); }}>
                                <div className="h-search-bar flexing">
                                    <div className="h-search-input">
                                        <input type="text" placeholder="Search Products" onChange={this.onSearchProductChanged} ref={(ref) => this.productSearchRef = ref} disabled={isFreemium} />
                                        <i className="icon icon-cortellis-search"></i>
                                    </div>
                                    <div className="h-search-category">
                                        <select onChange={this.onFilterProductTypeChanged} ref={(ref) => this.productTypeSearchRef = ref} disabled={isFreemium}>
                                            <option value="">Filter by</option>
                                            <option value={productTabs.API.productType.toLowerCase()}>{productTabs.API.productType}</option>
                                            <option value={productTabs.DOSE_FORM.productType.toLowerCase()}>{productTabs.DOSE_FORM.productType}</option>
                                            <option value={productTabs.INTERMEDIATE.productType.toLowerCase()}>{`${productTabs.INTERMEDIATE.productType}/Reagent`}</option>
                                            <option value={productTabs.INACTIVE_INGREDIENTS.productType.toLowerCase()}>{productTabs.INACTIVE_INGREDIENTS.productType}</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    {
                        visibleProducts && visibleProducts.length > 0 &&
                        (
                            <div className="store-new-con-block-con clearfix">
                            {
                                visibleProducts.map((product, index) => {
                                    console.log('product', product);
                                    const displayProduct = this.getDisplayProduct(product.type);
                                    const allowRoute = displayProduct.active;
                                    const typeName = displayProduct.name;
                                    let iconCss = 'icon icon-gear-check-blue';
                                    if (!product.isVerified) {
                                        iconCss = 'icon icon-gear-gray';
                                    }
                                    let productUrlCss = 'main-con';
                                    let productUrl = `${this.props.appPrefix}/product-profile/profile/10092/${product.id}`;
                                    if (!allowRoute) {
                                        productUrlCss = 'main-con unclickable';
                                        productUrl = 'javascript:void(0)';
                                    }
                                    return (
                                        <div className="col-md-6" key={`product-${product.name}-${index}`}>
                                            <a href={productUrl} className={productUrlCss}>
                                                <p className="title">{typeName}</p>
                                                <p className="company-name">
                                                    <i className={iconCss}></i>
                                                    <span className="item-title">
                                                        {product.name}
                                                    </span>                                                    
                                                </p>
                                                {product.alerts && product.alerts.length > 0 &&
                                                    (
                                                        product.alerts.map((al, i) => {
                                                            return (
                                                                <span className="shortage" key={`${al}-${i}`}>{al}</span>
                                                            )
                                                        })
                                                    )
                                                }
                                            </a>                                                
                                        </div>
                                    )
                                })                                
                            }
                            </div>
                        ) 
                    }
                    {
                        hasMoreItems && showMoreButton &&
                        (
                            <a className="store-new-con-show-more" onClick={this.showMoreButtonClicked} disabled={isFreemium}>
                                {isFreemium && <LockSymbol />}
                                <i className="icon icon-cross-blue"></i> Show More
                            </a>
                        )
                    }
                </div>
            </React.Fragment>
        )
    }
    
}

export default CompanyDetailsProductListComponent;