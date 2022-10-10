import React from 'react';
import express from 'express';
import reactDom from 'react-dom/server';
import Store from '../../redux/store';
import template from '../../views/layouts/template';

import { UserSettingsPage } from '../../views/layouts/horizon-pages/user-settings';
import { redirectUnauthorizedUser } from '../../utils';
import authenticated from '../../scripts/shared/authenticated';
import { userSettings as userSettingsPPs } from '../../consts/page-params';
import paymentController from '../horizon-api/payment-service/cleverbridge-controller';
import { USER_ID_KEY } from '../../consts/payment';
import { addAction } from '../horizon-api/auth-service/user-limitation-controller';
import { getUserInfo, updateUserInfo } from '../horizon-api/auth-service/auth-controller';
import { getCompaniesByIds } from '../horizon-api/entity-service/company-controller';
import { addFollower, removeFollower, getFollowerList } from '../horizon-api/entity-service/follower-controller';

const userRouter = express.Router();

userRouter.get('/settings', authenticated, async(req, res) => {
    //TODO: Figure-out why this always redirect to login
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    try {
        const activeTab = req.query?.activeTab;
        const userInfo = req?.user?.userInfo;
        const clarivateUserId = userInfo?.userid;
        const followerCompanies = await getFollowerList(clarivateUserId);
        const companiesIds = followerCompanies?.followers.map(follower => follower.companyId);
        const companies = await getCompaniesByIds(companiesIds, true);

        const extendedFollowerCompanies = {
            count: followerCompanies.count,
            followers: followerCompanies?.followers.map(follower => {
                const company = companies.find(company => company.id === follower.companyId);
                follower.companyName = company.name;
                return follower;
            })
        };

        const s = Store.createUserInfoStore({
            userReducer: {
                user: req.user,
                userInfo,
                followerCompanies: extendedFollowerCompanies,
                activeTab
            }
        });
        const reduxState = s.getState();
        const appString = userSettingsPPs.appString;

        const UserSettingsApp = reactDom.renderToString(<UserSettingsPage
            user={req.user}
            userInfo={userInfo}
            activeTab={activeTab}
        />);

        res.send(template(userSettingsPPs.bodyClass, userSettingsPPs.title, UserSettingsApp, appString, reduxState));
    } catch (e) {
        console.log('Error', e);
    }
});

userRouter.put('/settings/update', authenticated, async(req, res) => {
    try {
        const result = await updateUserInfo(req, req.body);
        res.status(result.status).send(result?.data);
    } catch (e) {
        console.log('Error', e);
    }
});

userRouter.post('/payment-notification', async(req, res) => {
    try {
        const { status, paymentArriveTime, extraParameters = {} } = req.body;
        const userId = extraParameters[USER_ID_KEY];
        const responseStatus = await paymentController.handlePaymentNotification(status, paymentArriveTime, userId);
        res.sendStatus(responseStatus);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// moved to src/routes/users.jsx
userRouter.get('/payment-link', (req, res) => {
    const clarivateUserId = req.user?.UserLogins[0]?.ProviderKey;
    const cartId = process.env.CLEVERBRIDGE_CART_ID;
    const productId = process.env.CLERVERBRIDGE_PRODUCT_ID;
    const isPermanentLink = isNaN(productId);

    if (clarivateUserId) {
        const paymentLink = isPermanentLink
            ? `https://buy.clarivate.com/${cartId}/${productId}?x-userid=${clarivateUserId}`
            : `https://buy.clarivate.com/${cartId}/?scope=checkout&cart=${productId}&x-userid=${clarivateUserId}`;
        res.json({ paymentLink });
    } else {
        console.log('User id not provided');
        res.sendStatus(500);
    }
});

userRouter.post('/increase-chat-counter', authenticated, async(req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const action = 'chatMessageSent';
        const resp = await addAction(clarivateUserId, action);
        if (resp.status === 200) {
            const updatedUser = await getUserInfo(req);
            req.user.flags = { ...updatedUser.data?.flags };
            res.json(updatedUser.data);
            return;
        }

        console.log(`Error in ${req.originalUrl}`);
        res.statusCode(500);
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.statusCode(500);
    }
});

userRouter.get('/profile-link', (req, res) => {
    res.json({ link: process.env.CLARIVATE_API_PROFILE_USER_URL });
});

userRouter.get('/subscriptions-link', (req, res) => {
    res.json({ link: process.env.CLARIVATE_API_SUBSCRIPTIONS_URL });
});

userRouter.post('/follower', authenticated, async(req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { followCompanyId = null } = req.body;

        if (followCompanyId) {
            const resp = await addFollower(clarivateUserId, followCompanyId);
            if (resp.status === 200) {
                res.json(resp.data);
                return;
            }

            console.log(`Error in ${req.originalUrl}`);
            res.statusCode(500);
        }
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.statusCode(500);
    }
});

userRouter.delete('/follower', authenticated, async(req, res) => {
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        const { followCompanyId = null } = req.body;

        if (followCompanyId) {
            const resp = await removeFollower(clarivateUserId, followCompanyId);
            if (resp.status === 200) {
                res.json(resp.data);
                return;
            }

            console.log(`Error in ${req.originalUrl}`);
            res.statusCode(500);
        }
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.statusCode(500);
    }
});

export default userRouter;
