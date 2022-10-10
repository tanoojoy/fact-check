import axios from 'axios';
import { microservices } from '../../../horizon-settings';
import { getServiceAddress } from '../../../public/js/common';
import { Search } from '../../../consts/search-categories';

const { TYPEAHEAD_BY } = Search;
module.exports = {
    getCompanies: (req, searchString, limit = 10, offset = 0) => {
        return getServiceAddress(microservices.companyTypeahead).then(horizonTypeaheadService => axios({
            url: `${horizonTypeaheadService}/suggest/search`,
            params: {
                query: searchString,
                source: TYPEAHEAD_BY.COMPANIES,
                size: limit,
                offset
            }
        }));
    }
};
