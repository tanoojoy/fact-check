'use strict';
var React = require('react');

class FeatureCreateInvoiceB2bOrderItemsComponent extends React.Component {

    renderItem(cart, hasQuotation) {
        const { ItemDetail } = cart;

        return (
            <tr className={hasQuotation ? 'brdt' : ''} key={cart.ID}>
                <td>
                    <div className="thumb-group">
                        <img src={ItemDetail.Media[0].MediaUrl} alt="Item" style={{ maxWidth: '64px' }} />
                        <span>{ItemDetail.Name}</span>
                    </div>
                    {this.renderVariants(ItemDetail.Variants)}
                </td>
                <td>{cart.Quantity}</td>
                <td>{this.props.renderFormatMoney(cart.CurrencyCode, ItemDetail.Price)}</td>
                <td>{this.props.renderFormatMoney(cart.CurrencyCode, cart.SubTotal - (cart.DiscountAmount || 0))}</td>
            </tr>
        );
    }

    renderVariants(variants) {
        if (variants && variants.length > 0) {
            return (
                <div className="item-field" style={{ marginLeft: '84px', textAlign: 'left'}}>
                {
                    variants.map((variant, index) => {
                        return (
                            <span className="if-txt" key={index}>
                                <span>{variant.GroupName}:</span>
                                <span>{variant.Name}</span>
                            </span>
                        )
                    })
                }
                </div>
            );
        }
        return null;
    }

    renderOfferDetails(offerDetails, currencyCode) {
        const self = this;

        if (offerDetails && offerDetails.length > 1) {
            const arr = offerDetails.slice(1);
            return arr.map(offerDetail =>
                <tr className="extra bb-none" key={offerDetail.ID}>
                    <td>
                        <div className="thumb-group">
                            <span><b>{offerDetail.Name} -</b> {offerDetail.Description}</span>
                        </div>
                    </td>
                    <td>{offerDetail.Type == 'Quantity' ? offerDetail.Quantity : offerDetail.Type}</td>
                    <td>
                        {
                            offerDetail.Type == 'Percentage' ?
                                `${offerDetail.Price * 100}%`
                                : <div className="item-price">{self.props.renderFormatMoney(currencyCode, offerDetail.Price)}</div>
                        }
                    </td>
                    <td><div className="item-price">{self.props.renderFormatMoney(currencyCode, offerDetail.TotalAmount)}</div></td>
                </tr>

            )
        }
        return null;
    }

    renderCartItemInfo(cart) {
        const { AcceptedOffer } = cart;
        //const hasQuotation = (AcceptedOffer && AcceptedOffer.Accepted) || (self.props.pendingOffer && !self.props.pendingOffer.Accepted && !self.props.pendingOffer.Declined);
        //const offerDetails = AcceptedOffer ? AcceptedOffer.OfferDetails : self.props.pendingOffer ? self.props.pendingOffer.OfferDetails : null;
        const hasQuotation = AcceptedOffer && AcceptedOffer.Accepted;
        const offerDetails = AcceptedOffer ? AcceptedOffer.OfferDetails : null;

        if (hasQuotation) {
            return (
                <React.Fragment>
                    {this.renderItem(cart, hasQuotation)}
                    {this.renderOfferDetails(offerDetails, cart.CurrencyCode)}
                </React.Fragment>
            )
        }

        return this.renderItem(cart, hasQuotation);
    }

    renderOrderItems() {
        if (this.props.invoiceDetail && this.props.invoiceDetail.Orders && this.props.invoiceDetail.Orders[0] && this.props.invoiceDetail.Orders[0].CartItemDetails) {
            const { CartItemDetails } = this.props.invoiceDetail.Orders[0];
            if (CartItemDetails.length == 0) return;
            return CartItemDetails.map(cart => this.renderCartItemInfo(cart));
        }
        return;
    }

    render() {
        return (
            <React.Fragment>
                <section className="sassy-box no-border box-order-items">
                    <table className="table order-data table-items">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Quantity</th>
                                <th style={{ width: '171px' }}>Unit Price</th>
                                <th style={{ width: '171px' }}>Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderOrderItems()}
                        </tbody>
                    </table>
                </section>
            </React.Fragment>
        );
    }
}

module.exports = FeatureCreateInvoiceB2bOrderItemsComponent;