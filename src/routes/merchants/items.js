'use strict';
import { redirectUnauthorizedUser } from '../../utils';

var express = require('express');
var merchantItemRouter = express.Router();
var React = require('react');
var reactDom = require('react-dom/server');
var Store = require('../../redux/store');
var template = require('../../views/layouts/template');
var MerchantItemListComponent = require('../../views/merchant/item/list/index').MerchantItemListComponent;

let authenticated = require('../../scripts/shared/authenticated');
let authorizedMerchant = require('../../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../../scripts/shared/onboarded-merchant');

var client = require('../../../sdk/client');

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

merchantItemRouter.get('/', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;

    var promiseItems = new Promise((resolve, reject) => {
        const options = {
            sellerId: user.ID,
            pageSize: 20,
            pageNumber: 1,
            tags: '',
            withChildItems: true,
            sort: 'name_asc',
            keyword: '',
            filterAvailable: false,
            filterVisible: false
        };

        client.Items.getMerchantItems(options, function (err, result) {
            resolve(result);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        let options = {
            includes: 'ControlFlags'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseItems, promiseMarketplace]).then((responses) => {
        let items = responses[0];
        let marketplaceInfo = responses[1];

        const context = {};
        const appString = 'merchant-item-list';
        const s = Store.createItemListStore({
            userReducer: { user: user },
            itemsReducer: {
                items: items.Records,
                pageSize: items.PageSize,
                pageNumber: items.PageNumber,
                totalRecords: items.TotalRecords,
                itemToDelete: null,
                controlFlags: marketplaceInfo.ControlFlags
            }
        });

        const reduxState = s.getState();
        let seoTitle = 'Your Items';
          if (req.SeoTitle) {
            seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
        }

        const app = reactDom.renderToString(<MerchantItemListComponent context={context} user={req.user} items={items.Records} />);
        res.send(template('page-seller page-item-list page-sidebar', seoTitle, app, appString, reduxState));
    });
});

merchantItemRouter.get('/:id([0-9]+)', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    console.log('merchant item details access: ', Date.now());
    res.send('merchant item detail home page');
});

merchantItemRouter.get('/search', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const user = req.user;
    const keyword = req.query['keyword'];
    const pageNumber = req.query['pageNumber'];
    let pageSize = req.query['pageSize'];
    if (!pageSize) {
        pageSize = 20;
    }
    const options = {
        sellerId: user.ID,
        pageSize: pageSize,
        pageNumber: pageNumber,
        tags: '',
        withChildItems: true,
        sort: 'name_asc',
        keyword: keyword,
        filterAvailable: false,
        filterVisible: false
    };

    var promiseItems = new Promise((resolve, reject) => {
        client.Items.getMerchantItems(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseItems]).then((responses) => {
        res.send(responses[0]);
    });
});

merchantItemRouter.put('/edit', ...handlers, function (req, res) {
    const user = req.user;
    const itemId = req.body['itemId'];
    const isAvailable = req.body['isAvailable'];

    const options = {
        merchantId: user.ID,
        itemId: itemId,
        isAvailable: isAvailable,
    };

    var promiseItems = new Promise((resolve, reject) => {
        client.Items.editItem(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseItems]).then((responses) => {
        res.send(responses[0]);
    });
});

merchantItemRouter.delete('/delete', ...handlers, function (req, res) {
    const user = req.user;
    const itemId = req.body['itemId'];

    const options = {
        merchantId: user.ID,
        itemId: itemId
    };

    var promiseItems = new Promise((resolve, reject) => {
        client.Items.deleteItem(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseItems]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = merchantItemRouter;
