import React, { Component } from 'react';
import { object, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../../header';
import HorizonFooterComponent from '../../horizon-components/footer';
import { QuoteTemplate, QuotationPriceForm } from '../../horizon-components/quote/';
import PreviousPageBtn from '../../horizon-components/previous-page-btn';
import { createQuotation, cancelQuotation, updateQuotation } from '../../../../redux/quotationActions';
import { InfoMessage } from '../../horizon-components/info-message';
import MainContent from '../../horizon-components/main-content';
import UnlockMoreResultsBanner from '../../horizon-components/unlock-more-results-banner';
import { quotationTemplate as quotationTemplatePPs } from '../../../../consts/page-params';
import { LimitationBlockFreemium, FREEMIUM_LIMITATION_POSITION } from '../../horizon-components/limitation-block-freemium';
import BreadcrumbsBlock from '../../horizon-components/breadcrumbs-block';
import { isFreemiumUserSku } from '../../../../utils';
import { userRoles } from '../../../../consts/horizon-user-roles';

const infoMessage = "If you\'d like to share more documents with buyer you can attach them in chat";

export class CreateQuoteTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clarivateUserId: '',
            issueDate: '',
            rfqId: 0,
            shelfLife: '',
            validDate: '',
            comment: '',
            price: 0
        };
    }

    componentDidMount() {
        const { rfqDetails = {}, userInfo = {}, quoteDetails = {} } = this.props;
        quoteDetails.clarivateUserId = userInfo.userid;
        quoteDetails.issueDate = rfqDetails.createdAt;
        quoteDetails.rfqId = rfqDetails.id;
        this.setState(quoteDetails);
    }

    handleChangeQuoteData(value, key) {
        this.setState({ [key]: value });
    }

    render() {
        const {
            user,
            userInfo,
            rfqDetails,
            quoteDetails,
            prevPageUrl,
            createQuote,
            cancelQuote,
            acceptQuote,
            declineQuote
        } = this.props;

        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={user} />
                </div>

                <MainContent user={user}>
                    <BreadcrumbsBlock>
                        {isFreemiumUserSku(user) &&
                        (user?.userInfo?.role === userRoles.subMerchant) &&
                        <LimitationBlockFreemium position={FREEMIUM_LIMITATION_POSITION.quote} user={user} />}
                    </BreadcrumbsBlock>
                    <div className='container-fluid create-quote-template-page'>
                        <div className='row mb-20'>
                            <div className='col-xs-2 col-sm-2'>
                                <PreviousPageBtn prevPageUrl={prevPageUrl} text='Back' />
                            </div>
                        </div>
                        <div className='row justify-content-end'>
                            <div className='col-xs-8'>
                                <QuoteTemplate
                                    rfqDetails={rfqDetails}
                                    quoteDetails={quoteDetails}
                                    userInfo={userInfo}
                                    onChangeQuoteData={this.handleChangeQuoteData.bind(this)}
                                />
                                <UnlockMoreResultsBanner user={user} page={quotationTemplatePPs.appString} />
                            </div>
                            <div className='col-xs-4' style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <div className='row'>
                                    <div className='col-xs-12'>
                                        <QuotationPriceForm
                                            rfqDetails={rfqDetails}
                                            quoteDetails={this.state}
                                            createQuote={createQuote}
                                            cancelQuote={cancelQuote}
                                            acceptQuote={acceptQuote}
                                            declineQuote={declineQuote}
                                            userInfo={userInfo}
                                            user={user}
                                        />
                                    </div>
                                </div>
                                <div className='row' style={{ marginTop: '32px', width: '320px' }}>
                                    <div className='col-xs-12' style={{ padding: 0 }}>
                                        <InfoMessage>{infoMessage}</InfoMessage>
                                    </div>
                                </div>
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

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        userInfo: state.userReducer.userInfo,
        rfqDetails: state.quotationReducer.rfqDetails,
        quoteDetails: state.quotationReducer.quotationDetail
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        createQuote: (quote) => dispatch(createQuotation(quote)),
        cancelQuote: (quote) => dispatch(cancelQuotation(quote)),
        acceptQuote: (quote) => dispatch(updateQuotation(quote)),
        declineQuote: (quote) => dispatch(updateQuotation(quote))
    };
};

CreateQuoteTemplate.propTypes = {
    user: object,
    userInfo: object,
    rfqDetails: object,
    quoteDetails: object,
    createQuote: func,
    cancelQuote: func,
    acceptQuote: func,
    declineQuote: func,
    prevPageUrl: string
};

export const QuotationTemplateLayout = connect(mapStateToProps, mapDispatchToProps)(CreateQuoteTemplate);
