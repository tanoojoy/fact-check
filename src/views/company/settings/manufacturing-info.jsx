'use strict';

var React = require('react');

import BaseComponent from '../../shared/base';
import { generateTempId, capitalize } from '../../../scripts/shared/common';
import FileUploadGroupComponent from '../../common/file-upload-group';
import FileUploadComponent from '../../common/file-upload';

class CompanySettingsManufacturingInfoComponent extends BaseComponent {
    //= ({ componentKey, contractManufacturingOrganizationList, companyInfo, otherInfo, otherServices, manufacturerCapabilities, addRemoveOtherService, addRemoveCapabilities, changeCmo }) => {
    constructor(props) {
        super(props);
        this.fileUploadLimit = 3;
    }
    
    onOtherServicesChange = (e) => {
        const { name, checked} = e.currentTarget;
        this.props.addRemoveOtherService(name, checked);
    };

    onCapabilitiesChange = (e) => {
        const { name, checked, attributes} = e.currentTarget;
        const type = attributes['data-type'].value;
        this.props.addRemoveCapabilities(type, name, checked);
    }

    onChangeCmo = (e) => {
        this.props.changeCmo(e.currentTarget.attributes['data-value'].value);
    }

    renderAdditionalSupplierInfo = () => {
        let fileUploads = [];
        const { filesList } = this.props.otherInfo;
        if (filesList && filesList.length > 0) {
            for (var i = 0; i < this.fileUploadLimit; i++) {
                const key = generateTempId();
                let fileName = '';
                if (filesList.length > i) {
                    const file = filesList[i];
                    fileName = file.fileName;
                    fileUploads.push(<FileUploadComponent fileName={fileName} onFileSelected={this.onFileSelected} onFileRemoved={this.onFileRemoved} key={key} fileId={`file${i+1}`} />);
                }
                else {
                    fileUploads.push(<FileUploadComponent onFileSelected={this.onFileSelected} onFileRemoved={this.onFileRemoved} key={`file${i + 1}`} fileId={`file${i + 1}`} ref={(ref) => this.fileUploadComponentRef = ref} />);
                    break;
                }
            }
        }
        else {
            fileUploads.push(<FileUploadComponent onFileSelected={this.onFileSelected} onFileRemoved={this.onFileRemoved} key={generateTempId()} fileId={'file0'} ref={(ref) => this.fileUploadComponentRef = ref} />);
        }        
        return fileUploads;
    }

    onFileSelected = (fileName, file) => {
        this.props.addRemoveFile(file, fileName, true);
    }

    onFileRemoved = (fileName) => {
        this.props.addRemoveFile(null, fileName, false);
    }

    render() {        
        let otherServiceTitle = 'None Selected';
        if (this.props.otherInfo.otherServices && this.props.otherInfo.otherServices.length > 0) {
            otherServiceTitle = this.props.otherInfo.otherServices.length === 1 ? this.props.otherInfo.otherServices[0] : `${this.props.otherInfo.otherServices.length} items selected`;
        }
        return (
            <React.Fragment key={this.props.componentKey}>
                {/* <!-- Manufacturing Column Start --> */}

                <div className="col-md-6 manufacturing-info">
                    <h4 className="row-settings-title">manufacturing capabilities </h4>

                    <div className="set-inputs manufacturing-capabilities clearfix">
                        <div className="input-container">
                            <span className="title">Contract Manufacturing Organization (CMO/CDMO)?</span>
                            <div className="manufacturing-radio">
                                {
                                    this.props.contractManufacturingOrganizationList && this.props.contractManufacturingOrganizationList.map(item => {
                                        const isSelected = this.props.otherInfo.contractManufacturingOrganization === item;
                                        return (
                                            <React.Fragment key={`cmo${item}`}>
                                                <input
                                                    type="radio"
                                                    name="common-radio-name"
                                                    id={`cmo${item}`}
                                                    className="radio-button"
                                                    checked={isSelected}
                                                />
                                                <label
                                                    htmlFor={`cmo${item}`}
                                                    className="radio-button-click-target"
                                                    data-value={item}
                                                    onClick={this.onChangeCmo} >
                                                    <span className="radio-button-circle"></span>{item}
                                                </label>
                                            </React.Fragment>
                                        )
                                    })
                                }

                            </div>
                        </div>
                        {
                            this.props.manufacturerCapabilities && this.props.manufacturerCapabilities.map((capability, index) => {
                                const selectedCapabilities = this.props.otherInfo.capabilities && this.props.otherInfo.capabilities.filter(r => r.type === capability.type);
                                let capabilityTitle = 'None Selected';
                                if (selectedCapabilities && selectedCapabilities.length > 0) {
                                    console.log('selectedCapabilities', selectedCapabilities);
                                    capabilityTitle = selectedCapabilities && selectedCapabilities.length === 1 ? selectedCapabilities[0].value : `${selectedCapabilities.length} items selected`;
                                }

                                return (
                                    <div className="input-container flex-item" key={capability + index}>
                                        <label className="additional-one">{capability.type}</label>
                                        <div className="advanced-select country" data-model="items">
                                            <div className="dropdown">
                                                <input id="LaunchedCountries" type="button" data-default="None Selected" value={capabilityTitle} className="trigger required" placeholder="Start typing" />
                                                <a className="x-clear"><i className="fa  fa-times-circle"></i></a>
                                                <a href="#" className="btn-toggle" data-toggle="dropdown">
                                                    <b className="caret"></b>
                                                </a>
                                                <ul className="dropdown-menu">
                                                    {
                                                        capability && capability.values.map((val, i) => {
                                                            const isChecked = this.props.otherInfo.capabilities ? this.props.otherInfo.capabilities.some(r => r.type === capability.type && r.value === val) : false;
                                                            const keyVal = generateTempId();
                                                            return (
                                                                <li key={`${val}${i}`}>
                                                                    <a className="x-check" >
                                                                        <input className="check-merchant" data-usertype="Consumer" type="checkbox" data-type={capability.type} name={val} id={keyVal} checked={isChecked} onChange={this.onCapabilitiesChange} />
                                                                        <label htmlFor={keyVal}> {val} </label>
                                                                    </a>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className="item-form-group company-alerts other-services-input clearfix">
                        <h4 className="row-title">Other Services</h4>
                        <p className="row-sub-title">Servises for Display on Your Company Profile</p>
                        <div className="input-container">
                            <div className="advanced-select country" data-model="items">
                                <div className="dropdown">
                                    <input id="LaunchedCountries" type="button" data-default="None Selected" value={otherServiceTitle} className="trigger required" placeholder="Start typing" />
                                    <a className="x-clear"><i className="fa  fa-times-circle"></i></a>
                                    <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                    <ul className="dropdown-menu">
                                        {
                                            this.props.otherServices && this.props.otherServices.map((otherService, index) => {
                                                const key = generateTempId();
                                                const isChecked = this.props.otherInfo.otherServices ? this.props.otherInfo.otherServices.some(r => r === otherService) : false;
                                                return (
                                                    <li key={`${otherService}${index}`}>
                                                        <a className="x-check" >
                                                            <input className="check-merchant" data-usertype="Consumer" type="checkbox" name={otherService} id={key} checked={isChecked} onChange={this.onOtherServicesChange} />
                                                            <label htmlFor={key}> {otherService} </label>
                                                        </a>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="set-inputs pdf-upload-con clearfix">
                        {
                            this.props.isFreemium ?
                                (
                                    <div class="freemium-lock">
                                        <div class="lock-img-handler">
                                            <i class="icon icon-grey-lock"></i>
                                        </div>
                                        <div>
                                            <h4 class="row-title">Additional Supplier Information</h4>
                                            <p class="row-sub-title">
                                                Premium users can upload up to three documents to share on your company profile page
                                            </p>
                                        </div>
                                    </div>
                                ) :
                                (
                                    <React.Fragment>
                                        <h4 className="row-title">Additional Supplier Information</h4>
                                        <p className="row-sub-title">Upload up to three documents to share on your company profile page</p>
                                        {/*<div class="input-container flex-item">*/}
                                        {/*    <input type="text" class="input-text" placeholder="" value="" />*/}
                                        {/*    <div class="btn-upload btn pdf-button-upload">*/}
                                        {/*        <i class="icon icon-upload"><input onchange="readDocument(this)" type="file" accept="application/pdf" value="" /></i>                                                    */}
                                        {/*    </div>*/}
                                        {/*    <a onclick="deleteRow()" href="javascript:void(0)"><i class="icon icon-delete-entry"></i></a>*/}
                                        {/*</div>*/}
                                        {
                                            this.renderAdditionalSupplierInfo()
                                        }
                                        {/*<div class="table-button-con">*/}
                                        {/*    <a class="table-row-button" onClick={() => this.fileUploadComponentRef.browseFile()}><i class="icon icon-add-row-cross"></i>Add Document</a>*/}
                                        {/*</div>*/}
                                    </React.Fragment>
                                )
                        }
                    </div>

                </div>

                {/* <!-- Manufacturing Column End --> */}
            </React.Fragment>
        )
    }      
}

module.exports = CompanySettingsManufacturingInfoComponent;