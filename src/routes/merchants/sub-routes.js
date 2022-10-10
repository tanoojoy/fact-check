var express = require('express');
var merchantsApp = express();

merchantsApp.use('/items', require('./items'));
merchantsApp.use('/dashboard', require('./dashboard'));
merchantsApp.use('/', require('./upload-edit'));
merchantsApp.use('/order', require('./order'));
merchantsApp.use('/activity-logs', require('./activitylog'));
merchantsApp.use('/settings', require('./settings'));
merchantsApp.use('/invoice', require('./invoice'));
module.exports = merchantsApp;