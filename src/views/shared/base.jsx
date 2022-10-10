var React = require('react');
var Numeral = require('numeral');
var Moment = require('moment');
var Currency = require('currency-symbol-map');
var Toastr = require('toastr');
var EnumCoreModule = require('../../../src/public/js/enum-core.js');

class BaseClassComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    onChange(event) {
        var self = this;

        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const reactStateName = target.getAttribute('data-react-state-name');

        self.setState({
            [reactStateName]: value
        }, function () {
            self.onChangeSetStateCallBack(reactStateName);
        });
    }

    onChangeNoWhiteSpaceAllowed(event) {
        var self = this;

        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const reactStateName = target.getAttribute('data-react-state-name');

        if (event.which == 32) {
            return false;
        }
            

        self.setState({
            [reactStateName]: value
        }, function () {
            self.onChangeSetStateCallBack(reactStateName);
        });
    }
    avoidWhiteSpaceOnKeyDown(event) {
        if (event.which == 32) {
            event.preventDefault();
            return false;
        }
    }
    onChangeSetStateCallBack(stateName) {
    }

    renderFormatMoney(currencyCode, amount) {
        let format = process.env.MONEY_FORMAT;
        if (typeof currencyCode === 'undefined') currencyCode = process.env.DEFAULT_CURRENCY;
        if (typeof amount === 'undefined' || isNaN(amount)) {
          //  return '';
            //adjusting for un1056
            return (<React.Fragment>
                <span className="currencyCode">{currencyCode}</span>
                <span className="currencySymbol"> {Currency(currencyCode)}</span>
            </React.Fragment>);
        }

        if (currencyCode === "empty") {
            //adjusting for un1056
            return (<React.Fragment>
                <span className="priceAmount"> {Numeral(amount).format(format)}</span>
            </React.Fragment>);
        }

        var htmlFormated = (<React.Fragment>
            <span className="currencyCode">{currencyCode}</span>
            <span className="currencySymbol"> {Currency(currencyCode)}</span>
            <span className="priceAmount"> {Numeral(amount).format(format)}</span>
        </React.Fragment>);
        return htmlFormated;
    }

    formatMoney(currencyCode, amount) {
        // base function for non-jsx purpose like html placeholder
        let format = process.env.MONEY_FORMAT;
        if (typeof currencyCode === 'undefined') currencyCode = process.env.DEFAULT_CURRENCY;

        let value = currencyCode + ' ' + Currency(currencyCode);

        if (typeof amount != 'undefined' && amount != null) {
            value = value + ' ' + Numeral(amount).format(format);
        }

        return value;
    }

    formatDateTime(timestamp, format) {
        if (typeof format === 'undefined') {
            format = process.env.DATETIME_FORMAT;
        }

        if (typeof timestamp === 'number') {
            return Moment.unix(timestamp).utc().local().format(format);
        } else {
            return Moment.utc(timestamp).local().format(format);
        }
    }

    formatDate(timestamp) {
        let format = process.env.DATE_FORMAT;
        return this.formatDateTime(timestamp, format);
    }

    formatTime(timestamp) {
        let format = process.env.TIME_FORMAT;
        return this.formatDateTime(timestamp, format);
    }

    formatYear(timestamp) {
        let format = process.env.YEAR_FORMAT;
        return this.formatDateTime(timestamp, format);
    }
    formatAmountWithCommaSeparator(totalAmount) {
        let format = process.env.MONEY_FORMAT;
        return Numeral(totalAmount).format(format);
    }
    showMessage(toastStr) {
        if (toastStr.type == 'error') {
            Toastr.error(toastStr.body, toastStr.header);
        }
        else if (toastStr.type == 'success') {
            Toastr.success(toastStr.body, toastStr.header);
        }
    }

    generateSlug(itemName) {
        return itemName.replace(/[^a-zA-Z0-9\-]/g, "");
    }

    validateFields() {

        $(".error-con").removeClass("error-con");
        $('.required.error-con').removeClass("error-con");
        $(".required").each(function (index, element) {
            var $this = $(element);
          
            $this.removeClass("error-con");
        
            if ($this.val() == "" && $this.val().length < 1) {
                $this.addClass("error-con");
            }
        })
    }

}

module.exports = BaseClassComponent;