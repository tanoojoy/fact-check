import React, { useEffect, useState } from "react";
import { userFollowersProductsMap } from "../../../consts/follower-products";
import { ColumnAdditionalType, ColumnType } from '../../../consts/table';
import { getAppPrefix } from "../../../public/js/common";
import PaginationComponent from '../../common/pagination';
import { NoneReported } from '../../search/results/table-content';

const TableCell = ({
	rowIndex,
	index,
	cellData
}) => {
	let resultCell = <NoneReported />;
	if (cellData?.value || cellData?.additionalData?.value) {
		const { type, value, additionalClasses, additionalData } = cellData;
    	const { category, label, action } = additionalData?.analyticsData || {};
		switch (type) {
			case ColumnType?.TEXT:
		        resultCell = (<span className={additionalClasses}>{value|| additionalData.value}</span>);
		        break;
		    case ColumnType?.LINK:
		        resultCell = (
		            <a
		                className={additionalClasses}
		                href={additionalData.link}
		                target={additionalData.target}
		                rel={additionalData.rel}
		                data-event-category={category}
		                data-event-label={label}
		                data-event-action={action}
		            >
		                {additionalData.value || value.toString()}
		            </a>);
		        break;
		}
	}
	return (
		<td key={`cell-${index}-${rowIndex}`}>
			<div class="table-box">
				{resultCell}
			</div>
		</td>
	)
}

const FollowedProductsTableHeader = () => {
	const getTableHeaderData =  () => {
		let headerConfig = [];
		for (const [key, value] of userFollowersProductsMap.entries()) {
			headerConfig.push({ key, name: value.name, styles: value.customStyles || {} });
		}
		return headerConfig;
	}

	const headerData = getTableHeaderData();
	return (
		<thead>
            <tr>
            	{
            		headerData.map((config, ix) =>
            			<th key={`${config.key}-${ix}`} styles={config.styles}>{config.name}</th>
            		)
            	}
            </tr>
        </thead>
	);
}

const FollowedProductsTableContent = ({
	followedProducts = [],
	page = 1,
	size = 10
}) => {
	const [products, setProducts] = useState([])
	useEffect(() => {
		const followedProductsWithIndex = followedProducts.map((followedProduct, ix) => {
			return ({ 
				index: (ix + 1)+ (page - 1) * size,
				...followedProduct,
			})
		});
		setProducts(followedProductsWithIndex);
	}, [followedProducts]);

	const prepareRowData = (fields) => {
		let rowData = [];
		for (const [key, value] of userFollowersProductsMap.entries()) {
			const additionalDataFieldValues = value.additionalData?.additionalFields?.map(key => fields[key]) || null;
			rowData.push({ 
				value: fields[key] || null,
				type: value.type,
				additionalClasses: value.additionalClasses?.join(' ') || '',
				additionalData: value.additionalData? value.additionalData.format(fields[key], additionalDataFieldValues) : null
			});
		}
		return rowData;
	}

	if (products.length === 0) return null;
	return (
        <tbody>
			{
				products.map((product, index) => {
					const rowData = prepareRowData(product);
					return (
						<tr key={index}>
							{
								rowData.map((data, i) => 
									<TableCell
										key={i}
										rowIndex={index}
										cellData={data}
									/>
								)
							}
						</tr>
					)
				})
			}			

		</tbody>
	);
}

const FollowedProductsSettingsComponent = ({
	extendedFollowerProducts = {},
	getFollowerProductsByPageAndSize = () => null
}) => {
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [products, setProducts] = useState(extendedFollowerProducts?.followers || []);

	useEffect(() => {
  		let isMounted = true;
		getFollowerProductsByPageAndSize(page-1, size, (followedProducts) => {
			if (isMounted) setProducts(followedProducts);
		});
	  	return () => { isMounted = false };
	}, [page, size]);

	return (
		<div id="FollowedProducts" className="tab-pane fade">
			<div className="company-section product-list">
				<div className="pull-left">
                    <h4>{extendedFollowerProducts.count} Products Total</h4>
                </div>	
                <table className="table">
                	<FollowedProductsTableHeader />
                	<FollowedProductsTableContent followedProducts={products} page={page} size={size}/>
                </table>
                {
                	extendedFollowerProducts.count > 0 ?
	                	<PaginationComponent
		                    key='products-paging-key'
		                    pagingId='followed-products-paging'
		                    pageNumber={page}
		                    pageSize={size}
		                    totalRecords={extendedFollowerProducts?.count}
                            onPageNumberClicked={(pageNumber) => setPage(pageNumber)}
		                    onPageSizeChanged={(pageSize) => {
		                    	setPage(1);
		                    	setSize(pageSize);

		                    }}
		                />
		            : ''
                }
			</div>
		</div>
	)
}



export default FollowedProductsSettingsComponent;