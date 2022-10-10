'use strict';
var React = require('react');
var toastr = require('toastr');

class SellerInfoComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedVariantIDs: new Map(),
        }
    }

    componentDidMount() {
        const self = this;
        $('select').on('change', function () {
            const groupID = $(this).attr('data-group-id');
            self.setState({
                selectedVariantIDs: self.state.selectedVariantIDs.set(groupID, this.value)
            })
        });
    }      

    getItemByCountry(parentItem, callback) {
        const self = this;
        let item = {};

        if (parentItem.HasChildItems && parentItem.ChildItems) {
            parentItem.ChildItems.forEach(function (child) {
                if (child.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                    item = child;
                }
            })
        }

        if (typeof callback === 'function') {
            callback(item);
        }
    }

    contactSupplier() {
        const self = this;
        const userDetail = self.props.user;
        const itemDetail = self.props.itemDetails;

        if (this.props.processing == true) return;
        
        if (userDetail.ID === itemDetail.MerchantDetail.ID) {
            toastr.error('Cannot open chat, this item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }
       
        this.props.setProcessing(true);

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

        const options = {
            pageSize: 999999,
            pageNumber: 1,
            includes: ['CartItemDetail', 'ItemDetail', 'User']
        }
        self.props.getUserChannels(options, function (channels) {
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
                        quantity: 0,
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

    compare() {
        const self = this;

        function validateMOQ(customFields, quantity, callback) {
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

        function validateComparison(itemId, callback) {
            const comparison = self.props.comparison;
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

        function getComparisonFields(parentItem) {
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

        function getItemByCountry(parentItem, callback) {
            let item = {};

            if (parentItem.HasChildItems && parentItem.ChildItems) {
                parentItem.ChildItems.forEach(function (child) {
                    if (child.Tags[0].toLowerCase() == self.props.countryCode.toLowerCase()) {
                        item = child;
                    }
                })
            }

            if (typeof callback === 'function') {
                callback(item);
            }
        }

        function getItem() {
            const { HasChildItems, ChildItems } = self.props.itemDetails;
            const { selectedVariantIDs } = self.state;
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
            if (self.props.itemDetails.Media) {
                $('.item-main-thumbnail').attr('href', self.props.itemDetails.Media[0].MediaUrl);
                $('.item-main-thumbnail').attr('data-lightbox', self.props.itemDetails.Media.length > 1 ? 'gallery-group' : 'gallery');
                $('.item-main-thumbnail > img ').attr('src', self.props.itemDetails.Media[0].MediaUrl);
            }
            return self.props.itemDetails;
        }

        if (self.props.processing === true) {
            return;
        }

        const parentItem = self.props.itemDetails;
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
            item = getItem();
        } else if (process.env.PRICING_TYPE === "country_level") {
            getItemByCountry(parentItem, function (result) {
                item = result;
            });
        }

        const { priceValues } = this.props;

        if (this.props.user && parentItem.MerchantDetail.ID === this.props.user.ID) {
            toastr.error('This item seems to belong to you.', 'Oops! Something went wrong.');
            return;
        }

        this.props.setProcessing(true);

        validateComparison(item.ID,
            function (comparisonCartItemId) {
                self.props.addOrEditCart(comparisonCartItemId, priceValues.quantity, priceValues.discount, item.ID, true, true,
                    function (cartItem) {
                        if (comparisonCartItemId !== cartItem.ID) {
                            self.props.createComparisonDetail(cartItem.ID, 'CartItem', getComparisonFields(parentItem));
                            self.props.deleteCartItem(cartItem.ID, self.props.user.ID);
                        } else {
                            self.props.updateComparisonDetail(cartItem.ID, cartItem.Quantity, cartItem.SubTotal, cartItem.DiscountAmount);
                        }

                        self.props.showHideWidget(true);
                    },
                    function (errorMessage) {
                        toastr.error(errorMessage, 'Oops! Something went wrong.');
                    }
                )
            }
        )

        setTimeout(function () {
            self.props.setProcessing(false);
        }, 1000);
    }

    renderCompareLink() {
        const self = this;
        if (self.props.controlFlags && self.props.controlFlags.ComparisonEnabled === true) {
            return (
                <a onClick={() => self.compare()} className="blue-ico-link" href="#">
                    <i className="fa fa-th-list"></i>
                    Compare
                </a>
            );
        }
        else {
            return null;
        }
    }

    render() {
        let self = this;
        let storeFrontUrl = "/storefront/" + self.props.merchantDetails.ID;
        let merchantImage = "";

        let isNegotiate = "";
        if (self.props.itemDetails.Negotation === false) {
            isNegotiate = "hide";
        }

        if (self.props.merchantDetails.Media && self.props.merchantDetails.Media.length > 0 && self.props.merchantDetails.Media[self.props.merchantDetails.Media.length - 1]) {
            merchantImage = self.props.merchantDetails.Media[self.props.merchantDetails.Media.length - 1].MediaUrl;
        }
        
        return (
            <div className="idcl-mid">
                <div className="idclm-content">
                    <div className="idclmc-img">
                        <span className="helper"></span> <img src={merchantImage} />
                    </div>
                    <div className="idclmc-name">
                        <a href={storeFrontUrl} className="seller-name">{self.props.merchantDetails.DisplayName}</a>
                    </div>
                    <div className="idclmc-contact">
                        <a onClick={() => this.contactSupplier()} className={"blue-ico-link " + isNegotiate} href="#">
                            <i className="fa fa-envelope"></i>
                            Contact Supplier
                        </a>
                        {this.renderCompareLink()}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SellerInfoComponent;