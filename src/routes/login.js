'use strict';
import { cgiAuthenticate, cgiLogout } from './horizon-api/auth-service/auth-controller';

const express = require('express');
const querystring = require('querystring');
const router = express.Router();
const React = require('react');
const useragent = require('express-useragent');
router.use(useragent.express());
const ipstack = require('ipstack');

const reactDom = require('react-dom/server');
const _ = require('lodash');
const Store = require('../redux/store');
const template = require('../views/layouts/template');

const LandingPage = require('../views/login/landing').LandingComponent;
const LoginPage = require('../views/login/login');
const passport = require('passport');
const BuyerSignUpPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/buyer-sign-up').BuyerSignUpComponent;
const SellerSignUpPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/seller-sign-up').SellerSignUpComponent;

const ForgotPasswordPage = require('../views/login/forgot-password').ForgotPasswordComponent;
const ResetPasswordPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/reset-password').ResetPasswordComponent;
const ChangePasswordPage = require('../views/extensions/' + process.env.TEMPLATE + '/login/change-password').ChangePasswordComponent;
const RegisterInterestPage = require('../views/extensions/bespoke/login/register-interest').RegisterInterestComponent;

const client = require('../../sdk/client');
const authenticated = require('../scripts/shared/authenticated');
const authorizedUser = require('../scripts/shared/authorized-user');
const utils = require('../utils');
const CommonModule = require('../public/js/common');
const prefix = CommonModule.getAppPrefix();

function buildExternalLoginUrl(hostname, provider, clientId = '', token = '', chatChannelId = '', isSeller = '') {
    let url = process.env.PROTOCOL + '://' + process.env.OAUTH_URL + '/oauth2/authorize?response_type=code';
    url += '&client_id=' + (clientId || process.env.CLIENT_ID);
    url += '&provider=' + provider;
    let urlRedirect = CommonModule.getAppPrefix() + '/accounts/api-token';
    if (chatChannelId.length > 1) {
        urlRedirect = CommonModule.getAppPrefix() + '/accounts/api-token?chatChannelId=' + chatChannelId;
    }
    if (isSeller && isSeller.toLowerCase() == 'true') {
        urlRedirect += (urlRedirect.indexOf('?') > -1 ? '&' : '?') + 'isSeller=true';
    }
    if (!hostname) {
        hostname = 'http://www.example.com';
    }
    url += '&redirect_uri=' + hostname + urlRedirect;
    if (token) {
        url += '&token=' + token;
    }
    return url;
}

function getMarketplaceInfo(withBusinessProfile = false, withOpenIdProviders = false) {
    return new Promise((resolve, reject) => {
        let options = null;
        const includes = [];

        if (withBusinessProfile) {
            includes.push('BusinessProfile');
        }
        if (withOpenIdProviders) {
            includes.push('OpenIdProviders');
        }

        if (includes.length > 0) {
            options = {
                includes: includes.join()
            };
        }

        client.Marketplaces.getMarketplaceInfo(options, function(err, result) {
            if (result && result.OpenIdProviders) {
                result.OpenIdProviders.forEach(function(provider) {
                    provider.ClientSecret = null;
                });
            }
            resolve(result);
        });
    });
}

function logLoginActivity(req, res, loginActivityId, alternateId, callback) {
    const cookieName = 'arcticktrack';
    const cookie = getActivityCookie(res, req, loginActivityId, alternateId);

    function getActivityCookie(res, req, loginActivityId, alternateId) {
        const cookie = req.cookies[cookieName];

        if (cookie) {
            return cookie;
        } else {
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

    const promiseUserLocation = new Promise((resolve, reject) => {
        const excluded = ['sign-out', 'change-password'];
        let isGetUserLocation = true;

        excluded.forEach((url) => {
            if (req.originalUrl.endsWith(url)) {
                isGetUserLocation = false;
            }
        });

        if (isGetUserLocation) {
            const ipAddress = (req.headers && (req.headers['x-forwarded-for'] || '').split(',').pop()) ||
                (req.connection && req.connection.remoteAddress) ||
                (req.socket && req.socket.remoteAddress) ||
                (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
                req.ip;

            if (ipAddress && !ipAddress.endsWith('127.0.0.1')) {
                ipstack(ipAddress, process.env.IPSTACK_API_ACCESS_KEY, (err, response) => {
                    if (!err) {
                        const location = `ip:${response.ip || ''}, city:${response.city || ''}, country:${response.country_name || ''}`;
                        return resolve(location);
                    }

                    resolve(null);
                });
            } else {
                resolve(null);
            }
        } else {
            resolve(null);
        }
    });

    Promise.all([promiseUserLocation]).then((responses) => {
        const location = responses[0];

        var promiseActivityLog = new Promise((resolve, reject) => {
            const options = {
                userId: req.user.ID,
                geoLocation: location,
                browser: req.useragent.browser,
                alternateId: cookie.alternateId
            };

            client.ActivityLog.logLoginActivity(options, function(err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseActivityLog]).then((responses) => {
            callback(cookieName);
        });
    });
}

function signOut(req, res, callback) {
    logLoginActivity(req, res, 0, null, function(cookieName) {
        if (req.cookies) {
            [...Object.keys(req.cookies)].forEach(function(c) {
                if (c.toLowerCase() !== 'acceptcookiepolicy') {
                    res.clearCookie(c);
                }
            });
        }

        callback();
    });
}

router.post('/cgi-sign-in', async(req, res, next) => {
    const { cgiToken, userId } = req.body;

    if (!cgiToken || !userId) {
        res.status(400).send(`Incorrect values: cgiToken: ${cgiToken}, userId: ${userId}`);
        return null;
    }

    try {
        const resBe = await cgiAuthenticate(req);
        const isLocalEnv = req.hostname?.search('localhost') !== -1;

        console.log('sign-in BE status', resBe.status);

        const cookieOptions = { path: isLocalEnv ? '/' : '/arcadier_supplychain' };
        res.cookie('cgitoken', cgiToken, cookieOptions);
        res.cookie('clarivateUserId', userId, cookieOptions);
        res.cookie('webapitoken', resBe.data && resBe.data.arcadierToken ? resBe.data.arcadierToken : '', cookieOptions);

        //NOTE: Put back the original code when development is done
        if (resBe.data && resBe.data.ssoCode) {
            res.json({ redirectUrl: CommonModule.getAppPrefix() + '/account/signintodomain?code=' + resBe.data.ssoCode + '&returnUrl=' + CommonModule.getAppPrefix() + '/' });
        } else {
            res.json({ redirectUrl: CommonModule.getAppPrefix() + '/' });
        }
    } catch (e) {
        console.log('Error in cgi-sign-in route', e);
        res.status(500).send(e);
    }
});

router.get('/interested-user', function(req, res) {
    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ marketplaceLogoUrl: marketplace.LogoUrl });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<RegisterInterestPage marketplaceLogoUrl={marketplace.LogoUrl} />);
        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-interest', seoTitle, app, appString, reduxState));
    });
});

router.post('/interested-user', function(req, res) {
    const { name, email, type } = req.body;
    const options = { Name: name, Email: email, IsSeller: req.body.type === 'seller', Status: 'Interested' };

    const promiseRegisterInterestedUser = new Promise((resolve, reject) => {
        client.Accounts.registerInterestedUser(options, function(err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseRegisterInterestedUser]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

router.post('/sign-out', async(req, res) => {
    // signOut via CGI

    try {
        const resBe = await cgiLogout(req);
        console.log('sign-out BE status', resBe.status);

        utils.clearSessionCookies(res);
        res.redirect(process.env.CLARIVATE_LOGIN_IFRAME_URL + '/login?app=scn&refferer=%2Farcadier_supplychain');
    } catch (e) {
        console.log('Error', e);
        res.status(500).send(e.response);
    }
});

router.get('/auth-url', async(req, res) => {
    try {
        res.send(process.env.CLARIVATE_LOGIN_IFRAME_URL);
    } catch (e) {
        console.log('Error in auth-url route', e);
        res.sendStatus(500);
    }
});

router.get('/non-private/sign-in', function(req, res) {
    const error = req.query.error;
    const errorMessage = req.query.errorMessage;
    const host = utils.getHostname(req);
    const isSeller = req.query.isSeller;

    getMarketplaceInfo(false, true).then((marketplace) => {
        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplace.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplace.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplace.OpenIdProviders) {
                    customFacebook = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        let favIconData = '';

        let chatChannelId = '';

        if (req.query.chatChannelId) {
            chatChannelId = req.query.chatChannelId;
        }

        if (marketplace.Settings &&
            marketplace.Settings.themes &&
            marketplace.Settings.themes['theme-1'] &&
            marketplace.Settings.themes['theme-1'].favicon) {
            favIconData = marketplace.Settings.themes['theme-1'].favicon;
        }
        let guestUserID = '';
        if (req.query.guestUserID) {
            guestUserID = req.query.guestUserID;
        }

        const appString = 'login';
        const token = req.query.token || '';
        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, '', token, chatChannelId, isSeller) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, '', token, chatChannelId, isSeller) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';
        const NonPrivateLoginPage = require('../views/login/non-private-login').NonPrivateLoginComponent;

        const s = Store.createEmptyStore({
            type: 'non-private-guest',
            host: utils.getHostname(req),
            error: error,
            loginConfigurationSettings: loginConfigurationSettings,
            cookieData: marketplace.CustomFields,
            favIconData: favIconData,
            chatChannelId: chatChannelId,
            guestUserID: guestUserID,
            customFacebookDisplayName: customFacebookDisplayName,
            customGoogleDisplayName: customGoogleDisplayName,
            isMerge: req.query.merge,
            isSeller: isSeller,
            errorMessage: errorMessage
        });

        const reduxState = s.getState();

        const nonPrivateLogin = reactDom.renderToString(
            <NonPrivateLoginPage
                type='non-private-guest'
                host={host}
                facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook', '', token, chatChannelId, isSeller)}
                googleLoginUrl={buildExternalLoginUrl(host, 'Google', '', token, chatChannelId, isSeller)}
                customFacebookLoginUrl={customFacebookLoginUrl}
                customGoogleLoginUrl={customGoogleLoginUrl}
                marketplaceLogoUrl={marketplace.LogoUrl}
                error={error}
                loginConfigurationSettings={loginConfigurationSettings}
                cookieData={marketplace.CustomFields}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                customFacebookDisplayName={customFacebookDisplayName}
                customGoogleDisplayName={customGoogleDisplayName}
                isSeller={isSeller}
                errorMessage={errorMessage}
            />
        );

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login guest', seoTitle, nonPrivateLogin, appString, reduxState));
    });
});

router.post('/non-private/sign-in', function(req, res, next) {
    const isSeller = req.body.isSeller;
    passport.authenticate('login', function(err, user) {
        if (err) {
            return res.redirect(`${CommonModule.getAppPrefix()}/accounts/non-private/sign-in?isSeller=${isSeller}&error=invalid-login`);
        } else {
            if (!user) {
                return res.redirect(`${CommonModule.getAppPrefix()}/accounts/non-private/sign-in?isSeller=${isSeller}&error=invalid-login`);
            }

            if (req.token) {
                utils.setApiToken(res, req.token.access_token, req.token.expires_in);
            }

            req.logIn(user, function(err) {
                if (err) {
                    return res.redirect(`${CommonModule.getAppPrefix()}/accounts/non-private/sign-in?isSeller=${isSeller}&error=invalid-login`);
                }

                if (req.cookies.guestUserID && (req.body.isMerge == true || req.body.isMerge == 'true')) {
                    const options = {
                        guestUserId: req.cookies.guestUserID,
                        userId: req.user.ID
                    };

                    var promiseMergeUser = new Promise((resolve, reject) => {
                        client.Users.mergeGuestToUser(options, function(err, result) {
                            resolve(result);
                        });
                    });

                    Promise.all([promiseMergeUser]).then((responses) => {
                        const data = responses[0];
                    });
                }

                logLoginActivity(req, res, 0, null, function() {
                    if (req.body.returnUrl) {
                        return res.redirect(CommonModule.getAppPrefix() + '/' + req.body.returnUrl);
                    }

                    if (req.query.chatChannelId) {
                        return res.redirect(CommonModule.getAppPrefix() + '/chat?channelId=' + req.query.chatChannelId);
                    }

                    if (req.user.Roles.includes('Merchant')) {
                        return res.redirect(CommonModule.getAppPrefix() + '/merchants/dashboard');
                    }

                    res.redirect(CommonModule.getAppPrefix() + '/');
                });
            });
        }
    })(req, res, next);
});

router.get('/non-private/register', function(req, res) {
    var error = req.query.error;
    var isSeller = req.query.isSeller;
    var host = utils.getHostname(req);
    var token = null;
    var googleLoginUrl = buildExternalLoginUrl(host, 'Google', '', token);
    var facebookLoginUrl = buildExternalLoginUrl(host, 'Facebook', '', token);
    var NonPrivateSignUpPage = require('../views/login/non-private-sign-up').NonPrivateSignUpComponent;

    Promise.all([getMarketplaceInfo()]).then((responses) => {
        const marketplaceInfo = responses[0];
        const marketplaceRegistration = responses[1];

        const s = Store.createEmptyStore({
            error: error,
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            googleLoginUrl: googleLoginUrl,
            facebookLoginUrl: facebookLoginUrl,
            isSeller: isSeller
        });

        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(<NonPrivateSignUpPage
            error={error}
            marketplaceInfo={marketplaceInfo}
            googleLoginUrl={buildExternalLoginUrl(host, 'Google')}
            facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook')}
            isSeller={isSeller}
        />);
        const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/non-private/sign-up', function(req, res, next) {
    req.body.token = null;
    req.body.isSeller = req.body.isSeller.toLowerCase() == 'true';

    passport.authenticate('signup', function(err, user, token) {
        if (err) {
            return res.redirect(`${CommonModule.getAppPrefix()}/accounts/non-private/register?isSeller=${req.body.isSeller}&error=invalid-signup`);
        } else {
            if (token) {
                utils.setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function(err) {
                    if (err) {
                        return res.redirect(`${CommonModule.getAppPrefix()}/accounts/non-private/register?isSeller=${req.body.isSeller}&error=invalid-login`);
                    }
                    if (req.body.isSeller == true) return res.redirect(CommonModule.getAppPrefix() + '/merchants/settings');

                    res.redirect(CommonModule.getAppPrefix() + '/');
                });
            }
        }
    })(req, res, next);
});

router.get('/non-private/forgot-password', function(req, res) {
    const success = req.query.success;
    const isSeller = req.query.isSeller;

    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ success: success, marketplaceLogoUrl: marketplace.LogoUrl, type: 'non-private', isSeller: isSeller });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<ForgotPasswordPage marketplaceLogoUrl={marketplace.LogoUrl} success={success} type='non-private' isSeller={isSeller} />);
        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.get('/sign-in', function(req, res) {
    getMarketplaceInfo().then((marketplace) => {
        const settingsTemp = marketplace.Settings['private-settings']['private-settings-area'];
        const isMerchantRestrictedOnly = settingsTemp && settingsTemp.enabled == 'true' && settingsTemp.mode === '0';
        const aboutUs = settingsTemp['about-us'];
        const backgroundImage = process.env.PROTOCOL + '://' + process.env.BASE_URL + '/userdata/' + process.env.BASE_URL + '/images/' + settingsTemp['background-image-url'];
        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        const cookieData = marketplace.CustomFields;
        let favIconData = '';
        let chatChannelId = '';
        const error = req.query.error;
        const errorMessage = req.query.errorMessage;

        let isPrivateEnabled = false;
        if (marketplace.Settings &&
            marketplace.Settings['private-settings']['private-settings-area'].enabled === 'true') {
            isPrivateEnabled = true;
        }
        // const isNonPrivateGuest = isPrivateEnabled && process.env.TEMPLATE === 'bespoke';
        if (!isPrivateEnabled) {
            let url = CommonModule.getAppPrefix() + '/accounts/non-private/sign-in';

            if (error) {
                url += `?error=${error}`;
            }
            if (req.query.returnUrl) {
                url += url.indexOf('?') >= 0 ? '&' : '?';
                url += `returnUrl=${req.query.returnUrl}`;
            }
            if (errorMessage) {
                url += '&errorMessage=' + errorMessage;
            }
            return res.redirect(url);
        }

        if (marketplace.Settings &&
            marketplace.Settings.themes &&
            marketplace.Settings.themes['theme-1'] &&
            marketplace.Settings.themes['theme-1'].favicon) {
            favIconData = marketplace.Settings.themes['theme-1'].favicon;
        }

        if (req.query.chatChannelId) {
            chatChannelId = req.query.chatChannelId;
        }

        const s = Store.createEmptyStore({
            aboutUs,
            backgroundImage,
            cookieData,
            isMerchantRestrictedOnly,
            favIconData,
            chatChannelId,
            error
        });

        const reduxState = s.getState();
        const appString = 'login';

        const landingApp = reactDom.renderToString(
            <LandingPage
                aboutUs={aboutUs}
                backgroundImage={backgroundImage}
                cookieData={cookieData}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                isMerchantRestrictedOnly={isMerchantRestrictedOnly}
                error={error}
            />
        );
        res.send(template('page-landing', seoTitle, landingApp, appString, reduxState));
    });
});

router.get('/buyer/sign-in', function(req, res) {
    const error = req.query.error;
    const host = utils.getHostname(req);

    getMarketplaceInfo(false, true).then((marketplace) => {
        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplace.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplace.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplace.OpenIdProviders) {
                    customFacebook = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        let favIconData = '';

        let chatChannelId = '';

        if (req.query.chatChannelId) {
            chatChannelId = req.query.chatChannelId;
        }

        if (marketplace.Settings &&
            marketplace.Settings.themes &&
            marketplace.Settings.themes['theme-1'] &&
            marketplace.Settings.themes['theme-1'].favicon) {
            favIconData = marketplace.Settings.themes['theme-1'].favicon;
        }

        const s = Store.createEmptyStore({
            type: 'buyer',
            host: utils.getHostname(req),
            error: error,
            loginConfigurationSettings: loginConfigurationSettings,
            cookieData: marketplace.CustomFields,
            favIconData: favIconData,
            chatChannelId: chatChannelId
        });

        const reduxState = s.getState();
        const appString = 'login';
        const token = req.query.token;
        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, customFacebook.ClientId, token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, customGoogle.ClientId, token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';

        const buyerLogin = reactDom.renderToString(
            <LoginPage
                type='buyer'
                host={host}
                facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook', '', token, chatChannelId)}
                googleLoginUrl={buildExternalLoginUrl(host, 'Google', '', token, chatChannelId)}
                customFacebookLoginUrl={customFacebookLoginUrl}
                customGoogleLoginUrl={customGoogleLoginUrl}
                marketplaceLogoUrl={marketplace.LogoUrl}
                error={error}
                loginConfigurationSettings={loginConfigurationSettings}
                cookieData={marketplace.CustomFields}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                customFacebookDisplayName={customFacebookDisplayName}
                customGoogleDisplayName={customGoogleDisplayName}
            />
        );

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-landing', seoTitle, buyerLogin, appString, reduxState));
    });
});

router.post('/buyer/sign-in', passport.authenticate('login', { failureRedirect: CommonModule.getAppPrefix() + '/accounts/buyer/sign-in?error=invalid-login' }), function(req, res) {
    if (req.token) {
        utils.setApiToken(res, req.token.access_token, req.token.expires_in);
    }

    if (req.user) {
        logLoginActivity(req, res, 0, null, function() {
            if (req.query.chatChannelId) {
                res.redirect(CommonModule.getAppPrefix() + '/chat?channelId=' + req.query.chatChannelId);
            }

            res.redirect(CommonModule.getAppPrefix() + '/');
        });
    }
});

router.get('/buyer/register', function(req, res) {
    const error = req.query.error;
    const token = req.query.token;
    var host = utils.getHostname(req);
    var googleLoginUrl = buildExternalLoginUrl(host, 'Google', '', token);
    var facebookLoginUrl = buildExternalLoginUrl(host, 'Facebook', '', token);

    if (!token) {
        return res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
    }

    var promiseMarketPlaceRegistration = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceRegistration({ token: token }, function(err, userInfo) {
            if (err) {
                const serverError = err.message.split('Error Code:');
                if (serverError && serverError.length > 0) {
                    resolve({
                        errorMessage: serverError[0].trim(),
                        errorCode: serverError[1].trim()
                    });
                } else {
                    resolve(null);
                }
            } else {
                resolve(userInfo);
            }
        });
    });

    Promise.all([getMarketplaceInfo(), promiseMarketPlaceRegistration]).then((responses) => {
        const marketplaceInfo = responses[0];
        const marketplaceRegistration = responses[1];

        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplaceInfo.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplaceInfo.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplaceInfo.OpenIdProviders) {
                    customFacebook = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        if (!marketplaceRegistration) {
            return res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
        }

        if (marketplaceRegistration.errorCode == '400') {
            return res.redirect(`${CommonModule.getAppPrefix()}/accounts/sign-in?error=1&errorMessage=${marketplaceRegistration.errorMessage}`);
        }

        if (marketplaceRegistration.IsSeller) {
            return res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
        }

        const s = Store.createEmptyStore({
            error: error,
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            googleLoginUrl: googleLoginUrl,
            facebookLoginUrl: facebookLoginUrl,
            loginConfigurationSettings: loginConfigurationSettings,
            marketplaceRegistration: marketplaceRegistration
        });

        const reduxState = s.getState();
        const appString = 'login';

        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, customFacebook.ClientId, token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, customGoogle.ClientId, token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';
        const app = reactDom.renderToString(<BuyerSignUpPage
            error={error}
            marketplaceInfo={marketplaceInfo}
            customFacebookLoginUrl={customFacebookLoginUrl}
            customGoogleLoginUrl={customGoogleLoginUrl}
            loginConfigurationSettings={loginConfigurationSettings}
            customFacebookDisplayName={customFacebookDisplayName}
            customGoogleDisplayName={customGoogleDisplayName}
            googleLoginUrl={buildExternalLoginUrl(host, 'Google')}
            facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook')}
            marketplaceRegistration={marketplaceRegistration}
        />);
        const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/buyer/sign-up', function(req, res, next) {
    passport.authenticate('signup', function(err, user, token) {
        if (err) {
            res.redirect(CommonModule.getAppPrefix() + '/accounts/buyer/register?token=' + req.body.token + '&error=invalid-signup');
        } else {
            if (token) {
                utils.setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function(err) {
                    if (err) {
                        return res.redirect(CommonModule.getAppPrefix() + '/accounts/buyer/register?token=' + req.body.token + '&error=invalid-login');
                    }

                    res.redirect(CommonModule.getAppPrefix() + '/');
                });
            }
        }
    })(req, res, next);
});

router.get('/seller/register', function(req, res) {
    const error = req.query.error;
    const token = req.query.token;
    var host = utils.getHostname(req);
    var googleLoginUrl = buildExternalLoginUrl(host, 'Google', '', token) + '&isSeller=true';
    var facebookLoginUrl = buildExternalLoginUrl(host, 'Facebook', '', token) + '&isSeller=true';
    if (!token) {
        return res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
    }

    var promiseMarketPlaceRegistration = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceRegistration({ token: token }, function(err, userInfo) {
            resolve(userInfo);
        });
    });

    Promise.all([getMarketplaceInfo(), promiseMarketPlaceRegistration]).then((responses) => {
        const marketplaceInfo = responses[0];
        const marketplaceRegistration = responses[1];

        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplaceInfo.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplaceInfo.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplaceInfo.OpenIdProviders) {
                    customFacebook = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplaceInfo.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }
        if (!marketplaceRegistration) {
            return res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
        }

        if (!marketplaceRegistration.IsSeller) {
            return res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
        }

        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, customFacebook.ClientId, token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, customGoogle.ClientId, token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';
        const s = Store.createEmptyStore({
            error: error,
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            googleLoginUrl: googleLoginUrl,
            facebookLoginUrl: facebookLoginUrl,
            loginConfigurationSettings: loginConfigurationSettings,
            marketplaceRegistration: marketplaceRegistration
        });
        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(<SellerSignUpPage
            error={error}
            googleLoginUrl={googleLoginUrl}
            facebookLoginUrl={facebookLoginUrl}
            customFacebookLoginUrl={customFacebookLoginUrl}
            customGoogleLoginUrl={customGoogleLoginUrl}
            loginConfigurationSettings={loginConfigurationSettings}
            customFacebookDisplayName={customFacebookDisplayName}
            customGoogleDisplayName={customGoogleDisplayName}
            marketplaceRegistration={marketplaceRegistration}
        />);
        const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/seller/sign-up', function(req, res, next) {
    passport.authenticate('signup', function(err, user, token) {
        if (err) {
            res.redirect(CommonModule.getAppPrefix() + '/accounts/seller/register?token=' + req.body.token + '&error=invalid-signup');
        } else {
            if (token) {
                utils.setApiToken(res, token.access_token, token.expires_in);
            }
            if (user) {
                req.logIn(user, function(err) {
                    if (err) {
                        return res.redirect(CommonModule.getAppPrefix() + '/accounts/seller/register?token=' + req.body.token + '&error=invalid-login');
                    }

                    res.redirect(CommonModule.getAppPrefix() + '/merchants/settings');
                });
            }
        }
    })(req, res, next);
});

router.get('/seller/sign-in', function(req, res) {
    const error = req.query.error;
    const host = utils.getHostname(req);
    getMarketplaceInfo(false, true).then((marketplace) => {
        let loginConfigurationSettings = null;
        let customFacebook = null;
        let customGoogle = null;

        if (marketplace.Settings['login-configuration-settings']) {
            loginConfigurationSettings = marketplace.Settings['login-configuration-settings']['login-configuration-area'];

            if (loginConfigurationSettings) {
                if (marketplace.OpenIdProviders) {
                    customFacebook = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'facebook-' + process.env.BASE_URL);
                    customGoogle = marketplace.OpenIdProviders.find(o => o.Name.toLowerCase() == 'google-' + process.env.BASE_URL);

                    if (customFacebook) {
                        loginConfigurationSettings['sort-custom-facebook'] = customFacebook.SortOrder.toString();
                    }
                    if (customGoogle) {
                        loginConfigurationSettings['sort-custom-google'] = customGoogle.SortOrder.toString();
                    }
                }
            }
        }

        let favIconData = '';
        let chatChannelId = '';

        if (req.query.chatChannelId) {
            chatChannelId = req.query.chatChannelId;
        }

        if (marketplace.Settings &&
            marketplace.Settings.themes &&
            marketplace.Settings.themes['theme-1'] &&
            marketplace.Settings.themes['theme-1'].favicon) {
            favIconData = marketplace.Settings.themes['theme-1'].favicon;
        }

        const s = Store.createEmptyStore({
            type: 'seller',
            host: utils.getHostname(req),
            error: error,
            loginConfigurationSettings: loginConfigurationSettings,
            cookieData: marketplace.CustomFields,
            favIconData: favIconData,
            chatChannelId: chatChannelId
        });

        const reduxState = s.getState();
        const appString = 'login';

        const token = req.query.token;
        const customFacebookLoginUrl = customFacebook ? buildExternalLoginUrl(host, customFacebook.Name, customFacebook.ClientId, token, chatChannelId) : '';
        const customGoogleLoginUrl = customGoogle ? buildExternalLoginUrl(host, customGoogle.Name, customGoogle.ClientId, token, chatChannelId) : '';
        const customFacebookDisplayName = customFacebook ? customFacebook.DisplayName : '';
        const customGoogleDisplayName = customGoogle ? customGoogle.DisplayName : '';

        const sellerLogin = reactDom.renderToString(
            <LoginPage
                type='seller'
                host={host}
                facebookLoginUrl={buildExternalLoginUrl(host, 'Facebook', '', token, chatChannelId)}
                googleLoginUrl={buildExternalLoginUrl(host, 'Google', '', token, chatChannelId)}
                customFacebookLoginUrl={customFacebookLoginUrl}
                customGoogleLoginUrl={customGoogleLoginUrl}
                marketplaceLogoUrl={marketplace.LogoUrl}
                error={error}
                loginConfigurationSettings={loginConfigurationSettings}
                cookieData={marketplace.CustomFields}
                favIconData={favIconData}
                chatChannelId={chatChannelId}
                customFacebookDisplayName={customFacebookDisplayName}
                customGoogleDisplayName={customGoogleDisplayName}
            />
        );

        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-landing', seoTitle, sellerLogin, appString, reduxState));
    });
});

router.post('/seller/sign-in', passport.authenticate('login', { failureRedirect: CommonModule.getAppPrefix() + '/accounts/seller/sign-in?error=invalid-login' }), function(req, res) {
    if (req.user) {
        logLoginActivity(req, res, 0, null, function() {
            if (req.query.chatChannelId) {
                res.redirect(CommonModule.getAppPrefix() + '/chat?channelId=' + req.query.chatChannelId);
            }

            res.redirect(CommonModule.getAppPrefix() + '/merchants/dashboard');
        });
    }
});

router.get('/buyer/forgot-password', function(req, res) {
    const success = req.query.success;

    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ success: success, marketplaceLogoUrl: marketplace.LogoUrl, type: 'buyer' });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<ForgotPasswordPage marketplaceLogoUrl={marketplace.LogoUrl} success={success} type='buyer' />);
        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.get('/seller/forgot-password', function(req, res) {
    const success = req.query.success;

    getMarketplaceInfo().then((marketplace) => {
        const s = Store.createEmptyStore({ success: success, marketplaceLogoUrl: marketplace.LogoUrl, type: 'seller' });
        const reduxState = s.getState();
        const appString = 'login';
        const app = reactDom.renderToString(<ForgotPasswordPage marketplaceLogoUrl={marketplace.LogoUrl} success={success} type='seller' />);
        const seoTitle = marketplace.SeoTitle ? marketplace.SeoTitle : marketplace.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/forgot-password', function(req, res) {
    const loginName = req.body.username;
    const type = req.body.type;
    const isSeller = req.body.isSeller;

    if (loginName === '') {
        res.redirect(CommonModule.getAppPrefix() + '/accounts/' + type + `/forgot-password?isSeller=${isSeller}&success=false`);
        return;
    }
    const promiseUsers = new Promise((resolve, reject) => {
        const options = {
            keyword: loginName,
            role: type === 'non-private' ? 'buyer' : type,
            findExact: true
        };

        client.Users.getUsers(options, function(err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseUsers]).then((responses) => {
        const users = responses[0];
        const promiseResets = [];

        if (users.TotalRecords > 0) {
            users.Records.forEach(function(user) {
                promiseResets.push(new Promise((resolve, reject) => {
                    const options = {
                        userId: user.ID,
                        action: 'token'
                    };

                    client.Accounts.requestResetPassword(options, function(err, result) {
                        resolve(result);
                    });
                }));
            });

            Promise.all(promiseResets).then((responses) => {
                res.redirect(CommonModule.getAppPrefix() + '/accounts/' + type + `/forgot-password?isSeller=${isSeller}&success=true`);
            });
        } else {
            res.redirect(CommonModule.getAppPrefix() + '/accounts/' + type + `/forgot-password?isSeller=${isSeller}&success=false`);
        }
    });
});

router.get('/reset-password', function(req, res) {
    const userId = req.query.userId;
    const token = req.query.token;
    const success = req.query.success || null;

    if (!(userId && token) && success !== 'true') { res.redirect(CommonModule.getAppPrefix() + '/?error=invalid-reset-password'); }

    Promise.all([getMarketplaceInfo()]).then((responses) => {
        const marketplaceInfo = responses[0];

        const isPrivate = marketplaceInfo.Settings['private-settings']['private-settings-area'].enabled;

        const s = Store.createEmptyStore({
            marketplaceLogoUrl: marketplaceInfo.LogoUrl,
            token: token,
            userId: userId,
            success: success,
            isPrivatemarketPlace: isPrivate

        });
        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(
            <ResetPasswordPage
                marketplaceLogoUrl={marketplaceInfo.LogoUrl}
                token={token}
                userId={userId}
                isPrivatemarketPlace={isPrivate}
                success={success}
            />
        );
        const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-login', seoTitle, app, appString, reduxState));
    });
});

router.post('/reset-password', function(req, res) {
    var promiseResetPassword = new Promise((resolve, reject) => {
        const options = {
            userId: req.body.userId,
            resetPasswordToken: querystring.unescape(req.body.token),
            password: req.body.new_password,
            confirmPassword: req.body.reconfirm_password
        };
        client.Accounts.resetUserPassword(options, function(err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });

    Promise.all([promiseResetPassword]).then((responses) => {
        const result = responses[0];

        res.redirect(CommonModule.getAppPrefix() + '/accounts/reset-password?success=true');
    }, (err) => {
        res.redirect(CommonModule.getAppPrefix() + '/accounts/sign-in?error=1');
    });
});

router.get('/change-password', authenticated, authorizedUser, function(req, res) {
    const success = req.query.success;

    Promise.all([getMarketplaceInfo()]).then((responses) => {
        const s = Store.createEmptyStore({
            changePasswordReducer: { success: success },
            userReducer: { user: req.user }
        });
        const marketplaceInfo = responses[0];
        const reduxState = s.getState();
        const appString = 'login';

        const app = reactDom.renderToString(
            <ChangePasswordPage success={success} user={req.user} />);
        const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;
        res.send(template('page-reset', seoTitle, app, appString, reduxState));
    });
});

router.post('/change-password', authenticated, function(req, res) {
    const options = {
        userId: req.user.ID,
        oldPassword: req.body.oldPassword,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    var promiseChangePassword = new Promise((resolve, reject) => {
        client.Accounts.resetUserPassword(options, function(err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseChangePassword]).then((responses) => {
        const result = responses[0];
        if (result && result.Result === true) {
            signOut(req, res, function() {
                res.send({ ...result, user: null });
            });
        } else res.send({ Result: false, user: req.user });
    });
});

router.get('/non-private/be-seller', authenticated, function(req, res) {
    if (req.user === undefined) {
        return res.redirect(CommonModule.getAppPrefix() + '/accounts/non-private/sign-in?isSeller=true');
    }

    if (req.user.Roles.includes('Merchant') || req.user.Roles.includes('Submerchant')) {
        return res.redirect(CommonModule.getAppPrefix() + '/');
    }

    if (req.user && req.user.Guest === false) {
        const promiseMerchantUserRole = new Promise((resolve, reject) => {
            client.Accounts.updateUserRole({ userId: req.user.ID, role: 'Merchant' }, function(err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseMerchantUserRole]).then((responses) => {
            const merchantUserRole = responses[0];
            let promiseMerchant = null;

            if (merchantUserRole && merchantUserRole.Result) {
                promiseMerchant = new Promise((resolve, reject) => {
                    client.Users.getUserDetails({ userId: req.user.ID }, function(err, details) {
                        resolve(details);
                    });
                });
            }

            Promise.all([promiseMerchant]).then((responses) => {
                const merchant = responses[0];

                if (merchant) {
                    req.logIn(merchant, function(err) {
                        if (err) {
                            return res.redirect(CommonModule.getAppPrefix() + '/');
                        }
                        return res.redirect(CommonModule.getAppPrefix() + '/merchants/settings');
                    });
                }

                res.redirect(CommonModule.getAppPrefix() + '/');
            });
        });
    } else {
        if (req.user) {
            return res.redirect(CommonModule.getAppPrefix() + '/accounts/non-private/sign-in?isSeller=true');
        }
    }
});

module.exports = router;
