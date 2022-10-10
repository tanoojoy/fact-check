'use strict';
import { redirectUnauthorizedUser } from '../../utils';

let express = require('express');
let merchantUploadEditRouter = express.Router();
let React = require('react');
let reactDom = require('react-dom/server');
let Store = require('../../redux/store');
let template = require('../../views/layouts/template');
let UploadEditComponent = require('../../views/merchant/item/upload-edit/main').UploadEditComponent;

let authenticated = require('../../scripts/shared/authenticated');
let authorizedMerchant = require('../../scripts/shared/authorized-merchant');
var onboardedMerchant = require('../../scripts/shared/onboarded-merchant');
let client = require('../../../sdk/client');

let multer = require('multer');
let uploadMulter = multer();
let FormData = require('form-data');

const EnumCoreModule = require('../../public/js/enum-core.js');

var handlers = [authenticated, authorizedMerchant, onboardedMerchant];

function generateUUID() {
    // temporary id only for variants in bespoke item upload
    return 'temp-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createDefaultVariantGroups(currentVariantGroups) {
    let length = currentVariantGroups.length;
    if (length < 3) {
        if (length == 0) {
            currentVariantGroups.push({
                id: generateUUID(),
                name: "Color",
                sortOrder: 1,
                variants: [{
                    id: generateUUID(),
                    name: "Red",
                    sortOrder: 1
                }]
            });

            length++;
        }

        for (let i = length; i < 3; i++) {
            currentVariantGroups.push({
                id: generateUUID(),
                name: "",
                sortOrder: i + 1,
                variants: []
            });
        }
    }

    return Object.assign([], currentVariantGroups);
}

merchantUploadEditRouter.get('/upload', ...handlers, function (req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    let currentUser = req.user;
    const appString = 'merchant-item-edit';

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function (err, result) {
            resolve(result);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function (err, result) {
            resolve(result);
        });
    });

    const promiseShippingOptionsMerchant = new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingMethods(currentUser.ID, function (err, result) {
            resolve(result);
        });
    });

    const promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingOptions(function (err, result) {
            resolve(result);
        });
    });

    const promiseAddress = new Promise((resolve, reject) => {
        client.Addresses.getUserPickupAddresses(currentUser.ID, function (err, addresses) {
            resolve(addresses);
        });
    });

    const promisePluginCustomFields = new Promise((resolve, reject) => {
        if (process.env.PRICING_TYPE == 'variants_level') {
            resolve(null);
        }
        client.CustomFields.getDefinitions(EnumCoreModule.GetCustomFieldReferenceTables().Items, function (err, result) {
            let pluginCustomFields = null;

            if (result && result.Records && result.Records.length > 0) {
                pluginCustomFields = {
                    Records: []
                };
                result.Records.map(function (customField, index) {
                    if (customField.GroupName === EnumCoreModule.GetCustomFieldGroups().Availability) {
                        pluginCustomFields.Records.push(customField);
                    }
                });
            }

            resolve(pluginCustomFields);
        });
    });

    Promise.all([promiseCategories, promiseMarketplace, promiseShippingOptionsAdmin, promiseShippingOptionsMerchant, promiseAddress, promisePluginCustomFields]).then((responses) => {
        let categories = responses[0];
        let marketplaceInfo = responses[1];
        let shippingOptionsAdmin = responses[2];
        let shippingOptionsMerchant = responses[3];
        let shippingOptionsPickup = responses[4];
        let packageCustomfields = responses[5];

        function setupCategories(category) {
            category.Selected = '';
            category.ShowThis = true;
            if (category.ChildCategories.length > 0) {
                category.ChildCategories.forEach(function(child) {
                    child.ParentCategoryID = category.ID;
                    setupCategories(child);
                });
            }
        }

        if (categories) {
            categories.forEach(function (category) {
                setupCategories(category);
            });
        }

        let shippings = [];
        if (shippingOptionsAdmin) {
            shippingOptionsAdmin.forEach(function (shipping) {
                if (shipping.CustomFields) {
                    shipping.CustomFields.forEach(function (cf) {
                        let shippingDetails = JSON.parse(cf.Values);
                        shippings.push({
                            GUID: shipping.ID,
                            Name: shipping.Description,
                            Method: "delivery",
                            ShippingDetails: shippingDetails,
                            Selected: "",
                            Show: true,
                            Visible: true
                        });
                    });
                }
            });
        }

        if (shippingOptionsMerchant) {
            shippingOptionsMerchant.forEach(function (shipping) {

                if (shipping.CustomFields != null) {
                    shipping.CustomFields.forEach(function (cf) {
                        let shippingDetails = JSON.parse(cf.Values);

                        shippings.push({
                            GUID: shipping.ID,
                            Name: shipping.Description,
                            Method: "delivery",
                            ShippingDetails: shippingDetails,
                            Selected: "",
                            Show: true,
                            Visible: true
                        });
                    });
                }
            });
        }

        if (shippingOptionsPickup) {
            shippingOptionsPickup.Records.forEach(function (shipping) {
                if (shipping.Pickup === true) {
                    let name2 = "";
                    if (shipping.Line2 != null) {
                        name2 = " " + shipping.Line2;
                    }
                    shippings.push({
                        GUID: shipping.ID,
                        Name: shipping.Line1 + name2,
                        Method: "pickup",
                        Selected: "",
                        Show: true,
                        Visible: true
                    });
                }
            });
        }
        if (shippings && currentUser.CustomFields) {
                currentUser.CustomFields.forEach(function (cf) {
                    if (cf.Name === 'DeliveryMethodAvailability') {
                        let cfValues = JSON.parse(cf.Values[0]);
                        if (cfValues.UnavailableDeliveryMethods) {
                            cfValues.UnavailableDeliveryMethods.forEach(function (dmeth) {
                                shippings.map(function (ship) {
                                    if (dmeth.ShippingMethodGuid === ship.GUID) {
                                        ship.Show = false;
                                    }
                                });

                            });
                        }
                    }
                });
        }

        let shippingModel = {
            shippings: shippings,
            checkDeliveryAll: "",
            checkPickUpAll: "",
            shippingWord: ""
        };

        let countryCode = "";
        let moqCode = "";
        let bulkPricingCode = "";

        if (packageCustomfields) {
            packageCustomfields.Records.forEach(function (pc) {
                if (pc.Name.toLowerCase() === EnumCoreModule.GetAvailabilityProperties().MOQ.toLowerCase()) {
                    moqCode = pc.Code;
                }
                else if (pc.Name.toLowerCase() === EnumCoreModule.GetAvailabilityProperties().BulkPricing.toLowerCase()) {
                    bulkPricingCode = pc.Code;
                }
                else if (pc.Name.toLowerCase() === EnumCoreModule.GetAvailabilityProperties().CountryCode.toLowerCase()) {
                    countryCode = pc.Code;
                }
            });
        }

        let bulkToDeleteCountryCode = {
            countryCode: "",
            index: 0
        };

        let variantGroups = createDefaultVariantGroups([]);
        let itemVariants = [];

        itemVariants.push({
            id: generateUUID(),
            sku: "",
            surcharge: "",
            stock: "",
            isUnlimited: false,
            variantGroups: variantGroups.filter(v => v.sortOrder == 1),
            media: null,
            isSameImage: false
        });

        let locationVariantGroupId = null;

        if (process.env.PRICING_TYPE == 'country_level') {
            if (marketplaceInfo.CustomFields) {
                const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (locationCustomField && locationCustomField.Values.length > 0) {
                    locationVariantGroupId = locationCustomField.Values[0];
                }
            }
        }

        const promiseLocationVariants = new Promise((resolve, reject) => {
            if (locationVariantGroupId) {
                client.Items.getAdminVariantsByGroupId({ variantGroupId: locationVariantGroupId }, (err, result) => {
                    resolve(result);
                });
            } else {
                resolve([]);
            }
        });

        Promise.all([promiseLocationVariants]).then((responses) => {
            const locations = responses[0];

            let itemModel = {
                categories: categories,
                categoriesSelected: [],
                categoryWord: "",
                listingName: "",
                description: "",
                images: [],
                customFields: [],
                shippingModel: shippingModel,
                currencyCode: marketplaceInfo.CurrencyCode,
                isUpload: "uploadItem",
                moqCode: moqCode,
                bulkPricingCode: bulkPricingCode,
                countryCode: countryCode,
                initializeFormattedText: false,
                bulkToDeleteCountryCode: bulkToDeleteCountryCode,
                pricingItem: {},
                isSaving: false,
                price: "",
                quantity: "",
                sku: "",
                isUnlimitedStock: false,
                hasVariants: false,
                variantGroups: variantGroups,
                itemVariants: itemVariants,
                savedItemVariants: [],
                selectedVariant: null,
                locationItems: [],
                locations: locations,
                selectedLocationIds: [],
                savedChildItemIds: []
            };

            itemModel.negotiation = false;
            itemModel.instantbuy = true;

            let modalStatus = {
                openDeleteBulkPopUp: false
            };

            const store = Store.createItemUploadEditStore({
                userReducer: { user: currentUser },
                uploadEditItemReducer: {
                    itemModel: itemModel,
                    modalStatus: modalStatus
                }
            });

            let seoTitle = 'Add Item';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const reduxState = store.getState();
            const upload = reactDom.renderToString(<UploadEditComponent modalStatus={modalStatus} itemModel={itemModel} user={currentUser} />);

            const pricingTypeBodyClass = process.env.PRICING_TYPE == 'country_level' ? 'new-country' : '';

            res.send(template(`page-seller seller-upload-page page-sidebar ${pricingTypeBodyClass}`, seoTitle, upload, appString, reduxState));
        });
    });
});

merchantUploadEditRouter.post('/customfields', ...handlers, function (req, res) {
    let categoryIds = req.body['categoryids[]'];
    let itemId = req.body['itemId'];
    let cleanedCategoryIds = req.body['cleanedCategoryIds[]']

    let promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function (err, details) {
            resolve(details);
        });

    });

    let promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
        client.Categories.getCategoriesByIds(categoryIds,function (err, categories) {
            resolve(categories);
        });
    });

    let promiseItems = new Promise((resolve, reject) => {
        const options = {
            itemId: itemId,
            activeOnly: true
        };

        client.Items.getItemDetails(options, function (err, details) {
            resolve(details);
        });
    });

    Promise.all([promiseCustomFieldDefinitions, promiseCategoriesWithCustomFields, promiseItems]).then((responses) => {
        let customfieldDefinitions = responses[0];
        let categoriesWithCustomfieldDefinitions = responses[1];
        let categoriesWithCustomfieldValues = responses[2];

        let customFieldToPass = [];
        //ADD WEIGHT CUSTOMFIELD
        if (customfieldDefinitions) {
            customfieldDefinitions.Records.forEach(function (customField) {
                if (customField.Name === "WEIGHT") {
                    let weightCustomfield = {};
                    weightCustomfield.DataFieldType = customField.DataFieldType;
                    weightCustomfield.DataInputType = customField.DataInputType;
                    weightCustomfield.IsMandatory = customField.IsMandatory;
                    weightCustomfield.IsSensitive = customField.IsSensitive;
                    weightCustomfield.IsComparable = customField.IsComparable;
                    weightCustomfield.Code = customField.Code;
                    weightCustomfield.Name = customField.Name;
                    weightCustomfield.Values = [];

                    if (categoriesWithCustomfieldValues && categoriesWithCustomfieldValues.CustomFields) {
                        categoriesWithCustomfieldValues.CustomFields.forEach(function (cf) {
                            if (cf.Code === customField.Code) {
                                if (cf.Values[0]) {
                                    cf.Values[0] = parseInt(cf.Values[0]);
                                }
                                weightCustomfield.Values.push(cf.Values[0]);
                            }
                        });
                    }

                    if (req.CustomFields) {
                        req.CustomFields.forEach(function (cf) {
                            if (cf.Name.toLowerCase() === "weight unit" && cf.Values) {
                                weightCustomfield.Name = weightCustomfield.Name + '(' + cf.Values[0] + ')'
                            }
                        });
                    }

                    customFieldToPass.push(weightCustomfield);
                }
            });
        }

        if (categoriesWithCustomfieldDefinitions) {
            categoriesWithCustomfieldDefinitions.forEach(function (category) {
                if (category.CustomFields) {
                    category.CustomFields.forEach(function (customfield) {
                        customfieldDefinitions.Records.forEach(function (customfieldWithDefinition) {
                            if (customfield.Code == customfieldWithDefinition.Code) {
                                customfield.DataFieldType = customfieldWithDefinition.DataFieldType;
                                customfield.DataInputType = customfieldWithDefinition.DataInputType;
                                customfield.IsMandatory = customfieldWithDefinition.IsMandatory;
                                customfield.IsSensitive = customfieldWithDefinition.IsSensitive;
                                customfield.IsComparable = customfieldWithDefinition.IsComparable;
                                customfield.MaxValue = customfieldWithDefinition.MaxValue;
                                customfield.MinValue = customfieldWithDefinition.MinValue;
                                customfield.Options = customfieldWithDefinition.Options;
                                customfield.SortOrder = customfieldWithDefinition.SortOrder;
                                customfield.DataRegex = customfieldWithDefinition.DataRegex;
                                customfield.Values = [];

                                if (categoriesWithCustomfieldValues && categoriesWithCustomfieldValues.CustomFields) {
                                    categoriesWithCustomfieldValues.CustomFields.forEach(function (cf) {
                                        if (cf.Code === customfield.Code) {
                                            customfield.Values = cf.Values;
                                        }
                                    });
                                }

                                //Remove Duplicate
                                customFieldToPass.map(function (cf, i) {
                                    if (cf.Code == customfield.Code) {
                                        customFieldToPass.splice(i, 1);
                                    }
                                });
                                customFieldToPass.push(customfield);
                            }
                        });
                    });
                }
            });
        }
        //For Non Category Selected
        if (categoryIds === undefined) {
            customFieldToPass = [];
        }
        res.send(customFieldToPass);
    });
});

merchantUploadEditRouter.post('/uploadMedia', ...handlers, uploadMulter.any(), function (req, res) {
    let formData = new FormData();

    req.files.forEach(function (file, i) {
        formData.append('itemMedia' + i, file.buffer, { filename: file.originalname });
    });

    const options = {
        userId: req.user.ID,
        purpose: 'items',
        formData: formData
    };

    var promiseMedia = new Promise((resolve, reject) => {
        client.Media.uploadMedia(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMedia]).then((responses) => {
        const media = responses[0];
        media.forEach(function (image, i) {
            image.Key = req.files[i].fieldname;
        });

        res.send(media);
    });
});

merchantUploadEditRouter.post('/uploadItem', ...handlers, function (req, res) {
    let currentUser = req.user;

    const options = {
        merchantId: currentUser.ID,
        data: req.body
    };

    let promiseCreateItem = new Promise((resolve, reject) => {
        client.Items.createItem(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseCreateItem]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

merchantUploadEditRouter.put('/editItem/:itemId', ...handlers, function (req, res) {
    let currentUser = req.user;

    const options = {
        merchantId: currentUser.ID,
        data: req.body,
        itemId: req.params.itemId
    };

    let promiseEditNewItem = new Promise((resolve, reject) => {
        client.Items.EditNewItem(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseEditNewItem]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

merchantUploadEditRouter.get('/edit/:itemid', ...handlers, function(req, res) {
    if (redirectUnauthorizedUser(req, res)) return;

    const currentUser = req.user;
    const appString = 'merchant-item-edit';

    if (req.params.itemid === 'undefined') {
        return;
    }

    const promiseItems = new Promise((resolve, reject) => {
        const options = {
            itemId: req.params.itemid,
            activeOnly: true
        };

        client.Items.getItemDetails(options, function(err, details) {
            resolve(details);
        });
    });

    const promiseCustomFieldDefinitions = new Promise((resolve, reject) => {
        client.CustomFields.getDefinitions("Items", function(err, details) {
            resolve(details);
        });
    });

    const promiseCategories = new Promise((resolve, reject) => {
        client.Categories.getCategories(null, function(err, categories) {
            resolve(categories);
        });
    });

    const promiseMarketplace = new Promise((resolve, reject) => {
        let options = {
            includes: 'ControlFlags'
        };

        client.Marketplaces.getMarketplaceInfo(options, function(err, result) {
            resolve(result);
        });
    });

    const promiseShippingOptionsMerchant = new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingMethods(currentUser.ID, function(err, addresses) {
            resolve(addresses);
        });
    });

    const promiseShippingOptionsAdmin = new Promise((resolve, reject) => {
        client.ShippingMethods.getShippingOptions(function(err, addresses) {
            resolve(addresses);
        });
    });

    const promiseAddress = new Promise((resolve, reject) => {
        client.Addresses.getUserPickupAddresses(currentUser.ID, function(err, addresses) {
            resolve(addresses);
        });
    });

    const promisePluginCustomFields = new Promise((resolve, reject) => {
        if (process.env.PRICING_TYPE == 'variants_level') {
            resolve(null);
        }

        client.CustomFields.getDefinitions(EnumCoreModule.GetCustomFieldReferenceTables().Items, function (err, result) {
            let pluginCustomFields = null;

            if (result && result.Records && result.Records.length > 0) {
                pluginCustomFields = {
                    Records: []
                };
                result.Records.map(function (customField, index) {
                    if (customField.GroupName === EnumCoreModule.GetCustomFieldGroups().Availability) {
                        pluginCustomFields.Records.push(customField);
                    }
                });
            }
            resolve(pluginCustomFields);
        });
    });

    Promise.all([promiseCategories, promiseMarketplace, promiseShippingOptionsMerchant, promiseShippingOptionsAdmin, promiseAddress, promiseItems, promiseCustomFieldDefinitions, promisePluginCustomFields]).then((responses) => {
        let categories = responses[0];
        let marketplaceInfo = responses[1];
        let shippingOptionsMerchant = responses[2];
        let shippingOptionsAdmin = responses[3];
        let shippingOptionsPickup = responses[4];
        let itemDetail = responses[5];
        let customfieldDefinitions = responses[6];
        let packageCustomfields = responses[7];

        let categoryIds = [];

        function setupCategories(category) {
            category.Selected = '';
            category.ShowThis = true;

            if (itemDetail.Categories) {
                itemDetail.Categories.forEach(function (cat) {
                    if (category.ID === cat.ID) {
                        category.Selected = "checked";
                        categoryIds.push(cat.ID);
                    }
                });
            }

            if (category.ChildCategories.length > 0) {
                category.ChildCategories.forEach(function(child) {
                    child.ParentCategoryID = category.ID;
                    setupCategories(child);
                });
            }
        }

        if (categories) {
            categories.forEach(function (category) {
                setupCategories(category);
            });
        }

        let shippings = [];

        if (shippingOptionsAdmin) {
            shippingOptionsAdmin.forEach(function (shipping) {

                if (shipping.CustomFields != null) {

                    shipping.CustomFields.forEach(function (cf) {
                        let shippingDetails = JSON.parse(cf.Values);

                        shippings.push({
                            GUID: shipping.ID,
                            Name: shipping.Description,
                            Method: "delivery",
                            ShippingDetails: shippingDetails,
                            Selected: "",
                            Show: true,
                            Visible: true
                        });
                    });
                }
            });
        }

        if (shippingOptionsMerchant) {
            shippingOptionsMerchant.forEach(function (shipping) {

                if (shipping.CustomFields != null) {

                    shipping.CustomFields.forEach(function (cf) {
                        let shippingDetails = JSON.parse(cf.Values);
                        shippings.push({
                            GUID: shipping.ID,
                            Name: shipping.Description,
                            Method: "delivery",
                            ShippingDetails: shippingDetails,
                            Selected: "",
                            Show: true,
                            Visible: true
                        });
                    });
                }
            });
        }

        if (shippingOptionsPickup) {
            shippingOptionsPickup.Records.forEach(function (shipping) {
                if (shipping.Pickup === true) {
                    let name2 = "";
                    if (shipping.Line2 != null) {
                        name2 = " " + shipping.Line2;
                    }
                    shippings.push({
                        GUID: shipping.ID,
                        Name: shipping.Line1 + name2,
                        Method: "pickup",
                        Selected: "",
                        Show: true,
                        Visible: true
                    });
                }
            });
        }

        //shipping and pickup selected
        let isAllDeliveryChecked = "checked";
        let isAllPickupChecked = "checked";

        if (shippings) {
            shippings.map(function (ship) {
                if (itemDetail.ShippingMethods != null) {
                    itemDetail.ShippingMethods.forEach(function (sp) {
                        if (ship.GUID == sp.ID) {
                            ship.Selected = "checked";
                        }
                    })
                }
                if (itemDetail.PickupAddresses != null) {
                    itemDetail.PickupAddresses.forEach(function (pu) {
                        if (ship.GUID == pu.ID) {
                            ship.Selected = "checked";
                        }
                    })
                }
            });

            shippings.forEach(function (sp) {
                if (sp.Method == "delivery") {
                    if (sp.Selected == "") {
                        isAllDeliveryChecked = "";
                    }
                }
                if (sp.Method == "pickup") {
                    if (sp.Selected == "") {
                        isAllPickupChecked = "";
                    }
                }
            })
        }

        if (shippings && currentUser.CustomFields) {
            currentUser.CustomFields.forEach(function (cf) {
                if (cf.Name === 'DeliveryMethodAvailability') {
                    let cfValues = JSON.parse(cf.Values[0]);
                    if (cfValues.UnavailableDeliveryMethods) {
                        cfValues.UnavailableDeliveryMethods.forEach(function (dmeth) {
                            shippings.map(function (ship) {
                                if (dmeth.ShippingMethodGuid === ship.GUID) {
                                    ship.Show = false;
                                }
                            });

                        });
                    }
                }
            });
        }

        let shippingModel = {
            shippings: shippings,
            checkDeliveryAll: isAllDeliveryChecked,
            checkPickUpAll: isAllPickupChecked,
            shippingWord: ""
        };

        let images = [];

        if (itemDetail.Media != null) {
            images = itemDetail.Media;
        }

        let locationVariantGroupId = null;

        if (process.env.PRICING_TYPE == 'country_level') {
            if (marketplaceInfo.CustomFields) {
                const locationCustomField = marketplaceInfo.CustomFields.find(c => c.Code.startsWith('locationid'));

                if (locationCustomField && locationCustomField.Values.length > 0) {
                    locationVariantGroupId = locationCustomField.Values[0];
                }
            }
        }

        const promiseLocationVariants = new Promise((resolve, reject) => {
            if (locationVariantGroupId) {
                client.Items.getAdminVariantsByGroupId({ variantGroupId: locationVariantGroupId }, (err, result) => {
                    resolve(result);
                });
            } else {
                resolve([]);
            }
        });

        //CustomFields
        let promiseCategoriesWithCustomFields = new Promise((resolve, reject) => {
            client.Categories.getCategoriesByIds(categoryIds, function (err, categories) {
                resolve(categories);
            });
        });

        Promise.all([promiseLocationVariants, promiseCategoriesWithCustomFields]).then((responses) => {
            const locations = responses[0];
            const selectedCategoriesWithCustomFields = responses[1];
            let customFieldWithDefinitions = [];

            if (selectedCategoriesWithCustomFields) {
                selectedCategoriesWithCustomFields.forEach(function (category) {
                    if (category.CustomFields) {
                        category.CustomFields.map(function (scf) {
                            if (itemDetail && itemDetail.CustomFields) {
                                itemDetail.CustomFields.forEach(function (cf) {
                                    if (cf.Code === scf.Code) {
                                        scf.Values = cf.Values;
                                    }
                                });
                            }

                            const duplicates = customFieldWithDefinitions.filter(function (cfd) { return cfd.Code === scf.Code });

                            if (duplicates && duplicates.length === 0) {
                                customFieldWithDefinitions.push(scf);
                            }
                        });
                    }
                });
            }

            if (customFieldWithDefinitions) {
                customfieldDefinitions.Records.forEach(function (customfieldWithDefinition) {
                    if (customfieldWithDefinition.Name.toLowerCase() === "weight") {
                        if (!customFieldWithDefinitions.includes(customfieldWithDefinition)) {
                            if (req.CustomFields) {
                                req.CustomFields.forEach(function (cf) {
                                    if (cf.Name.toLowerCase() === "weight unit" && cf.Values) {
                                        customfieldWithDefinition.Name = customfieldWithDefinition.Name + '(' + cf.Values[0] + ')'
                                    }
                                });
                            }

                            if (itemDetail.Weight) {
                                customfieldWithDefinition.Values = [];
                                customfieldWithDefinition.Values.push(itemDetail.Weight);

                            } else {
                                customfieldWithDefinition.Values = null;
                            }
                            customFieldWithDefinitions.unshift(customfieldWithDefinition);
                        }
                    } else {
                        customFieldWithDefinitions.map(function (customfield) {
                            if (customfield.Code.toLowerCase() === customfieldWithDefinition.Code.toLowerCase()) {
                                customfield.DataFieldType = customfieldWithDefinition.DataFieldType;
                                customfield.DataInputType = customfieldWithDefinition.DataInputType;
                                customfield.IsMandatory = customfieldWithDefinition.IsMandatory;
                                customfield.IsSensitive = customfieldWithDefinition.IsSensitive;
                                customfield.IsComparable = customfieldWithDefinition.IsComparable;
                                customfield.MaxValue = customfieldWithDefinition.MaxValue;
                                customfield.MinValue = customfieldWithDefinition.MinValue;
                                customfield.Options = customfieldWithDefinition.Options;
                                customfield.SortOrder = customfieldWithDefinition.SortOrder;
                                customfield.DataRegex = customfieldWithDefinition.DataRegex;
                            }
                        });
                    }
                });
            }

            let countryCode = "";
            let moqCode = "";
            let bulkPricingCode = "";

            if (packageCustomfields) {
                packageCustomfields.Records.forEach(function (pc) {
                    if (pc.Name.toLowerCase() === EnumCoreModule.GetAvailabilityProperties().MOQ.toLowerCase()) {
                        moqCode = pc.Code;
                    }
                    else if (pc.Name.toLowerCase() === EnumCoreModule.GetAvailabilityProperties().BulkPricing.toLowerCase()) {
                        bulkPricingCode = pc.Code;
                    }
                    else if (pc.Name.toLowerCase() === EnumCoreModule.GetAvailabilityProperties().CountryCode.toLowerCase()) {
                        countryCode = pc.Code;
                    }
                });
            }

            let bulkToDeleteCountryCode = {
                countryCode: "",
                index: 0
            };

            let variantGroups = [];
            let itemVariants = [];
            let hasSavedVariants = false;
            let locationItems = [];
            let savedChildItemIds = [];

            if (itemDetail.ChildItems) {
                itemDetail.ChildItems.forEach(function (child) {
                    const locationVariant = child.Variants.find(v => v.GroupID == locationVariantGroupId);

                    if (locationVariant) {
                        const existing = locationItems.find(l => l.locationId == locationVariant.ID);

                        if (!existing) {
                            locationItems.push({
                                locationId: locationVariant.ID,
                                locationName: locationVariant.Name,
                                moq: "",
                                id: "",
                                sku: "",
                                surcharge: "",
                                stock: "",
                                isUnlimited: false,
                                media: null,
                                isSameImage: false,
                                variantGroup: {
                                    id: locationVariant.GroupID,
                                    name: locationVariant.GroupName,
                                    sortOrder: null,
                                    variant: {
                                        id: locationVariant.ID,
                                        name: locationVariant.Name,
                                        sortOrder: locationVariant.SortOrder,
                                    }
                                },
                                itemVariants: [],
                                pricing: {}
                            });
                        }
                    }

                    child.Variants.filter(v => v.GroupID != locationVariantGroupId).forEach(function (variantFlat, index) {
                        let variant = {
                            id: variantFlat.ID,
                            name: variantFlat.Name,
                            sortOrder: variantFlat.SortOrder
                        };

                        let existingVariantGroup = variantGroups.find(v => v.id == variantFlat.GroupID);

                        if (!existingVariantGroup) {
                            variantGroups.push({
                                id: variantFlat.GroupID,
                                name: variantFlat.GroupName,
                                sortOrder: index + 1,
                                variants: [variant]
                            });
                        } else {
                            let existingVariant = existingVariantGroup.variants.find(v => v.id == variantFlat.ID);

                            if (!existingVariant) {
                                existingVariantGroup.variants.push(variant);
                            }
                        }
                    });
                });

                variantGroups.forEach(function (variantGroup) {
                    variantGroup.variants.forEach(function (variant, index) {
                        if (variant.sortOrder == null) {
                            variant.sortOrder = index + 1;
                        }
                    });
                    variantGroup.variants.sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1);
                });

                itemDetail.ChildItems.forEach(function (child) {
                    let nonLocationItemVariantGroups = [];
                    savedChildItemIds.push(child.ID);

                    child.Variants.filter(v => v.GroupID != locationVariantGroupId).forEach(function (variantFlat, index) {
                        let itemVariantGroup = Object.assign({}, variantGroups.find(v => v.id == variantFlat.GroupID));
                        itemVariantGroup.variants = itemVariantGroup.variants.filter(v => v.id == variantFlat.ID);

                        nonLocationItemVariantGroups.push(itemVariantGroup);
                    });

                    const itemVariant = {
                        id: child.ID,
                        sku: child.SKU || "",
                        surcharge: parseFloat(parseFloat((child.Price * 1000 - itemDetail.Price * 1000) / 1000).toFixed(4)), // did this to fix issue in floating numbers
                        stock: child.StockQuantity == 0 ? "" : child.StockQuantity,
                        isUnlimited: !child.StockLimited,
                        variantGroups: nonLocationItemVariantGroups,
                        media: child.Media ? child.Media[0] : null,
                        isSameImage: false
                    };

                    const locationVariant = child.Variants.find(v => v.GroupID == locationVariantGroupId);

                    if (locationVariant) {
                        const locationItem = locationItems.find(l => l.locationId == locationVariant.ID);
                        let moq = "";
                        let bulkPricing = "";

                        if (child.CustomFields != null) {
                            child.CustomFields.forEach(function (cf) {
                                if (cf.Name.toLowerCase() === "moq") {
                                    moq = cf.Values[0];
                                    if (moq) {
                                        moq = parseInt(moq);
                                    }
                                }
                                if (cf.Name.toLowerCase() === "bulkpricing") {
                                    bulkPricing = cf.Values[0];
                                }
                            });
                        }

                        locationItem.moq = moq;
                        locationItem.pricing = {
                            discountType: 'percentage',
                            priceRange: true,
                            currencyCode: marketplaceInfo.CurrencyCode,
                            locationId: locationVariant.ID,
                            bulkPricing: bulkPricing
                        };

                        if (bulkPricing.length > 0) {
                            bulkPricing = JSON.parse(bulkPricing);

                            if (bulkPricing[0].IsFixed == '1') {
                                locationItem.pricing.discountType = "fixed";
                            }

                            if (bulkPricing[bulkPricing.length - 1].Onward == '1') {
                                locationItem.pricing.priceRange = false;
                            }
                        }

                        if (nonLocationItemVariantGroups.length > 0) {
                            locationItem.itemVariants.push(Object.assign({}, itemVariant));

                            itemVariant.id = generateUUID();
                            itemVariant.sku = "";
                            itemVariant.surcharge = "";
                            itemVariant.stock = "";
                            itemVariant.isUnlimited = false;
                            itemVariant.media = null;
                            itemVariant.isSameImage = false;
                        } else {
                            locationItem.id = itemVariant.id;
                            locationItem.sku = itemVariant.sku;
                            locationItem.surcharge = itemVariant.surcharge;
                            locationItem.stock = itemVariant.stock;
                            locationItem.isUnlimited = itemVariant.isUnlimited;
                            locationItem.media = itemVariant.media
                            locationItem.isSameImage = itemVariant.isSameImage;
                        }
                    }

                    if (nonLocationItemVariantGroups.length > 0) {
                        const isExisting = itemVariants.find(v => JSON.stringify(v.variantGroups) == JSON.stringify(nonLocationItemVariantGroups)) != null;

                        if (!isExisting) {
                            itemVariants.push(itemVariant);
                        }
                    }
                });
            }

            variantGroups = createDefaultVariantGroups(variantGroups);

            if (itemVariants.length > 0) {
                hasSavedVariants = true;
            } else {
                itemVariants.push({
                    id: generateUUID(),
                    sku: "",
                    surcharge: "",
                    stock: "",
                    isUnlimited: false,
                    variantGroups: variantGroups.filter(v => v.sortOrder == 1),
                    media: null,
                    isSameImage: false
                });
            }

            let itemModel = {
                categories: categories,
                categoriesSelected: [],
                categoryWord: "",
                listingName: itemDetail.Name,
                description: itemDetail.BuyerDescription,
                images: images,
                customFields: customFieldWithDefinitions,
                shippingModel: shippingModel,
                currencyCode: marketplaceInfo.CurrencyCode,
                controlFlags: marketplaceInfo.ControlFlags,
                isUpload: "editItem",
                moqCode: moqCode,
                bulkPricingCode: bulkPricingCode,
                countryCode: countryCode,
                initializeFormattedText: false,
                itemId: req.params.itemid,
                bulkToDeleteCountryCode: bulkToDeleteCountryCode,
                pricingItem: {},
                isSaving: false,
                price: itemDetail.Price,
                quantity: itemDetail.StockQuantity == 0 ? "" : itemDetail.StockQuantity,
                sku: itemDetail.SKU || "",
                isUnlimitedStock: !itemDetail.StockLimited,
                hasVariants: hasSavedVariants,
                variantGroups: variantGroups,
                itemVariants: itemVariants,
                savedItemVariants: hasSavedVariants ? itemVariants : [],
                selectedVariant: null,
                locationItems: locationItems,
                locations: locations,
                selectedLocationIds: locationItems.map((item) => item.locationId),
                savedChildItemIds: savedChildItemIds
            };

            itemModel.negotiation = itemDetail.Negotiation;
            itemModel.instantbuy = itemDetail.InstantBuy;

            let modalStatus = {
                openDeleteBulkPopUp: false
            };

            const store = Store.createItemUploadEditStore({
                userReducer: { user: currentUser },
                uploadEditItemReducer: {
                    itemModel: itemModel,
                    modalStatus: modalStatus
                }
            });

            const reduxState = store.getState();

            const edit = reactDom.renderToString(<UploadEditComponent modalStatus={modalStatus} itemModel={itemModel} user={currentUser} />);

            let seoTitle = 'Edit';
            if (req.SeoTitle) {
                seoTitle = req.SeoTitle ? req.SeoTitle : req.Name;
            }

            const pricingTypeBodyClass = process.env.PRICING_TYPE == 'country_level' ? 'new-country' : '';

            res.send(template(`page-seller seller-upload-page page-sidebar ${pricingTypeBodyClass}`, seoTitle, edit, appString, reduxState));
        });
    });
});

merchantUploadEditRouter.post('/customfield', ...handlers, function (req, res) {
    let currentUser = req.user;

    var promiseMarketplace = new Promise((resolve, reject) => {
        const options = {
            includes: 'BusinessProfile'
        };

        client.Marketplaces.getMarketplaceInfo(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseMarketplace]).then((responses) => {
        const marketplace = responses[0];
        const data = {
            userId: marketplace.Owner.ID,
            customField: {
                'Name': req.body['Name'],
                'DataInputType': req.body['DataInputType'],
                'DataFieldType': req.body['DataFieldType'],
                'ReferenceTable': req.body['ReferenceTable'],
                'IsMandatory': false,
                'IsComparable': false,
                'GroupName': req.body['GroupName']
            }
        };

        let promiseCustomField = new Promise((resolve, reject) => {
            client.CustomFields.create(data, function (err, result) {
                resolve(result);
            });
        });

        Promise.all([promiseCustomField]).then((responses) => {
            const result = responses[0];
            res.send(result);
        });
    });
});

merchantUploadEditRouter.post('/uploadPdf', ...handlers, uploadMulter.any(), function (req, res) {
    let formData = new FormData();

    req.files.forEach(function (pdf, i) {
        formData.append(pdf.fieldname, pdf.buffer, { filename: pdf.originalname });
    });

    var promiseFiles = new Promise((resolve, reject) => {
        const options = {
            userId: req.user.ID,
            formData: formData
        };

        client.Files.uploadFile(options, function (err, result) {
            resolve(result);
        });
    });

    Promise.all([promiseFiles]).then((responses) => {
        const result = responses[0];
        res.send(result);
    });
});

module.exports = merchantUploadEditRouter;
