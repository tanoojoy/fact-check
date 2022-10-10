'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

const infoString = `This is not the same number as the system
	generated invoice no.<br/> This is the invoice reference number
	you can tag to this invoice, e.g. from an invoice generated by an
	external software. You're responsible for verifying that your issued
	invoices meet local tax requirements`;

var Moment = require('moment');

class InvoiceDetail extends BaseComponent {

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    getInvoiceInfo(field) {
        if (this.props.invoiceDetail && field) {
            const { invoiceDetail } = this.props;
            if (field == 'InvoiceNo') {
                let cosmeticNo = "";
                if (invoiceDetail.Orders[0].PaymentDetails) {
                    invoiceDetail.Orders[0].PaymentDetails.forEach(function (payment, index) {
                        if (payment.InvoiceNo === invoiceDetail.InvoiceNo) {
                            if (payment.CosmeticNo != null && payment.CosmeticNo != "") {
                                cosmeticNo = payment.CosmeticNo;
                            }
                        }
                    });
                }
                return cosmeticNo != "" && cosmeticNo != null ? cosmeticNo : invoiceDetail.InvoiceNo || '';
            } else {
                if (invoiceDetail && invoiceDetail.Orders) {
                    if (invoiceDetail.Orders[0] && invoiceDetail.Orders[0].PaymentDetails && invoiceDetail.Orders[0].PaymentDetails.length > 0) {
                        const thisInvoice = invoiceDetail.Orders[0].PaymentDetails.find(i => i.InvoiceNo == this.props.invoiceDetail.InvoiceNo);

                        if (typeof thisInvoice == 'undefined')
                            return '-'

                        if ((field == 'DateTimeCreated' || field == 'PaymentDueDateTime') && thisInvoice[field] != null) {
                            return this.formatDateTime(thisInvoice[field]);
                        }
                        if (field == 'InvoiceRefNo') {
                            return thisInvoice.GatewayTransactionID || '-';
                        }

                        return "-"
                    }
                }
            }

        }
        return;
    }

    getOrderTotal() {
        let total = 0;
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders) {
            this.props.invoiceDetail.Orders.map(s => total += parseFloat(s.GrandTotal));
        }
        return total;
    }

    getAlreadyPaidAmount() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders) {
            const { Orders } = this.props.invoiceDetail;
            if (Orders && Orders[0] && Orders[0].PaymentDetails && Orders[0].PaymentDetails.length > 0) {
                const { PaymentDetails } = Orders[0];
                let paidAmount = 0;
                const thisInvoice = PaymentDetails.find(i => i.InvoiceNo == this.props.invoiceDetail.InvoiceNo);
                PaymentDetails.map(inv => {
                    if (inv.InvoiceNo !== this.props.invoiceDetail.InvoiceNo) {

                        if (typeof thisInvoice != 'undefined' && (typeof thisInvoice.DateTimeCreated != 'undefined' && thisInvoice.DateTimeCreated)) {
                            if (thisInvoice.DateTimeCreated > inv.DateTimeCreated && (inv.Status == 'Paid' || inv.Status == 'Success' || (inv.Status == 'Waiting for Payment' && inv.GatewayPayKey))) {
                                paidAmount += parseFloat(inv.Total);
                            }
                        }
                    }
                });
                return paidAmount.toFixed(2);
            }
        }
        return (0).toFixed(2);
    }

    getBalance() {
        return (this.getOrderTotal() - this.getAlreadyPaidAmount()).toFixed(2);
    }

    render() {
        return (
            <React.Fragment>
                <section className="sassy-box no-border invoice-form">
                    <div className="horizontal-form">
                        <div className="l-side">
                            <div className="l-side-wrap">
                                <div className="form-group">
                                    <label html-for="">Date Created</label>
                                    <div>
                                        <span>{this.getInvoiceInfo('DateTimeCreated')}</span>
                                    </div>
                                </div>
                                <div className="form-group spacer-left-30">
                                    <label html-for="">Payment Due</label>
                                    <div>
                                        <span>{this.getInvoiceInfo('PaymentDueDateTime')}</span>
                                    </div>
                                </div>
                                <div className="form-group spacer-left-30 ">
                                    <label html-for="">Invoice No.</label>
                                    <div>
                                        <span>{this.getInvoiceInfo('InvoiceNo')}</span>
                                    </div>
                                </div>
                                <div className="form-group spacer-left-30">
                                    <label html-for="">Invoice Ref. No. (External)
                                    &nbsp;
                                        <a data-toggle="tooltip"
                                            title=""
                                            data-placement="bottom"
                                            data-html="true"
                                            href=""
                                            data-original-title={infoString}>
                                            <img src="/assets/images/info.svg" alt="" />
                                        </a>
                                    </label>
                                    <div>
                                        {this.getInvoiceInfo('InvoiceRefNo')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="r-side">
                            {this.props.renderPay}
                        </div>
                    </div>
                </section>
                <section className="sassy-box no-border">
                    <div className="table-responsive">
                        <table className="table tbl-border">
                            <thead>
                                <tr>
                                    <th className="col25">Total Cost</th>
                                    <th className="col25">Already Paid</th>
                                    <th className="col25">Balance</th>
                                    <th className="col25">Amount to be collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="col25" data-th="Total Cost">
                                        <div className="item-price">{this.renderFormatMoney(this.props.invoiceDetail.CurrencyCode, this.getOrderTotal())}</div>
                                    </td>
                                    <td className="col25" data-th="Already Paid">
                                        <div className="item-price">{this.renderFormatMoney(this.props.invoiceDetail.CurrencyCode, this.getAlreadyPaidAmount())}</div>
                                    </td>
                                    <td className="col25" data-th="Balance">
                                        <div className="item-price">{this.renderFormatMoney(this.props.invoiceDetail.CurrencyCode, this.getBalance())}</div>
                                    </td>
                                    <td className="col25" data-th="Amount to be collected">
                                        <div className="item-price">{this.renderFormatMoney(this.props.invoiceDetail.CurrencyCode, this.props.invoiceDetail.Total || 0)}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

module.exports = InvoiceDetail;