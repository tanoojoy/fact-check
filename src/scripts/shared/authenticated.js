'use strict';
import client from '../../../sdk/client';
import { getCompanyById } from '../../routes/horizon-api/entity-service/company-controller';
import { getUserInfo } from '../../routes/horizon-api/auth-service/auth-controller';

const getCgiUser = async(req) => {
    try {
        const respUserData = await getUserInfo(req);

        if (respUserData && respUserData.data) {
            req.user = respUserData.data.horizon_user || req.user;
            req.user.userInfo = JSON.parse(JSON.stringify(respUserData.data));
            const { userid, clarivate_company_id, role, flags } = respUserData.data;
            req.user.ID = userid || null;
            req.user.companyId = clarivate_company_id || null;
            req.user.role = role || null;
            req.user.hasCompany = !!req.user.companyId;
            req.user.flags = flags;

            const respCompanyData = await getCompanyById(req);
            req.user.companyInfo = respCompanyData.data;

            return await req.user;
        }
    } catch (e) {
        console.log(e);
        return await req.user;
    }
};

module.exports = function isAuthenticated(req, res, next) {
    if (!req.user) return next();
    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function(err, result) {
            if (!err) {
                const { SeoTitle, CustomFields, Name, Settings, CurrencyCode, LogoUrl } = result;
                resolve({
                    SeoTitle,
                    CustomFields,
                    Name,
                    CurrencyCode,
                    LogoUrl,
                    isPrivateEnabled: Settings != null && Settings['private-settings']['private-settings-area'].enabled === 'true',
                    isSellerVisibilityRestricted: Settings != null && Settings['private-settings']['private-settings-area']['restrict-seller-visibility'] === 'true',
                    isPrivateSellerSignUp: Settings != null && Settings['private-settings']['private-settings-area'].mode === '0'
                });
            }
        });
    });

    Promise.all([promiseMarketplaceInfo]).then(info => {
        const { SeoTitle, CustomFields, Name, isPrivateEnabled, CurrencyCode, isSellerVisibilityRestricted, LogoUrl, isPrivateSellerSignUp } = info[0];
        req.SeoTitle = SeoTitle;
        req.CustomFields = CustomFields;
        req.Name = Name;
        req.CurrencyCode = CurrencyCode;
        req.LogoUrl = LogoUrl;
        req.isPrivateEnabled = isPrivateEnabled;
        req.isSellerVisibilityRestricted = isSellerVisibilityRestricted;
        req.isPrivateSellerSignUp = isPrivateSellerSignUp;

        if (req.user) {
            getCgiUser(req, res).then(() => {
                return next();
            });
        } else return next();
    });
};
