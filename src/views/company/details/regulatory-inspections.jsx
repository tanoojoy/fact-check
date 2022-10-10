'use strict';

var React = require('react');
import { US_FDA_LABEL, US_FDA_MAPPING } from '../../../consts/us-fda';
import moment from 'moment';
import LockSymbol from '../../common/lock-symbol';

const CompanyDetailsRegulatoryInspectionsComponent = ({ otherInfo, isFreemium }) => {

    const { inspectionsInfo, gdufaFeePaymentYear, facultyRegistrationDate, fdaWarningLetterDate } = otherInfo;
    const usFdaInspectionDate = inspectionsInfo.find(ins => (ins.agencyName === 'US FDA'))?.inspectionDate;

    const fdaMapping = [
        { inspection: US_FDA_LABEL.FDA_INSPECTION, inspectionDate: usFdaInspectionDate },
        { inspection: US_FDA_LABEL.GDUFA_FEE_PAYMENT, inspectionDate: gdufaFeePaymentYear ? new Date(gdufaFeePaymentYear.toString()).toISOString() : '', yearOnly: true },
        { inspection: US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION, inspectionDate: new Date(null).toString() !== new Date(facultyRegistrationDate).toString() ? facultyRegistrationDate : '' },
        { inspection: US_FDA_LABEL.FDA_WARNING_LATTER, inspectionDate: fdaWarningLetterDate }
    ];
    
    const otherInspectionsMapping = inspectionsInfo.filter(ins => (ins.agencyName !== 'US FDA')).map((ins, index) => {
        return {
            inspection: ins?.agencyName,
            inspectionDate: ins?.inspectionDate
        }
    });

    const prepareCorrectDate = (value, yearOnly) => {
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

    return (
        <React.Fragment>
            <div className="store-new-con">
                <p className="store-new-con-title"><i className="icon icon-shield-blue"></i>Regulatory Inspections
                </p>
                <div className="col-md-6 us-fda-table">
                    <p className="common-table-tile"><a href="javascript:void(0)">US FDA<i className="icon icon-linker-gray"></i></a></p>

                    <table border="0" cellpadding="0" cellspacing="0" className="table storefront-tables">
                        <thead>
                            <tr>
                                <th scope="col">Inspection</th>
                                <th scope="col">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                fdaMapping && fdaMapping.map((ins, i) => {
                                    const inspectionDate = prepareCorrectDate(ins.inspectionDate, ins.yearOnly);
                                    return (
                                        <tr>
                                            <td><i className="icon icon-gear-gray"></i>{ins.inspection}</td>
                                            <td>{i > 0 && isFreemium ? <LockSymbol /> : inspectionDate}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>

                <div className="col-md-6 others-table">
                    <p className="common-table-tile">Others</p>


                    <table border="0" cellpadding="0" cellspacing="0" className="table storefront-tables">
                        <thead>
                            <tr>
                                <th scope="col">Inspection</th>
                                <th scope="col">Date</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                otherInspectionsMapping && otherInspectionsMapping.map((ins, i) => {
                                    const inspectionDate = prepareCorrectDate(ins.inspectionDate, ins.yearOnly);
                                    return (
                                        <tr>
                                            <td><i className="icon icon-gear-gray"></i>{ins.inspection}</td>
                                            <td>{isFreemium ? <LockSymbol /> : inspectionDate}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>                                    
                    </table>
                </div>
            </div>
        </React.Fragment>
    )
}

export default CompanyDetailsRegulatoryInspectionsComponent;