'use strict';
var React = require('react');
var toastr = require('toastr');

const Currency = require('currency-symbol-map');
var BaseComponent = require('../../../../../views/shared/base');
const CommonModule = require('../../../../../public/js/common');

class PurchaseOrderComponent extends BaseComponent {

    componentDidMount() {
        var self = this;
    }

    validateMOQ(customFields, quantity, callback) {
        let moq = 0;

        if (customFields) {

            customFields.forEach(function (customField) {
                if (customField.Name.toLowerCase() == 'moq') {
                    customField.Values.forEach(function (value) {
                        moq = parseFloat(value);
                    });
                }
            });
        }

        if (quantity >= moq) {
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            $('.minimum-order-not-met-error-container').show();
        }
    }

    validateComparison(itemId, callback) {
        const comparison = this.props.comparison;
        let existingComparisonDetail = {};

        if (comparison !== 'undefined' && $.isEmptyObject(comparison) === false) {
            if (comparison.ComparisonDetails) {
                existingComparisonDetail = comparison.ComparisonDetails.find(p => p.CartItem != null && p.CartItem.ItemDetail != null &&
                    p.CartItem.ItemDetail.ID === itemId && p.Offer == null);

                if (typeof callback === 'function') {
                    if (existingComparisonDetail) {
                        callback(existingComparisonDetail.CartItemID);
                    } else {
                        callback(null);
                    }
                }
            }
        }
    }

    getItemByCountry(parentItem, callback) {
        const self = this;
        let item = {};

        if (parentItem.HasChildItems && parentItem.ChildItems) {
            parentItem.ChildItems.forEach(function(child) {
                if (child.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    item = child;
                }
            });
        }

        if (typeof callback === 'function') {
            callback(item);
        }
    }

    getComparisonFields(parentItem) {
        let comparables = [];

        comparables.push({
            key: 'BuyerDescription',
            value: parentItem.BuyerDescription
        });

        comparables.push({
            key: 'ItemName',
            value: parentItem.Name
        });

        if (parentItem.CustomFields) {
            parentItem.CustomFields.forEach(function (customField) {
                if (customField.IsComparable === true) {
                    comparables.push({
                        key: customField.Code,
                        value: customField.Values.length > 1 ? JSON.stringify(customField.Values) : customField.Values[0]
                    });
                }
            })
        }

        return comparables;
    }

    negotiate() {
        const self = this;

        if (this.props.processing === true) {
            return;
        }

        $('.minimum-order-not-met-error-container').hide();
        $('.not-enough-stock-error-container').hide();
        $('.required').removeClass('error-con');

        if (self.props.user.Guest == true) {
            let loc = (location.pathname + location.search).substr(1);
            location.href = `${CommonModule.getAppPrefix()}/accounts/non-private/sign-in?returnUrl=${loc}`;
            return;
        }

        const userDetail = self.props.user;
        const itemDetail = self.props.itemDetails;

        if (userDetail.ID === itemDetail.MerchantDetail.ID) {
            toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        const parentItem = self.props.itemDetails;
        let item = self.props.itemDetails;
        const priceValues = self.props.priceValues;

        if (parentItem.HasChildItems) {
            if (process.env.PRICING_TYPE === 'country_level') {
                this.getItemByCountry(parentItem, function (result) {
                    item = result;
                })
            }
        }

        if (priceValues.quantity < 1) {
            toastr.error('Please enter quantity.', 'Error!');
            $('input[name="item-qty"]').addClass('error-con');
            return;
        }

        let MOQ = 0;
        if (item.CustomFields) {
            item.CustomFields.forEach(function (cf) {
                if (cf.Name === "MOQ" && cf.Values) {
                    MOQ = cf.Values[0];
                }
            });
            if (priceValues.quantity < parseFloat(MOQ)) {
                $('.minimum-order-not-met-error-container').show();
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }
        }

        if (item.StockLimited === true) {
            if ((parseInt(item.StockQuantity) - priceValues.quantity) < 0) {
                $('.not-enough-stock-error-container').show();
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }
        }

        this.props.setProcessing(true);

        const options = {
            pageSize: 999999,
            pageNumber: 1,
            includes: ['CartItemDetail', 'ItemDetail', 'User']
        }
        this.props.getUserChannels(options, function (channels) {
            let createNewChannel = false;
            let channel = null;

            //TODO: adjust API to include and check for open channels with pending offer
            if (channels && channels.TotalRecords === 0) {
                createNewChannel = true;
            }
            else {
                for (let i = 0; i < channels.TotalRecords; i++) {
                    let tempChannel = channels.Records[i];
                    if (tempChannel && tempChannel.ItemDetail) {
                        if (tempChannel.ItemDetail.ID === item.ID) {
                            channel = tempChannel;
                            break;
                        }
                        if (tempChannel && tempChannel.CartItemDetail && tempChannel.CartItemDetail.ItemDetail.ID === item.ID) {
                            channel = tempChannel;
                            break;
                        }
                    }
                }
                createNewChannel = !channel;

            }

            function getChatDetails(channel, callback) {
                if (channel) {
                    self.props.getChatDetails(channel.ChannelID, function (details) {
                        callback(details);
                    });
                } else {
                    callback();
                }
            }

            getChatDetails(channel, function (chatDetails) {
                if (chatDetails && chatDetails.Channel && chatDetails.Channel.Offer && chatDetails.Channel.Offer.Accepted) {
                    createNewChannel = true;
                }

                if (createNewChannel) {
                    self.props.createChatChannel({
                        recipientId: itemDetail.MerchantDetail.ID,
                        itemId: item.ID,
                        quantity: priceValues.quantity,
                        createCartItem: true
                    }, function (newChannel) {
                        if (newChannel && newChannel !== "") {
                            window.location = "/chat?channelId=" + newChannel.ChannelID;
                        }
                        else {
                            toastr.error('Error creating chat channel.', 'Error!');
                            self.props.setProcessing(false);
                        }
                    })
                }
                else {
                    toastr.error('You still have an open channel/offer for this item.', 'Oops! Something went wrong.');
                    window.location = "/chat?channelId=" + channel.ChannelID;
                }
            });
        });
    }

    getItemForCountry() {
        if (this.props.itemDetails.Media) {
            $('.item-main-thumbnail').attr('href', this.props.itemDetails.Media[0].MediaUrl);
            $('.item-main-thumbnail').attr('data-lightbox', this.props.itemDetails.Media.length > 1 ? 'gallery-group' : 'gallery');
            $('.item-main-thumbnail > img ').attr('src', this.props.itemDetails.Media[0].MediaUrl);
        }
        return this.props.itemDetails;
    }

    getItem() {

        const { HasChildItems, ChildItems } = this.props.itemDetails;
        const { selectedVariantIDs } = this.state;
        const selectedVariantArr = [...selectedVariantIDs.values()];
        // get child item with variants that matches the current selected variants
        if (HasChildItems && ChildItems.length > 0 && selectedVariantArr) {
            for (const ch in ChildItems) {
                const { Variants } = ChildItems[ch];
                if (Variants && Variants.length > 0 && Variants.length === selectedVariantArr.length) {
                    const VariantIds = Variants.map(v => v.ID);
                    const isMatch = selectedVariantArr.every(e => VariantIds.includes(e));
                    if (!isMatch) continue;
                    if (ChildItems[ch].Media && ChildItems[ch].Media.length > 0) {
                        $('.item-main-thumbnail').attr('href', ChildItems[ch].Media[0].MediaUrl)
                        $('.item-main-thumbnail').attr('data-lightbox', 'gallery')
                        $('.item-main-thumbnail > img ').attr('src', ChildItems[ch].Media[0].MediaUrl)
                    }
                    return ChildItems[ch];
                }
            }
        }

        $('.item-main-thumbnail').attr('href', this.props.itemDetails.Media[0].MediaUrl);
        $('.item-main-thumbnail').attr('data-lightbox', this.props.itemDetails.Media.length > 1 ? 'gallery-group' : 'gallery');
        $('.item-main-thumbnail > img ').attr('src', this.props.itemDetails.Media[0].MediaUrl);
        return this.props.itemDetails;

    }

    getItemPrice() {
        const parentItem = this.props.itemDetails;
        let price = this.props.itemDetails.Price;
        if (process.env.PRICING_TYPE === "variants_level") {
            const self = this;
            const { selectedVariantIDs } = this.state;
            if (selectedVariantIDs && selectedVariantIDs.size > 0) {
                price = this.getItem().Price || 0;
            }
        } else if (process.env.PRICING_TYPE === "country_level") {
            this.getItemByCountry(parentItem, function (result) {
                price = parseFloat(result.Price);
            })
        }

        return price;
    }

    fadeOutCart() {
        var target = $(".h-cart .h-dd-menu.add-cart");
        setTimeout(function () {
            target.removeClass('fadeout');
        }, 3000);
    }

    isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
            return true;
        }
        return false;
    }

    handleAddToCartSuccess() {
        const { CurrencyCode, Media, Name } = this.props.itemDetails;
        const { priceValues } = this.props;
        this.getLatestCartList();
        const cartSubTotal = (parseFloat(priceValues.bulkPrice)).toFixed(2);

        $(".h-cart .h-dd-menu.add-cart").addClass('fadeout');
        $('.h-cart .h-dd-menu.add-cart.fadeout').css('display', '');

        if (process.env.PRICING_TYPE === "variants_level") {
            const addedItem = this.getItem();
            $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-img > img').attr('src', addedItem.Media[0].MediaUrl || Media[0].MediaUrl);
        } else {
            const addedItem = this.getItemForCountry();
            $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-img > img').attr('src', addedItem.Media[0].MediaUrl || Media[0].MediaUrl);
        }

        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > p').text(Name);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .currency').text(`${CurrencyCode} ${Currency(CurrencyCode)}`);
        $('.h-cart .h-dd-menu.add-cart.fadeout > .h-cart-mid > ul > .cart-item > .item-info > .item-price > .value').text(cartSubTotal);
        //this.props.updateSubTotal(0, this.getItemPrice());
        $('input[name="item-qty"]').val('');

        $('html, body').animate({
            'scrollTop': $(".h-cart").position().top
        });
        var itemImg = $(".idclt-img > img");
        if (!this.isMobile()) {
            var t = window.flyToElement($(itemImg), $('.h-cart'));
        }
        this.fadeOutCart();
        return false;
    }

    getLatestCartList() {

        let guestUserID = "";
        //if (!this.props.user) {
        //    if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
        //        guestUserID = CommonModule.getCookie("guestUserID");
        //    }
        //}

        if (this.props.user && this.props.user.Guest !== undefined) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }
        if (!this.props.user) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }

        const options = {
            pageSize: 999999,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        }
        this.props.getUserCarts(options, null);
    }

    addItemToCart(e) {
        const self = this;

        if (this.props.processing === true) {
            return;
        }

        $('.minimum-order-not-met-error-container').hide();
        $('.not-enough-stock-error-container').hide();
        $('.required').removeClass('error-con');

        if (self.props.user.Guest && self.props.controlFlags.GuestCheckoutEnabled === false) {
            toastr.error('Feature not available yet for guest user.')
            return;
        }

        let hasEmpty = false;
        $('.idcrt-order-val .required').each(function () {
            if ($.trim(jQuery(this).val()) == '') {
                hasEmpty = true;
                $(this).addClass('error-con');
            }
        });
        if (hasEmpty == true) return;

        const parentItem = this.props.itemDetails;
        const { HasChildItems, ChildItems } = parentItem;
        if (process.env.PRICING_TYPE === "variants_level") {
            if (HasChildItems && ChildItems.length > 0) {
                if (ChildItems[0].Variants && ChildItems[0].Variants.length > 0) {
                    if (this.state.selectedVariantIDs.size !== ChildItems[0].Variants.length) {
                        return;
                    }
                }
            }
        }
        let item = null;
        if (process.env.PRICING_TYPE === "variants_level") {
            item = this.getItem();
        } else if (process.env.PRICING_TYPE === "country_level") {
            this.getItemByCountry(parentItem, function (result) {
                item = result;
            })
        }
        const { priceValues } = this.props;
        if (priceValues.quantity < 1) {
            toastr.error('Please enter quantity.', 'Error!');
            $('input[name="item-qty"]').addClass('error-con');
            return;
        }

        let MOQ = 0;
        if (item.CustomFields) {
            item.CustomFields.forEach(function (cf) {
                if (cf.Name === "MOQ" && cf.Values) {
                    MOQ = cf.Values[0];
                }
            });
            if (priceValues.quantity < parseFloat(MOQ)) {
                $('.minimum-order-not-met-error-container').show();
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }
        }

        if (item.StockLimited === true) {
            if ((parseInt(item.StockQuantity) - priceValues.quantity) < 0) {
                $('.not-enough-stock-error-container').show();
                $('input[name="item-qty"]').addClass('error-con');
                return;
            }
        }

        if (this.props.user && parentItem.MerchantDetail.ID === this.props.user.ID) {
            toastr.error('This item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        this.props.setProcessing(true);

        let guestUserID = "";
        if (!this.props.user) {
            if (CommonModule.getCookie("guestUserID") && CommonModule.getCookie("guestUserID") !== "") {
                guestUserID = CommonModule.getCookie("guestUserID");
            }
        }

        const options = {
            pageSize: 999999,
            pageNumber: 1,
            includes: null,
            guestUserID: guestUserID
        };

        //remove this function call since we need to add new cartitem
        //every cart may have different bulk discount
        this.props.getUserCarts(options, function (cartList) {
            //const itemExistsInCart = cartList.find(cl => cl.ItemDetail.ID == item.ID);
            //const cartItemId = itemExistsInCart ? itemExistsInCart.ID : null;

            let quantityToPass = priceValues.quantity;
            //if (itemExistsInCart) {
            //    quantityToPass = parseInt(priceValues.quantity) + parseInt(itemExistsInCart.Quantity);
            //}

            self.props.addOrEditCart(null, quantityToPass, priceValues.discount, item.ID, true, false,
                (cartItem) => self.handleAddToCartSuccess(),
                (errorMessage) => {
                    self.showMessage({
                        ...errorMessage,
                        body: 'Item visibility has been disabled (by marketplace Administrator or Merchant).'
                    });
                }
            )
        });
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        setTimeout(function () {
            self.props.setProcessing(false);
        }, 1000);
    }

    formatNumberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    renderPrice() {
        let self = this;
        if (this.props.itemDetails.ChildItems != null) {
            let ele = this.props.itemDetails.ChildItems.map(function (itemDetail, index) {
                if (itemDetail.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    return (
                        <div key={index} className="item-price">
                            {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, itemDetail.Price)}
                        </div>
                    )
                }
            })
            return ele;
        } else {
            return (
                <div className="item-price">
                    {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.itemDetails.Price)}
                </div>
            )
        }
    }

    render() {
        let self = this;
        let priceValue = this.props.itemDetails.Price;
        let bulks = [];
        let moq = 0;

        let isNegotiate = "";
        let isSpotPurchase = "";

        if (this.props.itemDetails && this.props.itemDetails.InstantBuy === false) {
            isSpotPurchase = "hide";
        }

        if (this.props.itemDetails && this.props.itemDetails.Negotiation === false) {
            isNegotiate = "hide";
        }

        if (this.props.itemDetails.ChildItems != null) {
            this.props.itemDetails.ChildItems.forEach(function (itemDetail) {
                if (itemDetail.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    priceValue = itemDetail.Price;
                    if (itemDetail.CustomFields != null) {
                        itemDetail.CustomFields.forEach(function (childCustomField) {
                            if (childCustomField.Name.toLowerCase() == 'moq') {
                                childCustomField.Values.forEach(function (value) {
                                    moq = parseFloat(value).toFixed();
                                });
                            }
                            if (childCustomField.Name.toLowerCase() == 'bulkpricing') {
                                childCustomField.Values.forEach(function (value) {
                                    let parsebulk = JSON.parse(value);
                                    parsebulk.forEach(function (bulk) {
                                        let bulkValues = {
                                            ID: bulk.Id,
                                            RangeStart: bulk.RangeStart,
                                            RangeEnd: bulk.RangeEnd,
                                            isPercentage: bulk.IsFixed == '0' ? true : false,
                                            Discount: bulk.Discount,
                                            OnwardPrice: bulk.OnwardPrice
                                        };
                                        bulks.push(bulkValues);
                                    })
                                })
                            }
                        })
                    }
                }
            });
        }
        return (
            <div className="idcr-top pull-left w-100">
                <div className="idcrt-order-val pull-left w-100">
                    <span className="idcrt-title">Purchase Order</span>
                    <div className="idcrt-list-val">
                        <span className="idcrtl-price full-width">
                            <span className="title">Price per item:</span>
                            <span className="idcrtl-right">
                                {this.renderPrice()}
                            </span>
                        </span>
                        <span className="idcrtl-qty full-width">
                            <span className="title">Quantity:</span>
                            <span className="idcrtl-right">
                                <input name="item-qty" type="number" onChange={(e) => this.props.updateQuantity(e, priceValue, bulks)} className="numbersOnlyD idcrt-order-val required" min="0" />
                                <span className="quantity-alert" style={{ display: 'none' }} />
                            </span>
                        </span>
                        <span className="idcrtl-moq full-width">
                            <span className="title">Minimum Order:</span>
                            <span className="idcrtl-right">
                                <span className="moq-val">{this.formatNumberWithCommas(moq)}</span>
                            </span>
                        </span>
                        <div className="error-message full-width">
                            <p className="not-enough-stock-error-container" style={{ display: 'none' }}>Not enough stock</p>
                            <p className="minimum-order-not-met-error-container" style={{ display: 'none' }}>Minimum order not met</p>
                        </div>
                    </div>
                </div>
                <div className="idcrt-order-total group-buy pull-left w-100">
                    <span className={"pull-left realPrice " + self.props.haveBulk}>Original Price:</span>
                    <span className={"total-price pull-right " + self.props.haveBulk}>
                        <div className="realPrice">
                            <del>
                                {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.priceValues.originalPrice)}
                            </del>
                        </div>
                    </span>
                    <div className="clearfix"></div>
                    <span className="pull-left">Sub Total:</span><span className="total-price pull-right">
                        <div className="item-price">
                            {self.renderFormatMoney(self.props.itemDetails.CurrencyCode, self.props.priceValues.bulkPrice)}
                        </div>
                    </span>
                </div>
                <div className="idcrt-order-btn pull-left w-100">
                    <div className={"btn-cart compare-btn " + isSpotPurchase} id="itemAddCart" onClick={(e) => this.addItemToCart(e)}>Add to Cart</div>
                    <div className={"btn-group contact-btn " + isNegotiate} id="negotiate" onClick={() => this.negotiate()}>Negotiate</div>
                </div>
            </div>
        );
    }
}

module.exports = PurchaseOrderComponent;
