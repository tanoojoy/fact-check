'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');
const CommonModule = require('../../../public/js/common');

import moment from 'moment';
import { quotationTemplate as quotationTemplatePPs } from '../../../consts/page-params';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';
import { getLimits, FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';
import { isFreemiumUserSku } from '../../../utils';
import { licensingInquiryMessages } from '../../../consts/rfq-quote-statuses';
import { userRoles } from '../../../consts/horizon-user-roles';


class DetailComponent extends BaseComponent {

    constructor(props) {
        super(props);

        const chatId = props.rfqDetails.chatId.split('|');
        this.backHref = `${CommonModule.getAppPrefix()}/chat/chatRFQ/${props.rfqDetails.id}/${chatId[0]}`;
    }
    
    isSubmitButtonDisabled() {
        const { rfqDetails, hasAccomplishedRequiredFields, user } = this.props;

        let disabled = false;

        const limits = getLimits(FREEMIUM_LIMITATION_POSITION.quote, user?.flags);
        if (isFreemiumUserSku(user) && limits.current >= limits.limit) {
            disabled = true;
        }

        if (rfqDetails?.productType === 'api' && !hasAccomplishedRequiredFields) {
            disabled = true;
        }
        return disabled;
    }
    
    get FinishedDosePendingStatus() {
        const { user } = this.props;
        const userRole = user.userInfo.role;
        const status = userRoles.subMerchant === userRole ?  licensingInquiryMessages.pending.sellerMessage : licensingInquiryMessages.pending.buyerMessage;
        return status;
    }

    render() {
        let { shelfLife, validDate, comment, price, rfqDetails, company, onChange, quotationDetail, hasAccomplishedRequiredFields } = this.props;

        const tspancss = `
            tspan {
                white-space: pre
            }

            .shp0 {
                fill: #2446a5
            }

            .shp1 {
                fill: none;
                stroke: #6ba2e4
            }
        `;

        let expectedTimeOfArrival = '';
        let acceptingQuotesUntil = '';
        let issueDate = '';
        let documentsRequired = '';
        if (rfqDetails) {
            if (rfqDetails.expectedTimeOfArrival) {
                expectedTimeOfArrival = moment(rfqDetails.expectedTimeOfArrival.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            }
            if (rfqDetails.acceptingQuotesUntil) {
                acceptingQuotesUntil = moment(rfqDetails.acceptingQuotesUntil.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            }
            documentsRequired = rfqDetails.documentsRequired?.map(doc => doc.name).join(', '); 
            issueDate = moment(rfqDetails.createdAt.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            
        }
        const disabledSubmitBtn = this.isSubmitButtonDisabled();

        return (
            <div className="container margin-top-fix">
                <div className="header-title-area">

                    <a className="btn-cancel-link" href={this.backHref}>
                        <svg version="1.2" baseProfile="tiny-ps" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
                            <title>Layer</title>
                            <style>
                                {tspancss}
                            </style>
                            <path id="Layer" className="shp0" d="M23.41 15.41L22 14L16 20L22 26L23.41 24.59L18.83 20L23.41 15.41Z" />
                            <path id="Layer" className="shp1" d="M20 39.5C9.22 39.5 0.5 30.78 0.5 20C0.5 9.22 9.22 0.5 20 0.5C30.78 0.5 39.5 9.22 39.5 20C39.5 30.78 30.78 39.5 20 39.5Z" />
                        </svg>
                        <span>Cancel</span>
                    </a>
                </div>
                <div className="row">
                    <div className="col-md-9 col-sm-12">
                        <table className="table table-proposal">
                            <thead>
                                <tr>
                                    <th width="150">Issue Date</th>
                                    {rfqDetails.productType === 'api' && <th>Quote Expiration Date</th>}
                                    {rfqDetails.productType === 'finished dose' && <th>Status</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ width: "100px" }}>{issueDate}</td>
                                    {
                                        rfqDetails.productType === 'api' &&
                                        <td>
                                            <div className="positon-relative" style={{ width: "200px" }}>
                                                <input data-format="DD/MM/YYY" name="validDate" placeholder="DD/MM/YYY" id="datepicker" type="text" className="form-control required datepicker-txt" defaultValue={validDate} />
                                            </div>
                                        </td>
                                    }
                                    { 
                                        rfqDetails.productType === 'finished dose' &&
                                        <td>
                                            <a  className="peding-response">{this.FinishedDosePendingStatus}</a>
                                        </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                        <table className="table table-proposal">
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Product</th>
                                    <th>CAS Number</th>
                                    {rfqDetails.productType === 'api' && <th>Quantity</th>}
                                    {rfqDetails.productType === 'api' && <th>Total Price</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="blue-bg">
                                    <td>{company.name}</td>
                                    <td>{rfqDetails.productName}</td>
                                    <td>{rfqDetails.casNumber}</td>
                                    {rfqDetails.productType === 'api' && <td>{`${rfqDetails.quantity} ${rfqDetails.unit}`}</td>}
                                    {
                                        rfqDetails.productType === 'api' &&
                                        <td>
                                            <div className="input-group input-total-price">
                                                <input
                                                    type="text"
                                                    className="numbersOnly form-control"
                                                    placeholder="-"
                                                    name="price"
                                                    value={price}
                                                    onChange={onChange}
                                                />
                                                <span className="input-group-addon" id="basic-addon2">$ USD</span>
                                            </div>
                                        </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                        <table className="table table-proposal">
                            <thead>
                                <tr>
                                    <th style={{ width: "200px" }}>Product Type</th>
                                    {rfqDetails.productType === 'api' && <th>Shelf Life</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{rfqDetails.productType.toUpperCase()}</td>
                                    {
                                        rfqDetails.productType === 'api' &&
                                        <td>
                                            <input
                                                type="text"
                                                className="numbersOnly form-control"
                                                placeholder="-"
                                                name="shelfLife"
                                                style={{ width: "200px" }}
                                                value={shelfLife}
                                                onChange={onChange}
                                            />
                                        </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                        {
                            rfqDetails.productType === 'api' &&
                            <>
                                <table className="table table-proposal">
                                    <thead>
                                        <tr>
                                            <th>Preferred Currency</th>
                                            <th>Preferred Packaging Type</th>
                                            <th>Expected Time of Arrival</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{rfqDetails.preferredCurrency}</td>
                                            <td>{rfqDetails.preferredPackagingType}</td>
                                            <td>{expectedTimeOfArrival}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="table table-proposal">
                                    <thead>
                                        <tr>
                                            <th>Incoterms</th>
                                            <th>Place of Delivery</th>
                                            <th>Preferred Payment Terms</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{rfqDetails.incoterms}</td>
                                            <td>{rfqDetails.placeOfDelivery}</td>
                                            <td>{rfqDetails.preferredPaymentTerms}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        }
                        <table className="table table-proposal">
                            <thead>
                                <tr>
                                    <th>Accepting Quotes Until</th>
                                    <th>Documents Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{acceptingQuotesUntil}</td>
                                    <td>{documentsRequired}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="table table-proposal">
                            <thead>
                                <tr>
                                    <th>Comment</th>
                                    {rfqDetails.productType === 'api' && <th>Answer Comment</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{rfqDetails.comment}</td>
                                    {
                                        rfqDetails.productType === 'api' &&
                                        <td>
                                            <textarea
                                                className="form-control"
                                                name="comment"
                                                rows="4"
                                                placeholder="Type here"
                                                value={comment}
                                                onChange={onChange}
                                            ></textarea>
                                        </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                        <UnlockMoreResultsBanner 
                            user={this.props.user}
                            getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                            page={quotationTemplatePPs.appString} 
                        />
                    </div>

                    <div className="col-md-3 col-sm-12">
                        <div className="quotation-price-sec">
                            <div className="quotation-price-title">
                                <h4>{rfqDetails.productType === 'api' ? 'Quotation Price' : 'Licensing Inquiry'}</h4>
                            </div>
                            <div className="quotation-price-body">
                                {
                                    rfqDetails.productType === 'api' &&
                                    <div className="qt-flex">
                                        <div className="qt-cost">Total Cost</div>
                                        <div className="qt-price"><span className="currency">{rfqDetails.preferredCurrency}</span> <span
                                            className="currency-symole">$</span> <span className="amount">{price}</span></div>
                                    </div>
                                }
                                
                                <div className="qt-btn-sec">
                                    <button className="qt-btn-white" onClick={this.props.onCancelRfq}>Decline</button>
                                    <button 
                                        className={`qt-btn-blue ${disabledSubmitBtn ? 'disabled' : ''}`}
                                        disabled={disabledSubmitBtn}
                                        onClick={rfqDetails.productType === 'api' ? this.props.onSubmitQuotation : this.props.onRespondRfq}
                                    >{rfqDetails.productType === 'api' ? 'Submit' : 'Respond'}</button>
                                </div>
                            </div>
                        </div>

                        <div className="qt-notice"><svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="16" fill="#C4F1FF" />
                            <path fillRule="evenodd" clipRule="evenodd"
                                d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM15 21V19H17V21H15ZM15 11V17H17V11H15Z"
                                fill="#08A6D9" />
                        </svg><span>If you'd like to share more documents with buyer you can attach them in chat</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = DetailComponent;