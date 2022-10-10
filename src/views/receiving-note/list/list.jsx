'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');
const CommonModule = require('../../../public/js/common');

class ListComponent extends BaseComponent {
    redirectToDetail(id) {
        window.location = '/receiving-note/detail?id=' + id;
    }

    renderPurchaseOrder(order) {
        if (order) {
            return (
                <a href={`/purchase/detail/orderid/${order.ID}`}>{order.PurchaseOrderNo}</a>
            );
        }

        return null;
    }

    renderSupplier(order) {
        if (order) {
            const { MerchantDetail } = order;

            if (MerchantDetail) {
                return MerchantDetail.DisplayName;
            }
        }

        return '';
    }

    renderQuantity(receivingNoteDetails) {
        let quantity = 0;

        if (receivingNoteDetails) {
            receivingNoteDetails.forEach((detail) => {
                quantity += detail.Quantity;
            });
        }

        return quantity;
    }

    renderVoid(isVoid) {
        if (isVoid) {
            return (
                <div className="item-actions action-inline">
                    <ul>
                        <li><span><img src={CommonModule.getAppPrefix() + "/assets/images/void_black.svg"} /></span> </li>
                    </ul>
                </div>
            );
        }

        return null;
    }

    render() {
        const self = this;

        return (
            <table className="table order-data1 sub-account tbl-department">
                <thead>
                    <tr>
                        <th>Receiving Notes </th>
                        <th>Timestamp</th>
                        <th>PO No.</th>
                        <th> Supplier</th>
                        <th>Quantity Received</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.receivingNotes.map((note, index) => {
                            const rowClass = note.Void ? 'account-row void-grey' : 'account-row';
                            return (
                                <tr className={rowClass} data-key="item" data-id={index} key={index} onClick={(e) => self.redirectToDetail(note.ID)}>
                                    <td data-th="Receiving Notes">{note.ReceivingNoteNo}</td>
                                    <td data-th="Timestamp">{self.formatDateTime(note.CreatedDateTime)}</td>
                                    <td data-th="PO No.">{self.renderPurchaseOrder(note.Order)}</td>
                                    <td data-th="Supplier">{self.renderSupplier(note.Order)}</td>
                                    <td data-th="Quantity Received">{self.renderQuantity(note.ReceivingNoteDetails)}</td>
                                    <td className="action-cell" data-th="Action">
                                        {self.renderVoid(note.Void)}
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        );
    }
}

module.exports = ListComponent;
