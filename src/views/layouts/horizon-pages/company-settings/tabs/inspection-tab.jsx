import React, { useState, useEffect } from 'react';
import FormTable from '../components/form-table';
import { US_FDA_LABEL, US_FDA_MAPPING } from '../../../../../consts/us-fda';
import { ColumnType } from '../../../../../consts/table';
import { bool, func, object } from 'prop-types';

const ColumnName = {
    NAME: 'name',
    DATE: 'date'
};

const InspectionsTab = ({
    companyInfo,
    onIspectionsChange,
    onFormReset,
    resetForm
}) => {
    const [company, setCompany] = useState(companyInfo);

    const {
        inspectionsInfo = [],
        gdufaFeePaymentYear,
        facultyRegistrationDate,
        fdaWarningLetterDate
    } = company || {};

    useEffect(() => {
        setCompany({ ...companyInfo });

        if (resetForm) {
            setCompany({ ...companyInfo });
            onIspectionsChange({ ...companyInfo });
            onFormReset();
        }
    }, [resetForm, companyInfo]);

    const fdaInspection = inspectionsInfo.find(inspection => inspection?.agencyName === 'US FDA')?.inspectionDate;
    const fdaMapping = [
        [
            {
                value: US_FDA_LABEL.FDA_INSPECTION,
                type: ColumnType.TEXT,
                colName: ColumnName.NAME
            },
            {
                value: fdaInspection,
                type: ColumnType.DATE,
                colName: ColumnName.DATE
            }
        ],
        [
            {
                value: US_FDA_LABEL.GDUFA_FEE_PAYMENT,
                type: ColumnType.TEXT,
                colName: ColumnName.NAME
            },
            {
                value: gdufaFeePaymentYear ? new Date(gdufaFeePaymentYear.toString()).toISOString() : '',
                type: ColumnType.DATE,
                colName: ColumnName.DATE,
                yearOnly: true
            }
        ],
        [
            {
                value: US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION,
                type: ColumnType.TEXT,
                colName: ColumnName.NAME
            },
            {
                value: new Date(null).toString() !== new Date(facultyRegistrationDate).toString() ? facultyRegistrationDate : '',
                type: ColumnType.DATE,
                colName: ColumnName.DATE
            }
        ],
        [
            {
                value: US_FDA_LABEL.FDA_WARNING_LATTER,
                type: ColumnType.TEXT,
                colName: ColumnName.NAME
            },
            {
                value: fdaWarningLetterDate,
                type: ColumnType.DATE,
                colName: ColumnName.DATE
            }
        ]];

    const otherInspections = inspectionsInfo.filter(inspection => inspection?.agencyName !== 'US FDA').map(inspection => {
        return [
            {
                value: inspection?.agencyName,
                type: ColumnType.TEXT,
                colName: ColumnName.NAME
            },
            {
                value: inspection?.inspectionDate,
                type: ColumnType.DATE,
                colName: ColumnName.DATE
            }
        ];
    });

    const handleInspectionsChange = (inspections) => {
        const {
            facultyRegistrationDate,
            fdaWarningLetterDate,
            gdufaFeePaymentYear,
            ...newCompanyInfo
        } = company;
        const otherInspections = [];
        const isUsFdaInspections = inspections.find(inspection => inspection.find(insp => Object.values(US_FDA_LABEL).indexOf(insp.value) > -1));
        if (isUsFdaInspections) {
            Object.values(US_FDA_LABEL).forEach(label => {
                const currentInspection = inspections?.find(inspection => {
                    return inspection?.find(inspection => inspection.value === label);
                });
                const currentInspectionDate = currentInspection?.find(insp => insp.colName === ColumnName.DATE).value;

                if (label !== US_FDA_LABEL.FDA_INSPECTION) {
                    console.log('NEW COMPANY INFO PREPARATION', currentInspectionDate, label);
                    if (currentInspection) newCompanyInfo[US_FDA_MAPPING[label]] = currentInspectionDate;
                } else {
                    const normalizedInspection = {
                        agencyName: 'US FDA',
                        inspectionDate: currentInspectionDate
                    };
                    newCompanyInfo.inspectionsInfo = [...newCompanyInfo.inspectionsInfo.filter(insp => insp.agencyName !== 'US FDA')];
                    if (currentInspection) newCompanyInfo.inspectionsInfo.push(normalizedInspection);
                }
            });
        } else {
            inspections?.forEach(inspection => {
                const name = inspection?.find(insp => insp?.colName === ColumnName.NAME)?.value;
                const date = inspection?.find(insp => insp?.colName === ColumnName.DATE)?.value;
                const otherInspection = name !== US_FDA_LABEL.FDA_INSPECTION;
                if (otherInspection) {
                    otherInspections.push({
                        agencyName: name,
                        inspectionDate: date
                    });
                }
            });
            newCompanyInfo.inspectionsInfo = [...newCompanyInfo.inspectionsInfo.filter(insp => insp.agencyName === 'US FDA'), ...otherInspections];
        }

        setCompany({ ...companyInfo, ...newCompanyInfo });
        onIspectionsChange({ ...companyInfo, ...newCompanyInfo });
    };

    return (
        <div className='company-settings__inspection-content'>
            <h1 className='company-settings__info-title'>Regulatory Inspections</h1>
            <div className='company-settings__inspections'>
                <FormTable
                    title='US FDA'
                    data={fdaMapping}
                    verificationStatusVisible={false}
                    columnTitles={['Inspection', 'Date']}
                    onInspectionsChange={handleInspectionsChange}
                    removable
                    editable
                    resetForm={resetForm}
                />
                <FormTable
                    title='Other'
                    data={otherInspections}
                    verificationStatusVisible={false}
                    columnTitles={['Inspection', 'Date']}
                    extendable
                    removable
                    editable
                    resetForm={resetForm}
                    onInspectionsChange={handleInspectionsChange}
                />
            </div>
        </div>

    );
};

InspectionsTab.propTypes = {
    companyInfo: object,
    onIspectionsChange: func,
    onFormReset: func,
    resetForm: bool
};

export default InspectionsTab;
