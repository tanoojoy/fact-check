import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';
import { Search } from '../../../consts/search-categories';

const { TYPEAHEAD_BY } = Search;
const MAX_COUNT = 100;

const getProducts = (req, searchString, limit = MAX_COUNT, offset = 0) => {
    const MAX_LIMIT = limit > MAX_COUNT ? MAX_COUNT : limit;

    return getServiceAddress(microservices.productTypeahead)
        .then(npTypeaheadService => axios({
            url: `${npTypeaheadService}/suggest/search`,
            params: {
                query: searchString,
                source: TYPEAHEAD_BY.PRODUCTS,
                size: MAX_LIMIT,
                offset
            }
        }));
};

module.exports = {
    getProductsCount: (req, searchString, limit = 0, offset = 0) => getProducts(req, searchString, limit, 0),
    getProducts
};
