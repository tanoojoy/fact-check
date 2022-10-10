import React from 'react';
import { SNOWPLOW_ACTION, SNOWPLOW_CATEGORY } from '../../consts/snowplow';
import { productCompanyTypes } from '../../consts/company-products';
import { getAppPrefix } from '../../public/js/common';
import { capitalize } from '../../scripts/shared/common';
import { getCustomFieldValues } from '../../utils';
import Alerts from '../common/alerts';
import ShareProduct from './share-product';

const { PRODUCT_COMPANY_MANUFACTURER,  PRODUCT_COMPANY_MARKETER } = productCompanyTypes;

export const ItemAlerts = ({ alerts = [], user = {} }) => {
    return (
        <div className="alerts-container">
            <Alerts alerts={alerts} user={user} type={'product'} />
        </div>
    )
}

export const ItemInfo = ({ extraClass = '', title = '', children, value = 'Unknown' }) => {
    return (
        <div 
            className={`${extraClass} cor-new-design`}
            data-event-category={SNOWPLOW_CATEGORY.PRODUCT_PROFILE_MANUFACTURER_SUPPLIER}
            data-event-action={SNOWPLOW_ACTION.CLICK}
            data-event-label={value}
        >
            {title && <p className="title-caption">{title}</p>}
            {children}
        </div>
    );
}

const SupplierInfo = ({ merchantID , Name = '', itemViewType = '' }) => {

    const merchantProfileUrl = `${getAppPrefix()}/company/${merchantID}`;
    if (!merchantID) return null;

    let title = 'Supplier';
    if (itemViewType === PRODUCT_COMPANY_MANUFACTURER) {
        title = 'Manufacturer'
    } else if (itemViewType === PRODUCT_COMPANY_MARKETER) {
        title = 'Marketer'
    }
    return (
        <ItemInfo title={title} value={Name}>
            <a href={merchantProfileUrl} target="_blank" rel="noopener noreferrer">
                <i className="icon icon-merchant-info-link" />&nbsp;
                {Name}
            </a>
        </ItemInfo>
    )
}

const ItemDetailHeader = ({ 
    itemDetails = {},
    user = {},
    itemViewType = '',
    isUserLinkedToSupplier = false,
    shareProductProfile = () => null,
}) => {

    let { MerchantDetail = {}, Name, Categories } = itemDetails;
    const ItemCustomFields = itemDetails.CustomFields || [];
    const MerchantCustomFields = MerchantDetail.CustomFields || [];

    const alerts = getCustomFieldValues(ItemCustomFields, 'alerts');

    const casNumber = getCustomFieldValues(ItemCustomFields, 'cas') || 'Unknown';
    const categoryStr = (Categories || []).map(cat => cat.Name).join(', ');

    const minPrice = getCustomFieldValues(ItemCustomFields, 'price-min', 'Code');
    const maxPrice = getCustomFieldValues(ItemCustomFields, 'price-max', 'Code');
    const priceRange = `${[minPrice, maxPrice].filter(price => !!price).join(' - ')}` || 'Unknown';

    const isFinishedDose  = itemViewType && [PRODUCT_COMPANY_MANUFACTURER, PRODUCT_COMPANY_MARKETER].includes(itemViewType);
    return (
		<div className="company-info-area">
            <div className="container">
                <div className="idc-left">
                    <ItemAlerts alerts={alerts} user={user} />
                    <div className="item-name">
                        {capitalize(Name)} &nbsp;
                        {isUserLinkedToSupplier && 
                            <a
                                href={`${getAppPrefix()}/company/product/${itemDetails.ID}/settings`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="edit-button"
                            >
                                <i className="icon icon-edit-gear-blue" />&nbsp;
                                Edit
                            </a>
                        }
                    </div>
                    <div className="item-info-con">
                        <SupplierInfo merchantID={MerchantDetail.ID} Name={MerchantDetail.DisplayName}  itemViewType={itemViewType} />
                        {!isFinishedDose &&
                            <ItemInfo title="CAS Number" value={casNumber}>
                                <p>{casNumber}</p>
                            </ItemInfo>
                        }
                        <ItemInfo title="Category" value={categoryStr}>
                            <p><span>{categoryStr}</span></p>
                        </ItemInfo>
                        {!isFinishedDose && 
                            <ItemInfo title="API Price, $USD/kg" value={priceRange}>
                                <p>{priceRange}</p>
                            </ItemInfo>
                        }
                        <ShareProduct
                            itemViewType={itemViewType}
                            itemDetails={itemDetails}
                            shareProductProfile={shareProductProfile}
                        />
                    </div>
                </div>
            </div>
        </div>
	)
}

export default ItemDetailHeader;