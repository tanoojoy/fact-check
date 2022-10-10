import React from 'react';
import { Search } from '../../../consts/search-categories';
import { 
	SNOWPLOW_ACTION,
	SNOWPLOW_CATEGORY
} from '../../../consts/snowplow';
import { getAppPrefix } from '../../../public/js/common';
import { productTabs } from '../../../consts/product-tabs';
import { TextWithAutoTooltip, TextTooltipType } from '../../item/common-components';

const { SEARCH_BY } = Search;

const CategorySwitch = ({
	categories = '',
	keywords,
}) => {

    const getLink = category => `${getAppPrefix()}/search/cgi-search?keywords=${keywords}&categories=${category}`;

	return (
		<div className="pull-right flexing">
			{
				(categories === SEARCH_BY.PRODUCTS || categories === SEARCH_BY.DOSE_FORMS) &&
				<>
					<a 
						href={getLink(SEARCH_BY.PRODUCTS)}
						className={`search-btn ${categories === SEARCH_BY.PRODUCTS ? 'active' : ''}`}
						data-event-category={SNOWPLOW_CATEGORY.PRODUCT_SEARCH_MANUFACTURER}
                        data-event-label={keywords}
                        data-event-action={SNOWPLOW_ACTION.QUICK_SEARCH}
					>
						{productTabs.API.tab}
					</a>
					<a 
						href={getLink(SEARCH_BY.DOSE_FORMS)}
						className={`search-btn ${categories === SEARCH_BY.DOSE_FORMS ? 'active' : ''}`}
						data-event-category={SNOWPLOW_CATEGORY.PRODUCT_SEARCH_MANUFACTURER}
                        data-event-label={keywords}
                        data-event-action={SNOWPLOW_ACTION.QUICK_SEARCH}
					>
						{productTabs.DOSE_FORM.tab}
					</a>
				</>
			}
			{
				categories === SEARCH_BY.INACTIVE_INGREDIENTS &&
				<a href="#" className="search-btn disabled">{productTabs.INACTIVE_INGREDIENTS.tab}</a>
			}
			{
				categories === SEARCH_BY.INTERMEDIATE &&
				<a href="#" className="search-btn disabled">{productTabs.INTERMEDIATE.tab}</a>
			}
        </div>
	);
}
const ResultsHeader = ({
	categories,
    totalRecords,
    keywords = '',
    sortColumn, 
}) => {
	return (
        <div className="sc-upper">
            <div className="sc-u sc-u-mid full-width">
                <div className="pull-left">
                	<TextWithAutoTooltip
                		maxWidth={800}
                		name={keywords}
                		type={TextTooltipType.TEXT}
                		containerClass='sc-text-big'
                	/>
                    <div className="sc-right-text">
                        <span>
                            <span className="count">{totalRecords}</span>
                            &nbsp; matches found
                        </span>
                    </div>
                </div>
                <CategorySwitch categories={categories} keywords={keywords} />
            </div>
        </div>
           
	);
}

export default ResultsHeader;