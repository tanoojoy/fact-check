import React, { useState, useEffect } from 'react';
import { Search } from '../../../consts/search-categories';
import {
    companiesMap,
    productCompaniesMap,
    doseFormsMap,
    inactiveIngredientMap,
    intermediateReagentMap
} from '../../../consts/search-results';
import {
    companiesMap as companiesMapFreemium,
    productCompaniesMap as productCompaniesMapFreemium,
    doseFormsMap as doseFormsMapFreemium
} from '../../../consts/search-results-freemium';
import { isFreemiumUserSku, isPremiumUserSku } from '../../../utils';
import LockSymbol from '../../common/lock-symbol';
import TableHeader from './table-header';
import TableContent from './table-content';

export const OtherFilings = () => (
    <span>
        <LockSymbol />&nbsp;
        Other Filings
    </span>
);

const filterResultsBySubscriptionLimit = (user, results) => {
	if (isPremiumUserSku(user)) return results;
	return results.map((result, index) => {
		result.fields.manufacturing_status = <LockSymbol />;
		result.fields.gmp_certificates = <LockSymbol />;

        const US_DMF = result?.fields?.reg_filing_list?.find((regFilling) => {
            return regFilling?.filing?.find(filing => filing === 'US DMF');
        });

        if (result.fields?.reg_filing_list?.length && US_DMF) {
            result.fields.reg_filing_list = [US_DMF, { filing: [<OtherFilings key={`api-reg-filling-${Math.random()}`} />], filing_status: [] }];
        } else {
            result.fields.reg_filing_list = [<LockSymbol key={`api-reg-filling-${Math.random()}`} />];
        }
        return result;
	});
}

const Table = ({
	user,
	categories,
	items,
    sortColumn, 
    sortDirection,
    sortResults,
}) => {
	const [config, setConfig] = useState(new Map());
	const [data, setData] = useState([]);

	useEffect(() => {
		let newConfig = new Map();
		switch (categories) {
		    case Search.SEARCH_BY.PRODUCTS:
		        newConfig = isFreemiumUserSku(user) ? productCompaniesMapFreemium : productCompaniesMap;
		        break;
		    case Search.SEARCH_BY.COMPANIES:
		        newConfig = isFreemiumUserSku(user) ? companiesMapFreemium : companiesMap;
		        break;
		    case Search.SEARCH_BY.DOSE_FORMS:
		        newConfig = isFreemiumUserSku(user) ? doseFormsMapFreemium : doseFormsMap;
		        break;
		    case Search.SEARCH_BY.INACTIVE_INGREDIENTS:
		        newConfig = inactiveIngredientMap;
		        break;
		    case Search.SEARCH_BY.INTERMEDIATE:
		        newConfig = intermediateReagentMap;
		        break;
		    default:
		        break;
	    }
		setConfig(newConfig);
	}, [categories, user]);

	useEffect(() => {
		setData(filterResultsBySubscriptionLimit(user, items));
	}, [user, items]);

	return (
		<div className='sc-bottom'>
			{
				data && 
				data.length > 0 &&
				<div className='items-content behavior2' id='items-list'>
					<div className='item-list table-responsive'>
						<table className='table item-area'>
							<TableHeader
								columnsConfig={config}
								sortColumn={sortColumn}
								sortDirection={sortDirection}
								sortResults={sortResults}
							/>
							<TableContent
								data={data}
								columnsConfig={config}
								user={user}
							/>
						</table>
					</div>
				</div>
			}
		</div>
	);
}


export default Table;