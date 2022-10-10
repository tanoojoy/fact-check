'use strict';
var React = require('react');

var BaseComponent = require('../shared/base');
const CommonModule = require('../../public/js/common.js');

class ItemsHomeComponent extends BaseComponent {

    constructor(props) {
        super(props);
    }

    itemUrl(itemName, itemId) {
        return CommonModule.getAppPrefix()+"/items/" + this.generateSlug(itemName) + "/" + itemId;
    }

    getPrice(item) {
        const { PRICING_TYPE } = process.env;
        const { user, userPreferredLocationId } = this.props;

        //Guest Logic
        if (PRICING_TYPE == 'country_level' && (typeof user === 'undefined' || !userPreferredLocationId)) {
            return 0;
        }

        return item.Price == null && (item.HasChildItems && item.ChildItems != null && item.ChildItems.length > 0) ? item.ChildItems[0].Price : item.Price;
    }

    render() {
        var self = this;
        return (
            <div className="latest-item-list">
                <div className="container">
                    <div className="section-title">
                        <h3>Latest</h3>
                        <div className="divider"></div>
                    </div>
                    <div className="row">
                        {Array.from(this.props.items.slice(0, (self.props.layoutItemCount))).map(function (item, index) {
                            let imgSrc = "";
                            if (item.Media) {
                                imgSrc = item.Media[0].MediaUrl
                            }
                            return (<div className="col-md-2 col-sm-4 col-xs-6 xs-mb-15" key={item.ID}>
                                <a href={self.itemUrl(item.Name, item.ID)} className="item-box-small">
                                    <div className="item-image">
                                        <img data-src={imgSrc} alt={item.Name} title={item.Name} className="img-responsive lazyload" />
                                    </div>
                                    <div className="item-detail">
                                        <h4 className="item-name">{item.Name}</h4>
                                        <div className="item-price">
                                            {self.renderFormatMoney(item.CurrencyCode, self.getPrice(item))}
                                        </div>
                                    </div>
                                </a>
                            </div>);
                        })}

                        <div className="vew-more-btn text-center">
                            <a href={CommonModule.getAppPrefix()+"/search"} className="more-btn">View More <i className="fa fa-angle-right"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    ItemsHomeComponent
}
