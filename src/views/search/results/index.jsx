import React from 'react';
import { itemSearch as itemSearchPPs } from '../../../consts/page-params';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';
import ResultsHeader from './result-header';
import ResultsTable from './result-table';

const Results = ({
	user,
	categories,
	items,
    totalRecords,
    keywords = '',
    sortColumn, 
    sortDirection,
    sortResults,
    getUpgradeToPremiumPaymentLink,
}) => {
	return (
		<div className="search-container">
			<div className="container">
                <ResultsHeader
                	categories={categories}
                	totalRecords={totalRecords}
                	keywords={keywords}
                />
                <ResultsTable
                    user={user}
                    items={items}
                    categories={categories}
                    sortResults={sortResults}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
                <UnlockMoreResultsBanner 
                    user={user}
                    getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
                    page={itemSearchPPs.appString} 
                />
            </div>
		</div>
	);
}

export default Results;