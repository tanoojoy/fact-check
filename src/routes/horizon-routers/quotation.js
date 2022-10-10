import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';
import template from '../../views/layouts/template';
import { rfqStatuses } from '../../consts/rfq-quote-statuses';
import { userRoles } from '../../consts/horizon-user-roles';
import { CreateQuoteTemplate } from '../../views/layouts/horizon-pages/quotation/create-quote-template';
import { CreateRFQ } from '../../views/layouts/horizon-pages/create-rfq/create-rfq';
import { getRfqById, updateRfq } from '../horizon-api/entity-service/rfq-controller';
import { getCompanyById } from '../horizon-api/entity-service/company-controller';
import { createQuote, getQuoteDetails, updateQuote } from '../horizon-api/entity-service/quote-controller';
import { isCompleteOnBoarding, redirectUnauthorizedUser } from '../../utils';
import { getAppPrefix } from '../../public/js/common';
import authenticated from '../../scripts/shared/authenticated';
import {
    viewRfq as viewRfqPPs,
    quotationTemplate as quotationTemplatePPs
} from '../../consts/page-params';

const quotationRouter = express.Router();

// ToDo: prepare quote
const prepareQuoteForUpdate = (quote) => {
    const preparedQuote = { ...quote };

    preparedQuote.quoteId = quote.id;
    delete preparedQuote.rfqId;
    delete preparedQuote.createdAt;
    delete preparedQuote.updatedAt;
    delete preparedQuote.id;

    return preparedQuote;
};

quotationRouter.get('/create-template', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    if (!isCompleteOnBoarding(req?.user)) {
        res.redirect(getAppPrefix() + '/');
        return;
    }

    const userInfo = req?.user?.userInfo;

    const isSubmerchant = req.user.role === userRoles.subMerchant;

    try {
        const rfqId = req.query.id;

        const rfqData = await getRfqById(rfqId);
        const chatId = rfqData.data.chatId;
        const rfqStatus = rfqData.data.status;

        const sellerCompanyData = await getCompanyById(req, rfqData.data.cgiCompanyId);
        rfqData.data.sellerCompanyName = sellerCompanyData.data.name;

        const s = Store.createQuotationPageStore({
            userReducer: { user: req.user, userInfo },
            quotationReducer: {
                rfqDetails: { ...rfqData.data },
                onlyView: !isSubmerchant || rfqStatus === rfqStatuses.declined
            },
            productReducer: {
                rfqFormDropdowns: null,
                productDetails: null
            }
        });
        const reduxState = s.getState();
        let appString;
        let QuotationApp;

        const prevPageUrl = `${getAppPrefix()}/product-profile/chatRFQ/${rfqId}/${chatId}`;
        if (isSubmerchant) {
            if (rfqStatus === rfqStatuses.declined) {
                appString = viewRfqPPs.appString;
                QuotationApp = reactDom.renderToString(
                    <CreateRFQ
                        user={req.user}
                        prevPageUrl={prevPageUrl}
                        onlyView
                        rfqDetails={rfqData.data}
                    />
                );
            } else {
                appString = quotationTemplatePPs.appString;
                QuotationApp = reactDom.renderToString(<CreateQuoteTemplate user={req.user} rfqDetails={rfqData.data} prevPageUrl={prevPageUrl} />);
            }
        } else {
            appString = viewRfqPPs.appString;
            QuotationApp = reactDom.renderToString(
                <CreateRFQ
                    user={req.user}
                    prevPageUrl={prevPageUrl}
                    onlyView
                    rfqDetails={rfqData.data}
                />
            );
        }

        res.send(template(viewRfqPPs.bodyClass, viewRfqPPs.title, QuotationApp, appString, reduxState));
    } catch (e) {
        console.log('quotation Error', e);
    }
});

quotationRouter.post('/create', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;

    try {
        const { quote, chatId } = req.body;
        const userInfo = req?.user?.userInfo;

        quote.clarivateUserId = userInfo.userid;
        await createQuote(quote);

        const prevPageUrl = `${getAppPrefix()}/product-profile/chatRFQ/${quote.rfqId}/${chatId}?quoteId=`;
        res.send(prevPageUrl);
    } catch (e) {
        console.log('/create Error', e);
    }
});

quotationRouter.post('/cancel', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    try {
        const { quote, chatId } = req.body;
        const userInfo = req?.user?.userInfo;
        await updateRfq(req, { status: rfqStatuses.declined, chatId, sellerId: userInfo?.userid }, quote.rfqId);
        const prevPageUrl = `${getAppPrefix()}/product-profile/chatRFQ/${quote.rfqId}/${chatId}`;
        res.send(prevPageUrl);
    } catch (e) {
        console.log('/decline; error', e);
    }
});

quotationRouter.post('/update', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    try {
        const { quote, chatId } = req.body;
        const userInfo = req?.user?.userInfo;
        const preparedQuote = prepareQuoteForUpdate(quote);

        await updateQuote(userInfo.userid, preparedQuote.quoteId, preparedQuote);
        const prevPageUrl = `${getAppPrefix()}/product-profile/chatRFQ/${quote.rfqId}/${chatId}`;
        res.send(prevPageUrl);
    } catch (e) {
        console.log('/update; error', e);
    }
});

quotationRouter.get('/quote/:quoteId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    if (!isCompleteOnBoarding(req?.user)) {
        res.redirect(getAppPrefix() + '/');
        return;
    }

    try {
        const quoteId = req.params.quoteId;
        const userInfo = req?.user?.userInfo;

        const quoteData = await getQuoteDetails(userInfo.userid, quoteId);

        const rfqId = req.query.rfqId;
        const rfqData = await getRfqById(rfqId);
        const chatId = rfqData.data.chatId;

        const sellerCompanyData = await getCompanyById(req, rfqData.data.cgiCompanyId);
        rfqData.data.sellerCompanyName = sellerCompanyData.data.name;

        const s = Store.createQuotationPageStore({
            userReducer: { user: req.user, userInfo },
            quotationReducer: {
                quotationDetail: { ...quoteData.data },
                rfqDetails: { ...rfqData.data }
            }
        });

        const reduxState = s.getState();
        const prevPageUrl = `${getAppPrefix()}/product-profile/chatRFQ/${rfqId}/${chatId}`;

        const appString = quotationTemplatePPs.appString;
        const QuotationApp = reactDom.renderToString(
            <CreateQuoteTemplate
                user={req.user}
                rfqDetails={rfqData.data}
                prevPageUrl={prevPageUrl}
                quoteDetails={quoteData.data}
            />
        );

        res.send(template(quotationTemplatePPs.bodyClass, quotationTemplatePPs.title, QuotationApp, appString, reduxState));
    } catch (e) {
        console.log('/quote; error', e);
    }
});

export default quotationRouter;
