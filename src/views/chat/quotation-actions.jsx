'use strict';
var React = require('react');

class ChatQuotationActionComponent extends React.Component {
    redirectCreateQuotation() {
        window.location = '/chat/quotation?channelId=' + this.props.channelId;
    }

    redirectQuotationDetail(quotationId) {
        window.location = '/quotation/detail?id=' + quotationId;
    }

    renderCreateQuotationAction() {
        return (
            <div className="user-product-buttons">
                <div className="btn-container">
                    <button className="green-btn" id="create-quotation-btn" onClick={(e) => this.redirectCreateQuotation()}>Create Quotation</button>
                </div>
            </div>
        );
    }

    renderCheckQuotationAction(quotationId) {
        return (
            <div className="user-product-buttons">
                <div className="btn-container">
                    <button id="create-quotation-btn" className="green-btn openModalRemove" onClick={(e) => this.redirectQuotationDetail(quotationId)}>Check Quotation</button>
                </div>
            </div>
        );
    }

    renderAction() {
        var self = this;
        const quotation = self.props.quotation;

        if (quotation) {
            if (!self.props.showMerchantActions) {
                return self.renderCheckQuotationAction(quotation.ID);
            }
        }

        if (self.props.showMerchantActions) {
            if (!quotation || quotation.Declined || quotation.MessageType == 'CANCELLED') {
                return self.renderCreateQuotationAction();
            } else {
                return self.renderCheckQuotationAction(quotation.ID);
            }
        }

        return null;
    }

    render() {
        var self = this;
        return (
            <div>
                {self.renderAction()}
            </div>
        );
    }
}

module.exports = ChatQuotationActionComponent;
