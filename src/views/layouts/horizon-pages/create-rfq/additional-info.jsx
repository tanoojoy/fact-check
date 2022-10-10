import React, { useEffect, useState } from 'react';
import { bool, func, object, array } from 'prop-types';
import moment from 'moment';
import { get } from 'lodash';
import { Select, MultiSelect, InputField, DaterangepickerField, Label, CellText } from '../../horizon-components/components-of-form';
require('daterangepicker');

const ExpectedTimeOfArrivalSelectors = ({ partOfMonth, months, years, setExpectedTimeOfArrival }) => {
    const [selectedPart, setPartOfMonth] = useState('');
    const [selectedMonth, setMonth] = useState('');
    const [selectedYear, setYear] = useState('');

    useEffect(() => {
        let result = '';
        let countDaysInMonth, midDay;
        if (selectedYear) {
            if (selectedMonth) {
                if (selectedPart) {
                    // path of selected month and selected year (full)
                    switch (selectedPart) {
                    case 'early':
                        result = moment([selectedYear, Number(selectedMonth) - 1]).startOf('month').toISOString();
                        break;
                    case 'mid':
                        countDaysInMonth = moment([selectedYear, Number(selectedMonth) - 1]).daysInMonth();
                        midDay = Math.round(countDaysInMonth / 2);
                        result = moment([selectedYear, Number(selectedMonth) - 1, midDay]).endOf('day').toISOString();
                        break;
                    case 'late':
                        result = moment([selectedYear, Number(selectedMonth) - 1]).endOf('month').toISOString();
                        break;
                    }
                } else {
                    // end of selected month and with year
                    result = moment([selectedYear, Number(selectedMonth) - 1]).endOf('month').toISOString();
                }
            } else {
                // end of selected year
                result = moment([selectedYear, 11]).endOf('year').toISOString();
            }
            setExpectedTimeOfArrival(result);
        }
    }, [selectedPart, selectedMonth, selectedYear]);

    return (
        <>
            <div className='col-xs-3'>
                <Select
                    options={[{ label: 'Select', value: '' }].concat(partOfMonth)}
                    className='expected-time-arrival__part-of-month'
                    onChangeValue={setPartOfMonth}
                />
            </div>
            <div className='col-xs-3 move-right'>
                <Select
                    options={[{ label: 'Month', value: '' }].concat(months)}
                    className='expected-time-arrival__month'
                    onChangeValue={setMonth}
                />
            </div>
            <div className='col-xs-2'>
                <Select
                    options={[{ label: 'Year', value: '' }].concat(years)}
                    className='expected-time-arrival__year'
                    onChangeValue={setYear}
                />
            </div>
        </>
    );
};

const AdditionalInfo = ({ onlyView = false, rfqDetails = {}, rfqFormDropdowns = {}, onChangeForm }) => {
    const getInitialState = (path = '', defaultValue = '') => onlyView ? get(rfqDetails, path, defaultValue) : defaultValue;

    const currenciesInfo = get(rfqFormDropdowns, 'currenciesInfo', []);
    const requiredDocs = get(rfqFormDropdowns, 'requiredDocs', []);
    const incoterms = get(rfqFormDropdowns, 'incoterms', []);
    const months = get(rfqFormDropdowns, 'months', []);
    const years = get(rfqFormDropdowns, 'years', []);
    const partOfMonth = get(rfqFormDropdowns, 'partOfMonth', '');

    const [preferredCurrency, setPreferredCurrency] = useState(getInitialState('preferredCurrency'));
    const [preferredPackagingType, setPreferredPackagingType] = useState(getInitialState('preferredPackagingType'));
    const [expectedTimeOfArrival, setExpectedTimeOfArrival] = useState(getInitialState('expectedTimeOfArrival'));
    const [incotermsValue, setIncotermsValue] = useState(getInitialState('incoterms'));
    const [placeOfDelivery, setPlaceOfDelivery] = useState(getInitialState('placeOfDelivery'));
    const [preferredPaymentTerms, setPreferredPaymentTerms] = useState(getInitialState('preferredPaymentTerms'));
    const [acceptingQuotesUntil, setAcceptingQuotesUntil] = useState(getInitialState('acceptingQuotesUntil'));
    const [documentsRequired, setDocumentsRequired] = useState(getInitialState('documentsRequired', []));
    const [comment, setComment] = useState(getInitialState('comment'));
    const prepareDocsRequiredField = (docsRequired) => docsRequired.map((doc) => ({ name: doc }));

    useEffect(() => {
        onChangeForm(
            preferredCurrency,
            preferredPackagingType,
            expectedTimeOfArrival,
            incotermsValue,
            placeOfDelivery,
            preferredPaymentTerms,
            acceptingQuotesUntil,
            documentsRequired,
            comment
        );
    }, [
        preferredCurrency,
        preferredPackagingType,
        expectedTimeOfArrival,
        incotermsValue,
        placeOfDelivery,
        preferredPaymentTerms,
        acceptingQuotesUntil,
        documentsRequired,
        comment
    ]);

    return (
        <div className='add-information container-fluid'>
            <div className='row add-information-header'>
                <div className='col-xs-12'>Additional Information</div>
            </div>

            <div className='row preferred-currency'>
                <Label htmlFor='preferred-currency' name='Preferred currency' />
                {
                    onlyView
                        ? <CellText text={preferredCurrency} classWidth='col-xs-8' specifyClasses='bold' />
                        : <div className='col-xs-4'>
                            <Select
                                options={[{ label: 'Select', value: '' }].concat(currenciesInfo)}
                                className='preferred-currency'
                                onChangeValue={setPreferredCurrency}
                            />
                        </div>
                }
            </div>

            <InputField
                name='Preferred packaging type'
                nameClass='preferred-packaging-type'
                widthClass='col-xs-8'
                placeholder='e.g.: blister pack'
                onChangeValue={setPreferredPackagingType}
                onlyView={onlyView}
                value={preferredPackagingType}
            />

            <div className='row expected-time-arrival'>
                <Label htmlFor='expected-time-arrival' name='Expected time of arrival' />
                {
                    onlyView
                        ? <CellText text={expectedTimeOfArrival ? moment(+expectedTimeOfArrival).format('MM/YYYY') : '-'} classWidth='col-xs-8' specifyClasses='bold' />
                        : <ExpectedTimeOfArrivalSelectors
                            partOfMonth={partOfMonth}
                            months={months} years={years}
                            setExpectedTimeOfArrival={setExpectedTimeOfArrival}
                        />
                }
            </div>

            <div className='row incoterms'>
                <Label htmlFor='incoterms' name='Incoterms' />
                {
                    onlyView
                        ? <CellText text={incotermsValue} classWidth='col-xs-8' specifyClasses='bold' />
                        : <div className='col-xs-4'>
                            <Select
                                options={[{ label: 'Select', value: '' }].concat(incoterms)}
                                className='incoterms'
                                onChangeValue={setIncotermsValue}
                            />
                        </div>
                }
            </div>

            <InputField
                name='Place of delivery'
                nameClass='place-of-delivery'
                widthClass='col-xs-8'
                placeholder='e.g.: city'
                onChangeValue={setPlaceOfDelivery}
                onlyView={onlyView}
                value={placeOfDelivery}
            />

            <InputField
                name='Preferred payment terms'
                nameClass='preferred-payment-terms'
                widthClass='col-xs-8'
                placeholder=''
                onChangeValue={setPreferredPaymentTerms}
                onlyView={onlyView}
                value={preferredPaymentTerms}
            />

            <DaterangepickerField
                name='Accepting quotes until'
                nameClass='accepting-quotes-until'
                widthClass='col-xs-4'
                onChangeValue={setAcceptingQuotesUntil}
                onlyView={onlyView}
                value={acceptingQuotesUntil}
            />

            <MultiSelect
                options={requiredDocs}
                name='Documents required'
                nameClass='documents-required'
                widthClass='col-xs-8'
                placeholder='You can select several'
                onChangeValue={(docsRequired) => setDocumentsRequired(prepareDocsRequiredField(docsRequired))}
                onlyView={onlyView}
                values={documentsRequired.map(doc => doc.name)}
            />

            <InputField
                name='Comment'
                nameClass='comment'
                widthClass='col-xs-8'
                placeholder='Type here'
                textArea={4}
                onChangeValue={setComment}
                onlyView={onlyView}
                value={comment}
            />
        </div>
    );
};

AdditionalInfo.propTypes = {
    onlyView: bool,
    rfqDetails: object,
    rfqFormDropdowns: object,
    onChangeForm: func
};

ExpectedTimeOfArrivalSelectors.propTypes = {
    partOfMonth: array,
    months: array,
    years: array,
    setExpectedTimeOfArrival: func
};

export default AdditionalInfo;
