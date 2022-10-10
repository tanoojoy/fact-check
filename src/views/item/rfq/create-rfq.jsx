'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const BaseComponent = require('../../shared/base');

//const SidebarLayout = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const DetailComponent = require('./detail');
const QuantityComponent = require('./quantity');
const AdditionalInfoComponent = require('./additional-info');
// const PriceComponent = require('../quotation-detail/price');
// const ModalComponent = require('../quotation-detail/modal');
const itemDetailsActions = require('../../../redux/itemDetailsActions');
const chatActions = require('../../../redux/chatActions');
// const EnumCoreModule = require('../../../public/js/enum-core');
const CommonModule = require('../../../public/js/common');

import { typeOfSearchBlock } from '../../../consts/search-categories';
import { FREEMIUM_LIMITATION_POSITION } from '../../chat/limitation';
import { createRfq as createRfqPPs } from '../../../consts/page-params';
import { userRoles } from '../../../consts/horizon-user-roles';

import UnlockMoreResultsBanner from '../../common/unlock-more-results';

import { HeaderLayoutComponent as HeaderLayout } from '../../layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';

import { sendInviteColleaguesEmail, getUpgradeToPremiumPaymentLink } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';
import moment from 'moment';
import { chatConstants } from '../../../consts/chat-constants';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class CreateRfqComponent extends BaseComponent {
    constructor(props) {
        super(props);

        const { rfqFormDropdowns } = props;
        this.state = {            
            acceptingQuotesUntil: '',
            additionalFields: {},
            
            comment: '',
            documentsRequired: [],
            expectedTimeOfArrival: '',
            expectedTimeOfArrivalHuman: '',
            
            placeOfDelivery: '',
            preferredCurrency: '',
            preferredPackagingType: '',
            preferredPaymentTerms: '',
            
            quantity: 0,
            
            unit: '',
            
            expectedTimeOfArrivalDay: '',
            expectedTimeOfArrivalMonth: '',
            expectedTimeOfArrivalYear: 0,

            preferredIncoterms: '',
            selectedDocumentsLabel: 'You can select several'
        };

        const itemDetail = props.itemDetail;
        const customFields = itemDetail.CustomFields[0];
        const { Company } = customFields;
        this.trails = [{ name: 'Home', redirectUrl: '/' }, { name: Company.name, redirectUrl: `company/${Company.id}` }, { name: itemDetail.Name, redirectUrl: `/product-profile/profile/${Company.id}/${itemDetail.ID}` }];

        this.cancelRoute = `${CommonModule.getAppPrefix()}/product-profile/profile/${Company.id}/${itemDetail.ID}`;
    }

    componentDidMount() {
        const self = this;
        $(document).ready(function () {
            $('#datepicker').datetimepicker({
                format: 'DD/MM/YYYY'
            });
            $('#datepicker').on('dp.change', function(e) { 
                const { name, value } = e.currentTarget;
                if (name && value) {
                    const d = moment(value, 'DD/MM/YYYY').toISOString();
                    console.log(d);
                    self.setState({[name]: d});
                }
                console.log(e); 
            });

            $('.advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
                var $this = $(this);
                var $ul = $this.parents('ul');
                if ($this.is(":checked")) {
                    $ul.find('input[type=checkbox]').prop("checked", true);
                } else {
                    $ul.find('input[type=checkbox]').prop("checked", false);
                }
            });



            //sub with parent
            $('.advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
                var $this = $(this);
                var $ul = $this.parents('li.has-sub');
                if ($this.is(":checked")) {
                    $ul.find('input[type=checkbox]').prop("checked", true);
                } else {
                    $ul.find(' input[type=checkbox]').prop("checked", false);
                }
            });

            //Serching
            $('.advanced-select .q').on('keyup', function () {
                var input, filter, ul, li, a, i;
                input = $(this);
                filter = $.trim(input.val().toLowerCase());
                var div = input.parents('.dropdown').find('.dropdown-menu');
                div.find("li:not(.skip-li)").each(function () {
                    var $this = $(this).find('label');
                    if ($this.text().toLowerCase().indexOf(filter) > -1) {
                        $this.parents('li').show();
                    } else {
                        $this.parents('li').hide()
                    }
                })
            });

            //Count

            $('.advanced-select .x-check input[type=checkbox]').on('change', function () {
                var $control = $(this).parents('.advanced-select');
                var model = $control.data('model');
                var $input = $control.find('.trigger');
                var default_val = $input.attr('data-default');
                var checked = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked').length;
                $input.val(default_val);
                var newVal = '';
                $control.removeClass('choosen');
                if (checked === 1) {
                    newVal = $control.find('.x-check:not(.parent-check) input[type=checkbox]:checked + label').text();
                    $input.val(newVal);
                    $control.addClass('choosen');
                } else if (checked > 0) {
                    $control.addClass('choosen');
                    if (checked > 1) {
                        newVal = checked + ' ' + model + ' selected';
                        $input.val(newVal);
                    }
                } else {
                    $input.val(default_val);
                    newVal = default_val;
                    $control.removeClass('choosen');
                }
                console.log(newVal);
                self.setState({
                    selectedDocumentsLabel: newVal
                });
            });

            //Count on ready
            $('.advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');
            //Prevent dropdown to close
            $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {
                return false;
            });
            //
            $('.advanced-select .x-clear').click(function () {
                var $this = $(this);
                $this.parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');
            });

            //Close dropdown to click outside
            $('body').on('click', function (e) {
                var $target = $(e.target);
                if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                    $('.advanced-select .dropdown').removeClass('open');
                }
            });

            $('.advanced-select .trigger').on('click', function () {
                if ($(this).parent().hasClass('open')) {
                    $(this).parent().removeClass('open');
                } else {
                    $('.advanced-select .dropdown.open').removeClass('open');
                    $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
                }
            });

            //Toggle sub items

            $('.advanced-select li.has-sub .toggle-sub').on('click', function (e) {
                var $this = $(this);
                //$this.parents('.dropdown').addClass('open--');
                var $icon = $this.find('.x-arrow');
                var $ul = $this.next('.sub-items');
                $ul.slideToggle();
                //console.log( $this.parents('.dropdown').length );
                $this.parents('.dropdown').addClass('open');
                if ($icon.hasClass('x-arrow-down')) {
                    $icon.removeClass('x-arrow-down');
                    $icon.addClass('x-arrow-up');
                } else {
                    $icon.removeClass('x-arrow-up');
                    $icon.addClass('x-arrow-down');
                }
            });
        });

    }

    saveRfqDetails = () => {
        if (!this.quantityComponentRef.validateFields()) {
            return false;
        }
        const { user, itemDetail } = this.props;
        const [ otherInfo ] = itemDetail.CustomFields;
        const { acceptingQuotesUntil, additionalFields, comment, documentsRequired, 
            expectedTimeOfArrivalHuman, placeOfDelivery, preferredCurrency, 
            preferredPackagingType, preferredPaymentTerms, quantity, unit,
            expectedTimeOfArrival, preferredIncoterms } = this.state;

        const chatId = `chatcommon${this.props.user.companyId}${Date.now()}`;

        const rfq = {
            abilityToAddFields: true,
            buyerId: user.ID,
            casNumber: itemDetail.SKU,
            cgiCompanyId: otherInfo.Company.id,
            chatId,
            incoterms: preferredIncoterms,
            productId: otherInfo.Product.GroupId,
            productName: itemDetail.Name || '',
            productType: 'api',
            sellerId: otherInfo.Company.id ? otherInfo.Company.id.toString() : '',
            acceptingQuotesUntil, 
            additionalFields, 
            comment, 
            documentsRequired: JSON.stringify(documentsRequired),
            expectedTimeOfArrival, 
            expectedTimeOfArrivalHuman, 
            placeOfDelivery, 
            preferredCurrency, 
            preferredPackagingType, 
            preferredPaymentTerms, 
            quantity, 
            unit
        }

        this.props.createRFQ(rfq, (rfqData, chatUrl) => {
            const chatIdSplit = rfqData.chatId.split('|');
            const channelName = chatIdSplit[0];
            const sid = chatIdSplit[1];
            const userId = rfqData.sellerId;
            this.props.generateConversationToken('browser', userId, (convData) => {
                this.props.sendSystemMessage(channelName, sid, convData, chatConstants.systemName, chatConstants.RFQReceivedMsg, () => {
                    window.location.href = chatUrl;
                });
            });
        });
    }

    cancelQuotation() {
        
    }

    declineQuotation() {
        
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    onValueChange = (name, value) => {
        this.setState({[name]: value});
    }

    onDocumentChecked = (value, checked) => {
        let { documentsRequired } = this.state;
        if (checked) {
            documentsRequired = [...documentsRequired, { name: value }];
        }
        else {
            documentsRequired = documentsRequired.filter(r => r.name !== value);
        }
        this.setState({
            documentsRequired
        });
    }

    sendAndStartClicked = (e) => {
        this.saveRfqDetails();
    }

    render() {
        const { itemDetail, rfqFormDropdowns } = this.props;
        const { currenciesInfo, incoterms, requiredDocs, partOfMonth, months, years } = rfqFormDropdowns;        
        const { quantity, unit, preferredCurrency, preferredPackagingType, placeOfDelivery, preferredPaymentTerms, comment, documentsRequired, preferredIncoterms, expectedTimeOfArrival, acceptingQuotesUntil, selectedDocumentsLabel } = this.state;

        return (
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                /> 
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} setSearchCategory={this.props.setSearchCategory} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>
                <div className="main" style={{paddingTop: '95px'}}>       
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />      
                    <SearchPanel
                        hideLimitationToRoles={[userRoles.subMerchant]}
                        user={this.props.user}
                        position={FREEMIUM_LIMITATION_POSITION.rfq}
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />
                    <div className="rfq-container">
                        <div className="header-title-bg-area">
                            <div className="container">
                                <a className="btn-cancel-link" href={this.cancelRoute}><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="19.5" fill="#3D5FC0" stroke="#3D5FC0"/><path d="M23.41 15.41L22 14L16 20L22 26L23.41 24.59L18.83 20L23.41 15.41Z" fill="white"/></svg><span>Cancel</span></a>
                            </div>
                        </div>
                        <div className="cmn-mt-section">
                            <div className="container--fluid">
                                <form className="requestQuotation">
                                    <div className="ccard">
                                        <div className="ccard-header">
                                            <h4>Request for Quotation</h4>
                                        </div>
                                        <div className="ccard-body">
                                            <DetailComponent 
                                                itemDetail={itemDetail}
                                            />
                                            
                                            <QuantityComponent 
                                                quantity={quantity} 
                                                unit={unit} 
                                                onChange={this.onChange}
                                                ref={(ref) => this.quantityComponentRef = ref}
                                            />
                                            <hr />
                                            <AdditionalInfoComponent 
                                                acceptingQuotesUntil={acceptingQuotesUntil}
                                                preferredPackagingType={preferredPackagingType}
                                                placeOfDelivery={placeOfDelivery}
                                                preferredPaymentTerms={preferredPaymentTerms}
                                                comment={comment}
                                                onChange={this.onChange}
                                                onValueChange={this.onValueChange}
                                                preferredCurrency={preferredCurrency}
                                                currenciesInfo={currenciesInfo}
                                                preferredIncoterms={preferredIncoterms}
                                                incoterms={incoterms}
                                                documentsRequired={documentsRequired}
                                                requiredDocs={requiredDocs}
                                                expectedTimeOfArrival={expectedTimeOfArrival}
                                                partOfMonth={partOfMonth}
                                                months={months}
                                                years={years}
                                                onDocumentChecked={this.onDocumentChecked}
                                                selectedDocumentsLabel={selectedDocumentsLabel}
                                            />
                                        </div>
                                        <div className="ccard-footer">
                                            <div className="rfq-chart">
                                                <a className="link" href="javascript:void(0);">After sending the RFQ the chat will start</a>
                                                <button type="button" name="send" id="startChat" onClick={this.sendAndStartClicked}>{'Send & Start Chat'}</button>
                                            </div>                                            
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className='container'>
                                <UnlockMoreResultsBanner 
                                    user={this.props.user}
                                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                                    page={createRfqPPs.appString} 
                                />
                            </div>
                        </div>
                    </div>    
                </div>

                <div className="footer grey">
                    <FooterLayoutComponent user={this.props.user} />
                </div>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        itemDetail: state.itemsReducer.itemDetail, 
        rfqFormDropdowns: state.itemsReducer.rfqFormDropdowns,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        createRFQ: (rfq, callback) => dispatch(itemDetailsActions.createRFQ(rfq, callback)),
        generateConversationToken: (device, userid, callback) => dispatch(chatActions.generateConversationToken(device, userid, callback)),
        sendSystemMessage: (channelId, userId, conversationData, senderName, message, callback) => dispatch(chatActions.sendSystemMessage(channelId, userId, conversationData, senderName, message, callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    };
}

const CreateRfqHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateRfqComponent);

module.exports = {
    CreateRfqHome,
    CreateRfqComponent
};
