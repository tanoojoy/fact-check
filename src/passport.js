'use strict';
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var CookieStrategy = require('passport-cookie');
var LocalStrategy = require('passport-local');
var CustomStrategy = require('passport-custom').Strategy;

var client = require('../sdk/client');

passport.use('auth_code', new CustomStrategy(
    function(req, done) {
        const code = req.query.code;
        const isSeller = req.query.isSeller;
        const hostname = req.protocol + '://' + req.get('host');
        let redirectUrl = hostname + '/accounts/api-token';
        if (isSeller && isSeller.toLowerCase() == 'true') {
            redirectUrl += '?isSeller=' + isSeller;
        }
        client.exchangeAuthorizationCode(code, redirectUrl, function(err, token) {
            if (err) {
                done(err);
            } else {
                client.Users.getCurrentUser(token.access_token, function(err, user) {
                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else if ((!user.Enabled || !user.Visible)) {
                        done(null, false);
                    } else done(null, user);
                });
            }
        });
    }
));

passport.use('user_impersonation_code', new CustomStrategy(
    function(req, done) {
        const code = req.query.code;
        client.exchangeImpersonationCode(code, function(err, token) {
            if (err) {
                done(err);
            } else {
                client.Users.getCurrentUser(token.access_token, function(err, user) {
                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else if ((!user.Enabled || !user.Visible)) {
                        done(null, false);
                    } else {
                        done(null, user);
                    }
                });
            }
        });
    }
));

passport.use('login', new LocalStrategy({
    passReqToCallback: true
},
function(req, username, password, done) {
    client.Accounts.loginWithUsernameAndPassword(username, password, function(err, token) {
        if (err) {
            // done(err);
            done(null, false); // prevent interpreting invalid login credentials as exception error
        } else {
            client.Users.getCurrentUser(token.access_token, function(err, user) {
                if (err) {
                    done(err);
                } else if (!user) {
                    done(null, false);
                } else if ((!user.Enabled || !user.Visible)) {
                    done(null, false);
                } else {
                    req.token = token;
                    done(null, user);
                }
            });
        }
    });
}
));

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
},
function(req, username, password, done) {
    const findOrCreateUser = function() {
        const options = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: username,
            password: password,
            confirmPassword: req.body.confirmPassword,
            email: req.body.email,
            token: req.body.token,
            IsSeller: req.body.isSeller
        };

        client.Accounts.registerWithUsernameAndPassword(options, function(err, token) {
            if (err) {
                done(err);
            } else {
                client.Users.getCurrentUser(token.access_token, function(err, user) {
                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else {
                        done(null, user, token);
                    }
                });
            }
        });
    };

    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
})
);

passport.use(new CookieStrategy({
    cookieName: 'webapitoken',
    signed: false,
    passReqToCallback: true
}, function(req, token, done) {
    client.Users.getCurrentUser(token, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    });
}));

passport.use(new BearerStrategy(
    function(token, done) {
        client.Users.getCurrentUser(token, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    if (user) {
        if (user.Media && user.Media.length > 0) {
            user.Media = [user.Media.pop()];
        }

        if (user.Roles && user.Roles.includes('Submerchant')) {
            user.SubmerchantID = user.ID;
            user.ID = user.AccountOwnerID;
        }

        if (user.Roles && user.Roles.includes('User')) {
            if (user.AccountOwnerID && user.ID != user.AccountOwnerID) {
                user.SubBuyerID = user.ID;
                user.ID = user.AccountOwnerID;
            }
        }
    }

    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use('sso', new CustomStrategy(

    function(req, done) {
        const externalUserId = req.body.ExternalUserId;
        const email = req.body.Email;

        client.SSO.login(externalUserId, email, function(err, result) {
            // result contains the api call response
            if (err) {
                done(null, false); // prevent interpreting invalid login credentials as an exception error
            } else {
                var access_token = result.AccessToken.access_token; // check API documentation for full response of the SSO API
                client.Users.getCurrentUser(access_token, function(err, user) {
                    if (err) {
                        done(err);
                    } else if (!user) {
                        done(null, false);
                    } else if (!user.Enabled || !user.Visible) {
                        done(null, false);
                    } else {
                        req.token = result;
                        var data = {
                            ID: user.ID,
                            Onboarded: user.Onboarded,
                            SsoCode: result.SsoCode
                        };
                        done(null, data);
                    }
                });
            }
        });
    }
));
