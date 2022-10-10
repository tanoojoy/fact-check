import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';
import template from '../../views/layouts/template';
import { redirectUnauthorizedUser } from '../../utils';
import { getCompanyById } from '../horizon-api/entity-service/company-controller';
import { getSubsAccounts } from '../horizon-api/auth-service/auth-controller';
import { CommonChatComponent } from '../../views/layouts/horizon-pages/common-chat';
import authenticated from '../../scripts/shared/authenticated';
import { commonChat as commonChatPPs } from '../../consts/page-params';
import { postChatParams } from '../horizon-api/entity-service/chat-controller';

const commonChatRouter = express.Router();

const addUsersToChatByCompanyId = (req, chatid, creatorCompanyId, companyId) => {
    return Promise.all([
        getSubsAccounts(req, creatorCompanyId),
        getSubsAccounts(req, companyId)
    ])
        .then(res => res.flat())
        .then(res => Promise.all(
            res.map(user => {
                console.log(user, chatid);
                const { clarivateUserId: userClarivateId, arcadierUserId } = user;
                return postChatParams({
                    userClarivateId,
                    arcadierUserId,
                    twillioChatId: chatid,
                    incomingCoId: creatorCompanyId,
                    outgoingCoId: companyId
                });
            })
        ))
        .catch(error => console.log(error));
};

commonChatRouter.get('/create/:companyId/:chatId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    try {
        const userInfo = req?.user?.userInfo;

        const resCgiCompanyData = await getCompanyById(req);
        const companyInfo = resCgiCompanyData.data || {};

        await addUsersToChatByCompanyId(req, req.params.chatId, companyInfo.id, req.params.companyId);
        const interlocutorCompanyInfo = await getCompanyById(req, req.params.companyId);

        const s = Store.createProductPageStore({
            userReducer: {
                user: req.user,
                userInfo,
                companyInfo,
                chatId: req.params.chatId,
                interlocutorCompanyInfo: interlocutorCompanyInfo.data || {}
            }
        });
        const reduxState = s.getState();
        const appString = commonChatPPs.appString;

        const ProductApp = reactDom.renderToString(<CommonChatComponent chatId={req.params.chatId} user={req.user} />);

        res.send(template(commonChatPPs.bodyClass, commonChatPPs.title, ProductApp, appString, reduxState));
    } catch (e) {
        console.log('productChat Error', e);
    }
});

commonChatRouter.get('/:chatId', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    try {
        const userInfo = req?.user?.userInfo;

        const resCgiCompanyData = await getCompanyById(req);
        const companyInfo = resCgiCompanyData.data || {};
        const interlocutorCompanyInfo = req.query?.interlocutor ? await getCompanyById(req, req.query?.interlocutor) : { data: {} };

        const s = Store.createProductPageStore({
            userReducer: {
                user: req.user,
                userInfo,
                companyInfo,
                chatId: req.params.chatId,
                interlocutorCompanyInfo: interlocutorCompanyInfo.data || {}
            }
        });
        const reduxState = s.getState();
        const appString = commonChatPPs.appString;

        const ProductApp = reactDom.renderToString(<CommonChatComponent chatId={req.params.chatId} user={req.user} />);

        res.send(template(commonChatPPs.bodyClass, commonChatPPs.title, ProductApp, appString, reduxState));
    } catch (e) {
        console.log('productChat Error', e);
    }
});

export default commonChatRouter;
