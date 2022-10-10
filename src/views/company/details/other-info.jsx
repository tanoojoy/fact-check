'use strict';

var React = require('react');

import CompanyDetailsRegulatoryInspectionsComponent from './regulatory-inspections';
import CompanyDetailsManufacturingCapabilitiesComponent from './manufacturing-capabilities';
import CompanyDetailsOtherServicesComponent from './other-services';
import CompanyDetailsProductListComponent from './products-list';
import BaseComponent from '../../shared/base';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';

class CompanyDetailsOtherInfoComponent extends BaseComponent {
    //= ({ companyInfo, companyProducts, customFields, usRegulartoryInspections, otherRegulartoryInspections }) => {
    render() {
        const [otherInfo] = this.props.customFields;
        return (
            <div className="row storefront-stuffs" id="">
                <div className="container">
                    <div className="col-md-8">
                        <CompanyDetailsRegulatoryInspectionsComponent
                            otherInfo={otherInfo}
                            isFreemium={this.props.isFreemium}
                        />

                        <CompanyDetailsManufacturingCapabilitiesComponent
                            cmo={otherInfo.cmo}
                            capabilities={otherInfo.capabilities}
                            isFreemium={this.props.isFreemium}
                        />

                        <CompanyDetailsOtherServicesComponent
                            otherServices={otherInfo.otherServices}
                            isFreemium={this.props.isFreemium}
                        />

                        <CompanyDetailsProductListComponent
                            companyInfo={this.props.companyInfo}
                            companyProducts={this.props.companyProducts}
                            isFreemium={this.props.isFreemium}
                            appPrefix={this.props.appPrefix}
                        />

                        <UnlockMoreResultsBanner
                            user={this.props.user}
                            getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                            page={'company'}
                        />
                    </div>

                    <div className="col-md-4">
                        <div className="store-new-con-pdf">
                            <p className="right-title">Additional Supplier Information</p>
                            <p className="supporting-message-present">Supporting documents have been uploaded by the
                                supplier</p>
                            <p className="supporting-message-absent hide">No supporting documents have been shared</p>

                            <div className="pdf-list-con">
                                {
                                    otherInfo.filesList && otherInfo.filesList.map(file => {
                                        return (
                                            <a className="storefront-pdf-name" href={file.link} target='_blank'>
                                                <i className="icon icon-pdf-circle"></i>
                                                <span className="pdf-name">{file.fileName}</span>
                                            </a>
                                        )
                                    })
                                }
                            </div>
                        </div>

                        <div className="store-new-con-more-info">
                            <p className="right-title">More Information</p>
                            <p className="more-info-common-text">Additional insights on company sales, deals, approvals,
                                patents and more is available on Cortellis Generics Intelligence.</p>
                            <a className="more-info-paragraph" href="javascript:void(0)"><i className="icon icon-more-info"></i>View Additional Details</a>
                            <hr />
                            <p className="more-info-common-text">If you do not have a subscription to Cortellis Generics
                                Intelligence, you can </p>
                            <a className="more-info-paragraph-small" href="javascript:void(0)"><i className="icon icon-more-info"></i>request your free demo here</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }    
}

export default CompanyDetailsOtherInfoComponent;