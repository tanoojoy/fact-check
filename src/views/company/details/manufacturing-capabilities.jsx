'use strict';

var React = require('react');

import BaseComponent from '../../shared/base';
import LockSymbol from '../../common/lock-symbol';

class CompanyDetailsManufacturingCapabilitiesComponent extends BaseComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            displayCount: 4,
            showMoreButton: true
        }
        this.capabilitiesCount = props && props.capabilities && props.capabilities.length > 0 ? props.capabilities.length : 0;
        this.hasMoreItems = this.capabilitiesCount > 4
    }

    showMoreButtonClicked = (e) => {
        if (this.props.isFreemium) return;
        this.setState({
            displayCount: this.capabilitiesCount,
            showMoreButton: false
        });
    }
    

    render() {
        const { capabilities, cmo,isFreemium } = this.props;
        const { showMoreButton, displayCount } = this.state;
        let sortedCapabilities = capabilities && capabilities.length > 0 ?
            capabilities.sort((a, b) => {
                if (a.type < b.type) {
                    return -1;
                }
                if (a.type > b.type) {
                    return 1;
                }
                return 0;
            }) : null;
        sortedCapabilities = sortedCapabilities && sortedCapabilities.slice(0, displayCount);
        const cmoCss = cmo ? 'store-new-con-yes' : 'store-new-con-no';

        return (
            <React.Fragment>
                <div className="store-new-con" id="storefront-manufacturing-capabilities">
                    <p className="store-new-con-title"><i className="icon icon-square-blue"></i>Manufacturing
                        Capabilities<span className="item-count">{this.capabilitiesCount} Total</span></p>
                    <p className="store-new-con-sub-title">Contract Manufacturing Organization (CMO/CDMO) — <span className="store-new-con-no hide">No</span> <span className={cmoCss}>{cmo ? 'Yes' : 'No'}</span>
                    </p>
                    <div className="store-new-con-block-con">
                        {
                            sortedCapabilities && sortedCapabilities.map((mcType, index) => {
                                    return (
                                        <div className="col-md-6" key={`mc${mcType.type}-${index}`}>
                                            <div className="main-con">
                                                <p className="title">{mcType.type}</p>
                                                <p className="company-name"><i className="icon icon-gear-check-blue"></i> <a href="#">{mcType.value}</a></p>
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

export default CompanyDetailsManufacturingCapabilitiesComponent;