﻿'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../src/public/js/enum-core.js');
var BootBox = require('bootbox')
var BaseClassComponent = require('../../shared/base.jsx');
var toastr = require('toastr');

const PermissionTooltip = require('../../common/permission-tooltip');

class PaymentComponent extends BaseClassComponent {
    constructor(props) {
        super(props)

        this.state = {
            showOmise: false,
            omiseType: 'Individual',
            omiseBankCode: '',
            omiseBankAccountName: '',
            omiseTaxNumber: '',
            omiseBankAccountNumber: '',
            showOfflinePayment: false,
            offlinePaymentDescription: '',
            selectedPayment: {}
        }
    }

    componentDidMount() {
        var self = this;
        if (self.props.paymentAcceptanceMethod != null && self.props.paymentAcceptanceMethod.length > 0) {
            var theConnection = self.props.paymentAcceptanceMethod.find(d => d.PaymentGateway.Code.toLowerCase() == EnumCoreModule.GetGateways().Omise.toLowerCase());
            if (theConnection && typeof theConnection != 'undefined') {

                self.setState({
                    omiseType: theConnection.BankAccountType,
                    omiseBankCode: theConnection.BankIdentifierCodes,
                    omiseBankAccountName: theConnection.BankAccountName,
                    omiseTaxNumber: theConnection.TaxID,
                    omiseBankAccountNumber: theConnection.BankAccountNumber
                })
            }
        }

        if (new URLSearchParams(window.location.search).get('tab') == 'payment') {
            $('a[href="#Payment"]').tab('show')
        }

        self.initCkEditor()
    }

    initCkEditor() {
        CKEDITOR.replace('niceEditorTextareaPayment', {

            toolbar: [

                { name: 'document', groups: ['document', 'doctools'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-'] },

                { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },

                { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['-', 'SelectAll', '-'] },

                { name: 'forms' },

                '/',

                { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },

                { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-'] },

                { name: 'links', items: ['Link', 'Unlink'] },

                { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar'] },

                '/',

                { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },

                { name: 'colors', items: ['TextColor', 'BGColor', 'youtube'] },



                //removing toolbar, 

                // { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },  

                // { name: 'others', items: [ '-' ] }

                // { name: 'about', items: [ 'About' ] }

            ]

        }); //this is how to remove the status bar  below,

        CKEDITOR.config.removePlugins = 'elementspath';

        CKEDITOR.config.resize_enabled = false;
    }

    showAccountLinkAndCompulsory(payment) {
        var self = this;
        let linkName = '';

        if (self.props.paymentAcceptanceMethod != null && self.props.paymentAcceptanceMethod.length > 0) {
            var theConnection = self.props.paymentAcceptanceMethod.find(d => d.PaymentGateway.Code == payment.Code);
            if (theConnection && typeof theConnection != 'undefined') {

                if (theConnection.PaymentGateway)

                    if (theConnection.PaymentGateway.Gateway == EnumCoreModule.GetGateways().Omise) {
                        return (
                            <div className="payment-text"> {theConnection.Account}
                                <div className="verified"><div className="check-icon"><img src="/assets/images/done.svg" /></div> <span>Verified</span></div>
                            </div>
                        )
                    }
                    else {
                        return (
                            <div className="payment-text"> {theConnection.Account}
                                <div className="verified"><div className="check-icon"><img src="/assets/images/done.svg" /></div> <span>Verified</span></div>
                            </div>
                        )
                    }

            }
            else {
                return self.showNoAccountLink(payment)
            }
        }
        else {
            return self.showNoAccountLink(payment)
        }
    }

    showNoAccountLink(payment) {
        var self = this;
        return (<div className="payment-text account-not-link">No Account Linked
                {
                payment.Meta && payment.Meta.mandatory.length > 1 && payment.Meta.mandatory == "True" ?
                    <span className="p-note mandatory-payment">
                        <div className="img-payment-warning" />
                        <p>This payment method is compulsary.</p>
                    </span>
                    :
                    ""
            }
        </div>
        )
    }

    showPaymentList() {
        var self = this;

        if (this.props.paymentGateways && this.props.paymentGateways.length > 0) {
            return (
                this.props.paymentGateways.map(function (payment, index) {
                    if (payment.Gateway == EnumCoreModule.GetGateways().Stripe) {
                        return (
                            <li className="Stripe" key={payment.Code}>
                                <div className="payment-logo"> <img src="/assets/images/gateways/stripe_logo.svg" /> </div>
                                {self.showAccountLinkAndCompulsory(payment)}
                                <div className="payment-note pull-right">
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-blue" onClick={(e) => self.doLinkAccount(payment)}>Link Account</div>
                                    </PermissionTooltip>
                                </div>
                            </li>
                        );
                    }
                    else if (payment.Gateway == EnumCoreModule.GetGateways().PayPal) {
                        return (
                            <li className="PayPal" key={payment.Code}>
                                <div className="payment-logo"> <img src="/assets/images/gateways/paypal_icon.svg" /> </div>
                                {self.showAccountLinkAndCompulsory(payment)}
                                <div className="payment-note pull-right">
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-blue" onClick={(e) => self.doLinkAccount(payment)}>Link Account</div>
                                    </PermissionTooltip>
                                </div>
                            </li>
                        );
                    }
                    else if (payment.Gateway == EnumCoreModule.GetGateways().Omise) {
                        return (
                            <li className="Omise" key={payment.Code}>
                                <div className="payment-logo"> <img src="/assets/images/gateways/omise_logo.svg" /> </div>
                                {self.showAccountLinkAndCompulsory(payment)}
                                <div className="payment-note pull-right">
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-blue" onClick={(e) => self.doLinkAccount(payment)}>Link Account</div>
                                    </PermissionTooltip>
                                </div>
                            </li>
                        );
                    }
                    else if (payment.Gateway == EnumCoreModule.GetGateways().CashOnDelivery) {
                        return (
                            <li className="CashOnDelivery" key={payment.Code}>
                                <div className="payment-logo"> Cash on delivery </div>
                                {self.showAccountLinkAndCompulsory(payment)}
                                <div className="payment-note pull-right">
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-blue" onClick={(e) => self.doLinkAccount(payment)}>Link Account</div>
                                    </PermissionTooltip>
                                </div>
                            </li>
                        );
                    }
                    else if (payment.Code.indexOf(EnumCoreModule.GetGateways().OfflinePayments)) {
                        return (
                            <li className="OfflinePayments" data-code={payment.Code} key={payment.Code}>
                                <div className="payment-logo"> {payment.Gateway} </div>
                                {self.showAccountLinkAndCompulsory(payment)}
                                <div className="payment-note pull-right">
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-blue" onClick={(e) => self.doLinkAccount(payment)}>Setup</div>
                                    </PermissionTooltip>
                                </div>
                            </li>
                        );
                    }
                    else {
                        return (
                            <li className="Custom" key={payment.Code}>
                                <div className="payment-logo"> <img src={payment.Logo.MediaUrl} /> </div>
                                {self.showAccountLinkAndCompulsory(payment)}
                                <div className="payment-note pull-right">
                                    <PermissionTooltip isAuthorized={self.props.pagePermissions.isAuthorizedToEdit} extraClassOnUnauthorized={'icon-grey'}>
                                        <div className="btn-blue" onClick={(e) => self.doLinkAccount(payment)}>Link Account</div>
                                    </PermissionTooltip>
                                </div>
                            </li>
                        );
                    }

                })
            );
        } else
            return '';
    }

    doLinkAccount(payment) {
        var self = this;
        this.props.validatePermissionToPerformAction("edit-merchant-payment-methods-api", () => {
            if (payment.Gateway == EnumCoreModule.GetGateways().Stripe) {
                window.location.href = self.props.stripeLoginUrl
            } else if (payment.Gateway == EnumCoreModule.GetGateways().PayPal) {
                window.location.href = self.props.paypalLoginUrl
            } else if (payment.Code.indexOf(EnumCoreModule.GetGateways().OfflinePayments) > 0) {
                self.setState({
                    showList: !self.state.showList,
                    showOfflinePayment: !self.state.showOfflinePayment,
                    selectedPayment: payment,
                }, function () {
                    if (self.props.paymentAcceptanceMethod && self.props.paymentAcceptanceMethod.length > 0) {
                        let paymentTemp = self.props.paymentAcceptanceMethod.find(d => d.PaymentGateway.Code == payment.Code);

                        if (paymentTemp) {
                            CKEDITOR.instances['niceEditorTextareaPayment'].setData(paymentTemp.Description);
                        }
                        else {
                            CKEDITOR.instances['niceEditorTextareaPayment'].setData('');
                        }
                    }
                })
            } else if (payment.Gateway == EnumCoreModule.GetGateways().Omise) {
                self.setState({
                    showList: !self.state.showList,
                    showOmise: !self.state.showOmise
                })
            } else if (payment.Gateway == EnumCoreModule.GetGateways().CashOnDelivery) {
                BootBox.confirm({
                    message: "By verifying this payment method, all your buyers will be able to checkout your items using Cash on Delivery and settlement has to be handled by you manually if they were to use this payment method.",
                    className: "my-confirmmodal",
                    buttons: {
                        confirm: {
                            label: 'Okay',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'Cancel',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result == true) {
                            self.createBasic_PaymentAcceptanceMethodAsync(payment);
                        }
                    }
                });

            } else {
                BootBox.confirm({
                    message: payment.Description,
                    className: "my-confirmmodal",
                    buttons: {
                        confirm: {
                            label: 'Okay',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'Cancel',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result == true) {
                            self.createBasic_PaymentAcceptanceMethodAsync(payment);
                        }
                    }
                });
            }
        });
    }

    createBasic_PaymentAcceptanceMethodAsync(payment) {
        var self = this;

        this.props.validatePermissionToPerformAction("edit-merchant-payment-methods-api", () => {
            self.props.createPaymentAcceptanceMethodAsync(JSON.stringify({
                merchantId: self.props.user.ID,
                Verified: true,
                PaymentGateway: {
                    Code: payment.Code
                },
                ClientID: '',
                Account: self.props.user.Email,
                BankAccountNumber: ''
            }), function () {
                self.props.getPaymentAcceptanceMethods(JSON.stringify({
                    merchantId: self.props.user.ID
                }), () => {
                });
            });
        });
    }

    doSaveOmise(e) {
        e.preventDefault();
        var self = this;
        let hasError = false;

        this.props.validatePermissionToPerformAction("edit-merchant-payment-methods-api", () => {
            $('#bank-branch-code').removeClass('error-con');
            $('#bank-account-number').removeClass('error-con');
            $('#bank-account-name').removeClass('error-con');

            if (!self.state.omiseBankCode) {
                $('#bank-branch-code').addClass('error-con');
                hasError = true;
            }

            if (!self.state.omiseBankAccountNumber) {
                $('#bank-account-number').addClass('error-con');
                hasError = true;
            }

            if (!self.state.omiseBankAccountName) {
                $('#bank-account-name').addClass('error-con');
                hasError = true;
            }

            if (!hasError) {
                self.setState({
                    showOmise: false
                }, function () {
                    const { paymentGateways, user } = self.props;
                    var paymentGateway = paymentGateways.find(d => d.Gateway == EnumCoreModule.GetGateways().Omise);
                    if (paymentGateway && typeof paymentGateway !== 'undefined') {
                        const options = {
                            type: self.state.omiseType.toLowerCase(),
                            taxId: self.state.omiseTaxNumber,
                            bankAccountBrand: self.state.omiseBankCode,
                            bankAccountNumber: self.state.omiseBankAccountNumber,
                            bankAccountName: self.state.omiseBankAccountName
                        };

                        self.props.saveOmiseAccount(JSON.stringify(options), (errorMessage, recipientId) => {
                            if (!errorMessage) {
                                self.props.createPaymentAcceptanceMethodAsync(JSON.stringify({
                                    merchantId: user.ID,
                                    Verified: true,
                                    PaymentGateway: {
                                        Code: paymentGateway.Code
                                    },
                                    ClientID: recipientId,
                                    Account: user.Email,
                                    BankAccountType: self.state.omiseType,
                                    BankIdentifierCodes: self.state.omiseBankCode,
                                    BankAccountName: self.state.omiseBankAccountName,
                                    TaxID: self.state.omiseTaxNumber,
                                    BankAccountNumber: self.state.omiseBankAccountNumber,
                                }), function () {
                                    self.props.getPaymentAcceptanceMethods(JSON.stringify({
                                        merchantId: user.ID
                                    }), () => {
                                    });
                                });
                            } else {
                                toastr.error('Failed to save the Omise bank details, please try again.', 'Oops! Something went wrong.');
                                console.log(errorMessage);
                            }
                        });
                    }
                });
            }
        });
    }

    doSaveOfflinePayment() {
        
        var self = this;
        this.props.validatePermissionToPerformAction("edit-merchant-payment-methods-api", () => {
            self.setState({
                showOfflinePayment: false
            }, function () {
                const { user } = self.props;
                const { selectedPayment } = self.state;

                self.props.createPaymentAcceptanceMethodAsync(JSON.stringify({
                    merchantId: user.ID,
                    Verified: true,
                    PaymentGateway: {
                        Code: selectedPayment.Code
                    },
                    Account: user.Email,
                    Description: CKEDITOR.instances['niceEditorTextareaPayment'].getData(),
                }), function () {
                    self.props.getPaymentAcceptanceMethods(JSON.stringify({
                        merchantId: user.ID
                    }), () => {
                    });
                });
            })
        });
    }

    handleSave() {
        if (this.state.showOmise) this.doSaveOmise();
        if (this.state.showOfflinePayment) this.doSaveOfflinePayment();
        else {
            //check if there are paymentmethod that is required and not verified
            if ($('.account-not-link .mandatory-payment').length > 0) {
                toastr.error("You need to link the mandatory payment method before proceeding.", "Oops! Something is wrong.");
                $(this).addClass('error-con');
                return;
            }

            const { paymentAcceptanceMethod } = this.props;
            if (paymentAcceptanceMethod && paymentAcceptanceMethod.length > 0 && paymentAcceptanceMethod.filter(p => p.Verified && p.Active).length > 0) {
                $('.nav-pills > .active').next('li').find('a').trigger('click');
            } else {
                //window.location.href = "/merchants/dashboard";
            }
        }
    }

    hideOmise(e) {
        e.preventDefault();
        this.setState({
            showOmise: false
        })
    }

    render() {        
        var self = this;

        return (<React.Fragment>
            <div className="tab-pane fade" id="Payment" >
                <div className="payment-tab" style={{ display: self.state.showOmise || self.state.showOfflinePayment ? 'none' : 'block' }}>
                    <ul className="flex-terms">
                        {self.showPaymentList()}
                    </ul>
                </div>
                <div className="seller-common-box pull-left" id="omiseConfirmSec" style={{ display: self.state.showOmise ? 'block' : 'none' }}>
                    <div className="pay-tab-container">
                        <div className="nav-breadcrumb"><i className="fa fa-angle-left" /><a href="#" onClick={(e) => self.hideOmise(e)} className="omise-back">Back</a></div>
                        <p><img src="/assets/images/gateways/omise_logo.svg" alt="omise" width={150} /></p>
                        <h4 className="title">ACCOUNT CONFIGURATION</h4>
                        <p className="description">Your details entered here will be saved and verified by Omise. Money you earn from your sales will be accredited to your bank account directly</p>
                    </div>
                    <div className="set-content">
                        <form className="pdc-inputs" method="post" id="omiseForm">
                            <div className="set-inputs">
                                <div className="input-container">
                                    <span className="title">Type</span>
                                    <select name="type" id="type" className="select-text required" onChange={(e) => self.onChange(e)} defaultValue={this.state.omiseType} value={this.state.omiseType} data-react-state-name='omiseType' >
                                        <option value="Individual">Individual</option>
                                        <option value="Corporate">Corporate</option>
                                    </select>
                                </div>
                                <div className="input-container">
                                    <span className="title">Tax Identification Number (Optional)</span>
                                    <input type="text" className="input-text" name="tax-identification" onChange={(e) => self.onChange(e)} defaultValue={this.state.omiseTaxNumber} value={this.state.omiseTaxNumber} data-react-state-name='omiseTaxNumber' />
                                </div>
                            </div>
                            <div className="set-inputs">
                                <div className="input-container">
                                    <span className="title">Bank Brand Code <a href="https://www.omise.co/supported-banks" target="_blank" className="btn-question">?</a></span>
                                    <input type="text" className="input-text required " id="bank-branch-code" name="bank-branch-code" onChange={(e) => self.onChange(e)} defaultValue={this.state.omiseBankCode} data-react-state-name='omiseBankCode' />
                                </div>
                                <div className="input-container">
                                    <span className="title">Bank Account Number</span>
                                    <input type="text" className="input-text required " id="bank-account-number" name="bank-account-number" onChange={(e) => self.onChange(e)} defaultValue={this.state.omiseBankAccountNumber} data-react-state-name='omiseBankAccountNumber' />
                                </div>
                            </div>
                            <div className="set-inputs">
                                <div className="input-container">
                                    <span className="title">Bank Account Name</span>
                                    <input type="text" className="input-text required" id="bank-account-name" name="bank-account-name" onChange={(e) => self.onChange(e)} defaultValue={this.state.omiseBankAccountName} data-react-state-name='omiseBankAccountName' />
                                </div>
                                <div className="clearfix" />
                            </div>
                            <div align="center" className="payment-btn-area hide">
                                <a className="my-btn btn-red" onClick={(e) => self.doSaveOmise(e)} id="next-tab" href="#">SAVE2</a>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="payment-setup-area" style={{ display: self.state.showOfflinePayment ? 'block' : 'none' }}>
                    <div className="setup_sec">
                        <a href="#" onClick={(e) => { self.setState({ showOfflinePayment: false }) }}>
                            <i className="fa fa-angle-left" /> Back </a>
                        <div className="setup_content">
                            <h3>{self.state.selectedPayment.Gateway}</h3>
                            <p>
                                {self.state.selectedPayment.Description}
                            </p>
                            <textarea id="niceEditorTextareaPayment" name="niceEditorTextareaPayment" style={{ width: '100%', visibility: 'hidden', display: 'none' }} defaultValue={""} />
                        </div>
                    </div>
                    <div className="settings-button">
                        <div className="btn-next pull-right" onClick={(e) => self.doSaveOfflinePayment(e)}>Save</div>
                    </div>
                </div>
                <div className="settings-button">
                    <div className="btn-previous pull-left" onClick={(e) => $('.setting-tab >ul >li:eq(1) a').click()} style={{ display: self.state.showOmise || self.state.showOfflinePayment ? 'none' : 'block' }}>Previous</div>
                    {
                        self.state.showOmise ?
                            <div className="btn-add pull-right payment-next" onClick={(e) => self.doSaveOmise(e)}>Save</div>
                            : <div className="btn-add pull-right payment-next" onClick={(e) => self.handleSave()} style={{ display: self.state.showOfflinePayment ? 'none' : 'block' }}>Next</div>
                    }
                </div>
            </div>
        </React.Fragment >)
    }
}

module.exports = PaymentComponent;