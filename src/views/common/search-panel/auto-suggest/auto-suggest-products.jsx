import React from 'react';
import { compact } from 'lodash';
import { Search } from '../../../../consts/search-categories';
import { productTabs } from '../../../../consts/product-tabs';
import { SNOWPLOW_ACTION, SNOWPLOW_CATEGORY } from '../../../../consts/snowplow';

const { SEARCH_BY } = Search;

const getSearchType = (productType) => {
    switch (productType) {
	    case productTabs.DOSE_FORM.productType:
	        return SEARCH_BY.DOSE_FORMS;
	    case productTabs.INACTIVE_INGREDIENTS.productType:
	        return SEARCH_BY.INACTIVE_INGREDIENTS;
	    case productTabs.INTERMEDIATE.productType:
	        return SEARCH_BY.INTERMEDIATE;
	    default:
	        return SEARCH_BY.PRODUCTS;
    }
};

const AutoSuggestProductListItem = ({
	product = {},
	searchString = '',
	listElKey = '',
    gotoSearchResultsPage = () => null,
}) => {

	let { name = '' } = product;
    const nameArray = product ? name.split(searchString) : [];
    const completeMatch = !compact(nameArray).length;

	return (
		<li 
			key={listElKey}
			onClick={() => gotoSearchResultsPage(product.name, getSearchType(product.productType))}
			data-event-category={SNOWPLOW_CATEGORY.PRODUCT_SEARCH}
            data-event-action={SNOWPLOW_ACTION.CLICK}
            data-event-label={product.name}
		>
			{completeMatch && <span className="search-selected">{searchString}</span>}
			{!completeMatch && 
				nameArray.map((subStr, i) => {
					if (!subStr) return null
					return (
						<>
							<span
								key={`${listElKey}-${i}`}
								className="search-selected"
								data-event-category={SNOWPLOW_CATEGORY.PRODUCT_SEARCH}
				                data-event-action={SNOWPLOW_ACTION.CLICK}
				                data-event-label={product.name}
							>{searchString}</span>{subStr}
						</>
					)
				})
				
			}
		</li>
	)
}

const AutoSuggestProducts = ({ 
	products = [],
	searchString = '',
    gotoSearchResultsPage = () => null,
}) => {
	return (
		<div className="autocom-box-list">
			{
				products.map((product, index) => 
					<AutoSuggestProductListItem
						key={`product-${index}`}
						listElKey={`product-${index}`}
						product={product}
                        searchString={searchString}
                        gotoSearchResultsPage={gotoSearchResultsPage}
					/>
				)
			}
		</div>
	);
}

export default AutoSuggestProducts;