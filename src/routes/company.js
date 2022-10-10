let React = require('react');
let express = require('express');
let reactDom = require('react-dom/server');
let template = require('../views/layouts/template');
let Store = require('../redux/store');
let client = require('../../sdk/client');

let authenticated = require('../scripts/shared/authenticated');
let CompanySettingsIndexComponent = require('../views/company/settings/index').CompanySettingsIndexComponent;
let CompanyDetailsIndexComponent = require('../views/company/details/index').CompanyDetailsIndexComponent;
let AddEditProductPage = require('../views/company/add-edit-product/index').AddEditProductPage;

import multer from 'multer';

const uploadMiddleware = multer();

const companyRouter = express.Router();

import { 
    redirectUnauthorizedUser,
    toUserCompanyInfoObj,
    toItemDetailObj,
    toProductInfoObj,
    getNormalizedProductAttributes,
} from '../utils';

import {
    deleteFile,
    getFilesList,
    uploadFile
} from './horizon-api/document-sharing-service/document-sharing-controller';
import {
    getCompanyById,
    updateCompany,
    getCompanyInfoSources,
    getUpdatedCompanies
} from './horizon-api/entity-service/company-controller';

import {
    getConnectionsDetailsByCompanyProduct,
    createProduct,
    updateProduct,
    getConnectionsByCompany,
    getCompanySources,
    getAddedProductCompanies,
    getUpdatedProducts
} from './horizon-api/entity-service/connections-controller';

import {
    getCompanyManufacturerCapabilities,
    getCompanyOtherServices,
    getCompanySubsidiaryTypes, getGmpCertificates, getGmpStatuses,
    getPredefinedCompanyAlerts, getRegFilings, getRegFilingsStatuses,
    getManufacturingStatus,
    getCountriesList
} from './horizon-api/entity-service/drop-down-controller';

import { 
    getFollowerList,
    getFollowers
} from './horizon-api/entity-service/follower-controller';
import { updateUpstreamSupply } from './horizon-api/entity-service/upstream-controller';

import { getSubsAccounts } from './horizon-api/auth-service/auth-controller';

import {
    companySettings as companySettingsPPs,
    companyDetails as companyPPs,
    productSettings as productSettingsPPs
} from '../consts/page-params';
import { company } from '../consts/page-params';

import { Search } from '../consts/search-categories';

import { productTabs } from '../consts/product-tabs';

import { NOTIFICATION } from '../consts/notifications';

const { API, DOSE_FORM } = productTabs;

export const getItemCustomFields = (filters, callback) => {
    const promiseItemCustomFields = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions('Items', (err, results) => {
            resolve(results);
        });
    })

    Promise.all([promiseItemCustomFields])
        .then((response) => {
            const { dataInputTypes = [], customFieldNames = [] } = filters;
            if (response && response[0]) {
                const customFieldDefinitions = response[0];

                if (customFieldDefinitions.TotalRecords > 0) {
                    let customFields = customFieldDefinitions.Records || [];
                    if (dataInputTypes && dataInputTypes.length > 0) {
                        customFields = customFields.filter(customField => dataInputTypes.includes(customField.DataInputType));
                    }

                    if (customFieldNames && customFieldNames.length > 0) {
                        customFields = customFields.filter(customField => customFieldNames.includes(customField.Name));
                    }
                    return callback(customFields);
                }
            } else {
                return callback([])
            }
        })
        .catch ((e) => callback([]));
}

companyRouter.get('/settings', authenticated, function(req, res) {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }    

    const activeTab = req.query?.activeTab;
    const { SEARCH_BY } = Search;

    var getCompanyIdPromise = new Promise((resolve, reject) => {
        getCompanyById(req)
            .then(result => {                
                resolve(result);
            });
    });

    var getCompanySubsidiaryTypesPromise = new Promise((resolve, reject) => {
        getCompanySubsidiaryTypes()
            .then(result => {
                resolve(result.data);
            });
    });

    var getCompanyOtherServicesPromise = new Promise((resolve, reject) => {
        getCompanyOtherServices()
            .then(result => {
                resolve(result.data);
            });
    });

    var getPredefinedCompanyAlertsProimise = new Promise((resolve, reject) => {
        getPredefinedCompanyAlerts()
            .then(result => {
                resolve(result.data);
            });
    });

    var getCompanyManufacturerCapabilitiesPromise = new Promise((resolve, reject) => {
        getCompanyManufacturerCapabilities()
            .then(result => {                
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });

    var getFilesListPromise = (companyId) => {
        return new Promise((resolve, reject) => {
            getFilesList(companyId)
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    reject(e);
                });
        });
    };

    Promise.all([getCompanyIdPromise]).then(responses => {
        const [resCgiCompanyData] = responses;
        const companyInfo = resCgiCompanyData.data;
        console.log('settings companyInfo', JSON.stringify(companyInfo));
        
        Promise.allSettled([getConnectionsByCompany(companyInfo?.id), 
                    getCompanySubsidiaryTypesPromise, 
                    getCompanyOtherServicesPromise, 
                    getCompanyManufacturerCapabilitiesPromise, 
                    getPredefinedCompanyAlertsProimise,
                    getSubsAccounts(companyInfo?.id),
                    getFilesListPromise(companyInfo?.id), 
                    getCountriesList()]).then(responses => { //, getFilesList(companyInfo?.id)]).then(responses => {
                        const [restCgiCompanyProducts, subsidiaryTypes, otherServices, manufacturerCapabilities, predefinedAlerts, subsAccounts, filesList, countriesList] = responses;

                        //console.log('subsAccounts', subsAccounts);
                        //const recipientEmails = subsAccounts.value.filter(acct => acct.role === 'MerchantSubAccount').map(item => item.email);
                        //console.log(recipientEmails);
                        //return;

            const contractManufacturingOrganizationList = ['Yes', 'No'];                        

            companyInfo.contractManufacturingOrganization = companyInfo.cmo ? 'Yes' : 'No';
            const companyFilesList = filesList?.value  || [];
            const companyProducts = restCgiCompanyProducts?.value?.products?.map(productEntry => ({ ...productEntry, ...productEntry.product }));
            
            const userCompanyInfo = toUserCompanyInfoObj(companyInfo, false, companyProducts, false, companyFilesList);
            
            const s = Store.createCompanyPageStore({
                userReducer: { 
                    user: req.user, 
                    userDetails: userCompanyInfo,
                    activeTab: activeTab,
                    subsAccounts: subsAccounts.value
                },
                companyReducer: {
                    predefinedValues: {
                        subsidiaryTypes: subsidiaryTypes?.value,
                        otherServices: otherServices?.value,
                        manufacturerCapabilities: manufacturerCapabilities?.value,
                        predefinedAlerts: predefinedAlerts?.value,
                        contractManufacturingOrganizationList, 
                        countries: countriesList.value.data
                    }
                },
                searchReducer: { searchCategory: SEARCH_BY.PRODUCTS, searchResults: '' }
            });

            const reduxState = s.getState();

            const appString = companySettingsPPs.appString;

            const CompanyApp = reactDom.renderToString(<CompanySettingsIndexComponent
                companyInfo={userCompanyInfo}
                user={req.user}
                activeTab={activeTab}
                subsidiaryTypes={subsidiaryTypes?.value} 
                predefinedAlerts={predefinedAlerts?.value}
                contractManufacturingOrganizationList={contractManufacturingOrganizationList}
                otherServices={otherServices?.value} 
                companyProducts={userCompanyInfo.companyProducts} 
                manufacturerCapabilities={manufacturerCapabilities?.value}
            />);

            res.send(template(companySettingsPPs.bodyClass, companySettingsPPs.title, CompanyApp, appString, reduxState));
        });
    });
    
});

companyRouter.put('/update', authenticated, function(req, res) {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    var updateCompanyPromise = new Promise((resolve, reject) => {
        updateCompany(req)
            .then(result => {                
                resolve(result);                
            });
    });

    var getFilesListPromise = (companyId) => {
        return new Promise((resolve, reject) => {
            getFilesList(companyId)
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    reject(e);
                });
        });
    };

    Promise.all([updateCompanyPromise]).then(responses => {
        const [updatedCompanyInfo] = responses;
        console.log('updateResponse', updatedCompanyInfo);
        Promise.allSettled([getConnectionsByCompany(updatedCompanyInfo?.id), getFilesListPromise(updatedCompanyInfo?.id)])
            .then(responses => {
                const [restCgiCompanyProducts, companyFilesList] = responses;
                const companyProducts = restCgiCompanyProducts?.value?.products?.map(productEntry => ({ ...productEntry, ...productEntry.product }));
                console.log('companyFilesList', companyFilesList);
                const userCompanyInfo = toUserCompanyInfoObj(updatedCompanyInfo, false, companyProducts, false, companyFilesList.data ? companyFilesList.data : null);
                res.send(userCompanyInfo);
            });        
    });
}); 

companyRouter.get('/:companyId?', authenticated, async(req, res) => {
    const { companyId = (req.user?.companyId || req.user?.companyInfo?.id || null) } = req.params;
    const clarivateUserId = req?.user?.userInfo?.userid;

    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    var getCompanyIdPromise = (companyId) => {
        return new Promise((resolve, reject) => {
            getCompanyById(req, companyId)
                .then(result => {                             
                    resolve(result.data);
                })
                .catch(e => {
                    console.log('getCompanyIdPromise error', e);
                    reject(e);
                });
        });
    };

    var getConnectionsByCompanyPromise = (companyId) => {
        return new Promise((resolve, reject) => {
            getConnectionsByCompany(companyId)
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    console.log('getConnectionsByCompanyPromise error', e);
                    reject(e);
                });
        });
    };

    var getFilesListPromise = (companyId) => {
        return new Promise((resolve, reject) => {
            getFilesList(companyId)
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    console.log('getFilesListPromise error', e);
                    reject(e);
                });
        });
    };

    var getFollowerListPromise = (clarivateUserId, companyId) => {
        return new Promise((resolve, reject) => {
            getFollowerList(clarivateUserId, companyId)
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    console.log('getFollowerListPromise error', e);
                    reject(e);
                });
        });
    };

    Promise.allSettled([getCompanyIdPromise(companyId), 
        getConnectionsByCompanyPromise(companyId), 
        getFilesListPromise(companyId),
        getSubsAccounts(companyId),
        getFollowers(clarivateUserId, companyId)]).then(responses => {
        const [
            resCgiCompanyDataPromise,
            resCgiCompanyProductsPromise,
            filesListPromise,
            subAccounts,
            followListPromise
        ] = responses;

            const companyInfo = resCgiCompanyDataPromise?.value;
            const followers = followListPromise?.value?.followers;
            const isFollowCompany = followers && followers.length > 0 ? !!followers[0]?.companyId : false;
            const resCgiCompanyProducts = resCgiCompanyProductsPromise?.value?.products || [];
            const filesList = filesListPromise && filesListPromise.value ? filesListPromise.value : [];

            const userCompanyInfo = toUserCompanyInfoObj(companyInfo, false, resCgiCompanyProducts, isFollowCompany, filesList);
            const s = Store.createCompanyPageStore({
                userReducer: { 
                    user: req.user,
                    userDetails: userCompanyInfo,
                    subAccounts: subAccounts.value
                }, 
                companyReducer: {
                    predefinedValues: {
                    
                    }
                }            
            });
            const reduxState = s.getState();
            const appString = companyPPs.appString;

            const CompanyApp = reactDom.renderToString(<CompanyDetailsIndexComponent userDetails={userCompanyInfo} user={req.user} />);
        
            res.send(template(companyPPs.bodyClass, companyPPs.title, CompanyApp, appString, reduxState));
    });
});

companyRouter.post('/update/add-new-exist-product', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }
    try {
        let success = false;
        const { newProduct, item } = req.body;
        const { userInfo = {}, companyInfo = {} } = req?.user;

        if (newProduct.type.toUpperCase() === DOSE_FORM.productType) {
            return res.json({ success });
        }

        const response = await createProduct(userInfo.userid, newProduct);

        if (newProduct.type.toUpperCase() === API.productType) {
            const companyInfoID = req?.user?.companyInfo?.id;

            const [
                connectionsDetailsByCompanyProductRequest,
                companySources
            ] = await Promise.allSettled(
                [
                    getConnectionsDetailsByCompanyProduct(req, companyInfoID, newProduct.productId),       
                    getCompanySources(req.user?.companyId),
                ]
            );

            const productDetails = connectionsDetailsByCompanyProductRequest?.value?.data[0];

            let productAttributes = getNormalizedProductAttributes(productDetails, companySources?.value)

            const updatedItem = toItemDetailObj({ ...productDetails, ...productAttributes}, API.productType);
            if (item && item.CustomFields && item.CustomFields.length > 0) {
                const { CustomFields: newCustomFields } = item;
                const { CustomFields } = updatedItem;
                updatedItem.CustomFields = Object.values([...CustomFields, ...newCustomFields].reduce((result, {
                    Code,
                    ...rest
                }) => {
                    result[Code] = {
                        ...(result[Code] || {}),
                        Code,
                        ...rest
                    };
                    return result;
                }, {}));

                const productInfo = toProductInfoObj(updatedItem);
                const updateResult = await updateProduct(userInfo.userid, productInfo) || {};
                const updateUpstreamSupplyResponse = await updateUpstreamSupply(userInfo.userid, companyInfoID, newProduct.productId, productInfo.upstreamSupply);
                success = updateResult && updateResult.productId !== null;
            } else {
                success = true;
            }
        } else {
            success = true;
        }

        res.json({ success });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.statusCode(500);
    }
});

companyRouter.get('/product/create', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    try {
        const [
            gmpCertificates,
            gmpStatuses,
            regFilings,
            regFilingsStatuses,
            manufacturingStatuses,
            companyData,
        ] = await Promise.allSettled(
            [
                getGmpCertificates(),
                getGmpStatuses(),
                getRegFilings(),
                getRegFilingsStatuses(),
                getManufacturingStatus(),
                getCompanyById(req)
            ]
        );

        const specialOffers = ['unconfirmed', 'no', 'yes'];

        const productDetails = {
            company: companyData?.value?.data || {}
        }

        const defaultCategory = API.productType;
        const item = toItemDetailObj(productDetails, defaultCategory);

        const customFieldFilter = {
            customFieldNames: ['Product Alerts'],
            dataInputTypes: ['dropdown']
        };

        getItemCustomFields(customFieldFilter, (customFields) => {
            let alerts = [];
            if (customFields && customFields.length > 0) {
                const productAlertsField = customFields[0] || {};
                alerts = productAlertsField?.Options.map(opt => opt.Name);
            }
    
            const predefinedValues = {
                gmpCertificates: gmpCertificates?.value?.data,
                gmpStatuses: gmpStatuses?.value?.data,
                regFilings: regFilings?.value?.data,
                regFilingsStatuses: regFilingsStatuses?.value?.data,
                manufacturingStatuses: manufacturingStatuses?.value?.data,
                specialOffers,
                alerts,
            };

            const pageType = 'ADD_ITEM';

            const store = Store.createItemUploadEditStore({
                userReducer: { user: req.user },
                uploadEditItemReducer: { 
                    predefinedValues,
                    item,
                    pageType: pageType,
                    referenceItem: item
                }
            });

            const reduxState = store.getState();
            const appString = productSettingsPPs.appString;

            const ProductSettingsApp = reactDom.renderToString(
                <AddEditProductPage 
                    user={req.user}
                    predefinedValues={predefinedValues}
                    item={item}
                    referenceItem={item}
                    pageType={pageType}
                />);
            res.send(template(productSettingsPPs.bodyClass, productSettingsPPs.title, ProductSettingsApp, appString, reduxState));
        });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.delete('/files/:companyId/:fileName', async (req, res) => {
    try {
        const { companyId, fileName } = req.params;
        await deleteFile(companyId, fileName);
        res.sendStatus(200);
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.post('/files/:companyId/upload', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const { companyId } = req.params;
        const { file } = req;
        await uploadFile(companyId, file);
        const files = await getFilesList(companyId);
        res.json({ files });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.get('/product/:productId/settings', authenticated, async(req, res) => {
    if (redirectUnauthorizedUser(req, res)) {
        return;
    }

    try {
        const [
            connectionsDetailsByCompanyProductRequest,
            gmpCertificates,
            gmpStatuses,
            regFilings,
            regFilingsStatuses,
            manufacturingStatuses,
            companySources
        ] = await Promise.allSettled(
            [
                getConnectionsDetailsByCompanyProduct(req, req?.user?.companyInfo?.id, req.params.productId),
                getGmpCertificates(),
                getGmpStatuses(),
                getRegFilings(),
                getRegFilingsStatuses(),
                getManufacturingStatus(),          
                getCompanySources(req.user?.companyId),
            ]
        );
        const specialOffers = ['unconfirmed', 'no', 'yes'];
       
        const productDetails = connectionsDetailsByCompanyProductRequest?.value?.data[0];

        let productAttributes = getNormalizedProductAttributes(productDetails, companySources?.value)
        let product = { ...productDetails, ...productAttributes}

        const item = toItemDetailObj(product, API.productType);

        const customFieldFilter = {
            customFieldNames: ['Product Alerts'],
            dataInputTypes: ['dropdown']
        };

        getItemCustomFields(customFieldFilter, (customFields) => {
            let alerts = [];
            if (customFields && customFields.length > 0) {
                const productAlertsField = customFields[0] || {};
                alerts = productAlertsField?.Options.map(opt => opt.Name);
            }

            const predefinedValues = {
                gmpCertificates: gmpCertificates?.value?.data,
                gmpStatuses: gmpStatuses?.value?.data,
                regFilings: regFilings?.value?.data,
                regFilingsStatuses: regFilingsStatuses?.value?.data,
                manufacturingStatuses: manufacturingStatuses?.value?.data,
                specialOffers,
                alerts,
            };

            const pageType = 'EDIT_ITEM';
            const store = Store.createItemUploadEditStore({
                userReducer: { user: req.user },
                uploadEditItemReducer: { 
                    pageType,
                    predefinedValues,
                    item,
                    referenceItem: { ...item},
                }
            });

            const reduxState = store.getState();
            const appString = productSettingsPPs.appString;

            const ProductSettingsApp = reactDom.renderToString(
                <AddEditProductPage 
                    user={req.user}
                    predefinedValues={predefinedValues}
                    item={item}
                    referenceItem={item} 
                    pageType={pageType}
                />);
            res.send(template(productSettingsPPs.bodyClass, productSettingsPPs.title, ProductSettingsApp, appString, reduxState));
        });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.get('/sources/:companyId', authenticated, async(req, res) => {
    try {
        const { companyId = null } = req.params;
        const companySources = await getCompanyInfoSources(companyId);
        res.json({ companySources });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.delete('/files/:companyId/:fileName', async(req, res) => {
    try {
        const { companyId, fileName } = req.params;
        await deleteFile(companyId, fileName);
        res.sendStatus(200);
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.post('/files/:companyId/upload', uploadMiddleware.single('file'), async(req, res) => {
    try {
        const { companyId } = req.params;
        const { file } = req;
        await uploadFile(companyId, file);
        const files = await getFilesList(companyId);
        res.json({ files });
    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.sendStatus(500);
    }
});

companyRouter.post('/notification', async(req, res) => {
    //will handle compoany update, new product and update product alerts
    try {
        const clarivateUserId = req?.user?.userInfo?.userid;
        let success = false;
        const { notificationType = null } = req.body;
        let updates = null;
        let data = null;

        if(notificationType === NOTIFICATION.COMPANYUPDATE){
            updates = getUpdatedCompanies(new Date(+0).toISOString());
        }
        else if(notificationType === NOTIFICATION.NEWPRODUCTUPDATE){
            updates = getAddedProductCompanies(new Date(+0).toISOString());
        }
        else if(notificationType === NOTIFICATION.PRODUCTUPDATE){
            updates = getUpdatedProducts(new Date(+0).toISOString());
        }

        if(updates !== null){
            //get followers
            updates.Records.forEach(function (update) {
                const followers = getFollowers(clarivateUserId, update.Id);
                //set EDM data
                //send notification
            });
        }
        
        res.json({ success });

    } catch (e) {
        console.log(`Error in ${req.originalUrl}`, e);
        res.statusCode(500);
    }
});

export default companyRouter;