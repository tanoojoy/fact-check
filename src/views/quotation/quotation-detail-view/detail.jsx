'use strict';
import React from 'react';
import moment from 'moment';
import { userRoles } from '../../../consts/horizon-user-roles';
import {
    licensingInquiryMessages,
    quoteStatuses,
    rfqStatuses,
    quoteStatusMessages
} from '../../../consts/rfq-quote-statuses';
import { quotationTemplate as quotationTemplatePPs } from '../../../consts/page-params';
import BaseComponent from '../../shared/base';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';

class QuotationDetailViewComponent extends BaseComponent {

    get shelfLife() {
        const { quotationDetail } = this.props;
        return quotationDetail?.OfferDetails[0]?.CustomFields[0]?.shelfLife || '';
    }

    getStatus = () => {
        const { rfqDetails, quotationDetail, user } = this.props;
        let status = '';
        let statusColorClass = '';
        let statusText = '';
        let type = '';
        const userRole = user.userInfo.role;
        if (rfqDetails && quotationDetail) {
            const statusMessages = rfqDetails.productType === 'api' ? quoteStatusMessages : licensingInquiryStatusMessages;
            const [offerDetail] = quotationDetail.OfferDetails;
            const [otherInfo] = offerDetail.CustomFields;
            status = otherInfo.status;
            type = userRoles.subMerchant === userRole ? 'sellerMessage' : 'buyerMessage';

            switch (status) {
                case quoteStatuses.pending:
                    statusColorClass = 'peding-response';
                    break;
                case quoteStatuses.accepted:
                    statusColorClass = 'quote-accepted';
                    break;
                case rfqStatuses.submitted:
                    statusColorClass = 'quote-received';
                    break;
                case quoteStatuses.declined:
                    statusColorClass = 'declined';
                    break;
            }
            statusText = statusMessages[status][`${type}`];
        }
        return {
            statusColorClass,
            statusText
        }
    }

    render() {
        const tspancss = `
            tspan {white - space:pre }.shp0 {fill: #2446a5 } .shp1 {fill: none;stroke: #6ba2e4 }
        `;

        let quoteStatusClassName = '';
        const { quotationDetail, rfqDetails, prevPageUrl, isSubmerchant } = this.props;
        let offerDetail = null, otherInfo = null;
        if (quotationDetail && quotationDetail.OfferDetails) {
            [offerDetail] = quotationDetail.OfferDetails;
            [otherInfo] = offerDetail.CustomFields;
        }

        const disableButton = otherInfo.status === 'accepted' || otherInfo.status === 'declined';
        let issueDate = '';
        let validDate = '';
        if (otherInfo) {
            if (otherInfo.issueDate) {
                issueDate = moment(otherInfo.issueDate.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            }
            if (otherInfo.validDate) {
                validDate = moment(otherInfo.validDate.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            }            
        }
        let expectedTimeOfArrival = '';
        let acceptingQuotesUntil = '';
        if (rfqDetails) {
            if (rfqDetails.expectedTimeOfArrival) {
                expectedTimeOfArrival = moment(rfqDetails.expectedTimeOfArrival.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            }
            if (rfqDetails.acceptingQuotesUntil) {
                acceptingQuotesUntil = moment(rfqDetails.acceptingQuotesUntil.split('T')[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            }            
        }
        const statusInfo = this.getStatus();

        return (
            <div className="container margin-top-fix">
                <div className="header-title-area">
                    <a className="btn-cancel-link" href={prevPageUrl}>
                        <svg version="1.2" baseProfile="tiny-ps" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
                            <title>Layer</title>
                            <style>{tspancss}</style>
                            <path id="Layer" className="shp0" d="M23.41 15.41L22 14L16 20L22 26L23.41 24.59L18.83 20L23.41 15.41Z"></path>
                            <path id="Layer" className="shp1" d="M20 39.5C9.22 39.5 0.5 30.78 0.5 20C0.5 9.22 9.22 0.5 20 0.5C30.78 0.5 39.5 9.22 39.5 20C39.5 30.78 30.78 39.5 20 39.5Z"></path>
                        </svg>
                        <span>Cancel</span>
                    </a>
                </div>
                <div className="row">
                    <div className="col-md-9 col-sm-12">
                        <table className="table table-proposal">
                            <thead>
                                <tr>
                                    <th>Issue Date</th>
                                    {rfqDetails.productType === 'api' && <th>Quote Expiration Date</th>}
                                    <th>Quotation id</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={`${statusInfo.statusColorClass}-bg`}>
                                    <td>{issueDate}</td>
                                    {rfqDetails.productType === 'api' && <td>{validDate}</td>}
                                    <td>QT{offerDetail ? offerDetail.ID : ''}</td>
                                    <td><a href="javascript:void(0);" className={statusInfo.statusColorClass}>{statusInfo.statusText}</a></td>
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
                                    <td>{rfqDetails.company.name}</td>
                                    <td>{rfqDetails.productName}</td>
                                    <td>{rfqDetails.casNumber}</td>
                                    {rfqDetails.productType === 'api' && <td>{`${rfqDetails.quantity} ${rfqDetails.unit}`}</td>}
                                    {rfqDetails.productType === 'api' && <td>{`${rfqDetails.preferredCurrency} $ ${offerDetail ? offerDetail.Price : 0}`}</td>}
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
                                            {this.shelfLife}
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
                                            <th>Prefered Currency</th>
                                            <th>Prefered Packaging Type</th>
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
                                            <th>Prefered Payment Terms</th>
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
                                    <td>-</td>
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
                                    {rfqDetails.productType === 'api' && <td>{otherInfo ? otherInfo.comment : ''}</td>}
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
                                        <div className="qt-price"><span className="currency">{rfqDetails.preferredCurrency}</span> <span className="currency-symole">$</span> <span className="amount">{offerDetail ? offerDetail.Price : 0}</span></div>
                                    </div>
                                }
                                
                                {
                                    !isSubmerchant &&
                                    otherInfo.status === 'pending' &&
                                    <div className="qt-btn-sec">
                                        <button className="qt-btn-white" onClick={(e) => this.props.updateQuoteStatus('declined')} disabled={disableButton}>Reject</button>
                                        <button className="qt-btn-blue" onClick={(e) => this.props.updateQuoteStatus('accepted')} disabled={disableButton}>Accept</button>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="qt-notice"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#C4F1FF"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM15 21V19H17V21H15ZM15 11V17H17V11H15Z" fill="#08A6D9"></path></svg><span>If you'd like to share more documents with buyer you can attach them in chat</span></div>

                    </div>
                </div>
            </div>
        )
    }    
}

export default QuotationDetailViewComponent;