'use strict';
import { redirectUnauthorizedUser } from '../utils';

var express = require('express');
var panelRouter = express.Router();

var client = require('../../sdk/client');

panelRouter.get('/getPanels', function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    var promisePanels = new Promise((resolve, reject) => {
        const options = {
            type: req.query['type'],
            pageSize: req.query['pageSize'],
            pageNumber: req.query['pageNumber']
        }

        client.Panels.getPanels(options, function (err, panels) {
            resolve(panels);
        });
    });

    Promise.all([promisePanels]).then((responses) => {
        res.send(responses[0]);
    });
});

module.exports = panelRouter;
