import React, { Component } from 'react';
import { string, bool, object } from 'prop-types';
import { get } from 'lodash';
import axios from 'axios';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../../header';
import { getAppPrefix } from '../../../../public/js/common';
import ProductMainInfo from './product-main-info';
import RequiredFields from './required-fileds';
import AdditionalInfo from './additional-info';
import FormFooter from './form-footer';
import RfqStatus from './rfq-status';
import PreviousPageBtn from '../../horizon-components/previous-page-btn';
import { chatConstants } from '../../../../consts/chat-constants';
import MainContent from '../../horizon-components/main-content';
import HorizonFooterComponent from '../../horizon-components/footer';
import UnlockMoreResultsBanner from '../../horizon-components/unlock-more-results-banner';
import { createRfq as createRfqPPs } from '../../../../consts/page-params';
import BreadcrumbsBlock from '../../horizon-components/breadcrumbs-block';
import { LimitationBlockFreemium, FREEMIUM_LIMITATION_POSITION } from '../../horizon-components/limitation-block-freemium';
import { isFreemiumUserSku } from '../../../../utils';
import { userRoles } from '../../../../consts/horizon-user-roles';

export class CreateRFQ extends Component {
    constructor(props) {
        super(props);
        const user = get(props, 'user', {});
        const product = get(props, 'productDetails.product', {});
        const sellerCompany = get(props, 'productDetails.company', {});
        this.state = {
            abilityToAddFields: true,
            acceptingQuotesUntil: '',
            additionalFields: {},
            buyerId: user.ID,
            casNumber: product.cas,
            cgiCompanyId: sellerCompany.id,
            chatId: 'string',
            comment: '',
            documentsRequired: [],
            expectedTimeOfArrival: '',
            expectedTimeOfArrivalHuman: '',
            incoterms: '',
            placeOfDelivery: '',
            preferredCurrency: '',
            preferredPackagingType: '',
            preferredPaymentTerms: '',
            productId: product.groupId,
            productName: product.mainName || '',
            productType: 'api',
            quantity: 0,
            sellerId: sellerCompany.id ? sellerCompany.id.toString() : '',
            unit: ''
        };
    }

    // ToDo: template, in this method you need to create chart with using data from this.state and return chartId
    getChatId() {
        const props = this.props;
        const user = get(props, 'user', {});
        const product = get(props, 'productDetails.product', {});
        const sellerCompany = get(props, 'productDetails.company', {});
        return `chat${user.ID}${product.cas}${sellerCompany.id}${Date.now()}`;
    }

    createChat() {
        this.setState({ chatId: this.getChatId() }, this.sendForm);
    }

    sendSystemMessage(message, chatId, redirectUrl){
        const systemName = chatConstants.systemName;
        return axios.get(`${getAppPrefix()}/product-profile/token/${systemName}`).then(data => {
            data = data.data;
            return Twilio.Chat.Client.create(data.token).then(client => {
                const chatClient = client;
                return chatClient.getChannelByUniqueName(chatId)
                    .then(function(channel) {
                        channel.join().finally(() => {
                            return channel.sendMessage(message).then(() => {
                                window.location = redirectUrl;
                            });
                        }).catch(() => {});
                    })
                    .catch(() => {
                        return chatClient.createChannel({
                            uniqueName: chatId,
                            friendlyName: 'Chat over product'
                        }).then(function(channel) {
                            channel.join().finally(() => {
                                channel.sendMessage(message).then(() => {
                                    window.location = redirectUrl;
                                });
                            });
                        }).catch(function(channel) {
                            console.log('Channel could not be created:');
                            console.log(channel);
                        });
                    });
            }).catch(error => {
                console.error(error);
            });
        });
    }

    sendForm() {
        console.log('data of form', this.state);
        const { chatId } = this.state;
        axios
            .post(`${getAppPrefix()}/product-profile/send-rfq`, {
                form: JSON.parse(JSON.stringify(this.state))
            })
            .then((response) => {
                console.log(response);
                const redirectUrl = `${getAppPrefix()}/product-profile/chatRFQ/${response.data.rfq.id}/${chatId}`;
                this.sendSystemMessage(chatConstants.RFQReceivedMsg, chatId, redirectUrl);
            }, (error) => {
                console.log(error);
            });
    }

    changeRequiredFields(quantity, unit) {
        this.setState({
            quantity,
            unit
        });
    }

    changeAdditionalInfo(preferredCurrency, preferredPackagingType, expectedTimeOfArrival, incoterms, placeOfDelivery, preferredPaymentTerms, acceptingQuotesUntil, documentsRequired, comment) {
        this.setState({
            preferredCurrency,
            preferredPackagingType,
            expectedTimeOfArrival,
            incoterms,
            placeOfDelivery,
            preferredPaymentTerms,
            acceptingQuotesUntil,
            documentsRequired,
            comment
        });
    }

    render() {
        const {
            user = null,
            prevPageUrl = `${getAppPrefix()}/`,
            productDetails = null,
            rfqFormDropdowns = null,
            onlyView = false,
            rfqDetails = null
        } = this.props;
        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={user} />
                </div>
                <MainContent className='blue-box' user={user}>
                    <BreadcrumbsBlock>
                        {isFreemiumUserSku(user) &&
                        (user?.userInfo?.role === userRoles.subBuyer) &&
                        <LimitationBlockFreemium position={FREEMIUM_LIMITATION_POSITION.rfq} user={user} />}
                    </BreadcrumbsBlock>
                    <div className='container create-rfq-page'>
                        <div className='row'>
                            <div className='col-xs-3'>
                                <PreviousPageBtn prevPageUrl={prevPageUrl} text='Cancel' fill />
                            </div>
                            <div className='col-xs-6'>
                                <div className='rfq-form'>
                                    <div className='rfq-form-header'>Request for Quotation</div>
                                    {onlyView && <RfqStatus status={rfqDetails.status} user={user} />}
                                    <ProductMainInfo onlyView={onlyView} rfqDetails={rfqDetails} productDetails={productDetails} />
                                    <RequiredFields onlyView={onlyView} rfqDetails={rfqDetails} onChangeForm={(quantity, unit) => this.changeRequiredFields(quantity, unit)} />
                                    <AdditionalInfo
                                        onlyView={onlyView}
                                        rfqDetails={rfqDetails}
                                        onChangeForm={
                                            (preferredCurrency, preferredPackagingType, expectedTimeOfArrival, incoterms, placeOfDelivery, preferredPaymentTerms, acceptingQuotesUntil, documentsRequired, comment) =>
                                                this.changeAdditionalInfo(preferredCurrency, preferredPackagingType, expectedTimeOfArrival, incoterms, placeOfDelivery, preferredPaymentTerms, acceptingQuotesUntil, documentsRequired, comment)
                                        }
                                        rfqFormDropdowns={rfqFormDropdowns}
                                    />
                                    {!onlyView &&
                                    <FormFooter
                                        requiredFields={[this.state.quantity, this.state.unit]}
                                        sendForm={() => this.createChat()}
                                        user={user}
                                    />}
                                </div>
                            </div>
                        </div>
                        <div className='row unlock-more-results-banner__wrapper-rfq'>
                            <div className='col-xs-6 col-xs-offset-3'>
                                <UnlockMoreResultsBanner user={user} page={createRfqPPs.appString} />
                            </div>
                        </div>
                    </div>
                </MainContent>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </>
        );
    }
}

CreateRFQ.propTypes = {
    user: object,
    prevPageUrl: string,
    productDetails: object,
    rfqFormDropdowns: object,
    onlyView: bool,
    rfqDetails: object
};

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        productDetails: state.productReducer.productDetails,
        rfqFormDropdowns: state.productReducer.rfqFormDropdowns,
        onlyView: state.quotationReducer.onlyView,
        rfqDetails: state.quotationReducer.rfqDetails
    };
};

const mapDispatchToProps = (dispatch) => {};

export const CreateRFQLayout = connect(mapStateToProps, mapDispatchToProps)(CreateRFQ);
