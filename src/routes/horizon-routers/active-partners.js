import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';

import template from '../../views/layouts/template';

import { Partners } from '../../views/layouts/horizon-pages/partners';
import { redirectUnauthorizedUser } from '../../utils';
import authenticated from '../../scripts/shared/authenticated';
import { activePartners as activePartnersPPs } from '../../consts/page-params';


const activePartnersRouter = express.Router();

activePartnersRouter.get('/', authenticated, (req, res) => {
    if (redirectUnauthorizedUser(req, res)) return;

    const s = Store.createPartnersPageStore({
        userReducer: { user: req.user }
    });
    const reduxState = s.getState();
    const appString = activePartnersPPs.appString;
    const PartnersApp = reactDom.renderToString(<Partners user={req.user} />);

    res.send(template(activePartnersPPs.bodyClass, activePartnersPPs.title, PartnersApp, appString, reduxState));
});

export default activePartnersRouter;
