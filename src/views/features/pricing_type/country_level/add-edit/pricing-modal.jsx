﻿'use strict';
const React = require('react');
const BaseComponent = require('../../../../shared/base');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class PricingModalComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            pricingItem: {},
            bulkPricing: [],
            errorMessages: [],
            defaultDiscount: 0,
            prevFixedPriceDiscount: null,
            startRange: ""
        }
    }

    componentDidMount() {
        this.initEvents();
    }

    initEvents() {
        $(document).on('blur', '[name="rate_cost"]', function (e) {
            if ($('#pricingPercentage').is(':checked')) {
                if (parseFloat($(this).val()) > 100) {
                    $(this).val(100);
                }
            }
        });

        $(document).on('change', '[name="rate_cost"]', function (e) {
            if ($('#pricingPercentage').is(':checked')) {
                if (parseFloat($(this).val()) > 100) {
                    $(this).val(100);
                }
            }
        });

        $(document).on('change', '[name="opt_discount_type"]', function (e) {

            if ($('#pricingPercentage').is(':checked')) {
                if (parseFloat($('[name="rate_cost"]').val()) > 100) {
                    $('[name="rate_cost"]').val(100);
                }
            }
        });
    }

    setPricing(pricingItem) {
        let bulkPricing = pricingItem.bulkPricing != undefined && pricingItem.bulkPricing != null && pricingItem.bulkPricing != '' ? pricingItem.bulkPricing : [];
        if (bulkPricing.length > 0) {
            bulkPricing = JSON.parse(bulkPricing);
            if (typeof bulkPricing[0] != 'undefined' && bulkPricing[0] != null) {
                pricingItem.discountType = bulkPricing[0].IsFixed == "1" ? 'fixed' : 'percentage';
            }
        }

        $("#range_start").val("");
        $("#range_end").val("");
        $("#inputRateCost").val("");
        $("#input_onwards").val("");

        $('.error-con').removeClass('error-con');        

        this.setState({
            pricingItem: pricingItem,
            bulkPricing: bulkPricing,
            errorMessages: []
        });
    }

    savePricingDetail(event, locationId) {
        event.preventDefault();
        const self = this;

        this.props.validatePermissionToPerformAction("add-merchant-create-item-api", () => {
            self.props.saveBulkPricing(locationId, self.state.bulkPricing);
            $('#myModalEditPricing').modal('hide');
        });
    }

    handleFixedPriceDiscountChange(e) {
        if ($("#pricingFixedPrice").is(":checked")) {
            var pricePattern = new RegExp(/^(?=.*[0-9])\d*(?:\.\d{0,2}){0,1}$/i);
            if (e.target.value && pricePattern.test(e.target.value) == false) {
                e.target.value = this.state.prevFixedPriceDiscount;
            }
            $(this).val(e.target.value);
            this.setState({ prevFixedPriceDiscount: e.target.value });
        }
    }

    validatePricingDetail() {
        const pricingDetail = this.state.pricingItem;
        let isValid = true;
        this.setState({ errorMessage: "" });
        let bulkPricing = pricingDetail.bulkPricing || [];
        let records = [];
        this.setState({ errorMessages: [] });

        $('li.li-form').prop('disabled', false);

        $('#myModalEditPricing input[type="number"]').removeClass('error-con');

        let $inputRateCost = $('#inputRateCost');
        let isPricingPercentage = $('#pricingPercentage').is(':checked');

        $('.error-con').removeClass('error-con');

        if (!$("#pricingCheckRange").is(":checked")) {
            //ONWARD

            var $rangeStart = $('#range_start');
            var $rangeEnd = $('#range_end');
            let $discount = $("#inputRateCost");

            if (!$.trim($rangeStart.val())) {
                $rangeStart.addClass('error-con');
                isValid = false;
            }

            if (!$.trim($rangeEnd.val())) {
                $rangeEnd.addClass('error-con');
                isValid = false;
            }
            if (!$.trim($discount.val())) {
                $discount.addClass('error-con');
                isValid = false;
            }

            if ($rangeStart.hasClass("error-con") || $rangeEnd.hasClass("error-con") || $discount.hasClass("error-con")) {
                return;
            }

            if (!isPricingPercentage) {
                if (isValid && parseFloat(pricingDetail.price) < parseFloat($.trim($inputRateCost.val()))) {
                    this.setState({ errorMessages: ["Discount can't be more than price."] });
                    $inputRateCost.addClass('error-con');
                    isValid = false;
                    return;
                }
            } else {
                if (isValid && 100 < parseFloat($.trim($inputRateCost.val()))) {
                    this.setState({ errorMessages: ["Discount can't be more than price."] });
                    $inputRateCost.addClass('error-con');
                    isValid = false;
                    return;
                }
            }

            if (isValid && parseFloat($.trim($rangeStart.val())) >= parseFloat($.trim($rangeEnd.val()))) {
                this.setState({ errorMessages: ["Cannot be smaller than or equal to " + $.trim($rangeStart.val())] });
                isValid = false;
                return;
            }            
            if (bulkPricing.length > 0 && isValid) {
                records = JSON.parse(bulkPricing).find(function (price) { return price.RangeEnd != undefined && price.RangeEnd != null && parseFloat(price.RangeEnd) >= parseFloat($rangeStart.val()) });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 :
                    ($.isPlainObject(records) && !$.isEmptyObject(records))) {

                    this.setState({ errorMessages: ["Cannot be smaller than or equal to last value " + ($.isArray(records) ? records[0].RangeEnd : records.RangeEnd)] });
                    $rangeStart.addClass('error-con');
                    isValid = false;

                    if (this.state.bulkPricing.length === 0) {
                        isValid = true;

                        let $rangeStart = $('#range_start');
                        let $rangeEnd = $('#range_end');
                        let $discount = $("#inputRateCost");

                        if (!isPricingPercentage) {
                            if (parseFloat(pricingDetail.price) < parseFloat($.trim($inputRateCost.val()))) {
                                this.setState({ errorMessages: ["Discount can't be more than price."] });
                                $inputRateCost.addClass('error-con');
                                isValid = false;
                                return;
                            }
                        } else {
                            if (100 < parseFloat($.trim($inputRateCost.val()))) {
                                this.setState({ errorMessages: ["Discount can't be more than price."] });
                                $inputRateCost.addClass('error-con');
                                isValid = false;
                                return;
                            }
                        }

                        if (parseFloat($.trim($rangeStart.val())) >= parseFloat($.trim($rangeEnd.val()))) {
                            this.setState({ errorMessages: ["Cannot be smaller than or equal to " + $.trim($rangeStart.val())] });
                            isValid = false;
                            return;
                        }
                        if (isValid === true) {
                            this.setState({ errorMessages: [] });
                            isValid = true;
                        }

                    }

                  //  return;
                }
            }
            if (this.state.bulkPricing.length > 0) {
                isValid = true;
                records = this.state.bulkPricing.find(function (price) { return price.RangeEnd != undefined && price.RangeEnd != null && parseFloat(price.RangeEnd) >= parseFloat($rangeStart.val()) });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 :
                    ($.isPlainObject(records) && !$.isEmptyObject(records))) {

                    this.setState({ errorMessages: ["Cannot be smaller than or equal to last value " + ($.isArray(records) ? records[0].RangeEnd : records.RangeEnd)] });
                    $rangeStart.addClass('error-con');
                    isValid = false;                   
                    return;
                }
            } else if (this.state.bulkPricing.length === 0 && isValid) {
                this.setState({ errorMessages: [] });
                isValid = true;
            }
        } else {
            //ONWARD
            let iOnward = $('#input_onwards');
            let iDiscount = $("#inputRateCost");

            if (!$.trim(iOnward.val())) {
                iOnward.addClass('error-con');
                isValid = false;
            }

            if (!$.trim(iDiscount.val())) {
                iDiscount.addClass('error-con');
                isValid = false;
            }


            if (iOnward.hasClass("error-con") || iDiscount.hasClass("error-con")) {
                return;
            }

            if (!isPricingPercentage) {
                if (isValid && parseFloat(pricingDetail.price) < parseFloat($.trim($inputRateCost.val()))) {
                    this.setState({ errorMessages: ["Discount can't be more than price."] });
                    $inputRateCost.addClass('error-con');
                    isValid = false;
                    return;
                }
            } else {
                if (isValid && 100 < parseFloat($.trim($inputRateCost.val()))) {
                    this.setState({ errorMessages: ["Discount can't be more than price."] });
                    $inputRateCost.addClass('error-con');
                    isValid = false;
                    return;
                }
            }

            if (bulkPricing.length > 0 && isValid) {
                let errMsg = [];
                records = JSON.parse(bulkPricing).find(function (price) { return price.Onward === "1" });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {
                    errMsg[errMsg.length] = "Unable to add new calculation if latest is set to 'onwards'";
                    $('li.li-form').prop('disabled', true);
                    iOnward.addClass('error-con');
                    isValid = false;

                }

                records = JSON.parse(bulkPricing).find(function (price) { return price.RangeEnd != undefined && price.RangeEnd != null && parseFloat(price.RangeEnd) >= parseFloat(iOnward.val()) });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {
                    errMsg[errMsg.length] = "Cannot be smaller than or equal to last value " + ($.isArray(records) ? records[0].RangeEnd : records.RangeEnd);
                    $('li.li-form').prop('disabled', true);
                    iOnward.addClass('error-con');
                    isValid = false;

                }

                if (!isValid) {
                    this.setState({ errorMessages: errMsg });
                }
            }

            if (this.state.bulkPricing.length > 0) {
                isValid = true;
                let errMsg = [];
                records = this.state.bulkPricing.find(function (price) { return price.Onward === "1" });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {
                    errMsg[errMsg.length] = "Unable to add new calculation if latest is set to 'onwards'";
                    $('li.li-form').prop('disabled', true);
                    iOnward.addClass('error-con');
                    isValid = false;

                }

                records = this.state.bulkPricing.find(function (price) { return price.RangeEnd != undefined && price.RangeEnd != null && parseFloat(price.RangeEnd) >= parseFloat(iOnward.val()) });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {
                    errMsg[errMsg.length] = "Cannot be smaller than or equal to last value " + ($.isArray(records) ? records[0].RangeEnd : records.RangeEnd);
                    $('li.li-form').prop('disabled', true);
                    iOnward.addClass('error-con');
                    isValid = false;

                }

                if (!isValid) {
                    this.setState({ errorMessages: errMsg });
                }
            } else if (this.state.bulkPricing.length === 0) {
                isValid = true;

                let $rangeStart = $('#range_start');
                let $rangeEnd = $('#range_end');
                let $discount = $("#inputRateCost");

                if (!isPricingPercentage) {
                    if (parseFloat(pricingDetail.price) < parseFloat($.trim($inputRateCost.val()))) {
                        this.setState({ errorMessages: ["Discount can't be more than price."] });
                        $inputRateCost.addClass('error-con');
                        isValid = false;
                        return;
                    }
                } else {
                    if (100 < parseFloat($.trim($inputRateCost.val()))) {
                        this.setState({ errorMessages: ["Discount can't be more than price."] });
                        $inputRateCost.addClass('error-con');
                        isValid = false;
                        return;
                    }
                }

                if (parseFloat($.trim($rangeStart.val())) >= parseFloat($.trim($rangeEnd.val()))) {
                    this.setState({ errorMessages: ["Cannot be smaller than or equal to " + $.trim($rangeStart.val())] });
                    isValid = false;
                    return;
                }

                var $inputOnwards = $('#input_onwards');
                if (!$.trim($inputOnwards.val())) {
                    $inputOnwards.addClass('error-con');
                    isValid = false;
                    return;
                }

                if (isValid === true) {
                    this.setState({ errorMessages: [] });
                    isValid = true;
                }

            }
            
        }

        return isValid;
    }

    addNewItemBulkPrice() {
        if (this.validatePricingDetail()) {
            let bulkPricing = this.state.bulkPricing;
            let bulkPrice = {};

            var d = new Date();
            bulkPrice.Id = d.getTime();
            bulkPrice.RangeStart = $("#range_start").val();
            bulkPrice.RangeEnd = $("#range_end").val();
            bulkPrice.Onward = $("#pricingCheckRange").is(":checked") ? "1" : "0";
            bulkPrice.OnwardPrice = $("#input_onwards").val();
            bulkPrice.IsFixed = $("#pricingFixedPrice").is(":checked") ? "1" : "0";
            bulkPrice.Discount = $("#inputRateCost").val();

            bulkPricing.push(bulkPrice);
            this.setState({
                bulkPricing: bulkPricing,
                startRange: ""
            });

            $("#range_start").val("");
            $("#range_end").val("");
            $("#inputRateCost").val("");
            $("#input_onwards").val("");

            if (bulkPrice.Onward === "1") {
                this.setState({ errorMessages: ["Unable to add new calculation if latest is set to 'onwards'"] });
            }
        }
    }

    onDiscountTypeChanged(e) {
        const { pricingItem, bulkPricing } = this.state;

        pricingItem.discountType = e.target.value;

        if (bulkPricing.length > 0) {
            bulkPricing.forEach((bulk) => {
                //if (pricingItem.discountType == 'percentage') {
                //    bulk.IsFixed = '0';
                //} else {
                //    bulk.IsFixed = '1';
                //}
            });
        }

        this.setState({ pricingItem, bulkPricing });
    }

    onPriceRangeChanged(event) {
        const checked = event.target;
        const pricingItem = this.state.pricingItem;
        let startRange = "";

        if ($("#range_start").length > 0) {
            startRange = $("#range_start").val();
        } else {
            startRange = $("#input_onwards").val();
        }
        if ($(event.target).hasClass("chck_onwards")) {
            let isCheck = $(event.target).is(':checked');
            pricingItem.priceRange = !isCheck;
        } else {
            pricingItem.priceRange = !checked;
        }
       

        this.setState({
            pricingItem: pricingItem,
            startRange: startRange
        });
    }

    showCurrency() {
        let currencyCode = this.state.pricingItem ? this.state.pricingItem.currencyCode : "";
        return currencyCode;
    }

    showDiscount(price) {
        if (price.IsFixed === "1") {
            return (
                <span className="result-discount">
                    <p className="fixed_percent">{this.formatMoney(this.showCurrency(), price.Discount)}</p>
                </span>
            );
        }
        return (
            <span className="result-discount">
                {price.Discount}<p className="fixed_percent">%</p>
            </span>
        );
    }

    showRemoveBulkPriceItemButton(index) {
        if (index === this.state.bulkPricing.length - 1) {
            return (
                <span className="remove_list" onClick={(event) => { this.showDeletePopUp() }} >
                    <span><i className="fa fa-times-circle openModalRemove remove-list-in-modal"></i></span>
                </span>
            );
        }
        return null;
    }

    showAddNewBulkPricingButton(hasOnward) {
        let button = <div key={"enabled"} className="btn-add" id="addNewBulkPrice" onClick={() => this.addNewItemBulkPrice()}>Add New Bulk Pricing</div>;

        if (hasOnward) {
            button = <div key={"disabled"} className="btn-add" id="addNewBulkPrice" onClick={(e) => e.preventDefault()}>Add New Bulk Pricing</div>;
        }

        return (
            <div className="add-new-bulk-price">
                {
                    this.state.errorMessages.map((msg, ndx) => {
                        return (<div className="text text-danger" key={ndx}>{msg}</div>);
                    })
                }
                {button}
            </div>  
        );
    }

    removeBulkPrice() {
        if (this.state.bulkPricing) {
            this.state.bulkPricing.splice(this.state.bulkPricing.length - 1, 1);
            this.setState({
                bulkPricing: this.state.bulkPricing,
                errorMessages: []
            });
            if (this.state.bulkPricing) {
                let records = this.state.bulkPricing.find(function (price) { return price.Onward === "1" });
                if (records != undefined && records != null
                    && $.isArray(records) ? records.length > 0 : ($.isPlainObject(records) && !$.isEmptyObject(records))) {
                    $('li.li-form').prop('disabled', true);
                } else {
                    $('li.li-form').prop('disabled', false);
                }
            }

            $('#modalRemoveBulkPricing').modal('hide');
        }
    }

    closeDeletePopUp() {
        this.setState({ errorMessages: [] });
        this.props.closeDeletePopUp();
    }

    showDeletePopUp() {
        $('#modalRemoveBulkPricing').modal('show');
    }

    render() {
        let self = this;
        const pricingItem = this.state.pricingItem;
        
        let onwardRecord = pricingItem && pricingItem.bulkPricing && pricingItem.bulkPricing.length > 0 ? JSON.parse(pricingItem.bulkPricing).filter(function (price) { return price.Onward === "1" }) : [];
        if (this.state.bulkPricing) {
            onwardRecord = this.state.bulkPricing && this.state.bulkPricing.length > 0 ? this.state.bulkPricing.filter(function (price) { return price.Onward === "1" }) : [];
        }
        
        let startRange = "";
        let hasOnward = onwardRecord.length > 0 ? true : false;
       
        return (
            <React.Fragment>
                <div id="myModalEditPricing" className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    onClick={() => this.closeDeletePopUp()}>×</button>
                                <h4 className="modal-title">EDIT BULK PRICING</h4>
                                <p>Create bulk pricing by specifying fixed or percentage based discounts for different quantity ranges</p>
                            </div>
                            <div className="modal-body">
                                <div className="discount-con">
                                    <span>Discount Type</span>
                                    <div className="radio-container">
                                        <span className="fancy-radio">
                                            <input type="radio" defaultValue="percentage" name="opt_discount_type" id="pricingPercentage"
                                                checked={pricingItem.discountType == 'percentage' ? true : false}
                                                onChange={(e) => { this.onDiscountTypeChanged(e) }}
                                                onClick={(e) => { this.onDiscountTypeChanged(e) }} />
                                            <label htmlFor="pricingPercentage"><span>Percentage</span></label>
                                        </span>
                                        <span className="fancy-radio">
                                            <input type="radio" defaultValue="fixed" name="opt_discount_type" id="pricingFixedPrice"
                                                checked={pricingItem.discountType == 'fixed' ? true : false}
                                                onChange={(e) => { this.onDiscountTypeChanged(e) }}
                                                onClick={(e) => { this.onDiscountTypeChanged(e) }} />
                                            <label htmlFor="pricingFixedPrice"><span>Fixed price</span></label>
                                        </span>
                                    </div>
                                </div>
                                <div className="bulk-pricing">
                                    <ul className="list-result" id="ul-rowPric-AF">
                                        {
                                            this.state.bulkPricing.map((price, ndx) => {
                                                if (price.Onward !== "1") {
                                                    return (
                                                        <li className="parent-r-b" key={ndx} data-id={price.Id}>
                                                            <span>Purchases between</span>
                                                            <span className="result-range">
                                                                <span className="first">{price.RangeStart}</span> - <span className="second">{price.RangeEnd}</span>
                                                            </span>
                                                            <span>will get a discount of</span>
                                                            {this.showDiscount(price)}
                                                            <span>off per item</span>
                                                            {this.showRemoveBulkPriceItemButton(ndx)}
                                                        </li>
                                                    );
                                                }
                                                else {
                                                    return (
                                                        <li className="parent-r-b no-range" key={ndx} data-id={price.Id}>
                                                            <span>Purchases between</span>
                                                            <span className="result-range">
                                                                <span className="third">{price.OnwardPrice}</span>
                                                            </span>
                                                            <span>onwards will get a discount of</span>
                                                            {this.showDiscount(price)}
                                                            <span>off per item</span>
                                                            {this.showRemoveBulkPriceItemButton(ndx)}
                                                        </li>
                                                    );
                                                }
                                            })
                                        }
                                    </ul>
                                    <ul>
                                        <li className={"li-form " + (hasOnward ? "disabled" : "")}>
                                            <span>Purchase</span>
                                            {
                                                pricingItem.priceRange
                                                    ? <span className="purchase_range">between
									                <input type="number" className="first_range txt sort numbersOnly" data-decimal="1" name="range_start" id="range_start" placeholder="0" min={0} defaultValue={startRange} />
                                                        <p>-</p>
                                                        <input type="number" className="second_range txt sort numbersOnly" data-decimal="1" name="range_end" id="range_end" placeholder="0" min={0} />
                                                    </span>
                                                    : <span className="range-b">
                                                        <input type="text" className="price_onwards txt cost numbersOnly" name="input_onwards" id="input_onwards" placeholder="0" min={0} defaultValue={startRange} />
                                                        <span className="unit_area"></span>
                                                    </span>
                                            }
                                            <span className="fancy-checkbox">
                                                <input
                                                    className="chck_onwards"
                                                    type="checkbox"
                                                    name="opt_del"
                                                    id="pricingCheckRange"
                                                    checked={!pricingItem.priceRange}
                                                    onChange={(e) => { this.onPriceRangeChanged(e) }}
                                                    onClick={(e) => { this.onPriceRangeChanged(e) }}
                                                />
                                                <label htmlFor="pricingCheckRange"><span>Onwards</span></label>
                                            </span>
                                            <span className="discount_content">
                                                <span>Discount amount:</span>
                                                <span className="discount_price">
                                                    {
                                                        pricingItem.discountType == 'percentage'
                                                            ? <p className="fixed_percent"> %</p>
                                                            : <p className="fixed_percent">{self.formatMoney(this.showCurrency())}</p>
                                                    }
                                                    {
                                                        pricingItem.discountType == 'percentage'
                                                            ? <input id="inputRateCost" type="number" className={"price_val txt cost number2DecimalOnly " + (hasOnward ? "zero-val" : "")} data-max={100} name="rate_cost" min={0} max={100} disabled={hasOnward ? true : false} />
                                                            : <input id="inputRateCost" type="text" className={"price_val txt cost number2DecimalOnly " + (hasOnward ? "zero-val" : "")} name="rate_cost" disabled={hasOnward ? true : false} onChange={(e) => this.handleFixedPriceDiscountChange(e)} />
                                                    }

                                                    <p>off per item</p>
                                                </span>
                                            </span>
                                        </li>
                                    </ul>
                                    {this.showAddNewBulkPricingButton(hasOnward)}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="btn btn-cancel" data-dismiss="modal"
                                    onClick={(e) => { this.closeDeletePopUp() }}>Cancel</div>
                                <div className="btn btn-save" id="btnSaveEditBulk" onClick={(e) => this.savePricingDetail(e, pricingItem.locationId)}>Save</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="modalRemoveBulkPricing" className="modal fade" role="dialog" data-backdrop="static" data-keyboard="false">
                    <div className="modal-dialog delete-modal-content">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Are you sure want to delete?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="btn-gray" data-dismiss="modal" onClick={() => this.props.closeDeletePopUp()}>Cancel</div>
                                <div className="btn-green" onClick={() => this.removeBulkPrice()} id="btnRemove">Okay</div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

module.exports = PricingModalComponent;