'use strict';
const React = require('react');
const BaseComponent = require('../../shared/base');

/*const QuantityComponent = ({quantity, unit, onChange}) => {*/
class QuantityComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false
        }
    }

    //onValueChanged = (e) => {
    //    const { name, value } = e.target;
    //    if (name === 'quantity' && !value) {
    //        errorConQuantity = 'error-con';
    //    }
    //    if (name === 'unit' && !value) {
    //        errorConUnit = 'error-con';
    //    }
    //    if (errorConQuantity || errorConUnit) {
    //        return;
    //    }
    //    onChange(e);
    //}

    validateFields = () => {
        const { quantity, unit } = this.props;
        if (!quantity || Number(quantity) < 1 || !unit) {
            this.setState({
                hasError: true
            });
            return false;
        }
        return true;
    }

    render() {
        const { quantity, unit, onChange } = this.props;
        let errorConQuantity = '';
        let errorConUnit = '';

        if (this.state.hasError) {
            if (!quantity) {
                errorConQuantity = 'error-con';
            }
            if (!unit) {
                errorConUnit = 'error-con';
            }
        }

        return (
            <div className="row">
                <div className="col-sm-4">
                    <label for="quantity">{'Quantity & Unit *'}</label>
                </div>
                <div className="col-sm-4">
                    <div className="form-group">
                        <input type="text" className={`numbersOnly form-control required ${errorConQuantity}`} id="quantity" name="quantity" placeholder="Quantity" value={quantity > 0 ? quantity : ''} onChange={onChange} />
                    </div>
                </div>
                <div className="col-sm-4">
                    <div className="form-group">
                        <input type="text" className={`form-control required ${errorConUnit}`} id="unit" name="unit" placeholder="unit" value={unit} onChange={onChange} />
                    </div>
                </div>
            </div>
        )
    }
    
};

module.exports = QuantityComponent;