'use strict';
import { redirectUnauthorizedUser } from '../utils';

var express = require('express');
var activityLogRouter = express.Router();
var useragent = require('express-useragent');
activityLogRouter.use(useragent.express());

var React = require('react');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var reactDom = require('react-dom/server');
var template = require('../views/layouts/template');

var authenticated = require('../scripts/shared/authenticated');
var client = require('../../sdk/client');
var Store = require('../redux/store');
var ActivityLogPage = require('../views/activity-log/index').ActivityLogComponent;

var authenticated = require('../scripts/shared/authenticated');
var authorizedMerchant = require('../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../scripts/shared/onboarded-merchant');

var handlers = [authenticated, validateUserAccess];

function validateUserAccess(req, res, next) {
    if (req.user && (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant'))) {
        return onboardedMerchant(req, res, next);
    }
    next();
};

function getActivityCookie(req, res, loginActivityId, alternateId) {
    const cookieName = 'arcticktrack';
    const cookie = req.cookies[cookieName];

    if (cookie) {
        return cookie;
    }
    else {
        const value = {
            loginActivityId: loginActivityId || 0,
            alternateId: alternateId || Math.random().toString(36).substr(2, 10)
        };

        res.cookie(cookieName, value, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true
        });

        return value;
    }

    return null;
}

activityLogRouter.post('/logPageActivity', authenticated, function (req, res) {
    const user = req.user;
    if (user) {
        let userID = user.ID;
        if (req.user.Roles.includes('Submerchant')) {
            if (user.SubmerchantID) {
                userID = user.SubmerchantID;
            }
        }
        const cookie = getActivityCookie(req, res, 0, null);
        const promiseActivityLog = new Promise((resolve, reject) => {
            const options = {
                userId: userID,
                pageUrl: req.body.pageUrl,
                alternateId: cookie.alternateId
            };
            client.ActivityLog.logPageActivity(options, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseActivityLog]).then((responses) => {
            return res.send();
        });
    }

    res.send();
});

activityLogRouter.get('/', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: 1
    };
    const promiseActivityLog = new Promise((resolve, reject) => {
        client.ActivityLog.getActivityLog(options, function (err, callback) {
            resolve(callback);
        });
    });
    Promise.all([promiseActivityLog]).then((responses) => {
        const messages = responses[0];
        const appString = 'activity-log';
        const context = {};
        const s = Store.createActivityLogStore({
            userReducer: { user: user },
            activityLogReducer: {
                messages: messages,
                logName: 'activity-logs'
            }
        });
        const reduxState = s.getState();

        let seoTitle = 'Activity Log';
        if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        const LogPage = reactDom.renderToString(<ActivityLogPage context={context} currentUser={req.user} />);
        res.send(template('page-seller auto-activity-page page-sidebar', seoTitle, LogPage, appString, reduxState));
    });
});

activityLogRouter.get('/search', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;

    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: 1,
        logName: req.query.logName
    };
    var promiseActivityLog = new Promise((resolve, reject) => {
        client.ActivityLog.getSearchActivityLogs(options, function (err, callback) {
            resolve(callback);
        });
    });
    Promise.all([promiseActivityLog]).then((responses) => {
        const messages = responses[0];
        res.send(messages);
    });
});

activityLogRouter.get('/paging', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: req.query.pageNumber,
        keyword: req.query.keyword
    };

    if (options.keyword === undefined) {
        var promiseInbox = new Promise((resolve, reject) => {
            client.ActivityLog.getActivityLog(options, function (err, callback) {
                resolve(callback);
            });
        });
        Promise.all([promiseInbox]).then((responses) => {
            const messages = responses[0];
            res.send(messages);
        });
    } else {
        var promiseActivityLog = new Promise((resolve, reject) => {
            client.ActivityLog.getSearchActivityLogs(options, function (err, callback) {
                resolve(callback);
            });
        });
        Promise.all([promiseActivityLog]).then((responses) => {
            const messages = responses[0];
            res.send(messages);
        });
    }
});

activityLogRouter.get('/export', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const options = {
        userId: user.ID,
        pageSize: 20,
        pageNumber: 1,
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };
    var promiseActivityLog = new Promise((resolve, reject) => {
        client.ActivityLog.getExportActivityLogs(options, function (err, callback) {
            resolve(callback);
        });
    });
    Promise.all([promiseActivityLog]).then((responses) => {
        const messages = responses[0];
        res.send(messages);
    });
});

module.exports = activityLogRouter;
