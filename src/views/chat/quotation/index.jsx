'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const Moment = require('moment');
const Currency = require('currency-symbol-map');
const BaseComponent = require('../../shared/base');
const HeaderLayoutComponent = require('../../layouts/header/index').HeaderLayoutComponent;
const ChatQuotationPriceComponent = require('../quotation/price');
require('daterangepicker');

const ChatActions = require('../../../redux/chatActions');

const DiscountReasons = ['Early Payment', 'Quantity Discount', 'Pricing Discount', 'Volume Discount', 'Agreed Discount', 'Others'];
const ChargeReasons = ['Bank Charges', 'Custom Duties', 'Taxes', 'Late Delivery', 'Freight Costs', 'Price Change', 'Others'];
const QuantityOptions = ['Fixed', 'Percentage'];

if (typeof window !== 'undefined') { var $ = window.$; }

class ChatQuotationComponent extends BaseComponent{
    constructor(props) {
        super(props);

        const discountQuotation = {
            type: 'Discount',
            description: DiscountReasons[0],
            reason: DiscountReasons[0],
            quantity: 'Fixed',
            price: '0',
            total: 0
        };
        const chargeQuotation = {
            type: 'Charge',
            description: ChargeReasons[0],
            reason: ChargeReasons[0],
            quantity: '1',
            price: '0',
            total: 0
        };
        const initialQuotation = Object.assign({}, discountQuotation, { id: '' });

        const cartItem = props.chatDetail.Channel.CartItemDetail;
        const item = {
            name: cartItem.ItemDetail.Name,
            description: cartItem.ItemDetail.BuyerDescription,
            quantity: cartItem.Quantity,
            price: cartItem.ItemDetail.Price.toString(),
            total: cartItem.SubTotal,
            variants: cartItem.ItemDetail.Variants
        };

        const paymentTerms = props.paymentTerms;
        const defaultPaymentTerm = paymentTerms && paymentTerms.length > 0 ? paymentTerms.find(p => p.Default == true) : null;

        this.state = {
            discountQuotation: discountQuotation,
            chargeQuotation: chargeQuotation,
            quotations: [initialQuotation],
            item: item,
            issueDate: Moment().local().format('DD/MM/YYYY'),
            validDate: '',
            paymentTerm: defaultPaymentTerm,
            isProcessing: false
        };
    }

    componentDidMount() {
        const self = this;

        $('#valid-datepicker').daterangepicker({
            opens: 'right',
            autoUpdateInput: false,
            locale: {
                format: 'DD/MM/YYYY',
                cancelLabel: 'Clear'
            }
        });

        $('#valid-datepicker').on('apply.daterangepicker', (event, picker) => {
            const dateRange = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
            $('#valid-datepicker').val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));

            self.changeValidDate(dateRange);
        });

        $('#valid-datepicker').on('cancel.daterangepicker', (event, picker) => {
            $('#valid-datepicker').val('');

            self.changeValidDate('');
        });

        let { quotations } = this.state;
        quotations.forEach((quotation) => {
            quotation.id = new Date().getTime();
        });

        this.setState({
            quotations: quotations
        });
    }
    
    addQuotation(event) {
        event.preventDefault();

        let { chargeQuotation, quotations } = this.state;
        const newQuotation = Object.assign({}, chargeQuotation, {
            id: new Date().getTime()
        });

        quotations.push(newQuotation);

        this.setState({
            quotations: quotations
        });
    }

    changeDescription(id, event) {
        event.preventDefault();

        let { quotations } = this.state;
        let quotation = quotations.find(q => q.id == id);

        if (quotation) {
            quotation.description = event.target.value;

            this.setState({
                quotations: quotations
            });
        }
    }

    changePaymentTerm(id) {
        const { paymentTerms } = this.props;
        const paymentTerm = paymentTerms.find(p => p.ID == id);

        this.setState({
            paymentTerm: paymentTerm || null
        });
    }

    changePrice(id, event) {
        event.preventDefault();

        function validate(value) {
            value = value.replace(/[^\x20-\xFF]/gi, '').replace(/[^0-9\.]/g, '');

            let array = value.split('.').slice(0, 2);

            if (array.length < 2) {
                value = value ? Number(value).toString() : '';
            } else {
                array[0] = Number(array[0]);

                if (array[1].length > 2) {
                    array[1] = array[1].substr(0, 2);
                }

                value = array.join('.');
            }

            return value;
        }

        const self = this;
        let { quotations } = this.state;
        let quotation = quotations.find(q => q.id == id);

        if (quotation) {
            quotation.price = validate(event.target.value).toString();

            this.setState({
                quotations: quotations
            }, self.updateTotals());
        }
    }

    changeQuantity(id, event) {
        event.preventDefault();

        function validate(value) {
            return value.replace(/[^0-9]/g, '');
        }

        const self = this;
        let { item, quotations } = this.state;
        let value = event.target.value;

        if (event.target.tagName.toLowerCase() == 'input') {
            value = validate(value);
        }

        if (!id) {
            item.quantity = value ? Number(value).toString() : '';

            this.setState({
                item: item
            }, self.updateTotals());
        } else {
            let quotation = quotations.find(q => q.id == id);

            if (quotation) {
                if (quotation.type.toLowerCase() == 'discount') {
                    quotation.quantity = value;
                } else {
                    quotation.quantity = value ? Number(value).toString() : '';
                }

                this.setState({
                    quotations: quotations
                }, self.updateTotals());
            }
        }
    }

    changeReason(id, event) {
        event.preventDefault();

        let { quotations } = this.state;
        let quotation = quotations.find(q => q.id == id);

        if (quotation) {
            quotation.reason = event.target.value;

            this.setState({
                quotations: quotations
            });
        }
    }

    changeType(id, type) {
        let { chargeQuotation, discountQuotation, quotations } = this.state;

        quotations.forEach((quotation) => {
            if (quotation.id == id) {
                if (type.toLowerCase() == 'discount') {
                    quotation = Object.assign(quotation, discountQuotation);
                } else {
                    quotation = Object.assign(quotation, chargeQuotation);
                }
            }
        });

        this.setState({
            quotations: quotations
        });
    }

    changeValidDate(value) {
        this.setState({
            validDate: value
        });
    }

    deleteQuotation(id, event) {
        event.preventDefault();

        const self = this;
        let { quotations } = this.state;

        this.setState({
            quotations: quotations.filter(q => q.id != id)
        }, self.updateTotals());
    }

    updateTotals() {
        const self = this;

        let { item, quotations } = this.state;

        const quantity = item.quantity || 0;
        item.total = (quantity * parseFloat(item.price)).toFixed(2);

        quotations.forEach((quotation) => {
            if (quotation.type.toLowerCase() == 'discount') {
                const price = parseFloat(quotation.price) || 0;

                if (quotation.quantity.toLowerCase() == 'fixed') {
                    quotation.total = price;
                } else {
                    quotation.total = parseFloat((item.total * (price / 100)).toFixed(2));
                }
            } else {
                const quantity = Number(quotation.quantity) || 0;
                const price = parseFloat(quotation.price) || 0;

                quotation.total = parseFloat((quantity * price).toFixed(2));
            }
        });

        this.setState({
            item: item,
            quotations: quotations
        });
    }

    renderDescriptionAndVariants(description, variants) {
        return (
            <div>
                <div><strong>{description}</strong></div>
                {
                    variants.map((variant, index) => {
                        return (
                            <div key={index}>{variant.GroupName}: {variant.Name}</div>
                        )
                    })
                }
            </div>
        );
    }

    renderItem() {
        const { name, description, quantity, price, total, variants } = this.state.item;

        return (
            <tr id="item">
                <td className="col-type">
                    {/* {name} */}
                    Item
                </td>
                <td className="col-desc">
                    {/* {(variants !== null && variants.length > 0)
                        ? this.renderDescriptionAndVariants(description, variants)
                        : description
                    } */}
                    {name}
                </td>
                <td className="col-qty">
                    <input id="quantity" className="optional-input required" type="text" value={quantity} onChange={(e) => this.changeQuantity(null, e)} />
                </td>
                <td className="col-ppu">
                    <span id="price_amt">{price}</span>
                </td>
                <td className="total-com col-total">
                    <span id="price_amt">{total}</span>
                </td>
                <td className="col-empty" />
            </tr>
        );
    }

    renderPaymentTerms() {
        const { paymentTerm } = this.state;
        const value = paymentTerm ? paymentTerm.ID : '';

        return (
            <div className="dd-payment-terms">
                <span className="title">Payment Terms</span><br />
                <div className="select-wrapper">
                    <select name="payment-terms" id="payment-terms" className="required" value={value} onChange={(e) => this.changePaymentTerm(e.target.value)}>
                        <option value={''}>Select Settlement Terms</option>
                        {
                            this.props.paymentTerms.map((paymentTerm, index) => {
                                return (
                                    <option key={index} value={paymentTerm.ID}>{paymentTerm.Name + ' - ' + paymentTerm.Description}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down" />
                </div>
            </div>
        );
    }

    renderQuotation(quotation) {
        const { id, type, description, reason, quantity, price, total } = quotation;

        return (
            <tr id={'quotation-' + id} key={id}>
                <td className="col-type">
                    <div className="tbl-select">
                        <select id={'type-' + id} value={type} onChange={(e) => this.changeType(id, e.target.value)}>
                            <option value="Charge">Charge</option>
                            <option value="Discount">Discount</option>
                        </select>
                        <i className="fa fa-angle-down" />
                    </div>
                </td>
                <td className="col-desc">
                    <input className="optional-input required" type="text" id={"description-" + id} value={description} onChange={(e) => this.changeDescription(id, e)} />
                    <div className="tbl-select">
                        <select id={'reason-' + id} value={reason} onChange={(e) => this.changeReason(id, e)}>
                            {this.renderQuotationReasons(type)}
                        </select>
                        <i className="fa fa-angle-down" />
                    </div>
                </td>
                <td className="col-qty">
                    {this.renderQuotationQuantity(id, type, quantity)}
                </td>
                <td className="col-ppu">
                    <input id={'price-' + id} className="per-unit required" type="text" value={price} onChange={(e) => this.changePrice(id, e)} />
                </td>
                <td className="total-com col-total">
                    <span id={'total-' + id}>{total}</span>
                </td>
                <td className="col-empty">
                    <a href="#" id={'delete-' + id} onClick={(e) => this.deleteQuotation(id, e)}><i className="btn-delete" /></a>
                </td>
            </tr>
        );
    }

    renderQuotationQuantity(id, type, value) {
        if (type.toLowerCase() == 'discount') {
            return (
                <div className="tbl-select">
                    <select id={'quantity-' + id} className="discountOption" style={{ display: 'inline-block' }} value={value} onChange={(e) => this.changeQuantity(id, e)}>
                        {
                            QuantityOptions.map((option) => {
                                return (
                                    <option key={option} value={option}>{option}</option>
                                )
                            })
                        }
                    </select>
                    <i className="fa fa-angle-down for-discount" style={{ display: 'inline-block' }} />
                </div>
            );
        }

        return (
            <input id={'quantity-' + id} className="quantity required" type="text" style={{ display: 'inline-block' }} value={value} onChange={(e) => this.changeQuantity(id, e)} />
        );
    }

    renderQuotationReasons(type) {
        if (type.toLowerCase() == 'discount') {
            return (
                DiscountReasons.map((reason, index) => {
                    return (
                        <option key={index} value={reason}>{reason}</option>
                    )
                })
            );
        }

        return (
            ChargeReasons.map((reason, index) => {
                return (
                    <option key={index} value={reason}>{reason}</option>
                )
            })
        );
    }

    render() {
        const self = this;
        const { categories, chatDetail, user } = this.props;
        const { issueDate, validDate, quotations } = this.state;

        return (
            <React.Fragment>
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent categories={categories} user={user} />
                </div>
                <div className="main footer_fixed" style={{ paddingTop: '122px' }}>
                    <div className="orderlist-container">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="nav-breadcrumb">
                                        <i className="fa fa-angle-left" /> <a href={'/chat?channelId=' + chatDetail.Channel.ChannelID}>Back</a>
                                    </div>
                                    <div className="quotation-container send-quotation clearfix" style={{ display: 'block' }}>
                                        <div className="flex-inline">
                                            <div className="quotation-date-issue">
                                                <span className="title">Issue date</span><br />
                                                <div className="group-datepicker">
                                                    <input type="text" id="issue-datepicker" defaultValue={issueDate} disabled="disabled" />
                                                </div>
                                            </div>
                                            <div className="quotation-date-valid">
                                                <span className="title">Valid date</span><br />
                                                <div className="group-datepicker">
                                                    <input type="text" id="valid-datepicker" className="required" value={validDate} onChange={(e) => this.changeValidDate(e.target.value)} />
                                                    <i className="fa fa-calendar" />
                                                </div>
                                            </div>
                                            {this.renderPaymentTerms()}
                                        </div>
                                        <div className="quotation-table">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th className="col-type">Type</th>
                                                        <th className="col-desc">Description</th>
                                                        <th className="col-qty">Qty</th>
                                                        <th className="col-ppu">Price per unit</th>
                                                        <th className="col-total">Total</th>
                                                        <th className="col-empty" />
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.renderItem()}
                                                    {
                                                        quotations.map((quotation) => {
                                                            return self.renderQuotation(quotation)
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="new-line">
                                                <a href="#" className="top-title" id="added-newline" onClick={(e) => this.addQuotation(e)}><i className="fas fa-plus fa-fw" /> Add new line</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ChatQuotationPriceComponent {...this.state} {...this.props} />
                            </div>
                        </div>
                    </div>
                </div>
                <div id="cover" style={{ zIndex: '9999999' }}></div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        chatDetail: state.chatReducer.chatDetail,
        paymentTerms: state.chatReducer.paymentTerms,
        availability: state.chatReducer.availability
    };
}

function mapDispatchToProps(dispatch) {
    return {
        sendOffer: (offer, callback) => dispatch(ChatActions.sendOffer(offer, callback)),
        addMember: (channelId, userId, callback) => dispatch(ChatActions.addMember(channelId, userId, callback))
    };
}

const ChatQuotationHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatQuotationComponent);

module.exports = {
    ChatQuotationHome,
    ChatQuotationComponent
};