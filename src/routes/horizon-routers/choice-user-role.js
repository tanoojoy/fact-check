import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';
import template from '../../views/layouts/template';
import authenticated from '../../scripts/shared/authenticated';
import { updateUserInfo } from '../horizon-api/auth-service/auth-controller';
import { ChooseUserRole } from '../../views/choose-user-role';
import { getAppPrefix } from '../../public/js/common.js';
import { choiceUserRole as choiceUserRolePPs } from '../../consts/page-params';

const choiceUserRoleRouter = express.Router();

choiceUserRoleRouter.get('/', authenticated, (req, res) => {
    const hasRole = req?.user && req?.user?.role;
    const prevPage = req?.params?.prevPage || '/';

    if (hasRole || !req?.user?.userInfo) {
        res.redirect(getAppPrefix() + prevPage);
        return;
    }

    const s = Store.createSettingsStore({
        userReducer: { user: req.user }
    });

    const reduxState = s.getState();
    const appString = choiceUserRolePPs.appString;
    const choiceUserRole = reactDom.renderToString(<ChooseUserRole user={req.user} />);

    res.send(template(choiceUserRolePPs.bodyClass, choiceUserRolePPs.title, choiceUserRole, appString, reduxState));
});

choiceUserRoleRouter.post('/update-user-role', authenticated, async(req, res) => {
    try {
        const updatedCgiUserData = await updateUserInfo(req, { role: req.body.role });
        if (updatedCgiUserData.status == 200 || updatedCgiUserData.status == 201) {
            res.json({ redirectUrl: getAppPrefix() + '/choice-user-company' });
        }
    } catch (e) {
        console.log('Error', e);
        res.json({ redirectUrl: getAppPrefix() + '/' });
    }
});

export default choiceUserRoleRouter;
