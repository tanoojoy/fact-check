'use strict';
var React = require('react');
var EnumCoreModule = require('../../../../../public/js/enum-core');
var BaseComponent = require('../../../../shared/base');
const CommonModule = require('../../../../../public/js/common.js');

class ItemListTableComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            itemVisibilityMap: new Map(),
        }
    }
    componentDidMount() {
        const { items } = this.props;
        const temp = new Map();
        if (items && items.length > 0) {
            items.map(i => temp.set(i.ID, i.IsAvailable))
        }
        this.setState({ itemVisibilityMap: temp });


    }

    renderStock(item) {
        let quantities = 0;
        let hasUnlimitedStocks = false;
        let value = 0;
        const infinite = <span className="infinite-stock">&#8734;</span>;

        if (item.HasChildItems && item.ChildItems) {
            hasUnlimitedStocks = item.ChildItems.filter(c => c.Active === true && c.StockLimited === false).length > 0;

            item.ChildItems.forEach(function (child) {
                if (child.Active === true && child.StockLimited === true) {
                    quantities += parseInt(child.StockQuantity);
                }
            });

            if (hasUnlimitedStocks) value = infinite;
            if (quantities > 0) value = quantities;

        } else value = item.StockLimited ? item.StockQuantity : infinite;

        return value;
    }

    renderSKU(item) {
        const hasSKUValue = item.SKU && item.SKU.trim().length >= 1;
        return hasSKUValue ? `SKU: ${item.SKU.trim()}` : '';
    }

    renderBulkPricing(item) {
        if (item.HasChildItems && item.ChildItems) {
            let optionsCount = 0;
            item.ChildItems.forEach(function (child) {
                if (child.CustomFields) {
                    child.CustomFields.forEach(function (cf) {
                        if (cf.Name.toLowerCase() === "bulkpricing" && cf.Values) {
                            let bulkOptions = JSON.parse(cf.Values);
                            optionsCount = optionsCount + bulkOptions.length;
                        }
                    });
                }
            });

            //meaning no bulk pricing still we needed to show the variants
            //https://arcadier.atlassian.net/browse/ARC-8701
            if (optionsCount == 0) {
                return `${item.ChildItems.length} Options`
            }

            return optionsCount + ' Options';
        }

    }

    renderPriceRange(item) {
        let self = this;
        if (item.HasChildItems) {
            let prices = [];
            let currencyCode = item.CurrencyCode;
            if (item.ChildItems) {
                item.ChildItems.forEach(function (child) {
                    if (child.Active && child.Price != 'undefined' && child.Price != null) {
                        prices.push(child.Price);
                    }
                });
            }

            if (prices.length > 1) {
                let min = Math.min(...prices);
                let max = Math.max(...prices);

                return (
                    <React.Fragment>
                        {self.renderFormatMoney(item.CurrencyCode, min)} - {self.renderFormatMoney(item.CurrencyCode, max)}
                    </React.Fragment>
                )
            }

            return (
                <React.Fragment>
                    {self.renderFormatMoney(item.CurrencyCode, prices[0])}
                </React.Fragment>
            )
        }

        return '';
    }

    updatePurchasable(item, event, id) {
        var self = this;
        var checkedStatus = event.target.checked

        if (this.props.controlFlags.AdminVetting === true && item.IsVisibleToCustomer === false && item.IsAvailable === false) {
            this.showMessage(EnumCoreModule.GetToastStr().Error.FAILED_ITEM_VISIBILITY_UPDATE);
        } else {


            this.props.editItemPurchasable(item.ID, event.target.checked, function (result) {

                if (result == 'available') {
                    const updated = new Map(self.state.itemVisibilityMap);
                    updated.set(item.ID, checkedStatus);
                    self.setState({ itemVisibilityMap: updated });
                }
            });
            this.props.createLogForItemVisibilityUpdate(item.ID, event.target.checked);
        }
    }

    render() {
        const self = this;
        return (
            <React.Fragment>
                <table className="table order-data1 item-area">
                    <thead>
                        <tr>
                            <th>ITEM</th>
                            <th className="text-left">PRICE</th>
                            <th className="text-left">BULK PRICING</th>
                            <th>STOCK</th>
                            <th>APPROVED</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.items.map(function (item, index) {
                                let itemLink = "edit/" + item.ID;
                                let itemDetailsLink = CommonModule.getAppPrefix()+"/items/" + self.generateSlug(item.Name) + "/" + item.ID;
                                const itemAvailable = self.state.itemVisibilityMap.get(item.ID);

                                let IsAvailable = itemAvailable !== null && typeof itemAvailable !== 'undefined' ? itemAvailable : item.IsAvailable;

                                return (
                                    <tr className="item-row" key={item.ID} data-key="" data-id={item.ID}>
                                        <td data-th="ITEM">
                                            {/* <span className="sku-title text-left">{self.renderSKU(item)}</span>*/}
                                            <a><p className="sort-item-description text-left">{item.Name.substring(0, 300)}</p></a>
                                        </td>
                                        <td data-th="PRICE">
                                            <div className="item-price">
                                                {self.renderPriceRange(item)}
                                            </div>
                                        </td>
                                        <td data-th="BULK PRICING">
                                            {self.renderBulkPricing(item)}
                                        </td>
                                        <td data-th="Stock">
                                            {self.renderStock(item)}
                                        </td>
                                        <td data-th="Approved">
                                            <div className="onoffswitch">
                                                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={index + '-purchaseable'} checked={IsAvailable} onChange={(e) => self.updatePurchasable(item, e, index + '-purchaseable')} />
                                                <label className="onoffswitch-label" htmlFor={index + '-purchaseable'}> <span className="onoffswitch-inner"></span> <span className="onoffswitch-switch"></span> </label>
                                            </div>
                                        </td>
                                        <td data-th="">
                                            <div className="item-actions">
                                                <ul>
                                                    <li><a href={itemLink}><i className="icon icon-edit"></i></a></li>
                                                    <li><a href={null} className="delete_item" data-id="1"><i className="icon icon-delete" onClick={(e) => self.props.confirmDelete(item.ID)}></i></a></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}
module.exports = ItemListTableComponent;
