import React, { Component } from 'react';
import { func, object } from 'prop-types';
import moment from 'moment';
import { get } from 'lodash';
import { CellText, Row, InputField, ClarificationCurrencyInput, DaterangepickerField } from '../components-of-form';
import { quoteStatuses, quoteStatusMessages } from '../../../../consts/rfq-quote-statuses';
import { userRoles } from '../../../../consts/horizon-user-roles';
require('daterangepicker');

class QuoteTemplate extends Component {
    componentDidMount() {
        const quote = get(this.props, 'quoteDetails', {});
        const rfqDetails = get(this.props, 'rfqDetails', {});
        this.setState({ ...rfqDetails, quote });
    }

    formatDate(date = 0, format = 'MM/DD/YYYY') {
        return date ? moment.utc(date).format(format) : null;
    }

    handleExpirationDate(date) {
        this.props.onChangeQuoteData(date, 'validDate');
    }

    handleTotalValue(value) {
        this.props.onChangeQuoteData(value, 'price');
    }

    handleShelfLife(value) {
        this.props.onChangeQuoteData(value, 'shelfLife');
    }

    handleComment(value) {
        this.props.onChangeQuoteData(value, 'comment');
    }

    get styleStatus() {
        return `status-${this.state.quote.status}`;
    }

    getStatusText() {
        const { userInfo } = this.props;
        const userRole = userInfo.role;

        switch (this.state.quote.status) {
        case quoteStatuses.pending:
            return {
                text: userRoles.subMerchant === userRole ? quoteStatusMessages.pending.sellerMessage : quoteStatusMessages.pending.buyerMessage,
                style: this.styleStatus
            };
        case quoteStatuses.declined:
            return {
                text: userRoles.subMerchant === userRole ? quoteStatusMessages.declined.sellerMessage : quoteStatusMessages.declined.buyerMessage,
                style: this.styleStatus
            };
        case quoteStatuses.accepted:
            return {
                text: userRoles.subMerchant === userRole ? quoteStatusMessages.accepted.sellerMessage : quoteStatusMessages.accepted.buyerMessage,
                style: this.styleStatus
            };
        default:
            return { text: '', style: '' };
        }
    }

    getStatusRowStyle() {
        switch (this.state.quote.status) {
        case quoteStatuses.accepted:
            return 'status-row-accepted';
        case quoteStatuses.declined:
            return 'status-row-declined';
        default:
            return '';
        }
    }

    render() {
        if (!this.state) return null;
        let quoteId = get(this.state, 'quote.id', null);
        quoteId = quoteId && quoteId.toString();

        return (
            <div className='quote-form'>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Issue Date' classWidth='col-xs-3' />
                        <CellText text='Quote Expiration Date' classWidth='col-xs-3' />
                        {quoteId && <CellText text='Quotation id' classWidth='col-xs-3' />}
                        {quoteId && <CellText text='Status' classWidth='col-xs-3' />}
                    </Row>
                    <Row classRow={`cgi-row-td ${quoteId && this.getStatusRowStyle()}`}>
                        <CellText text={this.formatDate(this.state.createdAt)} classWidth='col-xs-3' />
                        <div className='col-xs-3'>
                            <DaterangepickerField
                                value={quoteId && this.state.quote.validDate}
                                onlyView={!!quoteId}
                                nameClass='quote-expiration-date'
                                widthClass='col-xs-12'
                                onChangeValue={(date) => this.handleExpirationDate(date)}
                            />
                        </div>
                        {quoteId && <CellText text={quoteId} classWidth='col-xs-3' />}
                        {quoteId && <CellText text={this.getStatusText().text} classWidth='col-xs-3' specifyClasses={this.getStatusText().style} />}
                    </Row>
                </div>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Supplier' classWidth='col-xs-3' />
                        <CellText text='Product' classWidth='col-xs-3' />
                        <CellText text='CAS Number' classWidth='col-xs-2' />
                        <CellText text='Quantity' classWidth='col-xs-2' />
                        <CellText text='Total Price' classWidth='col-xs-3' />
                    </Row>
                    <Row classRow={`cgi-row-td ${quoteId && 'status-row-pending'}`}>
                        <CellText text={this.state.sellerCompanyName} classWidth='col-xs-3' />
                        <CellText text={this.state.productName} classWidth='col-xs-3' />
                        <CellText text={this.state.casNumber} classWidth='col-xs-2' />
                        <CellText text={`${this.state.quantity} ${this.state.unit}`} classWidth='col-xs-2' />
                        <div className='col-xs-3'>
                            {!quoteId &&
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InputField
                                        placeholder='-'
                                        type='number'
                                        onChangeValue={(value) => this.handleTotalValue(value)}
                                        maxLength={12}
                                    >
                                        <ClarificationCurrencyInput preferredCurrency={this.state.preferredCurrency} />
                                    </InputField>
                                </div>
                            }
                            {!!quoteId &&
                            <div style={{ display: 'flex' }}>
                                <CellText text={this.state.quote.price} />&nbsp;
                                <ClarificationCurrencyInput preferredCurrency={this.state.preferredCurrency} clearClasses />
                            </div>}
                        </div>
                    </Row>
                </div>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Product Type' classWidth='col-xs-3' />
                        <CellText text='Shelf Life' classWidth='col-xs-3' />
                    </Row>
                    <Row classRow='cgi-row-td'>
                        <CellText text={this.state.productType ? this.state.productType.toUpperCase() : 'API'} classWidth='col-xs-3' />
                        <div className='col-xs-3'>
                            <InputField
                                placeholder='-'
                                onChangeValue={(value) => this.handleShelfLife(value)}
                                onlyView={!!quoteId}
                                value={this.state.quote.shelfLife}
                            />
                        </div>
                    </Row>
                </div>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Prefered Currency' classWidth='col-xs-3' />
                        <CellText text='Prefered Packaging Type' classWidth='col-xs-3' />
                        <CellText text='Expected Time of Arrival' classWidth='col-xs-6' />
                    </Row>
                    <Row classRow='cgi-row-td'>
                        <CellText text={this.state.preferredCurrency} classWidth='col-xs-3' />
                        <CellText text={this.state.preferredPackagingType} classWidth='col-xs-3' />
                        <CellText text={this.formatDate(this.state.expectedTimeOfArrival)} classWidth='col-xs-3' />
                    </Row>
                </div>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Incoterms' classWidth='col-xs-3' />
                        <CellText text='Place of Deliver' classWidth='col-xs-3' />
                        <CellText text='Prefered Payment Terms' classWidth='col-xs-3' />
                    </Row>
                    <Row classRow='cgi-row-td'>
                        <CellText text={this.state.incoterms} classWidth='col-xs-3' />
                        <CellText text={this.state.placeOfDelivery} classWidth='col-xs-3' />
                        <CellText text={this.state.preferredPaymentTerms} classWidth='col-xs-3' />
                    </Row>
                </div>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Accepting Quotes Until' classWidth='col-xs-6' />
                        <CellText text='Documents Required' classWidth='col-xs-6' />
                    </Row>
                    <Row classRow='cgi-row-td'>
                        <CellText text={this.formatDate(this.state.acceptingQuotesUntil)} classWidth='col-xs-6' />
                        <CellText text={this.state.documentsRequired && this.state.documentsRequired.map(documentRec => documentRec.name).join(', ')} classWidth='col-xs-6' />
                    </Row>
                </div>
                <div className='row-quote-form'>
                    <Row classRow='cgi-row-th'>
                        <CellText text='Comment' classWidth='col-xs-6' />
                        <CellText text='Answer Comment' classWidth='col-xs-6' />
                    </Row>
                    <Row classRow='cgi-row-td'>
                        <CellText text={this.state.comment} classWidth='col-xs-6' />
                        {this.state.comment &&
                        <div className='col-xs-6'>
                            <InputField
                                placeholder='Type here'
                                rows={4}
                                onChangeValue={(value) => this.handleComment(value)}
                                onlyView={!!quoteId}
                                value={this.state.quote.comment}
                                widthClass='col-xs-12'
                            />
                        </div>}
                    </Row>
                </div>
            </div>
        );
    }
}

QuoteTemplate.propTypes = {
    rfqDetails: object,
    quoteDetails: object,
    userInfo: object,
    onChangeQuoteData: func
};

export default QuoteTemplate;
