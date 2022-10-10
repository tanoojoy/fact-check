'use strict';

var React = require('react');

import BaseComponent from '../../shared/base';
import LockSymbol from '../../common/lock-symbol';
import { productTabs } from '../../../consts/product-tabs';

class CompanyDetailsOtherServicesComponent extends BaseComponent {
    //({ otherServices }) => {
    constructor(props) {
        super(props);

        this.state = {
            displayCount: 2,
            showMoreButton: true
        }
        this.otherServicesCount = props && props.otherServices && props.otherServices.length > 0 ? props.otherServices.length : 0;
        this.hasMoreItems = this.otherServicesCount > 2
    }

    showMoreButtonClicked = (e) => {
        if (this.props.isFreemium) return;
        this.setState({
            displayCount: this.productsCount,
            showMoreButton: false
        });
    }

    render() {
        const { otherServices, isFreemium } = this.props;
        const { displayCount, showMoreButton } = this.state;
        const visibleServices = otherServices ? otherServices.slice(0, displayCount) : null;

        return (
            <React.Fragment>
                <div className="store-new-con" id="other-services">
                    <p className="store-new-con-title">
                        <i className="icon icon-circle-triangle-blue"></i>Other Services
                        <span className="item-count">{this.otherServicesCount} Total</span>
                    </p>
                    <div className="store-new-con-block-con">
                        {
                            visibleServices && visibleServices.length > 0 && visibleServices.map((os, index) => {
                                return (
                                    <div className="col-md-6" key={`otherservice-${os}-${index}`}>
                                        <div className="main-con">
                                            <p className="title">Service</p>
                                            <p className="company-name"><a href="#">{os}</a></p>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {
                            this.hasMoreItems && showMoreButton &&
                            (
                                <div className="col-md-12">
                                    <a className="btn-expand" onClick={this.showMoreButtonClicked} disabled={isFreemium}>
                                        {isFreemium && <LockSymbol />}
                                        <i className="icon icon-add-cross"></i> Show More
                                    </a>
                                </div>
                            )
                        }
                    </div>
                </div>
            </React.Fragment>
        )
    }    
}

export default CompanyDetailsOtherServicesComponent;