import express from 'express';
import homepage from './index';
import checkout from './checkout';
import users from './users';
import items from './items';
import chat from './chat';
import merchantsRouter from './merchants/sub-routes';
import searchRouter from './search';
import storefront from './storefront';
import purchase from './purchase';
import deliverySettings from './deliverysettings';
import comparison from './comparison';
import dashboard from './merchants/dashboard';
import login from './login';
import orderDiary from './order-diary';
import marketplace from './marketplace';
import category from './category';
import panel from './panel';
import policy from './policy';
import activities from './activity-log';
import cart from './cart';
import subAccount from './sub-account';
import { approvalRouter as approval } from './approval';
import requisition from './requisition';
import receivingNote from './receiving-note';
import invoice from './invoice';
import paymentGateway from './payment-gateway';
import sso from './sso';
import quotation from './quotation';
import inbox from './horizon-routers/inbox';
import companyRoutes from './company';
import user from './horizon-routers/user'; //TODO: TO BE DELETED
import choiceUserRoleRouter from './horizon-routers/choice-user-role';
import commonChatRouter from './horizon-routers/common-chat';
import activePartnersRouter from './horizon-routers/active-partners';
import autoSuggestRouter from './horizon-routers/autosuggest';
import cgiQuotation from './horizon-routers/quotation';
import testRoutePing from './horizon-routers/test-route-ping';
import choiceUserCompanyRouter from './horizon-routers/choice-user-company';

const MainRouter = express.Router();

MainRouter.use('/delivery', deliverySettings);
MainRouter.use('/accounts/', require('./login'));
MainRouter.use('/users', users);
MainRouter.use('/product-profile', items);
MainRouter.use('/merchants', merchantsRouter);
MainRouter.use('/storefront/', storefront);
MainRouter.use('/', homepage);
MainRouter.use('/search', searchRouter);
MainRouter.use('/checkout/', checkout);
MainRouter.use('/purchase', purchase);
MainRouter.use('/chat', chat);
MainRouter.use('/comparison', comparison);
MainRouter.use('/dashboard', dashboard);
MainRouter.use('/login', login);
MainRouter.use('/orderdiary', orderDiary);
MainRouter.use('/comparison', comparison);
MainRouter.use('/marketplace', marketplace);
MainRouter.use('/category', category);
MainRouter.use('/panel', panel);
MainRouter.use('/policy', policy);
MainRouter.use('/activity-logs', activities);
MainRouter.use('/cart', cart);
MainRouter.use('/subaccount', subAccount);
MainRouter.use('/approval', approval);

MainRouter.use('/requisition', requisition);
MainRouter.use('/receiving-note', receivingNote);
MainRouter.use('/invoice', invoice);
MainRouter.use('/payment-gateway', paymentGateway);
MainRouter.use('/sso', sso);

MainRouter.use('/company', companyRoutes);
MainRouter.use('/active-partners', activePartnersRouter);
MainRouter.use('/cgi-quotation', quotation);
MainRouter.use('/inbox', inbox);
//MainRouter.use('/users', user); //TODO: TO BE DELETED
MainRouter.use('/choice-user-role', choiceUserRoleRouter);
MainRouter.use('/choice-user-company', choiceUserCompanyRouter);
MainRouter.use('/userinfo', user);
MainRouter.use('/common-chat', commonChatRouter);
MainRouter.use('/autosuggest', autoSuggestRouter);
//MainRouter.use('/cgi-quotation', cgiQuotation);

// ToDo: for localhost only
MainRouter.use('/testRoutePing', testRoutePing);

module.exports = MainRouter;
