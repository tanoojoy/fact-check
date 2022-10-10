'use strict';
var React = require('react');
var BaseComponent = require('../../../../../../../../views/shared/base');
const CommonModule = require('../../../../../../../../public/js/common.js');

class TableItemsComponent extends BaseComponent {

    getItemUrl(itemName, itemId) {
        return CommonModule.getAppPrefix()+'/items/' + this.generateSlug(itemName) + '/' + itemId;
    }
    renderReview(cartItem, itemUrl) {
        return <td data-th="Review">
            {
                cartItem.Feedback && cartItem.Feedback.FeedbackID ?
                    <a href={itemUrl}><i className="icon icon-review_black" />
                        <span className="new-review">New Review!</span></a>
                    : <i className="icon icon-review-old"></i>
            }
        </td>
    }
    renderQuotationData() {
        const self = this;
        const orders = this.props.detail.Orders;
        let currency = "";
        let ele = '';
        if (orders) {
            ele = orders.map(function (order) {
                if (order.CartItemDetails) {
                    return order.CartItemDetails.map(function (cartItem) {
                        currency = cartItem.CurrencyCode;
                        if (cartItem.AcceptedOffer && cartItem.AcceptedOffer.OfferDetails) {
                            return cartItem.AcceptedOffer.OfferDetails.map(function (detail) {
                                let type = detail.Type;
                                if (type.toLowerCase() !== "fixed") {
                                    type = detail.Quantity;
                                }
                                if (detail.Name === cartItem.ItemDetail.Name) {
                                    return "";
                                }
                                return (
                                    <tr className="extra bb-none">
                                        <td data-th="Item Description">
                                            <div className="thumb-group">
                                                <span><b>{detail.Name} -</b> {detail.Description}</span>
                                            </div>
                                        </td>
                                        <td data-th="Review">
                                            &nbsp;
                                        </td>
                                        <td data-th="Quantity">
                                            {type}
                                        </td>
                                        <td data-th="Unit Price">
                                            {
                                                detail.Type == 'Percentage' ?
                                                    `${parseFloat(detail.Price * 100).toFixed(2)} %`
                                                    : <span className="item-price">{self.renderFormatMoney(currency, detail.Price)}</span>
                                            }
                                        </td>
                                        <td data-th="Unit Cost">
                                            <span className="item-price">{self.renderFormatMoney(currency, detail.TotalAmount)}</span>
                                        </td>
                                    </tr>
                                )
                            });
                        }
                    });
                }
            });
        }
        return ele
    }
    renderItem(cartItem) {
        const item = cartItem.ItemDetail;
        const itemImageUrl = item.Media !== null && item.Media.length > 0 ? item.Media[0].MediaUrl : '';
        const itemUrl = this.getItemUrl(item.Name, item.ParentID ? item.ParentID : item.ID);
        const itemQty = (cartItem.Quantity * 1).toLocaleString();
        let self = this;
        return (
            <tr key={cartItem.ID}>
                <td data-th="Item Description">
                    <div className="flex-wrap">
                        <div className="thumb-group mr-15">
                            <img src={itemImageUrl} alt="Item" />
                        </div>

                        <div className="text-left">
                            <span>{item.Name}</span>
                            {
                                item.SKU ?
                                    <div className="item-field">
                                        <span className="if-txt">
                                            <span>SKU: </span>
                                            <span>{item.SKU}</span>
                                        </span>
                                    </div> : ""

                            }

                        </div>
                    </div>
                </td>
                {self.props.enableReviewAndRating === true ? this.renderReview(cartItem, itemUrl) : <td data-th="Review">&nbsp;</td> }
                <td data-th="Quantity">
                    {itemQty}
                </td>
                <td data-th="Unit Price">
                    <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, item.Price)}</span>
                </td>
                <td data-th="Total Cost">
                    <span className="item-price">{self.renderFormatMoney(item.CurrencyCode, (parseFloat(item.Price) * parseInt(itemQty) - parseFloat(cartItem.DiscountAmount || 0)))}</span>
                </td>
            </tr>
        );
    }

    renderItemData() {
        const self = this;
        const orders = this.props.detail.Orders;
        let ele = '';
        if (orders) {
            ele = orders.map(function (order) {
                if (order.CartItemDetails) {
                    return order.CartItemDetails.map(function (cartItem) {
                        return self.renderItem(cartItem);
                    });
                }
            });
            return ele;
        } else {
            return null;
        }

    }
    render() {
        return (
            <React.Fragment>
                {this.renderItemData()}
                {this.renderQuotationData()}
            </React.Fragment>
        )
    }
}

module.exports = TableItemsComponent;
