import React from 'react';
import { getCustomFieldValues } from '../../../utils';
import VerifiedStatus from '../../common/verified-status';
import { ItemInfoBox, ItemInfoTable, ItemInfoTags } from '../common-components';
import LockSymbol from '../../common/lock-symbol';
import { getAppPrefix } from '../../../public/js/common';
import { UpstreamSupplySectionLabel } from '../../company/add-edit-product/add-edit-product-main/API/upstream-supply';

export const ManufacturingStatus = ({ 
    customFields = [], 
    isFreemiumUser = true, 
    isUserLinkedToSupplier = false,
    handleVerifyClick = () => null
}) => {
    const manufacturerStatus = getCustomFieldValues(customFields, 'manufacturerStatus');
    const manufacturingStatusVerified = getCustomFieldValues(customFields, 'manufacturingStatusVerified');

    const subTitle = (manufacturerStatus && 
        <>
            <VerifiedStatus 
                isVerified={manufacturingStatusVerified}
                hasPermissionToVerify={!isFreemiumUser && isUserLinkedToSupplier}
                handleVerifyClick={handleVerifyClick}
            />
            {manufacturerStatus}
        </>) || 'Unknown';
    return (
        <ItemInfoBox 
            title='Manufacturing Status'
            subTitle={subTitle}
            locked={isFreemiumUser}
        />
    );
}

export const SpecialOffer = () => (
    <ItemInfoBox title='Special offer / Bulk deal' subTitle='No' colId='notes-in' />
);

const columns = ['Name', 'Date', 'Status'];

const visibleAttributes = ['US FDA', 'US DMF'];

const TableTitleWithLink = ({ title, redirectUrl }) => (
    <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
        {title}
        <i className="icon icon-linker-gray" />
    </a>
)

export const RegulatoryFilings = ({
    supplierID = '',
    isFreemiumUser = true,
    customFields = [],
    isUserLinkedToSupplier = false,
    handleVerifyClick = () => null
}) => {
    
    const regulatoryFilings = getCustomFieldValues(customFields, 'registrationFilings') || [];
    const data = regulatoryFilings.map(item => ({
        Name: item.filing,
        Date: isFreemiumUser && !visibleAttributes.includes(item.filing) ? <LockSymbol /> : item.filingDate,
        Status: isFreemiumUser && !visibleAttributes.includes(item.filing) ? <LockSymbol /> : item.filingStatus,
        Verified: item.verified || false,
        hasPermissionToVerify: !isFreemiumUser &&  isUserLinkedToSupplier,
        handleVerifyClick: handleVerifyClick,
        showVerifiedIcon: true,
    }));

    const RegFilingsTableTitle = (
        <TableTitleWithLink 
            title='API Regulatory Filings'
            redirectUrl={supplierID ? `/generics/subsidiary/${supplierID}/regulatoryfilings` : '/generics/'}
        />
    );
    return (
        <ItemInfoBox title={RegFilingsTableTitle} customTitleClass='common-table-tile'>
            <ItemInfoTable
                columnNames={columns}
                data={data}
                showAll
            />
        </ItemInfoBox>
    );
}

export const GMPCertificates = ({ 
    supplierID = '',
    isFreemiumUser = true,
    customFields = [],
    isUserLinkedToSupplier = false,
    handleVerifyClick = () => null
}) => {
    const certificates = getCustomFieldValues(customFields, 'gmpCertificates') || [];
    const data = certificates.map(cert => ({
        Name: cert.authority,
        Date: isFreemiumUser && !visibleAttributes.includes(cert.authority) ? <LockSymbol /> : cert.statusDate,
        Status: isFreemiumUser && !visibleAttributes.includes(cert.authority) ? <LockSymbol /> : cert.status,
        Verified: cert.verified || false,
        hasPermissionToVerify: !isFreemiumUser && isUserLinkedToSupplier,
        handleVerifyClick: handleVerifyClick,
        showVerifiedIcon: true,
    }))

    const GMPCertificatesTableTitle = (
        <TableTitleWithLink 
            title='GMP Certificates'
            redirectUrl={supplierID ? `/generics/subsidiary/${supplierID}/apis` : '/generics/'}
        />
    );

    return (
        <ItemInfoBox title={GMPCertificatesTableTitle}  customTitleClass='common-table-tile'>
            <ItemInfoTable
                columnNames={columns}
                data={data}
                showAll
            />
        </ItemInfoBox>
    );
}

export const UpstreamSupply = ({ customFields = [], isFreemiumUser = true, isUserLinkedToSupplier = false }) => {

    const intermediates = getCustomFieldValues(customFields, 'intermediates') || [];
    const intermediateReagentManufacturers = getCustomFieldValues(customFields, 'intermediateReagentManufacturers') || [];
    const rawMaterialManufacturers = getCustomFieldValues(customFields, 'rawMaterialManufacturers') || [];

    const intermediatesAndReagentsData = intermediates
        .filter(i => i.id && i.name)
        .map(i => ({ name: i.name }));
    const getManufacturersData = (manufacturers = []) => {
        return manufacturers
            .filter(m => m.id && m.name)
            .map(manufacturer => {
                return { 
                    name: manufacturer.name,
                    redirectUrl: `${getAppPrefix()}/company/${manufacturer.id}`
                };
            });
    }

    const intermediateReagentManufacturersData = getManufacturersData(intermediateReagentManufacturers);
    const rawMaterialManufacturersData = getManufacturersData(rawMaterialManufacturers);
    const isUpstreamSupplyLocked = isFreemiumUser && !isUserLinkedToSupplier;
    
    return (
        <>
            <UpstreamSupplySectionLabel />
            <div className="single-row-fix">
                <ItemInfoTags 
                    title='Intermediates/Reagents'
                    colWidth={12}
                    data={intermediatesAndReagentsData}
                    locked={isUpstreamSupplyLocked}
                    autoTooltip
                    showAll
                />
                <ItemInfoTags 
                    title='Manufacturer of Intermediates/Reagents'
                    colWidth={12}
                    data={intermediateReagentManufacturersData}
                    locked={isUpstreamSupplyLocked}
                    autoTooltip
                    showAll
                />
                <ItemInfoTags 
                    title='Manufacturer of Raw Materials'
                    colWidth={12}
                    data={rawMaterialManufacturersData}
                    locked={isUpstreamSupplyLocked}
                    autoTooltip
                    showAll
                />
            </div>
        </>
    );
}