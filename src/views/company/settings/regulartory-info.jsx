'use strict';
var React = require('react');
import BaseComponent from '../../shared/base';
import { US_FDA_LABEL, US_FDA_MAPPING } from '../../../consts/us-fda';
import moment from 'moment';
import { generateTempId } from '../../../scripts/shared/common';

class CompanySettingsRegulatoryInfoComponent extends BaseComponent { //= () => {
    constructor(props) {
        super(props);
        this.usFDA = 'US FDA';

        this.state = {
            fdaMapping: null,
            otherInspectionsMapping: null
        };

        this.initializeMapping(true);
    }

    initializeMapping = (isFirstLoad = false) => {
        const { otherInfo } = this.props;
        const { inspectionsInfo, gdufaFeePaymentYear, facultyRegistrationDate, fdaWarningLetterDate } = otherInfo;
        const usFdaInspectionDate = inspectionsInfo.find(ins => (ins.agencyName === this.usFDA))?.inspectionDate;

        const fdaMapping = [
            { inspection: US_FDA_LABEL.FDA_INSPECTION, inspectionDate: usFdaInspectionDate, editMode: false },
            { inspection: US_FDA_LABEL.GDUFA_FEE_PAYMENT, inspectionDate: gdufaFeePaymentYear ? new Date(gdufaFeePaymentYear.toString()).toISOString() : '', yearOnly: true, editMode: false },
            { inspection: US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION, inspectionDate: new Date(null).toString() !== new Date(facultyRegistrationDate).toString() ? facultyRegistrationDate : '', editMode: false },
            { inspection: US_FDA_LABEL.FDA_WARNING_LATTER, inspectionDate: fdaWarningLetterDate, editMode: false }
        ];

        const otherInspectionsMapping = inspectionsInfo.filter(ins => (ins.agencyName !== this.usFDA)).map((ins, index) => {
            return {
                tempId: `otherInspections-${index}`,
                inspection: ins?.agencyName,
                inspectionDate: ins?.inspectionDate,
                editMode: false
            }
        });;

        this.unmodifiedFdaMapping = JSON.stringify(fdaMapping);
        this.unmodifiedOtherInspectionMapping = JSON.stringify(otherInspectionsMapping);

        if (isFirstLoad) {
            this.state = {
                fdaMapping,
                otherInspectionsMapping
            };
        }
        else {
            this.setState({
                fdaMapping,
                otherInspectionsMapping
            });
        }        
    }

    initializeControls = () => {
        const self = this;
        $('.other-inspection-table-timepicker').daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoApply": true,
            "opens": "left",
            "locale": {
                "format": "DD-MMM-YYYY"
            }
        });

        $('.other-inspection-table-timepicker').on('apply.daterangepicker', (event, picker) => {
            console.log('event', event);
            const name = event.target.getAttribute('data-temp-id');
            console.log('name', name);
            const type = event.target.getAttribute('data-type');
            const newDate = picker.startDate.format('YYYY-MM-DD');
            if (type === 'other-inspection') {
                self.onOtherInspectionDateChange(name, newDate);
            }
        });

        //FDA
        $(`input[name="${US_FDA_LABEL.FDA_INSPECTION}"]`).daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoApply": true,
            "opens": "left",
            "locale": {
                "format": "DD-MMM-YYYY"
            }
        });
        $(`input[name="${US_FDA_LABEL.FDA_INSPECTION}"]`).on('apply.daterangepicker', (event, picker) => {
            const newDate = picker.startDate.format('YYYY-MM-DD');
            self.onFdaItemChange(US_FDA_LABEL.FDA_INSPECTION, newDate);
        });

        $(`input[name="${US_FDA_LABEL.GDUFA_FEE_PAYMENT}"]`).daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoApply": true,
            "opens": "left",
            "locale": {
                "format": "DD-MMM-YYYY"
            }
        });
        $(`input[name="${US_FDA_LABEL.GDUFA_FEE_PAYMENT}"]`).on('apply.daterangepicker', (event, picker) => {
            const newDate = picker.startDate.format('YYYY-MM-DD');
            self.onFdaItemChange(US_FDA_LABEL.GDUFA_FEE_PAYMENT, newDate);
        });

        
        $(`input[name="${US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION}"]`).daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoApply": true,
            "opens": "left",
            "locale": {
                "format": "DD-MMM-YYYY"
            }
        });
        $(`input[name="${US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION}"]`).on('apply.daterangepicker', (event, picker) => {
            const newDate = picker.startDate.format('YYYY-MM-DD');
            self.onFdaItemChange(US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION, newDate);
        });

        $(`input[name="${US_FDA_LABEL.FDA_WARNING_LATTER}"]`).daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoApply": true,
            "opens": "left",
            "locale": {
                "format": "DD-MMM-YYYY"
            }
        });
        $(`input[name="${US_FDA_LABEL.FDA_WARNING_LATTER}"]`).on('apply.daterangepicker', (event, picker) => {
            const newDate = picker.startDate.format('YYYY-MM-DD');
            self.onFdaItemChange(US_FDA_LABEL.FDA_WARNING_LATTER, newDate);
        });
    }

    componentDidMount() {
        this.initializeControls();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.userDetailsKey !== this.props.userDetailsKey) {
            this.initializeMapping();
        }
        if (this.newTempId) {            
            const self = this;
            $(`[data-temp-id='${this.newTempId}']`).daterangepicker({
                "singleDatePicker": true,
                "showDropdowns": true,
                "autoApply": true,
                "opens": "left",
                "locale": {
                    "format": "DD-MMM-YYYY"
                }
            });

            $(`[data-temp-id='${this.newTempId}']`).on('apply.daterangepicker', (event, picker) => {
                console.log('event', event);
                const name = event.target.getAttribute('data-temp-id');
                console.log('name', name);
                const type = event.target.getAttribute('data-type');
                const newDate = picker.startDate.format('YYYY-MM-DD');
                if (type === 'other-inspection') {
                    self.onOtherInspectionDateChange(name, newDate);
                }
            });
            this.newTempId = '';
        }
    }

    getInspectionsInfo = () => {
        const { fdaMapping, otherInspectionsMapping } = this.state;
        return {
            fdaMapping,
            otherInspectionsMapping
        }
    }

    prepareCorrectDate = (value, yearOnly) => {
        if (value) {
            const inspectionDate = value && !yearOnly ? moment.utc(value).format('DD-MMM-YYYY') : value;
            let inspectionValue = inspectionDate !== 'Invalid date' ? inspectionDate : undefined;
            if (yearOnly && inspectionValue) {
                inspectionValue = moment.utc(inspectionValue).year() + ' Fiscal year';
            }
            return inspectionValue;
        }
        return 'None Reported';
    };

    editFda = (name) => {
        let { fdaMapping } = this.state;
        let fdaEdit = fdaMapping.find(fda => fda.inspection === name);
        if (fdaEdit) {
            fdaEdit.editMode = true;
            this.setState({
                fdaMapping
            });
        }
    }

    clearFda = (name) => {
        let { fdaMapping } = this.state;
        let fdaClear = fdaMapping.find(fda => fda.inspection === name);
        if (fdaClear) {
            fdaClear.inspectionDate = null;
            this.setState({
                fdaMapping
            }, () => {
                this.props.showButtonGroup(true);
            });
        }
    }

    editOther = (tempId) => {
        let { otherInspectionsMapping } = this.state;
        let othEdit = otherInspectionsMapping.find(fda => fda.tempId === tempId);
        if (othEdit) {
            othEdit.editMode = true;
            this.setState({
                otherInspectionsMapping
            });
        }
    }

    deleteOther = (tempId) => {
        let { otherInspectionsMapping } = this.state;
        otherInspectionsMapping = otherInspectionsMapping.filter(oth => oth.tempId !== tempId);
        this.setState({
            otherInspectionsMapping
        }, () => {
            //Check if item is in unmodified, if not found do not show buttongroup
            const otherInspections = JSON.parse(this.unmodifiedOtherInspectionMapping);
            const exist = otherInspections.some(oth => {
                return oth.tempId === tempId;
            });
            if (exist) {
                this.props.showButtonGroup(true);
            }            
        });
    }

    addOther = () => {
        let { otherInspectionsMapping } = this.state;
        const currDate = new Date().toISOString();
        this.newTempId = `otherInspections-${otherInspectionsMapping.length}`;
        otherInspectionsMapping = [
            ...otherInspectionsMapping,
            { tempId: this.newTempId, inspection: '', inspectionDate: currDate, editMode: true }
        ];
        this.setState(() => ({
            otherInspectionsMapping
        }));
    }

    onFdaItemChange = (name, value) => {        
        let { fdaMapping } = this.state;
        let fdaUpdate = fdaMapping.find(fda => fda.inspection === name);
        if (fdaUpdate) {
            fdaUpdate.inspectionDate = value;
            this.setState({
                fdaMapping
            }, () => {
                this.props.showButtonGroup(true);
            });
        }
    }

    onOtherInspectionNameChange = (e) => {
        const { name, value } = e.target;
        let { otherInspectionsMapping } = this.state;
        let otherInsUpdate = otherInspectionsMapping.find(oth => oth.tempId === name);
        if (otherInsUpdate) {
            otherInsUpdate.inspection = value;
            this.setState({
                otherInspectionsMapping
            }, () => {
                this.props.showButtonGroup(true);
            });
        }
    }

    onOtherInspectionDateChange = (name, value) => {
        let { otherInspectionsMapping } = this.state;
        const newDate = new Date(value).toISOString();

        let otherInsUpdate = otherInspectionsMapping.find(oth => oth.tempId === name);
        if (otherInsUpdate) {
            otherInsUpdate.inspectionDate = newDate;
            this.setState({
                otherInspectionsMapping
            }, () => {
                this.props.showButtonGroup(true);
            });
        }
    }

    disregardRegulartoryInfoChanges = () => {
        this.setState({
            fdaMapping: JSON.parse(this.unmodifiedFdaMapping),
            otherInspectionsMapping: JSON.parse(this.unmodifiedOtherInspectionMapping)
        });
    }

    onInspectionDateIconClicked = (name) => {
        $(`input[name="${name}"]`).click();
    }

    render() {
        
        const { otherInfo } = this.props;
        console.log('otherInfo', otherInfo);
        const { fdaMapping, otherInspectionsMapping } = this.state;
        const { inspectionsInfo, gdufaFeePaymentYear, facultyRegistrationDate, fdaWarningLetterDate } = otherInfo;
        
        return (
            <div id="RegulatoryInformation" className="tab-pane fade">
                <div className="set-content regulatory-con clearfix">
                    <h4 className="row-settings-title">Regulatory Information</h4>
                    <div className="col-md-6">
                        <label>US FDA*</label>
                        <div className="table-container">
                            <table border="0" cellPadding="1" cellSpacing="1" style={{ width: "500px" }} className="table storefront-tables">
                                <thead>
                                    <tr>
                                        <th scope="col">Inspection</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        fdaMapping && fdaMapping.map((ins, i) => {
                                            //const searchIns = ins === "FDA Inspection" ? "US FDA" : ins;
                                            //const insInfo = inspectionsInfo.find(inspection => inspection.agencyName === searchIns);
                                            
                                            const inspectionDate = this.prepareCorrectDate(ins.inspectionDate, ins.yearOnly);
                                            const inspectionDateAlias = this.prepareCorrectDate(ins.inspectionDate);
                                            console.log('ins', ins);
                                            console.log('inspectionDateAlias', inspectionDateAlias)
                                            let displayInspectionDate = ins.yearOnly ? inspectionDateAlias : inspectionDate;
                                            if (inspectionDate === 'None Reported') {
                                                //displayInspectionDate = new Date().toISOString();
                                                displayInspectionDate = moment().format('DD-MMM-YYYY');
                                                //displayInspectionDate.format('DD-MMM-YYYY')
                                            }
                                            let showEdit = {};
                                            if (!ins.editMode) {
                                                showEdit = {
                                                    display: 'none'
                                                };
                                            }
                                            let hideDisplay = {};
                                            if (ins.editMode) {
                                                hideDisplay = {
                                                    display: 'none'
                                                };
                                            }
                                            return (
                                                <tr>
                                                    <td>{ins.inspection}</td>
                                                    <td>
                                                        <span className="date-value" style={hideDisplay}>{inspectionDate}</span>                                                                                                                
                                                        <a className='pull-right' onClick={(e) => { this.editFda(ins.inspection) }}>
                                                            <i className="icon icon-pen-blue"></i>
                                                        </a>
                                                        <div class="time-input-con pull-left" style={showEdit}>
                                                            <input className="table-timepicker date-value-select" type="text" name={ins.inspection} data-type="fda-inspection" value={displayInspectionDate} onChange={this.onFdaItemChange} placeholder="Timestamp" />                                                            
                                                            <i class="fa fa-calendar status-options-select-calendar-icon" onClick={() => this.onInspectionDateIconClicked(ins.inspection)}></i>
                                                        </div>                                                        
                                                    </td>
                                                    <td>
                                                        <a onClick={(e) => { this.clearFda(ins.inspection) }}>
                                                            <i className="icon icon-delete-entry"></i>
                                                        </a>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label>Others*</label>
                        <div className="table-container">
                            <table border="0" cellPadding="1" cellSpacing="1" style={{ width: "500px" }} className="table storefront-tables">
                                <thead>
                                    <tr>
                                        <th scope="col">Inspection</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        otherInspectionsMapping && otherInspectionsMapping.map((ins, i) => {
                                            const inspectionDate = this.prepareCorrectDate(ins.inspectionDate, ins.yearOnly);
                                            let showEdit = {};
                                            if (!ins.editMode) {
                                                showEdit = {
                                                    display: 'none'
                                                };
                                            }
                                            let hideDisplay = {};
                                            if (ins.editMode) {
                                                hideDisplay = {
                                                    display: 'none'
                                                };
                                            }
                                            return (
                                                <tr>
                                                    <td>{ins.editMode ? (<div className="name-options-select"><input type='text' className="common-input" name={ins.tempId} defaultValue={ins.inspection} onChange={this.onOtherInspectionNameChange} /></div>) : ins.inspection}</td>
                                                    <td>
                                                        <div className="time-input-con pull-left" style={showEdit}>
                                                            <input className="other-inspection-table-timepicker table-timepicker date-value-select" type='text' name={ins.tempId} data-type="other-inspection" data-temp-id={ins.tempId} defaultValue={inspectionDate} placeholder="Timestamp"  />
                                                            <i className="fa fa-calendar status-options-select-calendar-icon" onClick={() => this.onInspectionDateIconClicked(ins.tempId)}></i>
                                                        </div>
                                                        <span className="date-value" style={hideDisplay}>{inspectionDate}</span>
                                                        <a className="pull-right" onClick={(e) => { this.editOther(ins.tempId) }}><i className="icon icon-pen-blue"></i></a>
                                                    </td>
                                                    <td><a onClick={(e) => { this.deleteOther(ins.tempId) }} ><i className="icon icon-delete-entry"></i></a></td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            <div className="table-button-con">
                                <a className="table-row-button" onClick={this.addOther}><i className="icon icon-add-row-cross"></i>Add Row</a>
                            </div>
                        </div>

                    </div>


                    <div className="settings-button hide">
                        <div className="btn-next pull-right">Next</div>
                    </div>
                </div>
            </div>
        )
    }    
}

module.exports = CompanySettingsRegulatoryInfoComponent;