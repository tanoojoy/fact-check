'use strict';
var express = require('express');
var activityLogRouter = express.Router();

var authenticated = require('../../scripts/shared/authenticated');
var authorizedMerchant = require('../../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../../scripts/shared/onboarded-merchant');
var client = require('../../../sdk/client');

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

activityLogRouter.post('/createItemActivityLog', ...handlers, function (req, res) {
    const user = req.user;

    let userId = user.ID;
    if (req.user.SubmerchantID && typeof req.user.SubmerchantID != 'undefined') {
        userId = req.user.SubmerchantID;
    }

    var promiseActivityLog = new Promise((resolve, reject) => {
        const options = {
            merchantId: userId,
            itemId: req.body.itemId,
            type: req.body.type,
            alternateId: req.body.alternateId
        };

        client.ActivityLog.createItemActivityLog(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseActivityLog]).then((responses) => {
        res.send(responses[0]);
    });
});

activityLogRouter.get('/getCookie', ...handlers, function (req, res) {
    const cookieName = 'arcticktrack';
    var cookie = req.cookies[cookieName];

    if (cookie) {
        return res.send(cookie);
    }

    res.send(null);
});

activityLogRouter.get('/setCookie', ...handlers, function (req, res) {
    const cookieName = 'arcticktrack';
    var cookie = req.cookies[cookieName];

    var value = {
        loginActivityId: req.query.loginActivityId || 0,
        alternateId: req.query.alternateId || Math.random().toString(36).substr(2, 10)
    };

    if (cookie) {
        res.clearCookie(cookieName);
    }

    res.cookie(cookieName, value, {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    });

    res.send(value);
});

activityLogRouter.post('/addPageAnaylytics', ...handlers, function (req, res) {
    const user = req.user;

    var promiseActivityLog = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            data: req.body
        };

        client.ActivityLog.addPageAnaylytics(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseActivityLog]).then((responses) => {
        res.send(responses[0]);
    });
});

activityLogRouter.post('/hasPageAnaylytics', ...handlers, function (req, res) {
    const user = req.user;

    var promiseActivityLog = new Promise((resolve, reject) => {
        const options = {
            userId: user.ID,
            key: req.body.key
        };

        client.ActivityLog.hasPageAnaylytics(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseActivityLog]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = activityLogRouter;