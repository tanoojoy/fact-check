import express from 'express';
import React from 'react';
import reactDom from 'react-dom/server';
import Store from '../redux/store';
import passport from 'passport';
import client from '../../sdk/client';
import authenticated from '../scripts/shared/authenticated';
import template from '../views/layouts/template';
import { getAppPrefix } from '../public/js/common';
import { HomepageComponent } from '../views/home';
import { Search } from '../consts/search-categories';
import { homePage as homePagePPs } from '../consts/page-params';
import { homepageAuthTemplate } from '../views/home/home-page-initial-login-page';
import { clearSessionCookies } from '../utils';

const homePageRouter = express.Router();

/* GET home page. */
homePageRouter.get('/', authenticated, async(req, res) => {
    let { user } = req;

    if (!user) {
        clearSessionCookies(res);
        res.send(homepageAuthTemplate);
    }

    if (user && !user.userInfo) {
        user = {};
        clearSessionCookies(res);
        res.redirect(`${getAppPrefix()}/`);
        return;
    }

    const { PRICING_TYPE } = process.env;

    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function(err, result) {
            if (!err) {
                resolve(result);
            }
        });
    });

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function(err, categories) {
            if (!err) {
                resolve(categories);
            }
        });
    });

    const promisePanels = new Promise((resolve, reject) => {
        const options = {
            type: 'all',
            pageSize: 24,
            pageNumber: 1
        };

        client.Panels.getPanels(options, function(err, panels) {
            if (!err) {
                resolve(panels);
            }
        });
    });

    Promise.all([promiseMarketplaceInfo, promiseCategories, promisePanels])
        .then((responses) => {
            const marketplaceInfo = responses[0];
            const categories = responses[1];
            const panels = responses[2];

            let locationVariantGroupId = null;
            let userPreferredLocationId = null;
            if (PRICING_TYPE == 'country_level') {
                if (marketplaceInfo.CustomFields) {
                    const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                    if (locationCustomField && locationCustomField.Values.length > 0) {
                        locationVariantGroupId = locationCustomField.Values[0];
                    }
                }

                if (user) {
                    if (user.CustomFields && user.CustomFields.length > 0) {
                        const customField = user.CustomFields.find(c => c.Code.startsWith('user_preferred_location'));

                        if (customField) {
                            userPreferredLocationId = customField.Values[0];
                        }
                    }
                }
            }

            const appString = homePagePPs.appString;
            const context = {};
            
            const { SEARCH_BY } = Search;

            const s = Store.createHomepageStore({
                categoryReducer: { categories: categories },
                panelsReducer: { panels: panels.Records },
                userReducer: { user: user },
                searchReducer: { searchCategory: SEARCH_BY.DEFAULT_CATEGORY, searchResults: '', hideSearchBar: true }

            });

            const seoTitle = marketplaceInfo.SeoTitle ? marketplaceInfo.SeoTitle : marketplaceInfo.Name;

            const reduxState = s.getState();
            const homepageApp = reactDom.renderToString(
                <HomepageComponent
                    context={context}
                    categories={categories}
                    panels={panels.Records}
                    user={user}
                    searchCategory={SEARCH_BY.DEFAULT_CATEGORY}
                    hideSearchBar
                />);
            res.send(template(homePagePPs.bodyClass, seoTitle, homepageApp, appString, reduxState));
        })
        .catch(e => console.log('Home route promiseMarketplaceInfo, promiseCategories, promisePanels,  error:', e));
});

homePageRouter.get('/admin', function(req, res) {
    res.redirect(process.env.PROTOCOL + '://' + process.env.BASE_URL + '/admin');
});

homePageRouter.all('/admin/*', function(req, res) {
    res.redirect(process.env.PROTOCOL + '://' + process.env.BASE_URL + '/admin');
});

homePageRouter.get('/account/signintodomain', passport.authenticate('user_impersonation_code', { failureRedirect: getAppPrefix() + '/accounts/buyer/sign-in?error=invalid-login' }), function(req, res) {
    if (req.user) {
        const parse = req.query;
        let returnUrl = getAppPrefix() + '/';
        if (typeof parse.returnUrl !== 'string') {
            parse.returnUrl.forEach(function(ru) {
                if (ru.length > 1) {
                    returnUrl = ru;
                }
            });
        } else {
            returnUrl = parse.returnUrl;
        }

        res.redirect(returnUrl);
    }
});

homePageRouter.get('/user/item/detail/:slug/:id', function(req, res) {
    res.redirect(getAppPrefix() + '/items/' + req.params.slug + '/' + req.params.id);
});

homePageRouter.post('/events', function(req, res) {
    res.status(200).send('Not found');
});

module.exports = homePageRouter;
