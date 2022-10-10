import axios from 'axios';
import moment from 'moment';
import { useEffect, useRef } from 'react';
import flattenDeep from 'lodash/flattenDeep';
import uniq from 'lodash/uniq';
import { COMPANY_PRODUCT_CONNECTION } from './consts/connections';
import { skuPossible } from './consts/horizon-user-roles';
import { productTabs } from './consts/product-tabs';
import { productCompanyTypes } from './consts/company-products';
import { getAppPrefix } from './public/js/common';

export const setApiToken = (res, token, expiry) => {
    res.cookie('webapitoken', token, {
        maxAge: expiry * 1000,
        httpOnly: false
    });
};

export const getHostname = req => req.protocol + '://' + req.get('host');

export const safeJsonParse = (data, defaultValue) => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log('error JSON.parse source=', data);
        console.log('error JSON.parse error=', e);
        return defaultValue || {};
    }
};

export const redirectUnauthorizedUser = (req, res, redirectUrl) => {
    const isAuthUser = !!(req.user && req.user.userInfo);
    const defaultRedirectUrl = process.env.CLARIVATE_LOGIN_IFRAME_URL + '/login?app=scn&refferer=%2Farcadier_supplychain' || getAppPrefix() + '';
    if (!isAuthUser) {
        res.redirect(redirectUrl || defaultRedirectUrl);
    }

    return !isAuthUser;
};

export const getMonths = () => moment.months().map((month, ix) => ({ label: month, value: ix + 1 }));

export const transformStringToObject = (string, propSeparator, keyValueSeparator) => {
    const entries = string?.split(propSeparator);
    const keyValueArrays = entries?.map(entry => entry.toString().split(keyValueSeparator));
    return Object.fromEntries(new Map(keyValueArrays));
};

export const getUserId = () => {
    return document.cookie?.split('; ')
        .find(row => row.startsWith('clarivateUserId='))?.split('=')[1];
};

export const deleteCookies = () => {
    // The "expire" attribute of every cookie is
    // Set to "Thu, 01 Jan 1970 00:00:00 GMT"
    const allCookies = document?.cookie?.split(';');
    console.log('allCookies', allCookies);
    allCookies && allCookies.length && allCookies.forEach((cookie) => {
        document.cookie = cookie + '=;expires=' + new Date(0).toUTCString();
    });
};

export const clearSessionCookies = (res) => {
    if (res && res.clearCookie) {
        res.clearCookie('cgitoken');
        res.clearCookie('session');
        res.clearCookie('webapitoken');
    }
};

export const logoutUser = (callback) => {
    return axios({
        method: 'post',
        url: `${getAppPrefix()}/accounts/sign-out`,
        baseURL: '/'
    })
        .then(callback)
        .catch((e) => {
            console.log('logoutUser Error', e.message);
        })
        .finally(() => {
            localStorage.removeItem('ls.token');
            deleteCookies();
        });
};

export const objectsEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

export const isFreemiumUserSku = (user = {}) => {
    return user?.userInfo?.sku === skuPossible.freemium;
};

export const isPremiumUserSku = (user = {}) => {
    return !isFreemiumUserSku(user);
};

export const getProductTabsValues = (key = '') => {
    const keyValues = [];
    for (const typeKey in productTabs) {
        keyValues.push(productTabs[typeKey][key]);
    }

    return uniq(flattenDeep(keyValues));
};

export const userRole = (user = {}) => user?.userInfo?.role;

export const userHasCompany = (user = {}) => user?.hasCompany;

export const isCompanyAttachRequestSend = (user = {}) => user?.flags?.isCompanyAttachRequestSend;

export const isCompleteOnBoarding = (user = {}) => !!userRole(user) && !!userHasCompany(user);

export const transformObjectToCustomFields = (obj, excludedKeys = [], arr = [], objKey = '') => {
    if (!obj) return arr;
    Object.entries(obj).forEach(([key, value]) => {
        if (!excludedKeys.includes(key)) {
            const codeSeparator = objKey && objKey.length > 0 ? '-' : '';
            const code = `${objKey}${codeSeparator}${key}`;
            if (value && typeof value === 'object' && value.constructor.name == "Object") {
                return transformObjectToCustomFields(value, [], arr, code);
            } 
            arr.push({
                Code: code,
                Name: key,
                Values: value !== null && value !== undefined ? [value] : null
            });
        }
    });
    return arr;
} 

export const transformCustomFieldsToObject = (CustomFields = []) => {
    let result = {};

    const setValue = (obj, path, val) => { 
        const keys = path.split('-');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((obj, key) => 
            obj[key] = obj[key] || {}, 
            obj); 
        lastObj[lastKey] = val;
    };

    Object.values(CustomFields).forEach(customField => {
        const { Code = '', Name = '', Values = [] } = customField;
        const value = (Values && Values[0]) || null;
        setValue(result, Code, value);
    });

    return result;
}

export const getNormalizedProductAttributes = (product, companySources) => {
    if (product && companySources && companySources.length > 0) {
        const productAttribute = companySources?.find(attribute => attribute[COMPANY_PRODUCT_CONNECTION.CGI]?.productId === product.productId);
        if (productAttribute !== null && productAttribute !== undefined) {
            const cgiConnectionData = productAttribute[COMPANY_PRODUCT_CONNECTION.CGI];
            if (cgiConnectionData) {
                return {
                    manufacturingStatusVerified: cgiConnectionData.manufacturerStatus === product?.manufacturerStatus,
                    registrationFilings: product.registrationFilings.map(filing => {
                        const cgiRegFilings = cgiConnectionData.registrationFilings;
                        const cgiEqualRecord = cgiRegFilings.find(cgiRegFiling => cgiRegFiling.filing === filing.filing);

                        const { filingNo, ...filingWithoutNumber } = filing || {};
                        const { filingNo: cgiFilingNo, ...cgiFilingWithoutNumber } = cgiEqualRecord || {};

                        return {
                            ...filing,
                            verified: cgiEqualRecord ? JSON.stringify(cgiFilingWithoutNumber) === JSON.stringify(filingWithoutNumber) : false
                        };
                    }),
                    gmpCertificates: product.gmpCertificates?.map(certificate => {
                        const cgiGmpCertificates = cgiConnectionData?.gmpCertificates;
                        const cgiEqualRecord = cgiGmpCertificates.find(gmpCertificate => gmpCertificate.authority === certificate.authority);
                        return {
                            ...certificate,
                            verified: cgiEqualRecord ? JSON.stringify(cgiEqualRecord) === JSON.stringify(certificate) : false
                        };
                    })
                }
            } else {
                return {
                    registrationFilings: cgiConnectionData.registrationFilings?.map(filing => ({
                        ...filing,
                        verified: true
                    })),
                    gmpCertificates: cgiConnectionData.gmpCertificates?.map(certificate => ({
                        ...certificate,
                        verified: true
                    })),
                    manufacturingStatusVerified: true
                }
            }
        }
    }
    return {};
}

export const toItemDetailObj = (productDetails, category, viewType) => {
    const { API, DOSE_FORM } = productTabs;
    const { PRODUCT_COMPANY_MANUFACTURER, PRODUCT_COMPANY_MARKETER } = productCompanyTypes;

    let item;
    if (category == DOSE_FORM.productType) {
        item = {
            ID: productDetails.apiId,
            Name: productDetails.apiName,
            Categories: [
                {
                    Name: category
                }
            ],
        }
        const { manufacturerCompanies, marketerCompanies } = productDetails;
        switch(viewType) {
            case PRODUCT_COMPANY_MANUFACTURER:
                if (manufacturerCompanies && manufacturerCompanies[0]) {
                    item = {
                        ...item,
                        CustomFields: transformObjectToCustomFields(productDetails, ['manufacturerCompanies']),
                        MerchantDetail: {
                            ID: manufacturerCompanies[0].id,
                            DisplayName: manufacturerCompanies[0].name,
                            CustomFields: transformObjectToCustomFields(manufacturerCompanies[0]),
                        },
                    }
                }
                break;
            case PRODUCT_COMPANY_MARKETER:
                if (marketerCompanies && marketerCompanies[0]) {
                    item = {
                        ...item,
                        CustomFields: transformObjectToCustomFields(productDetails, ['marketerCompanies']),
                        MerchantDetail: {
                            ID: marketerCompanies[0].marketerId,
                            DisplayName: marketerCompanies[0].name,
                            CustomFields: transformObjectToCustomFields(marketerCompanies[0]),
                        },
                    }
                }
                break;
            default:
                break;
        }
    } else {
        item = {
            ID: productDetails.productId,
            Name: productDetails.product?.mainName,
            Categories: category ? [
                {
                    Name: category,
                }
            ] : null,
            CustomFields: transformObjectToCustomFields(productDetails, ['company']),
            MerchantDetail: {
                ID: productDetails?.company?.id,
                DisplayName: productDetails?.company?.name,
                CustomFields: transformObjectToCustomFields(productDetails?.company),
            }
        }
    }
    return item;
}

export const toProductInfoObj = (itemDetail = {}) => {
    const { CustomFields = [], MerchantDetail = {} } = itemDetail;
    const productInfo = transformCustomFieldsToObject(CustomFields);
    const { CustomFields: MerchantCustomFields } = MerchantDetail;
    const company = transformCustomFieldsToObject(MerchantCustomFields);
    productInfo.company = company;
    return productInfo;
}

export const getRecordTypesByProductType = (productType) => {
    const tab = Object.values(productTabs).find(tab => tab.productType === productType);
    return tab?.recordType || null;
}

export const toInboxMessageObj = (deal) => {
    const { rfq, quote, interlocutorCompany } = deal;
    let record = {
        ChannelID: rfq.chatId,
        Provider: 'Twilio',
        CartItemDetail: {
            ID: rfq.id,
            Quantity: rfq.quantity, 
            Unit: rfq.unit,
            ItemDetail: {
                ID: rfq.productId,
                Name: rfq.productName,
                Categories: [
                    {
                        Name: rfq.productType
                    }
                ]
            }
        }, 
        Members: [
            {
                User: {
                    ID: rfq.buyerId
                }
            }
        ], 
        Status: rfq.status,
        CustomFields: [
            {
                ...interlocutorCompany
            },
            {
                ...rfq.company
            }
        ],        
        quote: quote
    }
    return record;
}

export const toInboxEnquiryObj = (chat, companyId, interlocutorCompanies) => {
    let interlocutorId = companyId;
    if (chat.incomingCoId && chat.outgoingCoId) {
        if (chat.incomingCoId === chat.outgoingCoId) {
            chat.interlocutorCompanyId = chat.incomingCoId
            interlocutorId = chat.incomingCoId;
        }
        interlocutorId = companyId === chat.incomingCoId ? chat.outgoingCoId : chat.incomingCoId;
    }    
    const InterlocutorCompany = interlocutorCompanies.find(c => c.id === interlocutorId);
    return {
        ChannelID: chat.twillioChatId,
        InterlocutorId: interlocutorId, 
        InterlocutorCompany: InterlocutorCompany
    }
}

export const toUserCompanyInfoObj = (userCompanyInfo, isUser, companyProducts, isFollowCompany, filesList, extendedFollowerCompanies, extendedFollowerProducts) => {
    if (isUser) {
        console.log('toUser', userCompanyInfo.flags);
        let userInfo = {
            ID: userCompanyInfo.userid,
            Email: userCompanyInfo.email,
            FirstName: userCompanyInfo.first_name,
            LastName: userCompanyInfo.last_name,
            Active: userCompanyInfo.active            
        };
        userInfo.CustomFields = [
            {
                CompanyId: userCompanyInfo.clarivate_company_id,
                Sku: userCompanyInfo.sku,
                flags: {
                    isCompanyAttachRequestSend: userCompanyInfo.flags.isCompanyAttachRequestSend,
                    quote: {
                        ...userCompanyInfo.flags.quote                        
                    },
                        rfq: {
                        ...userCompanyInfo.flags.rfq
                    },
                        chat: {
                        ...userCompanyInfo.flags.chat
                    },
                    notification: {
                        ...userCompanyInfo.flags.notification                        
                    }
                }, 
                work_location_country: userCompanyInfo.work_location_country,
                work_location_city: userCompanyInfo.work_location_city,
                app: userCompanyInfo.app,
                horizon_user: {
                    ...userCompanyInfo.horizon_user
                },
                clarivate_sku: userCompanyInfo.clarivate_sku,
                extendedFollowerCompanies: extendedFollowerCompanies,
                extendedFollowerProducts: extendedFollowerProducts
            }
        ];
        userInfo.Roles = [
            userCompanyInfo.role
        ]
        return userInfo;
    }
    else {
        console.log('toCompany', filesList);
        let userInfo = {
            id: userCompanyInfo.id,
            name: userCompanyInfo.name,
            address: !!userCompanyInfo.address ? [...userCompanyInfo.address] : null,
            city: userCompanyInfo.city,        
            CustomFields: [
                {
                    relationGroupId: userCompanyInfo.relationGroupId,
                    relationGroupName: userCompanyInfo.relationGroupName,
                    cmo: userCompanyInfo.cmo,
                    contractManufacturingOrganization: userCompanyInfo.cmo ? 'Yes' : 'No',
                    country: userCompanyInfo.country,
                    state: userCompanyInfo.state,
                    postalCode: userCompanyInfo.postalCode,
                    webPage: userCompanyInfo.webPage,
                    groupType: userCompanyInfo.groupType,
                    corporateApiRate: userCompanyInfo.corporateApiRate,
                    fdaWarningLetterDate: userCompanyInfo.fdaWarningLetterDate,
                    gdufaFeePaymentYear: userCompanyInfo.gdufaFeePaymentYear,
                    facultyRegistrationDate: userCompanyInfo.facultyRegistrationDate,
                    subsidiaryType: !!userCompanyInfo.subsidiaryType ? [...userCompanyInfo.subsidiaryType] : null,
                    inspectionsInfo: !!userCompanyInfo.inspectionsInfo ? [...userCompanyInfo.inspectionsInfo] : null,
                    capabilities: !!userCompanyInfo.capabilities ? [...userCompanyInfo.capabilities] : null,
                    alerts: !!userCompanyInfo.alerts ? [...userCompanyInfo.alerts] : null,
                    otherServices: !!userCompanyInfo.otherServices ? [...userCompanyInfo.otherServices] : null, 
                    companyUsers: {...userCompanyInfo.companyUsers},
                    state: userCompanyInfo.state,
                    postalCode: userCompanyInfo.postalCode, 
                    subsNumber: userCompanyInfo.subsNumber,
                    filesList: !!filesList ? [...filesList] : null
                }            
            ],
            isUser: isUser
        }
        userInfo.companyProducts = companyProducts;
        userInfo.isFollowCompany = isFollowCompany;
        return userInfo;
    }    
}

export const toExternalUserCompanyInfo = (userCompanyInfo, isUser) => {
    if (isUser) {
        let [otherInfo] = userCompanyInfo.CustomFields;
        let userInfo = {
            clarivate_company_id: otherInfo.CompanyId,
            role: userCompanyInfo.Roles[0],
            sku: otherInfo.Sku,
            flags: {
                ...otherInfo.flags
            },
            work_location_country: otherInfo.work_location_country,
            active: userCompanyInfo.Active,
            first_name: userCompanyInfo.FirstName,
            last_name: userCompanyInfo.LastName,
            userid: userCompanyInfo.ID,
            email: userCompanyInfo.Email,
            app: otherInfo.app,
            work_location_city: otherInfo.work_location_city,
            horizon_user: {
                ...otherInfo.horizon_user
            },
            clarivate_sku: otherInfo.clarivate_sku
        }
        return userInfo;
    }
    else {
        const { CustomFields } = userCompanyInfo;
        const [otherInfo] = CustomFields;
        let companyInfo = {
            id: userCompanyInfo.id,
            name: userCompanyInfo.name,
            relationGroupId: otherInfo.relationGroupId,
            relationGroupName: otherInfo.relationGroupName,
            cmo: otherInfo.cmo,
            country: otherInfo.country,
            city: userCompanyInfo.city,
            webPage: otherInfo.webPage,
            groupType: otherInfo.groupType,
            corporateApiRate: otherInfo.corporateApiRate,
            fdaWarningLetterDate: otherInfo.fdaWarningLetterDate,
            gdufaFeePaymentYear: otherInfo.gdufaFeePaymentYear,
            facultyRegistrationDate: otherInfo.facultyRegistrationDate,
            address: !!userCompanyInfo.address ? [...userCompanyInfo.address] : null,
            subsidiaryType: !!otherInfo.subsidiaryType ? [...otherInfo.subsidiaryType] : null,
            inspectionsInfo: !!otherInfo.inspectionsInfo ? [...otherInfo.inspectionsInfo] : null,
            capabilities: !!otherInfo.capabilities ? [...otherInfo.capabilities] : null,
            alerts: !!otherInfo.alerts ? [...otherInfo.alerts] : null,
            otherServices: !!otherInfo.otherServices ? [...otherInfo.otherServices] : null,
            companyUsers: { ...otherInfo.companyUsers },
            state: otherInfo.state,
            postalCode: otherInfo.postalCode,
            subsNumber: otherInfo.subsNumber
          }
    
        return companyInfo;
    }    
}

export const toArctickUserInfoObj = (cscnUserInfo) => {
    let arcUserInfo = {

    }

    return arcUserInfo;
}

export const toExternalUserInfoObj = (arctickUserInfo) => {
    let arcUserInfo = {

    }

    return arcUserInfo;
}

export const toCompanyProductItemDetailsInfoObj = (productItem, category) => {
    let productDto = {
        ID: productItem.productId,
        SKU: productItem.product.cas,
        Name: productItem.product.mainName,
        ModifiedDateTime: productItem.updateDate,
        CustomFields: [
            {
                ManufacturerId: productItem.manufacturerId,
                ManufacturerStatus: productItem.manufacturerStatus,
                RegistrationFillings: [...productItem.registrationFilings],
                GmpCertificates: [...productItem.gmpCertificates],
                Price: productItem.price,
                Company: { ...productItem.company },
                Product: { 
                    TradeNames: [...productItem.product.tradeNames],
                    ApiSynonymList: [...productItem.product.apiSynonymList],
                    UpdateDate: productItem.product.updateDate,
                    GroupId: productItem.product.groupId
                },
                Categories: category ? [
                    {
                        Name: category,
                    }
                ] : null
            }
        ]
    }

    return productDto;
}

export const getSearchResultsPageRedirectUrl =  (searchString, searchBy) => {
    return `${getAppPrefix()}/search/cgi-search?keywords=${encodeURIComponent(searchString)}&categories=${encodeURIComponent(searchBy)}`;
};

export const getCustomFieldValues = (cFields, keyword, searchBy = 'Name') => {
    const customField = cFields.find(cf => cf[searchBy] === keyword);
    if (customField && customField.Values && customField.Values.length > 0) {
        return customField.Values[0] || null;
    }
    return null;
}

export const toChatMessagesObj = (channelMessage) => {
    let msgObj = {
            TotalRecords: channelMessage.messageCount,
            PageNumber: 1,
            PageSize: 100,
            Records: channelMessage.messages.map((msg) => ({
                Sender: msg.author,
                Message: msg.body,
                SentDateTime: msg.dateUpdated,
                Sid: msg.sid
            }))
    };
    return msgObj;
}

export const toQuoteDetailObj = (quote) => {
    let quoteObj = {
        OfferDetails: [
            {
                ID: quote.id,                
                Price: quote.price,
                CustomFields: [
                    {
                        rfqId: quote.rfqId,
                        shelfLife: quote.shelfLife,
                        validDate: quote.validDate,
                        issueDate: quote.issueDate,
                        comment: quote.comment,
                        arcadierQuoteId: quote.arcadierQuoteId,
                        clarivateUserId: quote.clarivateUserId,
                        createdAt: quote.createdAt,
                        updatedAt: quote.updatedAt,
                        status: quote.status
                    }
                ]
            }
        ]
    }
    return quoteObj;    
}

export const toExternalQuoteDetailObj = (quote) => {
    let quoteObj = null;
    if (quote && quote.OfferDetails) {
        const [offerDetail] = quote.OfferDetails;
        const [otherInfo] = offerDetail.CustomFields;

        quoteObj = {
            id: offerDetail.ID,
            rfqId: otherInfo.rfqId,
            price: offerDetail.Price,
            shelfLife: otherInfo.shelfLife,
            validDate: otherInfo.validDate,
            issueDate: otherInfo.issueDate,
            comment: otherInfo.comment,
            arcadierQuoteId: otherInfo.arcadierQuoteId,
            clarivateUserId: otherInfo.clarivateUserId,
            createdAt: otherInfo.createdAt,
            updatedAt: otherInfo.updatedAt,
            status: otherInfo.status
        }
        console.log('toExternalQuoteDetailObj', quoteObj);
    }
    return quoteObj;
}

export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

export const debounce = (fn, delay) => {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    }
};

export const getProductType = (hit, productType) => {
    if (productType) {
        return productType;
    }

    const productTypes = values(productTabs);
    return productTypes.find((type) => {
        return Array.isArray(type.recordType)
            ? type.recordType.includes(hit.fields.recordType[0])
            : hit.fields.recordType[0] === type.recordType;
    })?.productType;
};
