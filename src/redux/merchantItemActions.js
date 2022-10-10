'use strict';
import axios from 'axios';
import toastr from 'toastr';
import Moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import actionTypes from './actionTypes';
import EnumCoreModule from '../public/js/enum-core';
import { getAppPrefix } from '../public/js/common.js';

const prefix = getAppPrefix();

toastr.options.preventDuplicates = true;

if (typeof window !== 'undefined') {
    var $ = window.$;
}

let selectedCategoryIds = [];
let isSaving = false;

function searchItemName(keyword, pageSize) {
    return function (dispatch, getState) {
        searchItemList(keyword, 1, pageSize, function (result) {
            return dispatch({
                type: actionTypes.SEARCH_ITEMS,
                items: result.Records,
                pageSize: result.PageSize,
                pageNumber: result.PageNumber,
                totalRecords: result.TotalRecords,
                keyword: keyword
            });
        });
    };
}

function getItemDetails(itemId) {
    return function (dispatch) {
        getActivityCookie(0, null, function (cookie) {
            $.ajax({
                url: prefix+'/items/getItemDetails',
                type: 'GET',
                data: {
                    itemId: itemId
                },
                success: function (result) {
                    var dis = dispatch({
                        type: actionTypes.GET_ITEM_DETAILS,
                        itemDetail: result
                    });

                    return dis
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        });
    }
}

function goToPage(pageNumber) {
    return function (dispatch, getState) {
        let keyword = getState().itemsReducer.keyword;
        let pageSize = getState().itemsReducer.pageSize;
        searchItemList(keyword, pageNumber, pageSize, function (result) {
            return dispatch({
                type: actionTypes.GO_TO_PAGE,
                items: result.Records,
                pageSize: result.PageSize,
                pageNumber: result.PageNumber,
                totalRecords: result.TotalRecords
            });
        });
    };
}

function createLogForItemVisibilityUpdate(itemId, isAvailable) {
    return function (dispatch) {
        getActivityCookie(0, null, function (cookie) {
            $.ajax({
                url: prefix+'/merchants/activity-logs/createItemActivityLog',
                type: 'POST',
                data: {
                    itemId: itemId,
                    type: isAvailable
                        ? EnumCoreModule.GetItemActivityLogTypes().Visible
                        : EnumCoreModule.GetItemActivityLogTypes().Invisible,
                    alternateId: cookie.alternateId
                },
                success: function () {
                    return dispatch({
                        type: '',
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        });
    }
}

function editItemPurchasable(itemId, isAvailable, callback) {

    return function (dispatch, getState) {
        const items = getState().itemsReducer.items;
        const controlFlags = getState().itemsReducer.controlFlags;
        const isAdminVettingEnabled = controlFlags ? controlFlags.AdminVetting : true;
        const index = items.findIndex(e => e.ID === itemId);
        let newItems = items.filter(i => i.ID !== itemId);


        $.ajax({
            url: prefix+'/items/getItemDetails',
            type: 'GET',
            data: {
                itemId: itemId
            },
            success: function (result) {

                if (result.IsVisibleToCustomer || !controlFlags.AdminVetting) {
                    $.ajax({
                        url: prefix+'/merchants/items/edit',
                        type: 'PUT',
                        data: {
                            itemId: itemId,
                            isAvailable: isAvailable
                        },
                        success: function (result) {
                            newItems.splice(index, 0, result);
                            toastr.success("Item's availability was successfully updated.");
                            if (callback)
                                callback('available')
                            return dispatch({
                                type: actionTypes.EDIT_ITEM_PURCHASABLE,
                                items: newItems
                            });

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (callback)
                                callback('not-available')
                            console.log(textStatus, errorThrown);
                        }

                    });
                }
                else {
                    if (callback)
                        callback('not-available')
                    toastr.error('Error. This item was mark unpurchsable by the admin!');
                    return dispatch({
                        type: ''
                    });

                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });


    };
}

function setItemToDelete(itemId) {
    return function (dispatch, getState) {
        let itemToDelete = null;

        if (itemId) {
            itemToDelete = getState().itemsReducer.items.find(i => i.ID === itemId);
        }

        return dispatch({
            type: actionTypes.SET_ITEM_TO_DELETE,
            itemToDelete: itemToDelete
        });
    };
}

function deleteItem() {
    return function (dispatch, getState) {
        const items = getState().itemsReducer.items;
        const keyword = getState().itemsReducer.keyword;
        let pageNumber = getState().itemsReducer.pageNumber;
        let pageSize = getState().itemsReducer.pageSize;
        const totalRecords = getState().itemsReducer.totalRecords;
        const itemToDelete = getState().itemsReducer.itemToDelete;
        let newItems = [];

        $.ajax({
            url: prefix+'/merchants/items/delete',
            type: 'DELETE',
            data: {
                itemId: itemToDelete.ID
            },
            success: function (result) {
                items.forEach(function (item) {
                    if (item.ID !== itemToDelete.ID) {
                        newItems.push(item);
                    }
                });

                getActivityCookie(0, null, function (cookie) {
                    $.ajax({
                        url: prefix+'/merchants/activity-logs/createItemActivityLog',
                        type: 'POST',
                        data: {
                            itemId: itemToDelete.ID,
                            type: EnumCoreModule.GetItemActivityLogTypes().Delete,
                            alternateId: cookie.alternateId
                        },
                        success: function () {
                            if (newItems.length === 0) {
                                pageNumber = pageNumber > 1 ? pageNumber - 1 : 1;

                                searchItemList(keyword, pageNumber, pageSize, function (result) {
                                    return dispatch({
                                        type: actionTypes.DELETE_ITEM,
                                        items: result.Records,
                                        pageSize: result.PageSize,
                                        pageNumber: result.PageNumber,
                                        totalRecords: result.TotalRecords,
                                        itemToDelete: null
                                    });
                                });
                            } else {
                                return dispatch({
                                    type: actionTypes.DELETE_ITEM,
                                    items: newItems,
                                    pageNumber: pageNumber,
                                    totalRecords: totalRecords - 1,
                                    itemToDelete: null
                                });
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function searchItemList(keyword, pageNumber, pageSize, callback) {

    $.ajax({
        url: prefix+'/merchants/items/search',
        type: 'GET',
        data: {
            keyword: keyword,
            pageNumber: pageNumber,
            pageSize: parseInt(pageSize)
        },
        success: function (result) {
            callback(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function getActivityCookie(loginActivityId, alternateId, callback) {
    $.ajax({
        url: prefix+'/merchants/activity-logs/getCookie',
        type: 'GET',
        data: {},
        success: function (getCookieResult) {
            if (!getCookieResult) {
                $.ajax({
                    url: prefix+'/merchants/activity-logs/setCookie',
                    type: 'GET',
                    data: {
                        loginActivityId: loginActivityId,
                        alternateId: alternateId
                    },
                    success: function (setCookieResult) {
                        callback(setCookieResult);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
                });
            } else {
                callback(getCookieResult);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function removeImage(i) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let itemModel = Object.assign({}, current);

        itemModel.images.splice(i, 1);
        itemModel.initializeFormattedText = false;

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function setUploadFile(file) {
    return function (dispatch, getState) {
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        const { locationItems } = itemModel;

        if (!file.VariantId) {
            itemModel.images.push(file);
        } else {
            let itemVariant = null;

            if (process.env.PRICING_TYPE == 'country_level') {
                const locationItem = locationItems.find(l => l.locationId == file.LocationId);

                if (locationItem) {
                    if (itemModel.hasVariants) {
                        itemVariant = locationItem.itemVariants.find(i => i.id == file.VariantId);
                    } else {
                        itemVariant = locationItem;
                    }
                }
            } else {
                itemVariant = itemModel.itemVariants.find(v => v.id == file.VariantId);
            }

            if (itemVariant) {
                delete file.VariantId;
                delete file.LocationId;
                itemVariant.media = file;
                itemVariant.isSameImage = false;
            }
        }

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function setPDFFile(data) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;

        let customFieldTopass = [];
        current.customFields.map(function (customfield) {
            if (customfield.Code === data.Code) {
                let customfieldValues = [];
                customfieldValues.push(data.Filename);
                customfield.Values = customfieldValues;
            }
            customFieldTopass.push(customfield);
        });

        current.customFields = customFieldTopass;
        let itemModel = Object.assign({}, current);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function CheckUncheckCategories(parents, selected) {
    parents.map(function (cat) {
        if (cat.ChildCategories.length > 0) {
            CheckUncheckCategories(cat.ChildCategories, selected);
        }
        cat.Selected = selected;
        if (selected === "checked") {
            selectedCategoryIds.push(cat.ID);
        } else {
            selectedCategoryIds.splice($.inArray(cat.ID, selectedCategoryIds), 1);
        }
    });
}

function selectAllOrNone(selected) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        //Set Selected Logic
        CheckUncheckCategories(current.categories, selected);
        let newSearchCategories = [];
        current.categories.forEach(function (catNow) {
            newSearchCategories.push(catNow);
        });

        if (current.isUpload.toLowerCase() !== "edititem") {
            current.itemId = "";
        }

        $.ajax({
            url: prefix+'/merchants/customfields',
            type: 'post',
            data: {
                categoryids: selectedCategoryIds,
                itemId: current.itemId
            },
            success: function (customFields) {
                let itemModel = Object.assign({}, current);
                itemModel.categories = newSearchCategories;
                itemModel.customFields = customFields;
                itemModel.categoriesSelected = selectedCategoryIds;
                itemModel.initializeFormattedText = true;

                return dispatch({
                    type: actionTypes.ITEM_UPLOAD_EDIT_GET_CUSTOMFIELDS,
                    itemModel: itemModel
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function selectUnselectCategories(categoryID, parents, currentState) {
    parents.map(function (cat) {
        if (cat.ID === categoryID) {
            if (cat.Selected === "checked") {
                cat.Selected = "";
                selectedCategoryIds.splice($.inArray(cat.ID, selectedCategoryIds), 1);
            } else {
                cat.Selected = "checked";
                selectedCategoryIds.push(cat.ID);
            }
            if (cat.ParentCategoryID != null) {
                if (cat.Selected === "") {
                    if (!parents.some(e => e.Selected == 'checked')) {
                        HandleCheckInParents(cat.ParentCategoryID, cat.Selected, parents, true, currentState);
                    }
                } else {
                    HandleCheckInParents(cat.ParentCategoryID, cat.Selected, parents, true, currentState);
                }

            }
            if (parseInt(cat.Level) === 0) {
                HandleLevelZero(cat.Selected, cat.ChildCategories);
            }

            if (cat.ChildCategories.length > 0) {
                HandleCheckInChilds(cat.ChildCategories, cat.Selected);
            }

        } else {
            //if (cat.ChildCategories.length > 0) {
            //    selectUnselectCategories(categoryID, cat.ChildCategories, currentState);
            //}
        }
    });
    //childCheck
    parents.map(function (cat) {
        if (cat.ChildCategories.length > 0) {
            selectUnselectCategories(categoryID, cat.ChildCategories, currentState);
        }
    });
}

function HandleCheckInChilds(categories, selected) {
    categories.map(function (cat) {
        cat.Selected = selected;
        if (cat.ChildCategories) {
            HandleCheckInChilds(cat.ChildCategories, cat.Selected);
        }
    });
}

function HandleCheckInParents(categoryID, selected, parents, findFromTheTop, current) {
    let categoryToUse = parents;
    if (findFromTheTop) {
        categoryToUse = current;
    }
    categoryToUse.map(function (cat) {
        if (cat.ID === categoryID) {
            cat.Selected = selected;

            if (cat.Selected === "checked") {
                selectedCategoryIds.push(cat.ID);
            } else {
                selectedCategoryIds.splice($.inArray(cat.ID, selectedCategoryIds), 1);
            }

            if (cat.ParentCategoryID != null) {
                HandleCheckInParents(cat.ParentCategoryID, cat.Selected, parents, true, current);
            }

        } else {

        }
    });
    //childCheck
    categoryToUse.map(function (cat) {
        if (cat.ChildCategories.length > 0) {
            HandleCheckInParents(categoryID, selected, cat.ChildCategories, false, current);
        }
    });
}

function HandleLevelZero(selected, parents) {
    parents.map(function (cat) {
        cat.Selected = selected;
        if (cat.Selected === "checked") {
            selectedCategoryIds.push(cat.ID);
        } else {
            selectedCategoryIds.splice($.inArray(cat.ID, selectedCategoryIds), 1);
        }
    });
    //For Childs
    parents.map(function (cat) {
        if (cat.ChildCategories.length > 0) {
            HandleLevelZeroChilds(selected, cat.ChildCategories);
        }
    });
}

function HandleLevelZeroChilds(selected, parents) {
    parents.map(function (cat) {
        cat.Selected = selected;
        if (cat.Selected === "checked") {
            selectedCategoryIds.push(cat.ID);
        } else {
            selectedCategoryIds.splice($.inArray(cat.ID, selectedCategoryIds), 1);
        }
        //For Childs
        parents.map(function (cat) {
            if (cat.ChildCategories.length > 0) {
                HandleLevelZeroChilds(selected, cat.ChildCategories);
            }
        });
    });
}

function selectUnselectCategory(categoryid) {

    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        //Set Selected Logic
        selectUnselectCategories(categoryid, current.categories, current.categories);
        let newSearchCategories = [];
        let categoryIDToPass = [];
        let cleanedCategoryIDToPass = [];

        current.categories.forEach(function (catNow) {
            newSearchCategories.push(catNow);
            findSelected(catNow);
        });

        function findSelected(category) {
            if (category.Selected === "checked") {
                categoryIDToPass.push(category.ID);
            }

            if (category.ChildCategories && category.ChildCategories.length > 0) {
                category.ChildCategories.forEach(function (child) {
                    findSelected(child);
                });
            }
        }

        categoryIDToPass.forEach(function (value, index) {

            var temp = $('.checkbox-content [parentid="' + value + '"]')

            if (!temp || temp == 'undefined' || temp.length == 0) {
                cleanedCategoryIDToPass.push(value)
            }

        })

        if (current.isUpload.toLowerCase() !== "edititem") {
            current.itemId = "";
        }

        $.ajax({
            url: prefix+'/merchants/customfields',
            type: 'post',
            data: {
                categoryids: categoryIDToPass,
                itemId: current.itemId,
                cleanedCategoryIds: cleanedCategoryIDToPass
            },
            success: function (customFields) {
                let itemModel = Object.assign({}, current);
                itemModel.categories = newSearchCategories;
                itemModel.customFields = customFields;
                itemModel.categoriesSelected = categoryIDToPass;
                itemModel.initializeFormattedText = true;

                return dispatch({
                    type: actionTypes.ITEM_UPLOAD_EDIT_GET_CUSTOMFIELDS,
                    itemModel: itemModel
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function showParentCategoryOfChild(cat, keyword) {
    for (var i = 0; i < cat.ChildCategories.length; i++) {
        if (cat.ChildCategories[i].ChildCategories.length > 0) {
            let subChild = cat.ChildCategories[i].ChildCategories;
            for (var j = 0; j < subChild.length; j++) {
                if (subChild[j].ChildCategories.length > 0) {
                    let subChild2 = subChild[j].ChildCategories;
                    if (subChild2.length > 0) {
                        for (var k = 0; k < subChild2.length; k++) {
                            if (subChild2[k].ChildCategories.length > 0) {
                                let subChild3 = subChild2[k].ChildCategories;
                                for (var l = 0; l < subChild3.length; l++) {
                                    if (subChild3[l].ChildCategories.length > 0) {
                                        let subChild4 = subChild3[l].ChildCategories;
                                    }
                                    if (subChild3[l].Name.toLowerCase().includes(keyword.toLowerCase())) {
                                        cat.ShowThis = true;
                                        break;
                                    }
                                }
                            }
                            if (subChild2[k].Name.toLowerCase().includes(keyword.toLowerCase())) {
                                cat.ShowThis = true;
                                break;
                            }
                        }
                    }
                }
                if (subChild[j].Name.toLowerCase().includes(keyword.toLowerCase())) {
                    cat.ShowThis = true;
                    break;
                }
            }
        }
        if (cat.ChildCategories[i].Name.toLowerCase().includes(keyword.toLowerCase())) {
            cat.ShowThis = true;
            break;
        }
    }
}

function searchCategories(parents, keyword) {

    parents.map(function (cat) {
        if (cat.Name.toLowerCase().includes(keyword.toLowerCase())) {
            cat.ShowThis = true;
        } else {
            cat.ShowThis = false;
        }
        if (cat.ChildCategories.length > 0) {
            showParentCategoryOfChild(cat, keyword);
            searchCategories(cat.ChildCategories, keyword);
        }
    });
}

function updateCategoryToSearch(keyword) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        //Search Logic
        searchCategories(current.categories, keyword);
        let newSearchCategories = [];
        current.categories.forEach(function (catNow) {
            newSearchCategories.push(catNow);
        });

        let itemModel = Object.assign({}, current);
        itemModel.categories = newSearchCategories;
        itemModel.categoryWord = keyword;
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.UPDATE_ITEM_UPLOAD_EDIT_CATEGORIES_TO_SEARCH,
            itemModel: itemModel
        });
    };
}

function onTextChange(value, code) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        //Update Customfield Data
        let itemModel = Object.assign({}, current);
        itemModel.initializeFormattedText = false;

        itemModel.customFields.map(function (customfield) {
            if (customfield.Code === code) {
                if (customfield.Values === null) {
                    let values = [value];
                    customfield.Values = values;

                } else {
                    customfield.Values.splice($.inArray(value, customfield.Values), 1);
                    customfield.Values.push(value);
                }
            }
        });

        if (code === "itemdescription") {
            itemModel.description = value;
        }

        if (code === "itemname") {
            itemModel.listingName = value; 
        }

        if (code === "itemprice") {
            itemModel.price = value;
        }

        if (code === "itemquantity") {
            itemModel.quantity = value;
        }

        if (code === "itemsku") {
            itemModel.sku = value;
        }

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function dropDownChange(e, code) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        //Update Customfield Data
        let customFieldTopass = [];
        current.customFields.map(function (customfield) {
            if (customfield.Code == code) {
                let customfieldValues = [];
                customfieldValues.push(e.target.value);
                customfield.Values = customfieldValues;
            }
            customFieldTopass.push(customfield);
        });
        current.customFields = customFieldTopass;
        current.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: current
        });
    };
}

function checkboxClickedCustomField(value, code) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;

        //Update Customfield Data
        let customFieldTopass = [];
        current.customFields.map(function (customfield) {
            if (customfield.Code == code) {

                if (customfield.Values[0] == null) {
                    let values = [value];
                    customfield.Values = values;

                } else {
                    if (customfield.Values.findIndex(v => v == value) == -1) customfield.Values.push(value)
                    else customfield.Values = customfield.Values.filter(i => i != value);
                }

            }
            customFieldTopass.push(customfield);
        });


        let itemModel = Object.assign({}, current);
        itemModel.customFields = customFieldTopass;
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function updatePdfCustomField(value, code) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let itemModel = Object.assign({}, current);
        itemModel.initializeFormattedText = false;
        //   itemModel.customFields = customFieldTopass;

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function removeAllCountries() {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let itemModel = Object.assign({}, current);

        //removeAll Countries
        itemModel.countries = [];
        itemModel.availabilities = [];
        itemModel.pricing = [];


        $('.sol-current-selection .sol-selected-display-item').each(function (index, el) {
            $(el).remove();
        });

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function removeCountry(countryCode) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let itemModel = Object.assign({}, current);
        itemModel.countries.splice($.inArray(countryCode, itemModel.countries), 1);

        itemModel.availabilities.map(function (av) {
            if (av.countryCode === countryCode) {
                itemModel.availabilities.splice($.inArray(av, itemModel.availabilities), 1);
            }
        });

        itemModel.pricing.map(function (pr) {
            if (pr.countryCode === countryCode) {
                itemModel.pricing.splice($.inArray(pr, itemModel.pricing), 1);
            }
        });
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function addCountries(countries) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let availabilities = [];
        let pricing = [];

        if (current.savedAvailabilities && current.savedAvailabilities.length > 0) {
            //current.savedAvailabilities.forEach(function (data) {
            //    if (data.countryCode === countries[0].id) {
            //        availabilities.push(data);
            //    }

            //});
            //current.savedPricing.forEach(function (data) {
            //    if (data.countryCode === countries[0].id) {
            //        pricing.push(data);
            //    }
            //});
            let countryCodeToRemove = "";
            if (current.availabilities && current.availabilities.length > 0) {
                countries.slice(0).map(function (data, i) {
                    current.availabilities.forEach(function (ava) {
                        if (ava.countryCode === data.id) {
                            countries.splice(i, 1);
                            countryCodeToRemove = data.id;
                        }
                    })
                });
            }

            if (current.pricing && current.pricing.length > 0) {
                current.pricing.forEach(function (data) {
                    pricing.push(data);
                });
            }

            if (current.availabilities && current.availabilities.length > 0) {
                current.availabilities.forEach(function (data) {
                    availabilities.push(data);
                });
            }
            //New countries
            countries.forEach(function (country) {

                availabilities.push({
                    countryCode: country.id,
                    countryName: country.name,
                    unlimitedAll: false,
                    purchasableAll: true,
                    unlimited: false,
                    purchasable: true,
                    sku: "",
                    moq: "",
                    stock: ""
                });

                pricing.push({
                    countryCode: country.id,
                    countryName: country.name,
                    discountType: 'percentage',
                    priceRange: true,
                    onward: false,
                    currencyCode: current.currencyCode,
                    price: "",
                    bulkPricing: []
                });
            });

        } else {
            countries.forEach(function (country) {

                availabilities.push({
                    countryCode: country.id,
                    countryName: country.name,
                    unlimitedAll: false,
                    purchasableAll: true,
                    unlimited: false,
                    purchasable: true,
                    sku: "",
                    moq: "",
                    stock: ""
                });

                pricing.push({
                    countryCode: country.id,
                    countryName: country.name,
                    discountType: 'percentage',
                    priceRange: true,
                    onward: false,
                    currencyCode: current.currencyCode,
                    price: "",
                    bulkPricing: []
                });
            });
        }
        //Sorting
        //   countries.sort((a, b) => (a.id > b.id) ? 1 : -1)
        //   availabilities.sort((a, b) => (a.countryCode > b.countryCode) ? 1 : -1)
        //   pricing.sort((a, b) => (a.countryCode > b.countryCode) ? 1 : -1)

        let itemModel = Object.assign({}, current);
        itemModel.countries = countries;
        itemModel.availabilities = availabilities;
        itemModel.pricing = pricing;
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function onPriceChanged(value, code) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;

        current.pricing.forEach(function (data) {
            if (data.countryCode === code) {
                data.price = value;
            }
        });
        current.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: current
        });
    };
}

function SkuMoqStockChange(value, type, locationId) {
    return function (dispatch, getState) {
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        const { locationItems } = itemModel;

        locationItems.forEach((locationItem) => {
            if (locationItem.locationId == locationId) {
                if (type == "moq") {
                    locationItem.moq = value;
                }
            }
        });

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function unliOrPurchasableChanged(type, code) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let availabilitiesPass = [];
        let statusNow = false;

        current.availabilities.map(function (data) {
            if (data.countryCode === code) {
                if (type === "purchasable") {
                    data.purchasable = !data.purchasable;
                    statusNow = data.purchasable;
                }
                if (type === "unlimited") {
                    data.unlimited = !data.unlimited;
                    statusNow = data.unlimited;
                }
            }
            if (type === "purchasableall") {
                data.purchasableAll = !data.purchasableAll;
                data.purchasable = data.purchasableAll;
            }
            if (type === "unlimitedall") {
                data.unlimitedAll = !data.unlimitedAll;
                data.unlimited = data.unlimitedAll;
            }
            availabilitiesPass.push(data);
        });
        //check if All clicked
        let isAllpurchasable = true;
        let isAllUnlimited = true;
        current.availabilities.forEach(function (data) {
            if (type === "purchasable") {
                if (data.purchasable != statusNow) {
                    isAllpurchasable = false;
                }
            }
            if (type === "unlimited") {
                if (data.unlimited != statusNow) {
                    isAllUnlimited = false;
                }
            }
        });
        if (isAllpurchasable || isAllUnlimited) {
            availabilitiesPass = [];
            current.availabilities.map(function (data) {
                if (type === "purchasable") {
                    if (statusNow === false) {
                        data.purchasableAll = false;
                    } else {
                        if (isAllpurchasable) {
                            data.purchasableAll = statusNow;
                        }
                    }

                }
                if (type === "unlimited") {
                    if (statusNow === false) {
                        data.unlimitedAll = false;
                    } else {
                        if (isAllUnlimited) {
                            data.unlimitedAll = statusNow;
                        }
                    }
                }
                availabilitiesPass.push(data);
            });
        }

        let itemModel = Object.assign({}, current);
        itemModel.availabilities = availabilitiesPass;
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function uploadOrEditData() {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        const hasError = validateItemDetails(current, true);

        if (!hasError) {
            let childItems = [];
            let categories = [];
            let imageUploads = [];
            let customfields = [];
            let pdfCustomFields = [];
            let countries = [];
            let deliveries = [];
            let pickups = [];

            current.shippingModel.shippings.forEach(function (sp) {
                if (sp.Method.toLowerCase() === "delivery" && sp.Selected == "checked") {
                    let deliveryModel = { ID: sp.GUID };
                    deliveries.push(deliveryModel);
                }
                if (sp.Method.toLowerCase() === "pickup" && sp.Selected == "checked") {
                    let pickupModel = { ID: sp.GUID };
                    pickups.push(pickupModel);
                }
            });

            //Append Value of CKEditor
            $("input, textarea, select").each(function (i, el) {
                if ($(this).hasClass('ck-editor-element')) {
                    if (CKEDITOR.instances[$(el).attr("data-custom-field-type")].getData() !== "") {
                        current.customFields.forEach(function (cf) {
                            let values = [];
                            let finalCode = $(el).attr("data-custom-field-type").replace("formattedText_", "");
                            if (cf.Code === finalCode) {

                                values.push(CKEDITOR.instances[$(el).attr("data-custom-field-type")].getData());
                                let customFieldModel = {
                                    Code: cf.Code,
                                    Values: values
                                };
                                customfields.push(customFieldModel);
                            }
                        });
                    }
                }
            });

            // Append Value of DateTime
            $('.datepicker').each(function (i, el) {
                current.customFields.forEach(function (cf) {
                    const values = [];
                    const code = $(el).attr('data-code');
                    if (cf.Code === code) {
                        if (cf.DataFieldType.toLowerCase() == 'date') {
                            let date = Moment.utc($(el).val(), 'DD/MM/YYYY');
                            date = new Date(date) / 1000;
                            values.push(date);
                        }
                        else if (cf.DataFieldType.toLowerCase() == 'datetime') {
                            values.push($(el).val());
                        }

                        const customFieldModel = {
                            Code: cf.Code,
                            Values: values
                        };
                        customfields.push(customFieldModel);
                    }
                });
            });

            $('.timepicker').each(function (i, el) {
                customfields.map(function (cf) {
                    const code = $(el).attr('data-code');
                    if (cf.Code === code) {
                        let time = $(el).val();
                        if (time !== "") {
                            if (cf.Values && cf.Values[0].length > 1) {
                                let date = Moment.utc(cf.Values[0] + " " + time, 'DD/MM/YYYY hh:mm A').format('MM/DD/YYYY hh:mm A');
                                let newDateUnix = new Date(date) / 1000;
                                cf.Values = [];
                                cf.Values.push(newDateUnix);
                            }
                        }
                        //Dont Save if Time is Null or Date is Null
                    }
                });
            });

            function checkChildCategories(childCategories) {
                childCategories.forEach(function (data) {
                    if (data.Selected === "checked") {
                        let categoryModel = { ID: data.ID };
                        categories.push(categoryModel);
                    }
                    if (data.ChildCategories) {
                        checkChildCategories(data.ChildCategories);
                    }
                });
            }

            current.categories.forEach(function (data) {
                if (data.ChildCategories) {
                    checkChildCategories(data.ChildCategories);
                }
                if (data.Selected === "checked") {
                    let categoryModel = { ID: data.ID };
                    categories.push(categoryModel);
                }
            });

            let weightValue = "";
            let itemKeywords = [];
            current.customFields.forEach(function (cf) {
                let values = [];
                //Already Added for CKeditors
                if (cf.DataInputType.toLowerCase() !== "formattedtext" && cf.DataInputType.toLowerCase() !== "datetime") {
                    if (cf.Values) {
                        cf.Values.forEach(function (val) {
                            if (val !== null) values.push(val);
                        });
                    }

                    let customFieldModel = {
                        Code: cf.Code,
                        Values: values
                    };
                    customfields.push(customFieldModel);

                    if (cf.DataInputType.toLowerCase() == "upload") {
                        pdfCustomFields.push(customFieldModel);
                    }
                    if (cf.Code.toLowerCase().indexOf('-weight-') >= 0) {
                        if (cf.Values) {
                            weightValue = cf.Values[0];
                        }
                    }
                }

                if (cf.DataFieldType === 'string' && cf.Values.length > 0) {
                    itemKeywords.push(cf.Values[0]);
                }
            });

            if (process.env.PRICING_TYPE == 'country_level') {
                current.locationItems.forEach((locationItem) => {
                    const locationVariant = {
                        GroupID: locationItem.variantGroup.id,
                        GroupName: locationItem.variantGroup.name,
                        ID: locationItem.variantGroup.variant.id,
                        Name: locationItem.variantGroup.variant.name,
                        SortOrder: locationItem.variantGroup.variant.sortOrder
                    };

                    if (current.hasVariants) {
                        locationItem.itemVariants.forEach((itemVariant) => {
                            let variantsModel = [];
                            variantsModel.push(locationVariant);

                            itemVariant.variantGroups.forEach((variantGroup) => {
                                variantGroup.variants.forEach((variant) => {
                                    let model = {
                                        GroupID: variantGroup.id.startsWith('temp-') ? null : variantGroup.id,
                                        GroupName: variantGroup.name,
                                        ID: variant.id.startsWith('temp-') ? null : variant.id,
                                        Name: variant.name,
                                        SortOrder: variant.sortOrder
                                    };

                                    variantsModel.push(model);
                                });
                            });

                            let childItemModel = {
                                ID: itemVariant.id,
                                SKU: itemVariant.sku || null,
                                Name: current.listingName,
                                BuyerDescription: current.description,
                                StockLimited: !itemVariant.isUnlimited,
                                StockQuantity: parseFloat(itemVariant.stock || 0),
                                IsVisibleToCustomer: true,
                                Active: true,
                                IsAvailable: true,
                                Categories: categories,
                                Tags: [],
                                ShippingMethods: deliveries,
                                PickupAddresses: pickups,
                                Media: itemVariant.media ? [itemVariant.media] : null,
                                CustomFields: [
                                    {
                                        Code: current.moqCode,
                                        Values: [locationItem.moq]
                                    }
                                ],
                                CurrencyCode: current.currencyCode,
                                Price: parseFloat(itemVariant.surcharge || 0),
                                Variants: variantsModel
                            };

                            if (locationItem.pricing.bulkPricing.length > 0) {
                                childItemModel.CustomFields.push({
                                    Code: current.bulkPricingCode,
                                    Values: [locationItem.pricing.bulkPricing]
                                });
                            }

                            childItems.push(childItemModel);
                        });
                    } else {
                        const itemVariant = locationItem;

                        let childItemModel = {
                            ID: itemVariant.id,
                            SKU: itemVariant.sku || null,
                            Name: current.listingName,
                            BuyerDescription: current.description,
                            StockLimited: !itemVariant.isUnlimited,
                            StockQuantity: parseFloat(itemVariant.stock || 0),
                            IsVisibleToCustomer: true,
                            Active: true,
                            IsAvailable: true,
                            Categories: categories,
                            Tags: [],
                            ShippingMethods: deliveries,
                            PickupAddresses: pickups,
                            Media: itemVariant.media ? [itemVariant.media] : null,
                            CustomFields: [
                                {
                                    Code: current.moqCode,
                                    Values: [locationItem.moq]
                                }
                            ],
                            CurrencyCode: current.currencyCode,
                            Price: parseFloat(itemVariant.surcharge || 0),
                            Variants: [locationVariant]
                        };

                        if (locationItem.pricing.bulkPricing.length > 0) {
                            childItemModel.CustomFields.push({
                                Code: current.bulkPricingCode,
                                Values: [locationItem.pricing.bulkPricing]
                            });
                        }

                        childItems.push(childItemModel);
                    }
                });

                childItems.forEach((child) => {
                    if (child.Media && child.Media.length > 0) {
                        const media = child.Media[0];

                        if (media.MediaUrl.includes(";")) {
                            var block = media.MediaUrl.split(";");
                            var contentType = block[0].split(":")[1];
                            var realData = block[1].split(",")[1];
                            let convertedBuffer = b64toBlob(realData, contentType);
                            imageUploads.push({
                                name: "item-variant-media-" + child.ID,
                                value: convertedBuffer,
                                filename: media.OriginalName
                            });
                        }
                    }
                });
            } else {
                if (current.hasVariants && current.itemVariants.length > 0) {
                    current.itemVariants.forEach(function (itemVariant) {
                        let variantsModel = [];
                        itemVariant.variantGroups.forEach(function (variantGroup) {
                            variantGroup.variants.forEach(function (variant) {
                                let model = {
                                    GroupID: variantGroup.id.startsWith('temp-') ? null : variantGroup.id,
                                    GroupName: variantGroup.name,
                                    ID: variant.id.startsWith('temp-') ? null : variant.id,
                                    Name: variant.name,
                                    SortOrder: variant.sortOrder
                                };

                                variantsModel.push(model);
                            });
                        });

                        let childItemModel = {
                            ID: itemVariant.id,
                            SKU: itemVariant.sku || null,
                            Name: current.listingName,
                            BuyerDescription: current.description,
                            StockLimited: !itemVariant.isUnlimited,
                            StockQuantity: parseFloat(itemVariant.stock || 0),
                            IsVisibleToCustomer: true,
                            Active: true,
                            IsAvailable: true,
                            Categories: categories,
                            Tags: [],
                            ShippingMethods: deliveries,
                            PickupAddresses: pickups,
                            Media: itemVariant.media ? [itemVariant.media] : null,
                            CustomFields: [],
                            CurrencyCode: current.currencyCode,
                            Price: parseFloat(itemVariant.surcharge || 0),
                            Variants: variantsModel
                        };

                        childItems.push(childItemModel);

                        if (itemVariant.media) {
                            const media = itemVariant.media;

                            if (media.MediaUrl.includes(";")) {
                                var block = media.MediaUrl.split(";");
                                var contentType = block[0].split(":")[1];
                                var realData = block[1].split(",")[1];
                                let convertedBuffer = b64toBlob(realData, contentType);
                                imageUploads.push({
                                    name: "item-variant-media-" + itemVariant.id,
                                    value: convertedBuffer,
                                    filename: media.OriginalName
                                });
                            }
                        }
                    });
                }
            }

            current.images.forEach(function (media, i) {
                if (media.MediaUrl.includes(";")) {
                    var block = media.MediaUrl.split(";");
                    var contentType = block[0].split(":")[1];
                    var realData = block[1].split(",")[1];
                    let convertedBuffer = b64toBlob(realData, contentType);
                    imageUploads.push({
                        name: "itemMedia-" + i,
                        value: convertedBuffer,
                        filename: media.OriginalName
                    });
                }
            });

            let itemId = "";
            if (current.itemId) {
                itemId = current.itemId;
            }
            let images = [];
            uploadMedia(imageUploads, function (newMedia) {
                if (current.images) {
                    current.images.forEach(function (image) {
                        if (image.ID) {
                            images.push({ ID: image.ID, Key: null });
                        }
                    })
                }

                if (newMedia) {
                    newMedia.forEach(function (image) {
                        images.push({ ID: image.ID, Key: image.Key });
                    });
                }

                childItems.map(function (ci) {
                    if ($('.variants-section').length > 0) {
                        var uploaded = images.filter(i => i.Key == "item-variant-media-" + ci.ID);
                        ci.Media = uploaded.length > 0 ? uploaded : ci.Media;
                        ci.ID = ci.ID.startsWith('temp-') ? null : ci.ID;
                    } else {
                        ci.Media = images;
                    }
                });

                if (process.env.PRICING_TYPE == 'country_level') {
                    current.savedChildItemIds.forEach((childId) => {
                        const isExist = childItems.length == 0 ? false : childItems.find(c => c.ID == childId) != null;
                        if (!isExist) {
                            childItems.push({
                                ID: childId,
                                Active: false
                            });
                        }
                    });
                } else {
                    current.savedItemVariants.forEach(function (itemVariant) {
                        const isExist = childItems.length == 0 ? false : childItems.find(c => c.ID == itemVariant.id) != null;
                        if (!isExist) {
                            childItems.push({
                                ID: itemVariant.id,
                                Active: false
                            });
                        }
                    });
                }

                uploadPdf(pdfCustomFields, function (updatedPdfCustomFields) {
                    if (updatedPdfCustomFields.length > 0) {
                        customfields.forEach(function (cf) {
                            var pdf = updatedPdfCustomFields.find(c => c.Code == cf.Code);
                            if (pdf) {
                                cf.Values = pdf.Values;
                            }
                        });
                    }

                    let itemData = {
                        Name: current.listingName,
                        Tags: countries,
                        BuyerDescription: current.description,
                        Categories: categories,
                        HasChildItems: true,
                        Active: true,
                        ChildItems: childItems,
                        ShippingMethods: deliveries,
                        PickupAddresses: pickups,
                        CurrencyCode: current.currencyCode,
                        CustomFields: customfields,
                        Weight: weightValue,
                        Keywords: itemKeywords.length > 0 ? itemKeywords.join() : null,
                    };

                    if (process.env.PRICING_TYPE == 'country_level') {
                        itemData.SKU = null;
                        itemData.IsVisibleToCustomer = false;
                        itemData.IsAvailable = false;
                    } else {
                        itemData.SKU = current.sku || null;
                        itemData.IsVisibleToCustomer = true;
                        itemData.IsAvailable = true;
                        itemData.Price = parseFloat(current.price);
                        itemData.StockLimited = !current.isUnlimitedStock;
                        itemData.StockQuantity = parseFloat(current.quantity || 0);
                    }

                    itemData.Media = images.filter(i => i.Key == null || !i.Key.startsWith("item-variant-media-"));

                    console.log(itemData, 'itemData');
                    //return;

                    if (current.negotiation || current.instantbuy) {
                        itemData.Negotiation = current.negotiation;
                        itemData.InstantBuy = current.instantbuy;
                    }

                    let url = prefix+'/merchants/' + current.isUpload;
                    let type = 'post';
                    let activityType = EnumCoreModule.GetItemActivityLogTypes().Add;
                    if (current.isUpload.toLowerCase() === "edititem") {
                        url = prefix+'/merchants/' + current.isUpload + "/" + itemId;
                        type = 'put';
                        activityType = EnumCoreModule.GetItemActivityLogTypes().Edit;
                    }

                    if (current.isSaving === false) {
                        //ARC8788
                        if (typeof current.controlFlags !== 'undefined') {
                            if (current.controlFlags.AdminVetting) {
                                itemData.IsVisibleToCustomer = false;
                                itemData.IsAvailable = false;
                            } else {
                                itemData.IsVisibleToCustomer = true;
                                itemData.IsAvailable = true;
                            }
                        }
                        postCreatedItem(url, type, itemData).done(function (data) {
                            if (data) {
                                isSaving = false;
                                getActivityCookie(0, null, function (cookie) {
                                    $.ajax({
                                        url: prefix+'/merchants/activity-logs/createItemActivityLog',
                                        type: 'POST',
                                        data: {
                                            itemId: data.ID,
                                            type: activityType,
                                            alternateId: cookie.alternateId
                                        },
                                        success: function () {
                                            if (current.isUpload.toLowerCase() === "edititem") {
                                                window.location = prefix+'/merchants/items';
                                            } else {
                                                window.location = prefix+'/items';
                                            }
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            console.log(textStatus, errorThrown);
                                        }
                                    });
                                });
                            } else {
                                current.isSaving = false;
                                toastr.error("Error uploading item");
                            }
                        });
                        current.isSaving = true;
                        return dispatch({
                            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
                            itemModel: current
                        });
                    }
                });
            });
        }
    };
}

function postCreatedItem(url, type, itemData) {
    return $.ajax({
        url: url,
        type: type,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(itemData),
    });
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function searchShippings(keyword) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;

        let searchShipping = [];
        current.shippingModel.shippings.map(function (data) {
            if (data.Show) {
                if (data.Name.toLowerCase().includes(keyword.toLowerCase())) {
                    data.Visible = true;
                } else {
                    data.Visible = false;
                }
                searchShipping.push(data);
            }
        });

        let newShippingModel = {
            shippings: searchShipping,
            checkDeliveryAll: current.shippingModel.checkDeliveryAll,
            checkPickUpAll: current.shippingModel.checkPickUpAll,
            shippingWord: keyword
        };

        let itemModel = Object.assign({}, current);
        itemModel.shippingModel = newShippingModel;
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function shippingSelectedChanged(type, guid) {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer.itemModel;
        let newShippingToPass = [];
        let isCheckedStatus = "";
        current.shippingModel.shippings.map(function (data) {
            if (data.GUID == guid) {
                if (data.Selected === "") {
                    data.Selected = "checked";
                } else {
                    data.Selected = "";
                }
                isCheckedStatus = data.Selected;
            }
            newShippingToPass.push(data);
        });

        let newShippingModel = {
            shippings: newShippingToPass,
            checkDeliveryAll: current.shippingModel.checkDeliveryAll,
            checkPickUpAll: current.shippingModel.checkPickUpAll,
            shippingWord: current.shippingModel.shippingWord
        };

        if (type === "checkDeliveryAll") {

            if (newShippingModel.checkDeliveryAll === "") {
                newShippingModel.checkDeliveryAll = "checked";
            } else {
                newShippingModel.checkDeliveryAll = "";
            }

            newShippingModel.shippings.map(function (data) {
                if (data.Method.toLowerCase() === "delivery") {
                    data.Selected = newShippingModel.checkDeliveryAll;
                }
            });

        } else if (type === "checkPickUpAll") {

            if (newShippingModel.checkPickUpAll === "") {
                newShippingModel.checkPickUpAll = "checked";
            } else {
                newShippingModel.checkPickUpAll = "";
            }

            newShippingModel.shippings.map(function (data) {
                if (data.Method.toLowerCase() === "pickup") {
                    data.Selected = newShippingModel.checkPickUpAll;
                }
            });
        }
        //check if All clicked
        let isAllDeliveryChecked = true;
        let isAllPickupChecked = true;
        newShippingModel.shippings.forEach(function (data) {
            if (type === "delivery") {
                if (data.Selected === "" && data.Method.toLowerCase() === "delivery") {
                    isAllDeliveryChecked = false;
                }
            }
            if (type === "pickup") {
                if (data.Selected === "" && data.Method.toLowerCase() === "pickup") {
                    isAllPickupChecked = false;
                }
            }
        });

        if (type === "delivery") {
            if (isAllDeliveryChecked === true) {
                newShippingModel.checkDeliveryAll = "checked";
            } else {
                newShippingModel.checkDeliveryAll = "";
            }
        }
        if (type === "pickup") {
            if (isAllPickupChecked === true) {
                newShippingModel.checkPickUpAll = "checked";
            } else {
                newShippingModel.checkPickUpAll = "";
            }
        }

        let itemModel = Object.assign({}, current);
        itemModel.shippingModel = newShippingModel;
        itemModel.initializeFormattedText = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function saveBulkPricing(locationId, bulkPricing) {
    return function (dispatch, getState) {
        const modalStatus = Object.assign({}, getState().uploadEditItemReducer.modalStatus);
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        const { locationItems } = itemModel;

        locationItems.forEach((locationItem) => {
            if (locationItem.locationId == locationId) {
                const { pricing } = locationItem;

                pricing.discountType = "percentage";
                pricing.priceRange = true;

                if (bulkPricing.length > 0) {
                    if (bulkPricing[0].IsFixed == '1') {
                        pricing.discountType = "fixed";
                    }

                    if (bulkPricing[bulkPricing.length - 1].Onward == '1') {
                        pricing.priceRange = false;
                    }
                }

                pricing.bulkPricing = JSON.stringify(bulkPricing);
            }
        });

        modalStatus.openDeleteBulkPopUp = false;

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_MODAL_CHANGE,
            itemModel: itemModel,
            modalStatus: modalStatus
        });
    };
}

function setBulkToDeleteCountryCode(countryCode, index) {
    return function (dispatch, getState) {
        let modalStatus = Object.assign({}, getState().uploadEditItemReducer.modalStatus);
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        const bulkToDeleteCountryCode = {
            countryCode: countryCode,
            index: index
        };

        itemModel.bulkToDeleteCountryCode = bulkToDeleteCountryCode;
        modalStatus.openDeleteBulkPopUp = true;

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_MODAL_CHANGE,
            itemModel: itemModel,
            modalStatus: modalStatus
        });
    };
}

function closeDeletePopUp() {
    return function (dispatch, getState) {
        let current = getState().uploadEditItemReducer;
        let model = Object.assign({}, current);

        let bulkToDeleteCountryCode = {
            countryCode: "",
            index: 0
        };

        model.itemModel.bulkToDeleteCountryCode = bulkToDeleteCountryCode;
        model.itemModel.initializeFormattedText = false;
        model.modalStatus.openDeleteBulkPopUp = false;
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_MODAL_CHANGE,
            itemModel: model.itemModel,
            modalStatus: model.modalStatus
        });
    };
}

function createCustomField(data, callback) {
    return function (dispatch, getState) {
        $.ajax({
            url: prefix+'/merchants/customfield',
            type: 'POST',
            data: data,
            success: function (result) {
                if (data.Name == 'user_seller_location') {

                    var tempDispatch = dispatch({
                        type: actionTypes.CREATE_USER_CUSTOM_FIELD,
                        CustomFields: result
                    });

                    if (callback) {
                        callback();
                    }

                    return tempDispatch
                }

                let itemModel = getState().uploadEditItemReducer.itemModel;
                if (data.Name === 'MOQ') {
                    itemModel.moqCode = result ? result.Code : null;
                }
                else if (data.Name === 'BulkPricing') {
                    itemModel.bulkPricingCode = result ? result.Code : null;
                }
                else if (data.Name === 'CountryCode') {
                    itemModel.countryCode = result ? result.Code : null;
                }

                var theDispatch = dispatch({
                    type: actionTypes.CREATE_CUSTOM_FIELD,
                    itemModel: itemModel
                });

                if (callback) {
                    callback();
                }

                return theDispatch

            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    };
}

function uploadPdf(pdfCustomFields, callback) {
    let pdfFormData = new FormData();
    pdfCustomFields.forEach(function (cf) {
        $.each($('#pdf-' + cf.Code + '[type="file"]')[0].files, function (i, file) {
            pdfFormData.append(cf.Code, file);
        });
    });

    if (pdfCustomFields.length > 0) {
        $.ajax({
            url: prefix+'/merchants/uploadPdf',
            data: pdfFormData,
            cache: false,
            contentType: false,
            async: false,
            processData: false,
            type: 'POST', // For jQuery < 1.9
            success: function (result) {
                if (result.length > 0) {
                    pdfCustomFields.forEach(function (cf) {
                        var pdf = result.find(r => r.Name == cf.Code);
                        if (pdf) {
                            cf.Values[0] = pdf.SourceUrl;
                        }
                    });
                }

                callback(pdfCustomFields);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    } else {
        callback(pdfCustomFields);
    }
}

function uploadMedia(uploads, callback) {
    let formData = new FormData();

    if (uploads.length > 0) {
        uploads.forEach(function (upload) {
            formData.append(upload.name, upload.value, upload.filename);
        });

        $.ajax({
            url: prefix+'/merchants/uploadMedia',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST', // For jQuery < 1.9
            success: function (media) {
                callback(media);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    } else {
        callback(new Array());
    }
}

function generateUUID() {
    return 'temp-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function addVariant(groupId, variantName) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        let variantId = generateUUID();

        itemModel.variantGroups.forEach(function (variantGroup) {
            if (variantGroup.id == groupId) {
                let isExist = variantGroup.variants.filter(v => v.name == variantName).length > 0;

                if (!isExist) {
                    variantGroup.variants.push({
                        id: variantId,
                        name: variantName,
                        sortOrder: variantGroup.variants.length + 1
                    });
                }
            }
        });

        updateItemVariants(itemModel);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function deleteVariant(variantId) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        let groupId = null;
        let updatedVariants = [];
        itemModel.initializeFormattedText = false;

        itemModel.variantGroups.forEach(function (variantGroup) {
            const isExist = variantGroup.variants.filter(v => v.id == variantId).length > 0;

            if (isExist) {
                groupId = variantGroup.id;

                variantGroup.variants = variantGroup.variants.filter(v => v.id != variantId);
                variantGroup.variants.forEach(function (variant, index) {
                    variant.sortOrder = index + 1;
                });

                updatedVariants = variantGroup.variants;
            }
        });

        itemModel.itemVariants.forEach(function (itemVariant) {
            itemVariant.variantGroups.forEach(function (variantGroup) {
                if (variantGroup.id == groupId) {
                    variantGroup.variants.forEach(function (variant) {
                        if (variant.id != variantId) {
                            variant.sortOrder = updatedVariants.find(v => v.id == variant.id).sortOrder;
                        }
                    })
                }
            });
        });

        updateItemVariants(itemModel);

        itemModel.selectedVariant = null;

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function onItemVariantChange(itemId, code, value, locationId) {
    return function (dispatch, getState) {
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        let itemVariants = null;

        if (locationId) {
            if (itemModel.locationItems.length > 0) {
                const locationItem = itemModel.locationItems.find(l => l.locationId == locationId);

                if (locationItem) {
                    if (itemModel.hasVariants) {
                        itemVariants = locationItem.itemVariants;
                    } else {
                        itemVariants = [locationItem];
                    }
                }
            }
        } else {
            itemVariants = itemModel.itemVariants;
        }

        if (itemVariants) {
            itemVariants.forEach(function (item, index) {
                if (item.id == itemId) {
                    if (code == 'variantsku') {
                        item.sku = value;
                    } else if (code == 'variantsurcharge') {
                        item.surcharge = value;
                    } else if (code == 'variantstock') {
                        item.stock = value;
                    } else if (code == 'variantunlimited') {
                        item.isUnlimited = value;
                        //item.stock = "";
                    } else if (code == 'variantsameimage') {
                        item.isSameImage = value;
                        if (item.isSameImage) {
                            if (index > 0) {
                                const prev = itemVariants[index - 1];
                                if (prev != null && prev != undefined && typeof prev !== undefined) {
                                    item.media = prev.media || null;
                                }
                            }
                        } else {
                            item.media = null;
                        }
                    }
                }

                if (code == 'variantunlimitedall') {
                    item.isUnlimited = value;
                    //item.stock = "";
                }
            });
        }

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function onToggleChange(value, code) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        if (code === "itemunlimitedstock") {
            itemModel.isUnlimitedStock = value;
        }

        if (code === "itemvariants") {
            itemModel.hasVariants = value;
        }

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function sortVariants(groupId, sortedVariants) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        let updatedVariants = [];
        itemModel.initializeFormattedText = false;

        itemModel.variantGroups.forEach(function (variantGroup) {
            if (variantGroup.id == groupId) {
                variantGroup.variants.forEach(function (variant) {
                    sortedVariants.forEach(function (sortedVariant, index) {
                        if (variant.id == sortedVariant.id) {
                            variant.sortOrder = index + 1;
                        }
                    })
                });

                variantGroup.variants.sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1);
                updatedVariants = variantGroup.variants;
            }
        });

        itemModel.itemVariants.forEach(function (itemVariant) {
            itemVariant.variantGroups.forEach(function (variantGroup) {
                if (variantGroup.id == groupId) {
                    variantGroup.variants.forEach(function (variant) {
                        variant.sortOrder = updatedVariants.find(v => v.id == variant.id).sortOrder;
                    })
                }
            });
        });

        updateItemVariants(itemModel);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function updateItemVariants(itemModel) {
    function getCombinations(arraysToCombine) {
        var divisors = [];
        for (var i = arraysToCombine.length - 1; i >= 0; i--) {
            divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;
        }

        function getPermutation(n, arraysToCombine) {
            var result = [],
                curArray;
            for (var i = 0; i < arraysToCombine.length; i++) {
                curArray = arraysToCombine[i];
                result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
            }
            return result;
        }

        var numPerms = arraysToCombine[0].length;
        for (var i = 1; i < arraysToCombine.length; i++) {
            numPerms *= arraysToCombine[i].length;
        }

        var combinations = [];
        for (var i = 0; i < numPerms; i++) {
            combinations.push(getPermutation(i, arraysToCombine));
        }
        return combinations;
    }

    let currentItemVariants = Object.assign([], itemModel.itemVariants);
    itemModel.itemVariants = [];
    let flatVariantGroups = [];

    itemModel.variantGroups.forEach(function (variantGroup) {
        let array = [];

        variantGroup.variants.forEach(function (variant) {
            let copy = Object.assign({}, variantGroup);
            copy.variants = variantGroup.variants.filter(v => v.id == variant.id)

            array.push(copy);
        })

        if (array.length == 0) {
            array.push(Object.assign({}, variantGroup));
        }

        flatVariantGroups.push(array);
    });

    getCombinations(flatVariantGroups).forEach(function (itemVariantGroups) {
        const validVariantGroups = itemVariantGroups.filter(v => v.name && v.variants.length > 0);

        if (validVariantGroups.length > 0) {
            let itemVariant = {
                id: generateUUID(),
                sku: "",
                surcharge: "",
                stock: "",
                isUnlimited: false,
                variantGroups: validVariantGroups,
                media: null,
                isSameImage: false
            };

            currentItemVariants.forEach(function (currentItemVariant) {
                if (JSON.stringify(currentItemVariant.variantGroups) == JSON.stringify(itemVariant.variantGroups)) {
                    itemVariant = Object.assign({}, currentItemVariant);
                }
            });

            itemModel.itemVariants.push(itemVariant);
        }
    });

    itemModel.locationItems.forEach((locationItem) => {
        var current = Object.assign([], locationItem.itemVariants);
        locationItem.itemVariants = JSON.parse(JSON.stringify(itemModel.itemVariants));

        locationItem.itemVariants.forEach((itemVariant) => {
            const existing = current.find(i => JSON.stringify(i.variantGroups) == JSON.stringify(itemVariant.variantGroups));

            if (existing) {
                itemVariant = Object.assign(itemVariant, existing);
            }
        });
    });
}

function updateVariantGroupName(groupId, name) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        itemModel.variantGroups.forEach(function (variantGroup) {
            if (variantGroup.id == groupId) {
                variantGroup.name = name;
            }
        });

        itemModel.itemVariants.forEach(function (itemVariant) {
            itemVariant.variantGroups.forEach(function (variantGroup) {
                if (variantGroup.id == groupId) {
                    variantGroup.name = name;
                }
            });
        });

        updateItemVariants(itemModel);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function sortItemVariants() {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);

        updateItemVariants(itemModel);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function updateSelectedVariant(variantId, name, isSubmit) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        function capitalize(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }

        isSubmit = isSubmit ? isSubmit : false;

        if (isSubmit) {
            let isUpdateItemVariants = false;
            const selectedId = itemModel.selectedVariant.id;
            const selectedName = capitalize(itemModel.selectedVariant.name.trim());

            itemModel.variantGroups.forEach(function (variantGroup) {
                variantGroup.variants.forEach(function (variant) {
                    if (variant.id == selectedId) {
                        if (selectedName) {
                            let isExist = variantGroup.variants.find(v => v.name.toLowerCase() == selectedName.toLowerCase()) != null;

                            if (!isExist) {
                                variant.name = selectedName;
                                isUpdateItemVariants = true;
                            }
                        }

                        itemModel.selectedVariant = null;
                    }
                });
            });

            if (isUpdateItemVariants) {
                itemModel.itemVariants.forEach(function (itemVariant) {
                    itemVariant.variantGroups.forEach(function (variantGroup) {
                        variantGroup.variants.forEach(function (variant) {
                            if (variant.id == selectedId) {
                                variant.name = selectedName;
                            }
                        });
                    });
                });

                updateItemVariants(itemModel);
            }
        } else if (typeof name !== 'undefined') {
            itemModel.selectedVariant.name = name;
        } else if (variantId) {
            itemModel.variantGroups.forEach(function (variantGroup) {
                variantGroup.variants.forEach(function (variant) {
                    if (variant.id == variantId) {
                        itemModel.selectedVariant = Object.assign({}, variant);
                    }
                });
            });
        } else {
            itemModel.selectedVariant = null;
        }

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function updateSpotOrNegotiateButton(button) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        if (button === "instantbuy") {
            itemModel.instantbuy = !itemModel.instantbuy;
        } else {
            itemModel.negotiation = !itemModel.negotiation;
        }
        if (itemModel.instantbuy === false && itemModel.negotiation === false) {
            if (button === "instantbuy") {
                itemModel.instantbuy = !itemModel.instantbuy;
            } else {
                itemModel.negotiation = !itemModel.negotiation;
            }
        }
        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function sortVariantGroups(sortedVariantGroups) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);

        itemModel.variantGroups.forEach((variantGroup) => {
            sortedVariantGroups.forEach((sortedVariantGroup, index) => {
                if (variantGroup.id == sortedVariantGroup.id) {
                    variantGroup.sortOrder = index + 1;
                }
            });
        });

        itemModel.variantGroups.sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1);

        updateItemVariants(itemModel);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function deleteVariantGroup(variantGroupId) {
    return function (dispatch, getState) {
        let itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        itemModel.initializeFormattedText = false;

        let updatedVariantGroups = itemModel.variantGroups.filter(v => v.id != variantGroupId);
        updatedVariantGroups.forEach((variantGroup, index) => {
            variantGroup.sortOrder = index + 1;
        });

        updatedVariantGroups.push({
            id: generateUUID(),
            name: "",
            sortOrder: updatedVariantGroups.length + 1,
            variants: []
        });

        itemModel.variantGroups = updatedVariantGroups;

        updateItemVariants(itemModel);

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function addLocations(locationIds) {
    return function (dispatch, getState) {
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        const { locations, locationItems, selectedLocationIds } = itemModel;
        itemModel.initializeFormattedText = false;

        if (true) {
            locationIds.forEach((id) => {
                if (locationItems.length > 0 && locationItems.find(l => l.locationId == id) != null) {
                    return;
                }

                const location = locations.find(l => l.ID == id);

                if (location) {
                    locationItems.push({
                        locationId: location.ID,
                        locationName: location.Name,
                        moq: "",
                        id: generateUUID(),
                        sku: "",
                        surcharge: "",
                        stock: "",
                        isUnlimited: false,
                        media: null,
                        isSameImage: false,
                        variantGroup: {
                            id: location.GroupID,
                            name: location.GroupName,
                            sortOrder: null,
                            variant: {
                                id: location.ID,
                                name: location.Name,
                                sortOrder: location.SortOrder,
                            }
                        },
                        itemVariants: JSON.parse(JSON.stringify(itemModel.itemVariants)),
                        pricing: {
                            discountType: 'percentage',
                            priceRange: true,
                            currencyCode: itemModel.currencyCode,
                            locationId: location.ID,
                            bulkPricing: ""
                        },
                    });

                    locationItems.sort((a, b) => (a.variantGroup.variant.sortOrder > b.variantGroup.variant.sortOrder) ? 1 : -1);

                    selectedLocationIds.push(id);
                }
            });
        }

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function removeLocation(locationId) {
    return function (dispatch, getState) {
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);
        const { locationItems, selectedLocationIds } = itemModel;
        itemModel.initializeFormattedText = false;

        selectedLocationIds.splice($.inArray(locationId, selectedLocationIds), 1);

        locationItems.map((locationItem) => {
            if (locationItem.locationId === locationId) {
                locationItems.splice($.inArray(locationItem, locationItems), 1);
            }
        });

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    };
}

function removeAllLocations() {
    return function (dispatch, getState) {
        const itemModel = Object.assign({}, getState().uploadEditItemReducer.itemModel);

        itemModel.selectedLocationIds = [];
        itemModel.locationItems = [];

        $('.sol-current-selection .sol-selected-display-item').each(function (index, el) {
            $(el).remove();
        });

        return dispatch({
            type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
            itemModel: itemModel
        });
    }
}

function validateNonPricingDetails(callback) {
    return function (dispatch, getState) {
        const itemModel = getState().uploadEditItemReducer.itemModel;
        const hasError = validateItemDetails(itemModel, false);

        if (typeof callback == 'function') {
            callback(hasError);
        }

        return dispatch({
            type: ''
        });
    }
}

function validateItemDetails(itemModel, isValidatePricing = false) {
    let hasError = false;
    const mandatoryFieldErrorMessage = 'Missing mandatory fields';

    $('.delivery-tab-class').removeClass("error-con");

    if (itemModel.shippingModel && itemModel.shippingModel.shippings && itemModel.shippingModel.shippings < 1) {
    } else if (itemModel.shippingModel && itemModel.shippingModel.shippings) {
        var addedShipping = itemModel.shippingModel.shippings.filter((value) => {
            return value.Selected != '';
        });

        // commented condition below:
        // check if needed this since it will be catched later in the code
        //if (addedShipping.length < 1) {
        //    $('.delivery-tab-class').addClass("error-con");
        //    hasError = true;
        //    toastr.error('Please select atleast one shipping!');
        //}
    }

    $("input.required, textarea.required, select.required").each(function () {
        if (isValidatePricing || $(this).parents('.tabcontent').attr('id') != 'pricing_tab') {
            let type = $(this).attr('type');
            let name = $(this).attr('name');
            $(this).removeClass("error-con");
            if (type == 'file') {
                $(this).parent().removeClass("error-con");
            }
            if (name == 'custom-field' && type == 'checkbox') {
                $(this).parent().parent().removeClass("error-con");
            }
            if ($(this).hasClass('ck-editor-element')) {
                $(this).next('div').removeClass("error-con");

                if (CKEDITOR.instances[$(this).attr("data-custom-field-type")].getData() === "") {
                    $(this).addClass("error-con");
                    $(this).next('div').addClass("error-con");
                    hasError = true;
                    toastr.error(mandatoryFieldErrorMessage);
                }
            } else {
                if ($.trim($(this).val()) === "" && type !== 'file') {
                    if (type !== 'checkbox') {
                        $(this).addClass("error-con");
                        hasError = true;
                        toastr.error(mandatoryFieldErrorMessage);
                    }
                }
                if ($(this).hasClass('emailOnly')) {
                    var regex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((?!-))((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(\[IPv(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))+[0-1]])|(([a-zA-Z\-0-9]((?!-\.).)+\.)+[a-zA-Z]{2,}))$/;
                    if (!regex.test($(this).val())) {
                        $(this).addClass('error-con');
                        hasError = true;
                    }
                }
                if (type == 'file') {
                    let code = $(this).attr('data-code');
                    let customFields = itemModel.customFields;
                    if (customFields) {
                        let pdf = customFields.find(c => c.Code == code);
                        if (pdf.Values && !pdf.Values[0]) {
                            $(this).parent().addClass('error-con');
                            hasError = true;
                        }
                    }
                }
                if (name == 'custom-field' && type == 'checkbox') {
                    var code = $(this).attr('data-group');
                    let hasChecked = false;
                    $('input[data-group="' + code + '"]').each(function () {
                        if ($(this).is(":checked")) {
                            hasChecked = true;
                        }
                    });

                    if (!hasChecked) {
                        $(this).parent().parent().addClass('error-con');
                        toastr.error(mandatoryFieldErrorMessage);
                        hasError = true;
                    }
                }
            }
        }
    });

    $("input[name='custom-field'].emailOnly:not(.required)").each(function () {
        $(this).removeClass("error-con");
        if ($(this).val() !== '') {
            var regex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((?!-))((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(\[IPv(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))+[0-1]])|(([a-zA-Z\-0-9]((?!-\.).)+\.)+[a-zA-Z]{2,}))$/;
            if (!regex.test($(this).val())) {
                $(this).addClass('error-con');
                hasError = true;
            }
        }

    });

    $('.numberDecimalOnly').each(function () {
        if (isValidatePricing || $(this).parents('.tabcontent').attr('id') != 'pricing_tab') {
            if (!$(this).hasClass('required')) {
                $(this).removeClass('error-con');
            }
            if (parseFloat($(this).attr('data-max'))) {
                if (parseFloat($(this).attr('data-max')) < parseFloat(this.value)) {
                    toastr.error("Maximum value is " + $(this).attr('data-max'), "Invalid value");
                    $(this).addClass('error-con');
                    hasError = true;
                }
            }
            if (parseFloat($(this).attr('data-min'))) {
                if (parseFloat($(this).attr('data-min')) > parseFloat(this.value)) {
                    toastr.error("Minimum value is " + $(this).attr('data-min'), "Invalid value");
                    $(this).addClass('error-con');
                    hasError = true;
                }
            }
        }
    });

    $('.numbersOnly').each(function () {
        if (isValidatePricing || $(this).parents('.tabcontent').attr('id') != 'pricing_tab') {
            if (!$(this).hasClass('required')) {
                $(this).removeClass('error-con');
            }
            if (parseInt($(this).attr('data-max'))) {
                if (parseInt($(this).attr('data-max')) < parseInt(this.value)) {
                    toastr.error("Maximum value is " + $(this).attr('data-max'), "Invalid value");
                    $(this).addClass('error-con');
                    hasError = true;
                }
            }
            if (parseInt($(this).attr('data-min'))) {
                if (parseInt($(this).attr('data-min')) > parseInt(this.value)) {
                    toastr.error("Minimum value is " + $(this).attr('data-min'), "Invalid value");
                    $(this).addClass('error-con');
                    hasError = true;
                }
            }
        }
    });

    $('.check-box.available').each(function (i, cb) {
        var checkbox = $(cb).find('input[type="checkbox"]').checked;
        if ($(checkbox).is(":checked")) {

        }
    });

    $(".item-upload-category-container.required").each(function () {
        var checkboxes = $(this).find('.checkbox-content > ul > li > input[type="checkbox"]');
        var checkedOne = Array.prototype.slice.call(checkboxes).some(x => x.checked);
        if (checkedOne == false) {
            $(this).addClass("error-con");
            hasError = true;
        } else {
            $(this).removeClass("error-con");
        }
    });

    if ($(".form-element-select .sol-container").length > 0) {
        if (isValidatePricing) {
            if (!$('#selectCountries').searchableOptionList().getSelection().length > 0) {
                $(".sol-inner-container").addClass("error-con");
                toastr.error(mandatoryFieldErrorMessage);
                hasError = true;
            } else {
                $(".sol-inner-container input").removeClass("error-con");
            }
        }
    }

    if (itemModel.images.length <= 0) {
        $(".browse-image").addClass("error-con");
        toastr.error(mandatoryFieldErrorMessage);
        hasError = true;
    } else {
        $(".browse-image").removeClass("error-con");
    }

    if ($('.variants-section').length > 0) {
        let hasMissingFields = false;
        let withDuplicateVariantGroupNames = false;
        let withValidVariantGroup = false;

        itemModel.variantGroups.forEach(function (variantGroup) {
            $('div[data-id="' + variantGroup.id + '"]').find(".bootstrap-tagsinput").removeClass("error-con");
            $('div[data-id="' + variantGroup.id + '"]').find(".option_name").removeClass("error-con");

            if (itemModel.hasVariants) {
                if (variantGroup.name && variantGroup.variants.length <= 0) {
                    $('div[data-id="' + variantGroup.id + '"]').find(".bootstrap-tagsinput").addClass("error-con");
                    hasMissingFields = true;
                }
                if (!variantGroup.name && variantGroup.variants.length > 0) {
                    $('div[data-id="' + variantGroup.id + '"]').find(".option_name").addClass("error-con");
                    hasMissingFields = true;
                }
                if (variantGroup.name && itemModel.variantGroups.filter(v => v.name == variantGroup.name && v.id != variantGroup.id).length > 0) {
                    $('div[data-id="' + variantGroup.id + '"]').find(".option_name").addClass("error-con");
                    withDuplicateVariantGroupNames = true;
                }
                if (variantGroup.name && variantGroup.variants.length > 0) {
                    withValidVariantGroup = true;
                }
            }
        });

        if (hasMissingFields) {
            toastr.error(mandatoryFieldErrorMessage);
            hasError = true;
        }
        if (withDuplicateVariantGroupNames) {
            toastr.error('Variant option should be unique');
            hasError = true;
        }
        if (itemModel.hasVariants && !withValidVariantGroup) {
            $(".bootstrap-tagsinput").first().addClass('error-con');
            $("input.option_name").first().addClass('error-con');
            toastr.error(mandatoryFieldErrorMessage);
            hasError = true;
        }
    }

    let hasDeliverySelected = false;
    let hasPickupSelected = false;
    itemModel.shippingModel.shippings.forEach(function (sp) {
        if (sp.Method.toLowerCase() === "delivery" && sp.Selected == "checked") {
            hasDeliverySelected = true;
        }
        if (sp.Method.toLowerCase() === "pickup" && sp.Selected == "checked") {
            hasPickupSelected = true;
        }
    });

    if ($('.variants-section').length > 0) {
        $('#tblDelivery').removeClass('error-con');
        $('#tblPickupLocation').removeClass('error-con');

        if (!hasDeliverySelected && !hasPickupSelected) {
            $('#tblDelivery').addClass('error-con');
            $('#tblPickupLocation').addClass('error-con');
            toastr.error(mandatoryFieldErrorMessage);
            hasError = true;
        }
    }

    return hasError;
}

const updateItemData = (key, value, isCustomField = false) => (dispatch, getState) => {
    const { item } = getState().uploadEditItemReducer;

    const updatedItem = Object.assign({}, item);

    if (!isCustomField) {
        switch(key) {
            case 'Categories': 
                updatedItem.Categories = [
                    {
                        Name: value
                    }
                ]
                break;
            default: 
                updatedItem[key] = value;
                break;
        }
    } else {
        const customField = updatedItem.CustomFields.find(cf => cf.Code === key);
        if (customField) {
            customField.Values = [value];
        } else {
            const newCustomField = {
                Code: key,
                Name: key,
                Values: [value]
            }
            updatedItem.CustomFields.push(newCustomField);
        }
    }
    return dispatch({
        type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
        item: updatedItem
    });
}

const updateSelectedRowInfo = (code = '', id = null) => (dispatch) => {
    return dispatch({
        type: actionTypes.SET_SELECTED_ROW,
        selectedRow: {
            code: code,
            id: id,
        }
    });
}

const resetToInitialItemData = () => (dispatch, getState) => {
    const { referenceItem } = getState().uploadEditItemReducer;
    return dispatch({
        type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
        item: cloneDeep(referenceItem)
    });
}

const updateItem = (callback) => (dispatch, getState) => {
    const { item } = getState().uploadEditItemReducer;
    axios.put(`${prefix}/product-profile/update`, item)
        .then(({ data }) => {
            const { updatedItem = {} } = data;
            const success = updatedItem && updatedItem.ID;
            callback({ success });
            if (success) {
                return dispatch({
                    type: actionTypes.ITEM_UPLOAD_EDIT_UPDATE_DATA,
                    item: updatedItem,
                    referenceItem: cloneDeep(updatedItem)
                });
            } else {
                return dispatch({ type: ''});
            }
        })
        .catch(err => {
            callback({ success: false });
            return dispatch({ type: ''});
        });
};

const createItem = (newProduct, callback) => (dispatch, getState) => {
    const { item } = getState().uploadEditItemReducer;
    const data =  {
        newProduct,
        item,
    }

    axios.post(`${prefix}/company/update/add-new-exist-product`, data)
        .then(({ data }) => {
            callback({ success: data?.success || false });
            return dispatch({ type: ''});
        })
        .catch(err => {
            callback({ success: false });
            return dispatch({ type: ''});
        });
}

const searchCompaniesByFilters = (filters, callback) => (dispatch, getState) => {
    const { keywords = '', country = '', city = '' } = filters;
    axios.post(getAppPrefix() + '/search/cgi-search/companies', {
        keywords,
        country,
        city: city ? city + "*" : null,
        isLinking: true
    }).then(({
        data: {
            items,
            countriesList
        }
    }) => {
        callback({ companies: items, countries: countriesList });
        return dispatch({ type: ''});
    }).catch(err => {
        callback({ companies: [], countries: [] });
        return dispatch({ type: ''});
    });
}
module.exports = {
    searchItemName: searchItemName,
    goToPage: goToPage,
    editItemPurchasable: editItemPurchasable,
    createLogForItemVisibilityUpdate: createLogForItemVisibilityUpdate,
    setItemToDelete: setItemToDelete,
    deleteItem: deleteItem,
    updateCategoryToSearch: updateCategoryToSearch,
    selectUnselectCategory: selectUnselectCategory,
    selectAllOrNone: selectAllOrNone,
    CheckUncheckCategories: CheckUncheckCategories,
    uploadOrEditData: uploadOrEditData,
    checkboxClickedCustomField: checkboxClickedCustomField,
    dropDownChange: dropDownChange,
    onTextChange: onTextChange,
    updatePdfCustomField: updatePdfCustomField,
    addCountries: addCountries,
    removeCountry: removeCountry,
    removeAllCountries: removeAllCountries,
    onPriceChanged: onPriceChanged,
    SkuMoqStockChange: SkuMoqStockChange,
    unliOrPurchasableChanged: unliOrPurchasableChanged,
    setUploadFile: setUploadFile,
    setPDFFile: setPDFFile,
    searchShippings: searchShippings,
    shippingSelectedChanged: shippingSelectedChanged,
    saveBulkPricing: saveBulkPricing,
    setBulkToDeleteCountryCode: setBulkToDeleteCountryCode,
    closeDeletePopUp: closeDeletePopUp,
    removeImage: removeImage,
    createCustomField: createCustomField,
    addVariant: addVariant,
    deleteVariant: deleteVariant,
    onItemVariantChange: onItemVariantChange,
    onToggleChange: onToggleChange,
    sortItemVariants: sortItemVariants,
    sortVariants: sortVariants,
    updateVariantGroupName: updateVariantGroupName,
    updateSelectedVariant: updateSelectedVariant,
    updateSpotOrNegotiateButton: updateSpotOrNegotiateButton,
    getItemDetails: getItemDetails,
    sortVariantGroups: sortVariantGroups,
    deleteVariantGroup: deleteVariantGroup,
    addLocations: addLocations,
    removeLocation: removeLocation,
    removeAllLocations: removeAllLocations,
    validateNonPricingDetails: validateNonPricingDetails,
    updateItemData: updateItemData,
    updateSelectedRowInfo: updateSelectedRowInfo,
    resetToInitialItemData: resetToInitialItemData,
    updateItem: updateItem,
    createItem: createItem,
    searchCompaniesByFilters: searchCompaniesByFilters
};
