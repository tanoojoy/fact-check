'use strict';
const { useState, useEffect } = require('react');
const React = require('react');
const BaseComponent = require('../../shared/base');

import moment from 'moment';

const AdditionalInfoComponent = ({
    acceptingQuotesUntil,
    preferredPackagingType, 
    placeOfDelivery, 
    preferredPaymentTerms, 
    comment, 
    onChange, 
    onValueChange,
    preferredCurrency, 
    currenciesInfo, 
    preferredIncoterms, 
    incoterms, 
    documentsRequired, 
    requiredDocs, 
    expectedTimeOfArrival, 
    //expectedTimeOfArrivalDay,
    partOfMonth: partOfMonths, 
    //expectedTimeOfArrivalMonth,
    months, 
    //expectedTimeOfArrivalYear,
    years,
    onDocumentChecked,
    selectedDocumentsLabel
}) => {

    const [expectedTimeOfArrivalDay, setExpectedTimeOfArrivalDay] = useState(expectedTimeOfArrivalDay);
    const [expectedTimeOfArrivalMonth, setExpectedTimeOfArrivalMonth] = useState(expectedTimeOfArrivalMonth);
    const [expectedTimeOfArrivalYear, setExpectedTimeOfArrivalYear] = useState(expectedTimeOfArrivalYear);
    const [newExpectdTimeOfArrival, setNewExpectdTimeOfArrival] = useState('');

    if (expectedTimeOfArrival && (expectedTimeOfArrival !== newExpectdTimeOfArrival)) {
        setNewExpectdTimeOfArrival(expectedTimeOfArrival);
        const momentExpectedTimeOfArrival = moment(expectedTimeOfArrival);
        if (momentExpectedTimeOfArrival && momentExpectedTimeOfArrival.isValid()) {
            const day = Number(momentExpectedTimeOfArrival.format('DD'));
            if (day < 10 && expectedTimeOfArrivalDay !== 'early') {
                setExpectedTimeOfArrivalDay('early');
            }
            else if (day >= 10 && day < 20 && expectedTimeOfArrivalDay !== 'mid') {
                setExpectedTimeOfArrivalDay('mid');
            }
            else {
                expectedTimeOfArrivalDay !== 'late' || setExpectedTimeOfArrivalDay('late');
            }
            const month = momentExpectedTimeOfArrival.month() + 1;
            if (month !== Number(expectedTimeOfArrivalMonth))
                setExpectedTimeOfArrivalMonth(month);
            const year = momentExpectedTimeOfArrival.year();
            if (year !== Number(expectedTimeOfArrivalYear)) 
                setExpectedTimeOfArrivalYear(year);
        }
    }

    const onExpectedTimeOfArrivalChanged = (e) => {
        const { name, value } = e.target;
        switch(name) {
            case 'expectedTimeOfArrivalDay': 
                setExpectedTimeOfArrivalDay(value);
                break;
            case 'expectedTimeOfArrivalMonth': 
                setExpectedTimeOfArrivalMonth(value);
                break;
            case 'expectedTimeOfArrivalYear': 
                setExpectedTimeOfArrivalYear(value);
                break;
        }        
    }

    const onAcceptingQuotesUntilChange = (e) => {
        const { name, value } = e.target;
        console.log(e);
    }

    const onDocumentCheck = (e) => {
        console.log(e);
        const docName = e.currentTarget.getAttribute('data-usertype');
        const checked = e.currentTarget.checked;
        onDocumentChecked(docName, checked);
    }

    useEffect(() => {
        let dt = null
        if (expectedTimeOfArrivalDay && 
            expectedTimeOfArrivalMonth && 
            expectedTimeOfArrivalYear) {
            switch(expectedTimeOfArrivalDay) {
                case 'early': 
                    dt = moment([Number(expectedTimeOfArrivalYear), Number(expectedTimeOfArrivalMonth) - 1]).startOf('month').toISOString();
                    break;
                case 'mid': 
                    const countDaysInMonth = moment([Number(expectedTimeOfArrivalYear), Number(expectedTimeOfArrivalMonth) - 1]).daysInMonth();
                    const midDay = Math.round(countDaysInMonth / 2);
                    dt = moment([Number(expectedTimeOfArrivalYear), Number(expectedTimeOfArrivalMonth) - 1, midDay]).endOf('day').toISOString();;
                    break;
                case 'late': 
                    dt = moment([Number(expectedTimeOfArrivalYear), Number(expectedTimeOfArrivalMonth) - 1]).endOf('month').toISOString();
                    break;
            }
            onValueChange('expectedTimeOfArrival', dt);            
            console.log('dt', dt);
        }
    }, [expectedTimeOfArrivalDay, expectedTimeOfArrivalMonth, expectedTimeOfArrivalYear]);

    return (
        <React.Fragment>
            <h4 className="blue-title">Additional Information</h4>
            <div className="row">
                <div className="col-sm-4">
                    <label for="currency">Preferred currency</label>
                </div>
                <div className="col-sm-4">
                    <div className="form-group">
                        <select name="currency" className="form-control required" id="currency" name='preferredCurrency' value={preferredCurrency} onChange={onChange}>
                            <option value=''>Select</option>
                            {
                                currenciesInfo && currenciesInfo.map(currency => {
                                    return (
                                        <option value={currency.value} key={currency.value}>{currency.label}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="packaging-type">Preferred packaging type</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group">
                        <input type="text" className="form-control required" name="preferredPackagingType" id="packaging-type" placeholder="e.g.: blister pack" value={preferredPackagingType} onChange={onChange} />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="expected-time">Expected time of arrival</label>
                </div>
                <div className="col-sm-8">
                    <div className="row">
                        <div className="col-sm-4">
                            <div className="form-group">
                                <select name="expected-time" className="form-control required" id="expected-time" name='expectedTimeOfArrivalDay' value={expectedTimeOfArrivalDay} onChange={onExpectedTimeOfArrivalChanged}>
                                <option value="">Select</option>
                                {
                                    partOfMonths && partOfMonths.map(m => {
                                        return (
                                            <option value={m.value} key={m.value}>{m.label}</option>
                                        )
                                    })
                                }
                                
                                </select>
                            </div>
                        </div><div className="col-sm-4">
                            <div className="form-group">
                                <select name="month" className="form-control required" id="month" name='expectedTimeOfArrivalMonth' value={expectedTimeOfArrivalMonth} onChange={onExpectedTimeOfArrivalChanged}>
                                    <option value="">Month</option>
                                    { 
                                        months && months.map(month => {
                                            return (
                                                <option value={month.value} key={`month${month.value}`}>{month.label}</option>
                                            )
                                        })
                                    }                                    
                                </select>
                            </div>
                        </div><div className="col-sm-4">
                            <div className="form-group">
                                <select name="year" className="form-control required" id="year" name='expectedTimeOfArrivalYear' value={expectedTimeOfArrivalYear} onChange={onExpectedTimeOfArrivalChanged} >
                                    <option value="">Year</option>
                                    {
                                        years && years.map(yr => {
                                            return (
                                                <option value={yr.value} key={`key${yr.value}`}>{yr.label}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="incoterms">Incoterms</label>
                </div>
                <div className="col-sm-4">
                    <div className="form-group">
                        <select name="incoterms" className="form-control required" id="incoterms" name='preferredIncoterms' value={preferredIncoterms} onChange={onChange}>
                            <option value="">Select</option>
                            {
                                incoterms && incoterms.map(incoterm => {
                                    return (
                                        <option value={incoterm.value} key={incoterm.value}>{incoterm.label}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="row">
                <div className="col-sm-4">
                    <label for="place-delivery">Place of delivery</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group">
                        <input type="text" className="form-control required" name="placeOfDelivery" id="place-delivery" placeholder="e.g.: city" value={placeOfDelivery} onChange={onChange} />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="payment-terms">Preferred payment terms</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group">
                        <input type="text" className="form-control required" name="preferredPaymentTerms" id="payment-terms" value={preferredPaymentTerms} onChange={onChange} />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="accepting-quotes">Accepting quotes until</label>
                </div>
                <div className="col-sm-4">
                    <div className="form-group">
                        <input data-format="DD/MM/YYYY" name="acceptingQuotesUntil" placeholder="DD/MM/YYYY" id="datepicker" type="text" className="form-control required datepicker-txt" onChange={onAcceptingQuotesUntilChange} />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="documents">Documents required</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group document-group">
                        <div className="advanced-select" data-model="Documents">
                            <div className="dropdown">
                                <input id="Merchants" type="button" data-default="You can select several" value={selectedDocumentsLabel} className="trigger required" placeholder="You can select several" />
                                <a href="javascript:void(0)" className="x-clear"><i className="fa  fa-times-circle"></i></a>
                                <a href="#" className="btn-toggle" data-toggle="dropdown"><b className="caret"></b></a>
                                <ul className="dropdown-menu">
                                    <li className="skip-li"><input type="text" className="q" placeholder="" /></li>
                                    <li className="hide">
                                        <a className="x-check parent-check" href="javascript:void(0)">
                                            <input type="checkbox" name="Documents_0" id="Documents_0" />
                                            <label for="Documents_0"> Select All</label>
                                        </a>
                                    </li>
                                    {
                                        requiredDocs && requiredDocs.map((doc, i) => {
                                            return (
                                                <li>
                                                    <a className="x-check" href="javascript:void(0)">
                                                        <input className="check-merchant" data-usertype={doc.value} type="checkbox" name={`Documents_${i + 1}`} id={`Documents_${i + 1}`} onChange={onDocumentCheck} />
                                                        <label for={`Documents_${i + 1}`}>{doc.label}</label>
                                                    </a>
                                                </li>
                                            )
                                        })
                                    }                                    
                                </ul>
                            </div>
                        </div>
                        {/*<select id="documents" className="form-control required" name={documentsRequired} value={documentsRequired} onChange={onChange}>*/}
                        {/*    <option value=''>You can select several</option>*/}
                        {/*    {*/}
                        {/*        requiredDocs && requiredDocs.map(doc => {*/}
                        {/*            return (*/}
                        {/*                <option value={doc.value} key={doc.value}>{doc.label}</option>*/}
                        {/*            )*/}
                        {/*        })*/}
                        {/*    }*/}
                        {/*</select>*/}
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label for="comment">Comment</label>
                </div>
                <div className="col-sm-8">
                    <div className="form-group">
                        <textarea rows="4" className="form-control" name="comment" id="comment" value={comment} onChange={onChange}></textarea>
                    </div>
                </div>
            </div>
            
            
            {/*<div className="area-common-field row">*/}
            {/*    <div className="col-sm-12">*/}
            {/*        <table className="table">*/}
            {/*            <thead>*/}
            {/*                <tr>*/}
            {/*                    <th>Field Name</th>*/}
            {/*                    <th>Value</th>*/}
            {/*                    <th></th>*/}
            {/*                </tr>*/}
            {/*            </thead>*/}
            {/*            <tbody></tbody>*/}
            {/*        </table>*/}
            {/*        <a href="javascript:void(0);" className="add-more-requirement"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.99967 1.33337C4.31967 1.33337 1.33301 4.32004 1.33301 8.00004C1.33301 11.68 4.31967 14.6667 7.99967 14.6667C11.6797 14.6667 14.6663 11.68 14.6663 8.00004C14.6663 4.32004 11.6797 1.33337 7.99967 1.33337ZM8.66618 7.33333V4.66667H7.33285V7.33333H4.66618V8.66667H7.33285V11.3333H8.66618V8.66667H11.3328V7.33333H8.66618ZM2.66618 8C2.66618 10.94 5.05951 13.3333 7.99951 13.3333C10.9395 13.3333 13.3328 10.94 13.3328 8C13.3328 5.06 10.9395 2.66667 7.99951 2.66667C5.05951 2.66667 2.66618 5.06 2.66618 8Z" fill="#2446A5"/></svg> <span>Add Field</span></a>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </React.Fragment>
    )
};

module.exports = AdditionalInfoComponent;