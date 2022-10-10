import express from 'express';
import { get } from 'lodash';
import { getCompanies } from '../horizon-api/horizon-typehead-service/autosuggest-company-controller';
import { getProducts, getProductsCount } from '../horizon-api/horizon-typehead-service/autosuggest-product-controller';
import { autosuggestByProduct } from '../horizon-api/search-results-service/search-results.controller';
import authenticated from '../../scripts/shared/authenticated';
import { Search } from '../../consts/search-categories';
import { productTabs } from '../../consts/product-tabs';

const autoSuggestRouter = express.Router();

export const prepareData = (data) => {
    const source = get(data, 'data[0].source', '');
    const suggestions = source === Search.SEARCH_BY.COMPANIES ? get(data, 'data[0].suggestions', []) : get(data, 'data.hits', []);
    const count = source === Search.SEARCH_BY.COMPANIES ? get(data, 'data[0].hits', []) : get(data, 'data.info.totalHits', []);
    const results = suggestions.map((suggestion) => {
        if (source === Search.SEARCH_BY.COMPANIES) {
            return suggestion.info.reduce((acc, cur) => {
                acc[cur.key] = cur.value;
                return acc;
            }, {});
        } else {
            return {
                uid: suggestion?.id,
                name: suggestion?.fields?.recordName[0],
                dictId: suggestion?.fields?.dictId[0]
            };
        }
    });

    return {
        results,
        count
    };
};

export const getAutosuggestRawData = async(req, categories, keywords) => {
    const recordTypes = {
        [Search.SEARCH_BY.PRODUCTS]: productTabs.API.recordType,
        [Search.SEARCH_BY.DOSE_FORMS]: productTabs.DOSE_FORM.recordType,
        [Search.SEARCH_BY.INACTIVE_INGREDIENTS]: productTabs.INACTIVE_INGREDIENTS.recordType,
        [Search.SEARCH_BY.INTERMEDIATE]: productTabs.INTERMEDIATE.recordType
    };

    return Search.SEARCH_BY.PRODUCTS === categories ||
    Search.SEARCH_BY.DOSE_FORMS === categories ||
    Search.SEARCH_BY.INACTIVE_INGREDIENTS === categories ||
    Search.SEARCH_BY.INTERMEDIATE === categories
        ? await autosuggestByProduct(keywords, recordTypes[categories])
        : await getCompanies(req, keywords);
};

autoSuggestRouter.get('/by-companies', authenticated, async(req, res) => {
    try {
        const searchString = req.query.searchString;
        const companiesData = await getCompanies(req, searchString);
        const companies = prepareData(companiesData);

        res.json({
            companies: companies.results,
            count: companies.count
        });
    } catch (e) {
        console.log('autosuggest by-companies error', e);
    }
});

autoSuggestRouter.get('/by-products', authenticated, async(req, res) => {
    try {
        const searchString = req.query.searchString;
        const productsCountData = await getProductsCount(req, searchString);
        const productsCount = get(productsCountData, 'data[0].hits');
        const productsData = await getProducts(req, searchString, productsCount);
        const products = prepareData(productsData);

        res.json({
            products: products.results,
            count: products.count
        });
    } catch (e) {
        console.log('autosuggest by-products error', e);
    }
});

autoSuggestRouter.get('/srp-find', authenticated, async(req, res) => {
    try {
        const { searchString = '', recordType = '' } = req.query;
        const resp = await autosuggestByProduct(searchString, recordType);
        res.json({ products: resp?.data || [] });
    } catch (e) {
        console.log('autosuggest srp-find error', e);
    }
});

export default autoSuggestRouter;
