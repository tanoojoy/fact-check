'use strict';
var React = require('react');
const CountryComponent = require('./country');
const LocationComponent = require('./location');
const LocationListComponent = require('./location-list');

class PricingComponent extends React.Component {
    addItem(event) {
        event.preventDefault();
        this.props.uploadOrEditData();
    }

    render() {
        return (
            <React.Fragment>
                <div className="tab-container tabcontent mt-50 new-country" id="pricing_tab" style={{ display: 'none' }}>
                    <div className="tab-title">
                        <div className="tab-text">
                            <span>Pricing & Stock</span>
                        </div>
                    </div>
                    <div className="tab-content un-inputs">
                        <div className="item-form-element">
                            <LocationListComponent
                                locations={this.props.itemModel.locations}
                                selectedLocationIds={this.props.itemModel.selectedLocationIds}
                                addLocations={this.props.addLocations}
                                removeLocation={this.props.removeLocation}
                                removeAllLocations={this.props.removeAllLocations} />
                            <LocationComponent
                                {...this.props} />
                        </div>
                        <div className="col-md-12">
                            <div className="item-upload-btn">
                                <div className="un-btn-upload" id="btnItemUpload" onClick={(e) => this.addItem(e)}>
                                    <a href="#" onClick={(e) => e.preventDefault()}>Add Item</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = PricingComponent;