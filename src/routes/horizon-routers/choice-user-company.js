import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';
import template from '../../views/layouts/template';

import { redirectUnauthorizedUser, userRole, userHasCompany, isCompanyAttachRequestSend } from '../../utils';
import { ChooseUserCompany } from '../../views/choose-user-company';
import { setLinkingFlag } from '../horizon-api/auth-service/auth-controller';
import {
    attachUserToCompany,
    attachUserToUnknownCompany
} from '../horizon-api/auth-service/company-connection-controller';
import authenticated from '../../scripts/shared/authenticated';
import { getAppPrefix } from '../../public/js/common.js';
import { choiceUserCompany as choiceUserCompanyPPs } from '../../consts/page-params';

const choiceUserCompanyRouter = express.Router();

choiceUserCompanyRouter.get('/', authenticated, (req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;
    const { user } = req;
    const prevPage = req?.params?.prevPage || '/';

    if (!user?.userInfo || userHasCompany(user) || isCompanyAttachRequestSend(user)) {
        res.redirect(getAppPrefix() + prevPage);
        return;
    }

    const s = Store.createSettingsStore({
        userReducer: { user: req.user }
    });

    const reduxState = s.getState();
    const appString = choiceUserCompanyPPs.appString;
    const choiceUserRole = reactDom.renderToString(<ChooseUserCompany user={req.user} />);

    res.send(template(choiceUserCompanyPPs.bodyClass, choiceUserCompanyPPs.title, choiceUserRole, appString, reduxState));
});

choiceUserCompanyRouter.post('/update', authenticated, async(req, res) => {
    try {
        const { ID: id } = req.user;
        const { companyId } = req.body;
        if (companyId) { // request to attach company from list of companies
            const resp = await attachUserToCompany(req, id, companyId);
        } else {
            const resp = await attachUserToUnknownCompany(id, req.body?.unknownCompany);
        }

        res.json({ message: 'success' });
    } catch (e) {
        console.log('Error', e);
        res.json({ redirectUrl: getAppPrefix() + '/', error: e });
    }
});

export default choiceUserCompanyRouter;
