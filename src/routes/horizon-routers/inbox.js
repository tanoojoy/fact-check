import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';

import template from '../../views/layouts/template';
import authenticated from '../../scripts/shared/authenticated';
import { Inbox } from '../../views/layouts/horizon-pages/inbox';
import { Enquiry } from '../../views/layouts/horizon-pages/enquiry';
import { resolveClarivateUserId } from '../horizon-api/auth-service/auth-controller';
import { isCompleteOnBoarding, redirectUnauthorizedUser } from '../../utils';
import { getDealsByUserId, getDealsByCompanyId, getDealsCountByBuyer } from '../horizon-api/entity-service/deals-controller';
import { getChatsByParams } from '../horizon-api/entity-service/chat-controller';
import { userRoles } from '../../consts/horizon-user-roles';
import { getCompanyById, getCompaniesByIds } from '../horizon-api/entity-service/company-controller';
import { inbox as inboxPPs, enquiry as enquiryPPs } from '../../consts/page-params';
import { getAppPrefix } from '../../public/js/common';

const inboxRouter = express.Router();

const getDealsWithInterlocutor = async({ role, companyId, userId, page, size }) => {
    if (role === userRoles.subMerchant) {
        const deals = (await getDealsByCompanyId(companyId, page, size)).content;
        const buyerIds = deals.map(deal => deal.rfq && deal.rfq.buyerId);
        const usersData = await resolveClarivateUserId(buyerIds);
        const companies = await getCompaniesByIds(usersData.map(userData => userData.clarivateCompanyId), true);

        deals.forEach((deal, ix) => (deal.interlocutorCompany = companies[ix]));

        return deals;
    }

    const dealsResponse = await getDealsByUserId(userId, page, size);
    const deals = dealsResponse.data;

    const companyIds = deals.map(deal => deal.rfq && deal.rfq.cgiCompanyId);
    const companies = await getCompaniesByIds(companyIds, true);

    deals.forEach((deal) => {
        const company = companies.find((company) => deal.rfq.cgiCompanyId === company.id);
        deal.interlocutorCompany = company;
    });

    return deals;
};

inboxRouter.get('/', authenticated, async(req, res) => {
    res.redirect(`${getAppPrefix()}/inbox/requests-quotes`);
});

inboxRouter.get('/requests-quotes', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    if (!isCompleteOnBoarding(req?.user)) {
        res.redirect(getAppPrefix() + '/');
        return;
    }

    try {
        const userInfo = req?.user?.userInfo;
        const resCgiCompanyData = await getCompanyById(req);
        const companyInfo = resCgiCompanyData.data || {};
        let dealsCount;
        if (userInfo.role === userRoles.subMerchant) {
            console.log('req?.user?.companyId', req?.user?.companyId);
            const deals = await getDealsByCompanyId(req?.user?.companyId);
            console.log('userRoles.subMerchant', JSON.stringify(deals));
            dealsCount = deals?.total;
        } else {
            const deals = await getDealsCountByBuyer(req.user.ID);
            console.log('else', deals);
            dealsCount = deals?.rfq[0]?.count;
        }

        const s = Store.createInboxPageStore({
            userReducer: { user: req.user, userInfo, companyInfo },
            marketplaceReducer: { dealsCount: dealsCount || 0 }
        });
        const reduxState = s.getState();
        const appString = inboxPPs.appString;
        const InboxApp = reactDom.renderToString(<Inbox user={req.user} />);

        res.send(template(inboxPPs.bodyClass, inboxPPs.title, InboxApp, appString, reduxState));
    } catch (e) {
        console.log('Error', e);
    }
});

inboxRouter.get('/enquiries', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    if (!isCompleteOnBoarding(req?.user)) {
        res.redirect(getAppPrefix() + '/');
        return;
    }

    try {
        const userInfo = req?.user?.userInfo;

        const chats = await getChatsByParams({
            userId: req.user.ID,
            page: 0,
            size: 1
        });
        console.log('chats', chats);
        const resCgiCompanyData = await getCompanyById(req);
        const companyInfo = resCgiCompanyData.data || {};

        const s = Store.createInboxPageStore({
            userReducer: {
                user: req.user,
                chatsCount: chats.total,
                userInfo,
                companyInfo
            }
        });
        const reduxState = s.getState();
        const appString = enquiryPPs.appString;
        const InboxApp = reactDom.renderToString(<Enquiry user={req.user} />);

        res.send(template(enquiryPPs.bodyClass, enquiryPPs.title, InboxApp, appString, reduxState));
    } catch (e) {
        console.log('Error', e);
    }
});

inboxRouter.get('/deal-chat-list', authenticated, async(req, res) => {
    try {
        const { page, size } = req.query;
        const { role, companyId = null, ID: userId } = req.user;

        const deals = await getDealsWithInterlocutor({
            role,
            companyId,
            userId,
            page,
            size
        });

        res.json({ deals });
    } catch (e) {
        console.log('Error', e);
    }
});

inboxRouter.get('/enquire-chat-list', authenticated, async(req, res) => {
    try {
        const { page = 0, size = 10, companyId = null } = req.query;

        const chats = await getChatsByParams({
            userId: req.user.ID,
            page,
            size
        });

        const interlocutorIds = chats?.content?.map(chat => {
            if (chat.incomingCoId && chat.outgoingCoId) {
                if (chat.incomingCoId === chat.outgoingCoId) {
                    return chat.incomingCoId;
                }

                return companyId === chat.incomingCoId ? chat.outgoingCoId : chat.incomingCoId;
            }
            return null;
        });

        const companies = await getCompaniesByIds(interlocutorIds, true);

        chats?.content?.forEach((chat, ix) => (chat.interlocutorCompany = companies[ix]));

        res.json({ chats: chats?.content });
    } catch (e) {
        console.log('Error', e);
    }
});

inboxRouter.get('/getchats', authenticated, async(req, res) => {
    try {
        const userInfo = req?.user?.userInfo;
        const chats = await getChatsByParams({ userId: req.user.ID });
        const commonChats = chats?.content?.map(chat => chat.twillioChatId);
        let deals;
        if (userInfo.role === userRoles.subMerchant) {
            deals = (await getDealsByCompanyId(req?.user?.companyInfo?.id)).content;
        } else {
            const dealsResponse = await getDealsByUserId(req.user.ID);
            deals = dealsResponse.data;
        }

        const dealChats = deals.map(deal => deal.rfq.chatId);
        const resCgiCompanyData = await getCompanyById(req);

        const companyInfo = resCgiCompanyData.data || {};
        const { email, first_name, last_name } = userInfo;
        const { name: companyName } = companyInfo;
        let username = email;
        if (last_name && first_name) {
            username = `${last_name} ${first_name}`;
        }
        username = `${username} | ${companyName}`;
        res.send({ username, chatIds: [...commonChats, ...dealChats] });
    } catch (e) {
        console.log('Error', e);
    }
});

export default inboxRouter;
