'use strict';
var React = require('react');
const CommonModule = require('../../public/js/common');
import { 
    rfqStatusMessages,
    quoteStatusMessages,
    licensingInquiryStatusMessages
} from '../../consts/rfq-quote-statuses';

class ChatItemInformationComponent extends React.Component {

    getStatus = () => {
        const { deal, quote } = this.props;

        const statusMessages = quote && quote.id && quote.status ? quoteStatusMessages : deal.productType === 'api' ? rfqStatusMessages : licensingInquiryStatusMessages;
        const status =  (quote && quote.id && quote.status) || deal.status;
        const type = (this.props.isCurrentUserBuyer && 'buyerMessage') || 'sellerMessage';

        let statusColorClass = '';
        switch (status) {
            case 'pending':
                statusColorClass = 'peding-response';
                break;
            case 'accepted':
                statusColorClass = 'quote-accepted';
                break;
            case 'submitted':
                statusColorClass = 'quote-received';
                break;
            case 'declined':
                statusColorClass = 'declined';
                break;
        }        
        return (<span className={`chat-status ${statusColorClass}`}>{statusMessages[status][`${type}`]}</span>);
    }

    openBuyerRfq = () => {
        const url = `${CommonModule.getAppPrefix()}/product-profile/viewRFQ/${this.props.deal.id}/${this.props.deal.chatId}`;
        window.location.href = url;
    }

    openSellerRfq = () => {
        const { deal } = this.props;
        let url = '';
        if (deal.status === "declined") {
            url = `${CommonModule.getAppPrefix()}/product-profile/viewRFQ/${this.props.deal.id}/${this.props.deal.chatId}`;
        }
        else {
            url = `${CommonModule.getAppPrefix()}/cgi-quotation/create-template/${this.props.deal.id}`;
        }
        window.location.href = url;
    }

    openBuyerSellerQuotation = () => {
        const url = `${CommonModule.getAppPrefix()}/cgi-quotation/quote/${this.props.deal.quoteId}?rfqId=${this.props.deal.id}`;
        window.location.href = url;
    }

    renderQuoteButton = () => {
        const isFinishedDose = this.props.deal.productType === 'finished dose';
        if (this.props.deal.quoteId) {
            return (
                <button type="button" className="btn btn-rfq" onClick={this.openBuyerSellerQuotation}>{isFinishedDose ? 'Open Inquiry' : 'Open Quotation'}</button>
            )
        } else {
            return (
                <button 
                    type="button"
                    className="btn btn-rfq"
                    onClick={this.props.isCurrentUserBuyer ? this.openBuyerRfq : this.openSellerRfq}
                >
                    {isFinishedDose ? 'Open Inquiry' : 'Open RFQ'}
                </button>
            )
        }
    }

    render() {
        console.log('item-info', this.props);
        const { deal } = this.props;
        console.log('deal', deal);
        if (deal) {
            return (
                <div className="section-chat-body">
                    <div className="deal-summary-section">
                        <div className="deal-card">
                            <div className="deal-card-header">
                                <h3>Deal Summary</h3>
                            </div>
                            <div className="deal-card-body">
                                <div className="product-cattr">
                                    <span className="pname">Product</span>
                                    <span className="pval">{deal.productName}</span>
                                </div>
                                { 
                                    deal.productType === 'api' && 
                                    <div className="product-cattr">
                                        <span className="pname">Quantity</span>
                                        <span className="pval">{deal.quantity}</span>
                                    </div>
                                }
                                <div className="product-cattr chat-status-tble">
                                    <div className="chat-status-left"><span className="pname">Status</span></div>
                                    <div className="chat-status-right"> 
                                        {
                                            this.getStatus()
                                        }
                                    </div>
                                    <div className="clearfix"></div>
                                </div>
                            </div>
                            { 
                                deal.productType === 'api' && 
                                <div className="chat-total-cost">
                                    <div className="product-cattr">
                                        <span className="pname">Total Cost</span>
                                        <span className="pval">{`${deal.preferredCurrency} 0`}</span>
                                    </div>
                                </div>
                            }
                            <div className="deal-card-footer">
                                { this.renderQuoteButton() }
                            </div>
                        </div>
                        { 
                            deal.productType === 'api' && 
                            <>
                                <div className="qt-notice">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="16" fill="#C4F1FF"></circle>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM15 21V19H17V21H15ZM15 11V17H17V11H15Z" fill="#08A6D9"></path>
                                    </svg>
                                    <span>One quote can be submitted for each RFQ</span>
                                </div>
                                <div className="qt-notice">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="16" fill="#C4F1FF"></circle>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM15 21V19H17V21H15ZM15 11V17H17V11H15Z" fill="#08A6D9"></path>
                                    </svg>
                                    <span>Manage your notification preferences from your username menu in the header</span>
                                </div>
                            </>
                        }
                        <div className="clearfix"></div>
                    </div>
                </div>                
            );
        }
        else {
            return (
                <div className="section-chat-body">
                    <div className="deal-summary-section">
                        <div className="qt-notice">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="16" fill="#C4F1FF"></circle>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM15 21V19H17V21H15ZM15 11V17H17V11H15Z" fill="#08A6D9"></path>
                            </svg>
                            <span>
                                Buyers can submit a request for quotation (RFQ) or licensing inquiry from any applicable product profile page
                            </span>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                </div>
            )
        }
        
    }
}

module.exports = ChatItemInformationComponent;