'use strict';
const React = require('react');
const BaseComponent = require('../../../../../views/shared/base');
const BreadcrumbComponent = require('../../../../../views/item/breadcrumb');
const ItemCustomFieldsComponent = require('../../../../../views/item/item-custom-fields');

const ItemInfoComponent = require('./item-info');
const SellerInfoComponent = require('./seller-info');
const PurchaseOrderComponent = require('./purchase-order');
const ReviewsComponent = require('./reviews.jsx');
var ComparisonWidgetComponent = require('../../../../comparison/comparison-widget/index');

var ComparisonActions = require('../../../../../redux/comparisonActions');
const itemDetailActions = require('../../../../../redux/itemDetailsActions');
const ChatActions = require('../../../../../redux/chatActions');
const CartActions = require('../../../../../redux/cartActions');
const userActions = require('../../../../../redux/userActions');
const actionTypes = require('../../../../../redux/actionTypes');

class ItemDetailMainComponent extends BaseComponent {

    showHideWidget(isShow) {
        if (typeof isShow === 'undefined') {
            $('.compare-desk').toggleClass('active');
        } else if (isShow === true) {
            $('.compare-desk').addClass('active');
        } else {
            $('.compare-desk').removeClass('active');
        }

        if ($('.compare-desk').hasClass('active')) {
            $('.toggle-btn-compare i').addClass('fa-angle-down');
            $('.toggle-btn-compare i').removeClass('fa-angle-up');
        } else {
            $('.toggle-btn-compare i').removeClass('fa-angle-down');
            $('.toggle-btn-compare i').addClass('fa-angle-up');
        }
    }

    renderDefaultPaymentTerm() {
        if (this.props.paymentTerms && this.props.paymentTerms.length > 0) {
            const defaultPaymentTerm = this.props.paymentTerms.find(p => p.Default);
            if (!defaultPaymentTerm) return;
            return (
                <div className="idcrb-bot">
                    <span className="title">Payment Terms</span>
                    <div className="payment-terms-box">
                        <div><span className="title">{defaultPaymentTerm.Name}</span></div>
                        <div>{defaultPaymentTerm.Description}</div>
                    </div>
                </div>
            );
        }
        return;
    }
    render() {
        let percentage = 0;
        if (this.props.feedback) {
            percentage = this.props.feedback.PositiveFeedbackPercentage;
        }
        return (
            <React.Fragment>
                <div className="item-detail-container">
                    <div className="container">
                        <BreadcrumbComponent itemDetails={this.props.itemDetails} />
                        <div className="idc-left">
                            <ItemInfoComponent countryCode={this.props.countryCode} ReviewAndRating={this.props.ReviewAndRating} itemDetails={this.props.itemDetails} PositiveFeedbackPercentage={percentage} />
                            <SellerInfoComponent merchantDetails={this.props.merchantDetails}
                                countryCode={this.props.countryCode}
                                getUserChannels={this.props.getUserChannels}
                                createChatChannel={this.props.createChatChannel}
                                itemDetails={this.props.itemDetails}
                                priceValues={this.props.priceValues}
                                user={this.props.user}
                                addOrEditCart={this.props.addOrEditCart}
                                deleteCartItem={this.props.deleteCartItem}
                                comparison={this.props.comparison}
                                createComparisonDetail={this.props.createComparisonDetail}
                                updateComparisonDetail={this.props.updateComparisonDetail}
                                showHideWidget={this.showHideWidget}
                                processing={this.props.processing}
                                setProcessing={this.props.setProcessing}
                                controlFlags={this.props.controlFlags}
                                getChatDetails={this.props.getChatDetails}
                            />
                            <ItemCustomFieldsComponent itemDetails={this.props.itemDetails} decodeHTMLEntities={this.decodeHTMLEntities} />
                            <ReviewsComponent
                                itemDetails={this.props.itemDetails}
                                user={this.props.user}
                                feedback={this.props.feedback}
                                ReviewAndRating={this.props.ReviewAndRating}
                                selectedFeedBack={this.props.selectedFeedBack}/>
                        </div>
                        <div className="idc-right">
                            <PurchaseOrderComponent
                                itemDetails={this.props.itemDetails}
                                addOrEditCart={this.props.addOrEditCart}
                                updateSubTotal={this.props.updateSubTotal}
                                priceValues={this.props.priceValues}
                                processing={this.props.processing}
                                setProcessing={this.props.setProcessing}
                                getUserCarts={this.props.getUserCarts}
                                user={this.props.user}
                                getUserChannels={this.props.getUserChannels}
                                createChatChannel={this.props.createChatChannel}
                                updateUserInfo={this.props.updateUserInfo}
                                controlFlags={this.props.controlFlags}
                                getChatDetails={this.props.getChatDetails}
                            />
                            {this.renderDefaultPaymentTerm()}
                        </div>
                    </div>
                </div>
                <ComparisonWidgetComponent
                    comparisonList={this.props.comparisonList}
                    comparison={this.props.comparison}
                    comparisonToUpdate={this.props.comparisonToUpdate}
                    comparisonDetailToUpdate={this.props.comparisonDetailToUpdate}
                    getUserComparisons={this.props.getUserComparisons}
                    getComparison={this.props.getComparison}
                    createComparison={this.props.createComparison}
                    editComparison={this.props.editComparison}
                    setComparisonToUpdate={this.props.setComparisonToUpdate}
                    setComparisonDetailToUpdate={this.props.setComparisonDetailToUpdate}
                    controlFlags={this.props.controlFlags}
                    user={this.props.user}
                    deleteComparisonDetail={this.props.deleteComparisonDetail} />

            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        merchantDetails: state.merchantReducer.user,
        paymentTerms: state.merchantReducer.paymentTerms,
        user: state.userReducer.user,
        countryCode: state.itemsReducer.countryCode,
        itemDetails: state.itemsReducer.items,
        priceValues: state.itemsReducer.priceValues,
        customFieldsDefinitions: state.itemsReducer.customFieldsDefinitions,
        processing: state.itemsReducer.processing,
        feedback: state.itemsReducer.feedback,
        ReviewAndRating: state.itemsReducer.ReviewAndRating,
        message: state.itemsReducer.message,
        //Comparison Widget
        comparisonList: state.comparisonReducer.comparisonList,
        comparison: state.comparisonReducer.comparison,
        comparisonToUpdate: state.comparisonReducer.comparisonToUpdate,
        comparisonDetailToUpdate: state.comparisonReducer.comparisonDetailToUpdate,
        controlFlags: state.marketplaceReducer.ControlFlags
    };
}

function mapDispatchToProps(dispatch) {
    return {
        contactSeller: () => dispatch({ type: actionTypes.LATEST_ITEMS }),
        updateSubTotal: (quantity, price) => dispatch(itemDetailActions.updateSubTotal(quantity, price)),
        addOrEditCart: (cartItemId, quantity, discount, itemId, force, isComparisonOnly, successCallback, failedCallback) => dispatch(itemDetailActions.addOrEditCart(cartItemId, quantity, discount, itemId, force, isComparisonOnly, successCallback, failedCallback)),
        getUserCarts: (options, callback) => dispatch(CartActions.getUserCarts(options, callback)),
        deleteCartItem: (cartItemId, userId) => dispatch(CartActions.deleteCartItem(cartItemId, userId)),
        setProcessing: (processing) => dispatch({ type: actionTypes.PROCESSING, processing: processing }),
        getUserChannels: (options, callback) => dispatch(ChatActions.getUserChannels(options, callback)),
        createChatChannel: (options, callback) => dispatch(ChatActions.createChannel(options, callback)),
        getChatDetails: (channelId, callback) => dispatch(ChatActions.getChatDetails(channelId, callback)),
        updateUserInfo: (userInfo) => dispatch(userActions.updateUserInfo(userInfo)),
        selectedFeedBack: (feedbackId) => dispatch(itemDetailActions.selectedFeedBack(feedbackId)),
        addReplyFeedBack: (message) => dispatch(itemDetailActions.addReplyFeedBack(message)),
        updateMessage: (message) => dispatch(itemDetailActions.updateMessage(message)),
        //Comparison Widget
        getUserComparisons: (createIfEmpty, namesOnly, pageSize) => dispatch(ComparisonActions.getUserComparisons(createIfEmpty, namesOnly, pageSize)),
        getComparison: (id, includes) => dispatch(ComparisonActions.getComparison(id, includes)),
        createComparison: (name) => dispatch(ComparisonActions.createComparison(name)),
        editComparison: (name) => dispatch(ComparisonActions.editComparison(name)),
        setComparisonToUpdate: (id) => dispatch(ComparisonActions.setComparisonToUpdate(id)),
        setComparisonDetailToUpdate: (id) => dispatch(ComparisonActions.setComparisonDetailToUpdate(id)),
        deleteComparisonDetail: () => dispatch(ComparisonActions.deleteComparisonDetail()),
        createComparisonDetail: (cartItemId, includes, comparisonFields) => dispatch(ComparisonActions.createComparisonDetail(cartItemId, includes, comparisonFields)),
        updateComparisonDetail: (cartItemId, quantity, subTotal, discountAmount) => dispatch(ComparisonActions.updateComparisonDetail(cartItemId, quantity, subTotal, discountAmount)),
    }
}


module.exports = {
    mapStateToProps,
    mapDispatchToProps,
    ItemDetailMainComponent
}
