import React from 'react';
import { typeOfSearchBlock } from '../../consts/search-categories';
import ItemDetailHeader from './item-detail-header';
import ItemDetailMain from './item-detail-main'
import SearchPanel from '../common/search-panel/index';

const ItemDetailContainer = ({
    itemDetails = {},
    user = {},
    getUpgradeToPremiumPaymentLink,
    handleVerifyClick,
    shareProductProfile,
    itemViewType = '',
    searchCategory = '',
    searchResults = null,
    searchString = '',
    setSearchCategory = () => null,
    setSearchString = () => null,
    gotoSearchResultsPage = () => null,

}) => {

    let { MerchantDetail = {}  } = itemDetails;
    const isUserLinkedToSupplier = user.companyInfo?.id === MerchantDetail.ID;

	return (
        <div className="item-detail-container">
            <SearchPanel
                type={typeOfSearchBlock.HEADER}
                searchCategory={searchCategory}
                searchResults={searchResults}
                searchString={searchString}
                setSearchCategory={setSearchCategory}
                gotoSearchResultsPage={gotoSearchResultsPage}
                setSearchString={setSearchString}
            />
            <ItemDetailHeader 
                itemDetails={itemDetails}
                user={user}
                itemViewType={itemViewType}
                isUserLinkedToSupplier={isUserLinkedToSupplier}
                shareProductProfile={shareProductProfile}
            />
            <ItemDetailMain  
                itemDetails={itemDetails}
                user={user}
                getUpgradeToPremiumPaymentLink={getUpgradeToPremiumPaymentLink}
                itemViewType={itemViewType}
                handleVerifyClick={handleVerifyClick}
                isUserLinkedToSupplier={isUserLinkedToSupplier}
            />
        </div>
	);
}

export default ItemDetailContainer;