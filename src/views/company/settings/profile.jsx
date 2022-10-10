'use strict';

var React = require('react');

import BaseComponent from '../../shared/base';
import { generateTempId } from '../../../scripts/shared/common';
import CompanySettingsManufacturingInfoComponent from './manufacturing-info';

class CompanySettingsProfileComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.unmodifiedCompanyInfo = JSON.stringify({ ...props?.companyInfo } || {});
        console.log('props?.companyInfo', props?.companyInfo);
        const otherInfo = props?.companyInfo.CustomFields[0];
        this.capabilities = JSON.stringify(otherInfo.capabilities ? Array.from(otherInfo.capabilities, (v, i) => v) : []);
        this.subsidiaryType = JSON.stringify(otherInfo.subsidiaryType ? Array.from(otherInfo.subsidiaryType, (v, i) => v) : []);
        this.otherServices = JSON.stringify(otherInfo.otherServices ? Array.from(otherInfo.otherServices, (v, i) => v) : []);
        this.alerts = JSON.stringify(otherInfo.alerts ? Array.from(otherInfo.alerts, (v, i) => v) : []);
        this.filesList = JSON.stringify(otherInfo.filesList);

        this.state = {
            companyInfo: props?.companyInfo || {}
            
            //unmodifiedCustomFields: Array.from(props?.companyInfo.CustomFields, (v, i) => v)
        }
        console.log('props?.companyInfo', props?.companyInfo);
    }

    getCompanyInfo = () => {

        return this.state.companyInfo;
    }

    updateCompanyInfo = (companyInfo) => {
        this.setState({
            companyInfo
        }, () => {
            this.props.showButtonGroup(true);
        });
    }

    discardCompanyInfoChanges = () => {
        const unmodifiedCompanyInfo = JSON.parse(this.unmodifiedCompanyInfo);
        let customFields = unmodifiedCompanyInfo.CustomFields[0];
        unmodifiedCompanyInfo.CustomFields[0] = {
            ...customFields,
            capabilities: JSON.parse(this.capabilities),
            subsidiaryType: JSON.parse(this.subsidiaryType),
            otherServices: JSON.parse(this.otherServices),
            alerts: JSON.parse(this.alerts),
            filesList: JSON.parse(this.filesList)
        };
        //let customFieldsOtherInfo = unmodifiedCompanyInfo.CustomFields;
        this.setState({
            companyInfo: unmodifiedCompanyInfo 
        });
    }

    onCompanyInfoProfileChange = (e) => {
        let { companyInfo } = this.state;

        const { name, value } = e.target;
        companyInfo = {...companyInfo, [name]: value};
        this.updateCompanyInfo(companyInfo);
    }

    onCompanyInfoAddressChange = (e) => {
        let { companyInfo } = this.state;

        const { name, value } = e.target;
        let address = companyInfo.address;
        if (!address && address.length < 1) {
            address.push('');
        }
        if (!address && address.length < 2) {
            address.push('');
        }
        if (name === 'address1') {            
            address[0] = value;
        }
        if (name === 'address2') {
            address[1] = value;
        }
        companyInfo = { ...companyInfo, address };
        this.updateCompanyInfo(companyInfo);
    }

    addRemoveOtherService = (otherService, isAdd) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        if (!otherInfo.otherServices) otherInfo.otherServices = [];
        if (isAdd) {
            const isExist = otherInfo.otherServices.some(r => r === otherService);
            if (!isExist) {
                otherInfo.otherServices = [...otherInfo.otherServices, otherService];
            }            
        }
        else {
            otherInfo.otherServices = otherInfo.otherServices.filter(r => r !== otherService);
        }
        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }

    addRemoveFile = (file, filename, isAdd) => {
        let { companyInfo } = this.state;
        let [otherInfo] = companyInfo.CustomFields;
        if (!otherInfo.filesList) otherInfo.filesList = [];
        if (isAdd) {
            const isExist = otherInfo.filesList.some(r => r.fileName === filename);
            if (!isExist) {
                otherInfo.filesList = [...otherInfo.filesList, { fileName: filename, file: file}];
            }
        }
        else {
            otherInfo.filesList = otherInfo.filesList.filter(r => r.fileName !== filename);
        }
        companyInfo = {
            ...companyInfo,
            CustomFields: [{ ...otherInfo }]
        };
        this.updateCompanyInfo(companyInfo);
    }

    addRemoveCapabilities = (type, value, isAdd) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        if (!otherInfo.capabilities) otherInfo.capabilities = [];
        if (isAdd) {
            const isExist = otherInfo.capabilities.some(r => r.type === type && r.value === value);
            if (!isExist) {
                otherInfo.capabilities = [...otherInfo.capabilities, { type, value }]
            }
        }
        else{
            otherInfo.capabilities = otherInfo.capabilities.filter(r => !(r.type === type && r.value === value) );
        }

        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }



    onCompanyOtherInfoChange = (e) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        const { name, value } = e.target;
        otherInfo = {...otherInfo, [name]: value};

        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }

    onCompanyInfoProfileAddressChange = (e) => {
        let { companyInfo } = this.state;
        const { value } = e.target;
        if (companyInfo.address && companyInfo.address.length > 0) {
            companyInfo.address[0] = value;
        }
        this.updateCompanyInfo(companyInfo);
    }

    onCompanySubsidiaryTypeChange = (e) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        const {name, checked } = e.currentTarget;
        if (!otherInfo.subsidiaryType) otherInfo.subsidiaryType = [];
        if (checked) {
            otherInfo.subsidiaryType = [...otherInfo.subsidiaryType, name];
        }
        else {
            otherInfo.subsidiaryType = otherInfo.subsidiaryType.filter(r => r !== name);
        }
        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }

    addCompanyAlert = (alert, index) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        if (!otherInfo.alerts) otherInfo.alerts = [];
        if (otherInfo.alerts && otherInfo.alerts.length > index) {
            otherInfo.alerts[index] = alert;
        }
        else {
            otherInfo.alerts.push(alert);
        }
        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }

    removeCompanyAlert = (index) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        if (index >= 0 && otherInfo.alerts && otherInfo.alerts.length < 3) {
            if (index === 0) {
                otherInfo.alerts = [];
            }
            else {
                otherInfo.alerts.splice(index, 1);
            }            
        }
        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }

    validateFields = () => {
        $('.error-con').removeClass('error-con');
        let hasError = false;
        if (!this.locationAddressLine1Ref.value) {
            this.locationAddressLine1Ref.classList.add('error-con');
            hasError = true;
        }
        if (!this.locationCityRef.value) {
            this.locationCityRef.classList.add('error-con');
            hasError = true;
        }
        if (!this.locationCountryRef.value) {
            this.locationCountryRef.classList.add('error-con');
            hasError = true;
        }
        return hasError;
    }

    changeCmo = (selected) => {
        let { companyInfo } = this.state;
        let [ otherInfo ] = companyInfo.CustomFields;
        otherInfo = {
            ...otherInfo,
            cmo: selected === 'Yes',
            contractManufacturingOrganization: selected
        };
        companyInfo = {
            ...companyInfo,
            CustomFields: [{...otherInfo}]
        };
        this.updateCompanyInfo(companyInfo);
    }

    render() {
        const { subsidiaryTypes, predefinedAlerts, contractManufacturingOrganizationList, otherServices, manufacturerCapabilities, countries, isFreemium } = this.props;
        const { companyInfo } = this.state;
        const otherInfo = companyInfo.CustomFields[0];
        let address1 = '';
        if (companyInfo.address && companyInfo.address.length > 0) {
            address1 = companyInfo.address[0];
        }
        let address2 = '';
        if (companyInfo.address && companyInfo.address.length > 1) {
            address2 = companyInfo.address[1];
        }
        
        return (
            <div id="Profile" className="tab-pane fade in active">
                <div className="profile-img hide"> 
                    <img src="images/NCD-logo.svg" />
                    <button className="btn-change">Change</button>
                </div>

                <div className="set-content clearfix">
                    {/* <!-- General Column Start --> */}

                    <div className="col-md-6 general-info">
                        <h4 className="row-settings-title">General</h4>
                        <div className="set-inputs hide">
                            <div className="col-md-6"><span className="itmdtls-seller-cnct">
                                    <button type="button" className="btn btn-outline-light" id="show-links">Request to link to a company</button>
                                </span>
                            </div>
                        </div>

                        <div className="set-inputs">
                        </div>
                        <div className="set-inputs">
                            <div className="input-container">
                                <span className="title">Subsidiary Name</span>
                                <span className="not-input">{companyInfo.name}
                                    {/*TODO: Sprint22-25*/}
                                    <img src="images/verified-01.svg" alt="" />
                                </span>
                            </div>
                        </div>
                        <div className="set-inputs">
                            <div className="input-container">
                                <span className="title">Corporate Group Name </span>
                                <span className="not-input">
                                    <i className="icon icon-chains"></i>
                                    {otherInfo.relationGroupName}
                                </span>
                            </div>
                        </div>                                            

                        <div className="set-inputs checkbox-design">
                            <div className="input-container">
                                <span className="title">Subsidiary Type</span>
                                <div className="d-flex">
                                    { subsidiaryTypes && subsidiaryTypes.map((st) => {
                                        const isChecked = otherInfo.subsidiaryType.some(s => s === st);
                                        const key = `subsidiary${st}`;
                                        return (
                                            <div className="fancy-checkbox checkbox-sm" key={key}>
                                                <input type="checkbox" id={key} name={st} data-value={st} data-parent-custom="52909-SubsidiaryType-mgdTBZJB4f" data-id="7792" checked={isChecked} onChange={this.onCompanySubsidiaryTypeChange} /> 
                                                <label htmlFor={key}>{st}</label>
                                            </div>        
                                        )
                                    })}                                    
                                </div>
                            </div>
                            <div className="input-container">
                                <span className="title">Website URL</span>
                                <input 
                                    type="text" 
                                    className="input-text required" 
                                    id="52909-WebsiteURL-7RZx2tzANO" 
                                    placeholder="" 
                                    name="webPage" 
                                    value={otherInfo.webPage} 
                                    onChange={this.onCompanyOtherInfoChange} 
                                />
                            </div>
                        </div>

                        {/*TODO: Sprint22-25*/}
                        <div className="item-form-group clearfix">
                            <h4 className="row-title">Location</h4>
                            <p className="mandatory-title"><i className="fa fa-asterisk" aria-hidden="true"></i>Mandatory Fields</p>
                            <p className="row-sub-title"></p>
                            <div className="input-container">
                                <span className="title"><span>Address Line 1<i className="fa fa-asterisk" aria-hidden="true"></i></span></span>
                                <input
                                    onChange={this.onCompanyInfoAddressChange}
                                    type="text"
                                    className="input-text required"
                                    placeholder=""
                                    name='address1'
                                    value={address1}
                                    maxlength="200"
                                    ref={(ref) => this.locationAddressLine1Ref = ref}
                                />
                            </div>
                            <div className="input-container">
                                <span className="title">Address Line 2</span>
                                <input
                                    onChange={this.onCompanyInfoAddressChange}
                                    type="text"
                                    className="input-text "
                                    placeholder=""
                                    name='address2'
                                    value={address2}
                                    maxlength="200"
                                />
                            </div>
                            <div className="input-container">
                                <span className="title"><span>City<i className="fa fa-asterisk" aria-hidden="true"></i></span></span>
                                <span className="select-option">
                                    <input
                                        onChange={this.onCompanyInfoProfileChange}
                                        type="text"
                                        className="input-text required" 
                                        placeholder=""
                                        name='city'
                                        value={companyInfo.city}
                                        maxlength="100"
                                        ref={(ref) => this.locationCityRef = ref}
                                    />
                                </span>
                            </div>
                            <div className="input-container">
                                <span className="title">State</span>
                                <span className="select-option">
                                    <input
                                        onChange={this.onCompanyOtherInfoChange}
                                        type="text"
                                        className="input-text "
                                        placeholder=""
                                        name='state'
                                        value={otherInfo.state}
                                        maxlength="100"
                                    />
                                </span>
                            </div>
                            <div className="input-container">
                                <span className="title">Postal Code</span>
                                <input
                                    onChange={this.onCompanyOtherInfoChange}
                                    type="text"
                                    className="input-text postal-size"
                                    placeholder=""
                                    name='postalCode'
                                    value={otherInfo.postalCode}
                                    maxlength="15"
                                />
                            </div>
                            <div className="input-container">
                                <span className="title"><span>Country / Territory<i className="fa fa-asterisk" aria-hidden="true"></i></span></span>
                                <span className="select-option">
                                    <select
                                        name="country"
                                        className="get-text valid required"
                                        onChange={this.onCompanyOtherInfoChange}
                                        value={otherInfo.country.toLowerCase().trim()}
                                        ref={(ref) => this.locationCountryRef = ref}
                                    >
                                        {/*<option value=''>Please select</option>*/}
                                        {
                                            countries && countries.map((country, index) => {
                                                if (country.toLowerCase() === otherInfo.country.toLowerCase()) {
                                                    return (
                                                        <option key={`country${index + 1}`} value={country.toLowerCase().trim()} selected>{country}</option>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <option key={`country${index + 1}`} value={country.toLowerCase().trim()}>{country}</option>
                                                    )
                                                }                                                
                                            })
                                        }                                        
                                    </select>
                                </span>
                            </div>
                        </div>

                        <div className="item-form-group company-alerts clearfix">
                            <h4 className="row-title">Company Alerts</h4>
                            <p className="row-sub-title">These alerts will be displayed on Company Page</p>
                            <div className="input-container">
                                <label className="additional-one">1st</label>

                                <div className="dropdown select">
                                    <button className="btn btn-default dropdown-toggle" value="" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                        {otherInfo.alerts && otherInfo.alerts.length > 0 ? otherInfo.alerts[0] : 'No Alerts Reported'}
                                        <span className="caret"></span>
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="alertMenu1">
                                        <li>
                                            <a 
                                                onClick={() => this.removeCompanyAlert(otherInfo.alerts && otherInfo.alerts.length > 0 ? 0 : -1)}
                                            >
                                                No Alerts Reported
                                            </a>
                                        </li>
                                        {
                                            predefinedAlerts && predefinedAlerts.map((alert, index) => {
                                                return (
                                                    <li key={`${alert}1${index}`}><a onClick={() => this.addCompanyAlert(alert, 0)}>{alert}</a></li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>                                                    
                            </div>
                            {otherInfo.alerts && otherInfo.alerts.length > 0 &&
                                (<div className="input-container">
                                    <label className="additional-one">2nd</label>
                                    <div className="dropdown select">
                                        <button className="btn btn-default dropdown-toggle" value="" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                        {otherInfo.alerts && otherInfo.alerts.length > 1 ? otherInfo.alerts[1] : 'No Alerts Reported'}
                                            <span className="caret"></span>
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="alertMenu2">
                                        <li>
                                            <a 
                                                onClick={() => this.removeCompanyAlert(otherInfo.alerts && otherInfo.alerts.length > 1 ? 1 : -1)}
                                            >
                                                No Alerts Reported
                                            </a>
                                        </li>
                                            { predefinedAlerts && predefinedAlerts.map((alert, index) => {
                                                return (
                                                    <li key={`${alert}2${index}`}><a onClick={() => this.addCompanyAlert(alert, 1)}>{alert}</a></li>
                                                )
                                            }) }                                            
                                        </ul>
                                    </div>                                                    
                                </div>)
                            }
                        </div>
                        <div className="set-inputs">
                        </div>
                    </div>

                    {/* <!-- General Column End --> */}

                    <CompanySettingsManufacturingInfoComponent 
                        contractManufacturingOrganizationList={contractManufacturingOrganizationList}
                        companyInfo={companyInfo}
                        otherInfo={otherInfo}
                        otherServices={otherServices}
                        manufacturerCapabilities={manufacturerCapabilities}
                        addRemoveOtherService={this.addRemoveOtherService}
                        addRemoveCapabilities={this.addRemoveCapabilities}
                        changeCmo={this.changeCmo}
                        addRemoveFile={this.addRemoveFile}
                        isFreemium={isFreemium}
                    />

                </div>
            </div>
        )
    }
}

module.exports = CompanySettingsProfileComponent;
