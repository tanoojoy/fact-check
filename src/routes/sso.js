'use strict';
const client = require('../../sdk/client');
const express = require('express');
const ssoRouter = express.Router();
const passport = require('passport');
// const { resolve } = require('core-js/fn/promise');

ssoRouter.post('/sso', function(req, res, next) {
    passport.authenticate('sso', function(err, user) {
        if (err) {
            // return error
        } else {
            if (!user) {
                // return invalid login
            } else {
                req.logIn(user, function(err) {
                    if (err) {
                        // return invalid login
                    }

                    // check if this is NOT the first time login of this user, if yes let them navigate marketplace
                    if (user.Onboarded) {
                        console.log('Not first time user');
                        console.log('/account/signintodomain?code=' + user.SsoCode + '&returnUrl=/cart');
                        res.json({ user });
                    }

                    // if first time login, update their role, add other information, complete onboarding and let them navigate
                    else {
                        var options = {
                            role: req.body.role,
                            userId: user.ID
                        };
                        const user_role_update = new Promise(function(resolve, reject) { // update their role
                            client.Accounts.updateUserRole(options, function(err, result) {
                                if (!err) {
                                    resolve(result);
                                }
                            });
                        });

                        const complete_onboarding = new Promise(function(resolve, reject) { // complete onboarding
                            client.Users.updateUser(options.userId, { Onboarded: true }, function(err, result) {
                                if (!err) {
                                    resolve(result);
                                }
                            });
                        });

                        // extra API calls like setting Custom Fields

                        Promise.all([user_role_update]).then((response) => {
                            Promise.all([complete_onboarding]).then((response) => {
                                console.log('First time user');
                                console.log('/account/signintodomain?code=' + user.SsoCode + '&returnUrl=/cart');
                                res.json({ user });
                            });
                        });
                    }
                });
            }
        }
    })(req, res, next);
});

module.exports = ssoRouter;
