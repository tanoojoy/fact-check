import React, { Component, useEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../header';
import HorizonFooterComponent from '../horizon-components/footer';
import { getAppPrefix } from '../../../public/js/common';
import { userRoles } from '../../../consts/horizon-user-roles';
import MainContent from '../horizon-components/main-content';
import UnlockMoreResultsBanner from '../horizon-components/unlock-more-results-banner';
import { company as companyPPs } from '../../../consts/page-params';
import { isFreemiumUserSku, isPremiumUserSku } from '../../../utils';
import LockSymbol from '../horizon-components/lock-symbol';
import axios from 'axios';
import { VerifiedStatus } from '../horizon-components/verified-status';
import { SNOWPLOW_ACTION, SNOWPLOW_CATEGORY, SNOWPLOW_LABEL } from '../../../consts/snowplow';
import { CompanyAlerts } from '../horizon-components/alerts/company-alerts';
import { MoreInformation } from '../horizon-components/more-information';
import { COMPANY_MORE_INFO_DESCRIPTION } from '../../../consts/more-info';
import HorizonDropdown from '../horizon-components/dropdown';
import { productTabs } from '../../../consts/product-tabs';

const ProfileBlock = ({ title, children }) => {
    return (
        <div className='company-profile__trial_batch company-profile__additional_info_item'>
            <div className='company-profile__additional_info_title'>
                {title}
            </div>
            {children}
        </div>
    );
};

const ContactSupplierChatButton = ({
    isSellerUser = false,
    companyId = null,
    userHasCompany = false,
    companyWithUsers = false,
    openChat = () => { console.log('"openChat" function is undefined') }
}) => {
    const chatAvailable = Boolean(userHasCompany && !isSellerUser && companyWithUsers);

    return (
        <>
            <div className='company-profile__company-action-title'>
                Contact Supplier
            </div>
            <div
                className={`company-profile__company-action-item ${!chatAvailable ? ' company-profile__company-action-item--disabled' : ''}`}
                onClick={() => chatAvailable ? openChat(companyId) : null}
                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_CONTACT_SUPPLIER}
                data-event-label={SNOWPLOW_LABEL.OPEN_CHAT}
                data-event-action={SNOWPLOW_ACTION.CLICK}
            >
                <img
                    src={getAppPrefix() + '/assets/images/horizon/communicate.svg'}
                    alt='open chat'
                    className='company-profile__alert-icon'
                    data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_CONTACT_SUPPLIER}
                    data-event-label={SNOWPLOW_LABEL.OPEN_CHAT}
                    data-event-action={SNOWPLOW_ACTION.CLICK}
                />
                {!chatAvailable ? 'Chat not available' : 'Open Chat'}
            </div>
        </>);
}

const FollowingCompany = ({ userHasCompany = false, isFollow = false, companyId }) => {
    const [isFollowState, setIsFollowState] = useState(null);
    useEffect(() => {
        setIsFollowState(isFollow);
    }, [isFollow]);

    const setFollowStatus = () => {
        const newFollowState = !isFollowState;
        const method = newFollowState ? 'post' : 'delete';
        setIsFollowState(newFollowState);

        axios(`${getAppPrefix()}/users/follower`, {
            method,
            data: {
                followCompanyId: companyId
            }
        })
            .then(res => {
                res.status === 200 ? console.log(res.statusText) : console.error(res.statusText);
            })
            .catch(e => console.error(e.status));
    }

    return (
        <>
            <div className='company-profile__company-action-title'>
                Stay Tuned
            </div>
            <div
                className={`company-profile__company-action-item ${!userHasCompany ? 'company-profile__company-action-item--disabled' : ''}`}
                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_STAY_TUNED}
                data-event-label={SNOWPLOW_LABEL.FOLLOW}
                data-event-action={SNOWPLOW_ACTION.CLICK}
            >
                <div
                    className='company-profile__follow-toggler'
                    data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_STAY_TUNED}
                    data-event-label={SNOWPLOW_LABEL.FOLLOW}
                    data-event-action={SNOWPLOW_ACTION.CLICK}
                    onClick={setFollowStatus}
                >
                    <div
                        className={`company-profile__follow-toggler-base${isFollowState ? '-active' : ''}`}
                        data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_STAY_TUNED}
                        data-event-label={SNOWPLOW_LABEL.FOLLOW}
                        data-event-action={SNOWPLOW_ACTION.CLICK}
                    />
                    <div
                        className={`company-profile__follow-toggler-knob${isFollowState ? '-active' : ''}`}
                        data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_STAY_TUNED}
                        data-event-label={SNOWPLOW_LABEL.FOLLOW}
                        data-event-action={SNOWPLOW_ACTION.CLICK}
                    />
                </div>
                <span
                    data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_STAY_TUNED}
                    data-event-label={SNOWPLOW_LABEL.FOLLOW}
                    data-event-action={SNOWPLOW_ACTION.CLICK}
                >{userHasCompany ? 'Follow' : 'Following not available'}
                                </span>
            </div>
        </>
    )
}

export class CompanyPage extends Component {
    regularInspectionNames = ['US FDA', 'gdufaFeePaymentYear', 'facultyRegistrationDate', 'fdaWarningLetterDate'];
    verifiedStatuses = ['Commercially Available', 'Under Development', 'Early API Activity', 'Innovator or Marketer'];
    initialOtherServicesCount = 2;
    initialCapabilitiesCount = 4;
    initialProductsCount = 8;

    constructor(props) {
        super(props);
        this.state = {
            showAllProducts: false,
            showAllCapabilities: false,
            showAllOtherServices: false,
            regulatoryInspections: [],
            otherInspections: [],
            capabilities: [],
            companyProducts: []
        };
    }

    componentDidMount() {
        const {
            companyInfo: {
                inspectionsInfo = [],
                fdaWarningLetterDate = null,
                facultyRegistrationDate = null,
                gdufaFeePaymentYear = null,
                capabilities = [],
                id = ''
            },
            companyProducts = []
        } = this.props;
        const newInspectionsInfo = [
            ...inspectionsInfo,
            {
                agencyName: 'fdaWarningLetterDate',
                inspectionDate: fdaWarningLetterDate
            },
            {
                agencyName: 'facultyRegistrationDate',
                inspectionDate: facultyRegistrationDate
            },
            {
                agencyName: 'gdufaFeePaymentYear',
                inspectionDate: gdufaFeePaymentYear
            }
        ];

        this.updateCompanyData(newInspectionsInfo, capabilities);
        this.updateCompanyProducts(companyProducts);

        axios.get(getAppPrefix() + `/company/sources/${id}`).then(({ data: { companySources } }) => {
            const {
                cgiCompany,
                hznCompany
            } = companySources;
            const newInspectionsInfo = this.addVerifiedMarksToInspectionsInfo(inspectionsInfo, cgiCompany, hznCompany);
            const newCapabilitiesInfo = this.addVerifiedMarksToCapabilitiesInfo(capabilities, cgiCompany?.capabilities);

            this.updateCompanyData(newInspectionsInfo, newCapabilitiesInfo);
        }).catch(console.log);

        axios.get(getAppPrefix() + `/product-profile/sources/${id}`).then(({ data: { productAttributes } }) => {
            const products = this.addVerifiedMarksToCompanyProducts(productAttributes);
            this.updateCompanyProducts(products);
        }).catch(console.log);
    }

    addVerifiedMarksToCompanyProducts(products) {
        const { companyProducts } = this.state;
        return companyProducts?.map(product => {
            const cgiEqualRecord = products.find(({ cgiCompanyProductConnection }) => {
                return cgiCompanyProductConnection.productId === product.productId;
            })?.cgiCompanyProductConnection;
            const equalStatus = cgiEqualRecord?.manufacturerStatus === product?.manufacturerStatus;
            const verified = equalStatus && this.verifiedStatuses.includes(cgiEqualRecord?.manufacturerStatus);
            return {
                ...product,
                verified
            };
        });
    }

    addVerifiedMarksToInspectionsInfo(inspectionsInfo, cgiCompany, hznCompany) {
        const { companyInfo } = this.props;
        const inspectionsWithVerifiedStatus = (inspectionsInfo || []).map(inspection => {
            const recordsEqual = !!(cgiCompany?.inspectionsInfo.find((cgiInspection) => JSON.stringify(cgiInspection) === JSON.stringify(inspection)));
            return {
                ...inspection,
                verified: recordsEqual
            };
        });

        return [
            ...inspectionsWithVerifiedStatus,
            {
                agencyName: 'fdaWarningLetterDate',
                inspectionDate: cgiCompany?.fdaWarningLetterDate || companyInfo?.fdaWarningLetterDate,
                verified: companyInfo?.fdaWarningLetterDate ? cgiCompany?.fdaWarningLetterDate === companyInfo?.fdaWarningLetterDate : false
            },
            {
                agencyName: 'facultyRegistrationDate',
                inspectionDate: cgiCompany?.facultyRegistrationDate || companyInfo?.facultyRegistrationDate,
                verified: companyInfo?.facultyRegistrationDate ? cgiCompany?.facultyRegistrationDate === companyInfo?.facultyRegistrationDate : false
            },
            {
                agencyName: 'gdufaFeePaymentYear',
                inspectionDate: cgiCompany?.gdufaFeePaymentYear || companyInfo?.gdufaFeePaymentYear,
                verified: companyInfo?.gdufaFeePaymentYear ? cgiCompany?.gdufaFeePaymentYear === companyInfo?.gdufaFeePaymentYear : false
            }
        ];
    }

    addVerifiedMarksToCapabilitiesInfo(capabilities, cgiCapabilities) {
        return capabilities.map(capability => {
            const recordsEqual = !!(cgiCapabilities.find(cgiCapability => JSON.stringify(cgiCapability) === JSON.stringify(capability)));
            return {
                ...capability,
                verified: recordsEqual
            };
        });
    }

    updateCompanyData(newInspectionsInfo, capabilities, companyProducts) {
        const regulatoryInspections = this.formatRegulatoryInspections(newInspectionsInfo);
        const otherInspections = this.filterOtherInspections(newInspectionsInfo);
        this.setState({
            ...this.state,
            regulatoryInspections,
            otherInspections,
            capabilities
        });
    }

    updateCompanyProducts(companyProducts) {
        this.setState({
            ...this.state,
            companyProducts
        });
    }

    openChat = (companyId) => {
        const chatId = `chatcommon${companyId}${Date.now()}`;
        window.location = `${getAppPrefix()}/common-chat/create/${companyId}/${chatId}`;
    };

    formatRegulatoryInspections(normalizedInspectionInfo = []) {
        return normalizedInspectionInfo.reduce((acc, inspection) => {
            if (this.regularInspectionNames.includes(inspection.agencyName)) {
                const inspDate = inspection.inspectionDate;
                let formattedDate;
                if (inspDate) {
                    if (inspection.agencyName === 'gdufaFeePaymentYear') {
                        formattedDate = `${inspDate} Fiscal year`;
                    } else {
                        formattedDate = moment.utc(inspDate).format('D-MMM-YYYY');
                    }
                }
                return {
                    ...acc,
                    [inspection.agencyName]: {
                        value: formattedDate,
                        verified: inspection.verified
                    }
                };
            }
            return acc;
        }, {});
    }

    filterOtherInspections(normalizedInspectionInfo = []) {
        return normalizedInspectionInfo.filter(inspection => !this.regularInspectionNames.includes(inspection.agencyName));
    }

    renderCompanyHeader() {
        const { user = {}, companyInfo = {}, isFollowCompany = false } = this.props;
        const sellerUser = user?.role === userRoles.subMerchant;
        const userHasCompany = !!user?.hasCompany;
        const companyWithUsers = Boolean(companyInfo?.subsNumber);

        const {
            name = '',
            country,
            webPage,
            relationGroupName,
            subsidiaryType = [],
            addresses = [],
            city,
            id: companyId,
            alerts
        } = companyInfo;
        return (
            <>
                <div className='company-profile__header'>
                    <div className='company-profile__main-info'>
                        <div className='company-profile__main-name'>
                            <div className='company-profile__main-name-value'>{name}</div>
                        </div>
                        <CompanyAlerts alerts={alerts} user={user} />
                    </div>
                    <div className='company-profile__secondary_info'>
                        <div className='company-profile__additional_info'>
                            <ProfileBlock title='City'>
                                <div className='company-profile__additional_info_value'>
                                    {city || 'Not Available'}
                                </div>
                            </ProfileBlock>
                            <ProfileBlock title='Location'>
                                <div className='company-profile__additional_info_value'>
                                    {[addresses[0], country].filter(val => !!val).join(', ') || 'Not Available'}
                                </div>
                            </ProfileBlock>
                        </div>
                        <div className='company-profile__additional_info'>
                            <ProfileBlock title='Subsidiary Type'>
                                {subsidiaryType.length === 0
                                    ? (
                                        <div className='company-profile__additional_info_value'>
                                            Not Available
                                        </div>)
                                    : subsidiaryType.map(type =>
                                        (<div className='company-profile__additional_info_value' key={type}>
                                            {type}
                                        </div>
                                        )
                                    )}
                            </ProfileBlock>
                            <ProfileBlock title='Corporate Group Name'>
                                <div className='company-profile__additional_info_value'>
                                    {relationGroupName || 'Not Available'}
                                </div>
                            </ProfileBlock>
                        </div>
                        <div className='company-profile__additional_info'>
                            <ProfileBlock title='Website'>
                                <div className='company-profile__additional_info_value'>
                                    <div style={{ display: 'flex' }}>
                                        <img
                                            src={getAppPrefix() + '/assets/images/horizon/globe.svg'} alt=''
                                            className='company-profile__alert-icon'
                                        />
                                        <div className='company-profile__web-page_value'>{webPage || 'Not Available'}</div>
                                    </div>
                                </div>
                            </ProfileBlock>
                            <ProfileBlock title='More Info'>
                                <div className='company-profile__additional_info_value'>
                                    <a
                                        target='_blank'
                                        href={companyId ? `/generics/subsidiary/${companyId}/keyinsights` : '/generics/'}
                                        rel='noreferrer'
                                        data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_MORE_INFO}
                                        data-event-label={SNOWPLOW_LABEL.CCI}
                                        data-event-action={SNOWPLOW_ACTION.CLICK}
                                    >
                                        <div
                                            className='company-profile__company-action-item'
                                            data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_MORE_INFO}
                                            data-event-label={SNOWPLOW_LABEL.CCI}
                                            data-event-action={SNOWPLOW_ACTION.CLICK}
                                        >
                                            <img
                                                src={getAppPrefix() + '/assets/images/horizon/outer_link_arrow-blue.svg'} alt=''
                                                className='company-profile__alert-icon'
                                                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_MORE_INFO}
                                                data-event-label={SNOWPLOW_LABEL.CCI}
                                                data-event-action={SNOWPLOW_ACTION.CLICK}
                                            />
                                            Cortellis Generics Intelligence
                                        </div>
                                    </a>
                                </div>
                            </ProfileBlock>
                        </div>
                        <div className='company-profile__company-action'>
                            <ContactSupplierChatButton
                                isSellerUser={sellerUser}
                                companyId={companyId}
                                userHasCompany={userHasCompany}
                                companyWithUsers={companyWithUsers}
                                openChat={this.openChat}
                            />
                            <FollowingCompany
                                userHasCompany={FollowingCompany}
                                isFollow={isFollowCompany}
                                companyId={companyId}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    renderRegulatoryInspections() {
        const { user = {}, companyInfo = {} } = this.props;
        const userLinkedToCompany = companyInfo?.id === user?.companyInfo?.id;
        const alwaysVisibleInspectionKey = 'FDA Inspection';
        const usFdaRows = [alwaysVisibleInspectionKey, 'GDUFA Fee Payment', 'Self Identified Registration', 'FDA Warning Letter'];
        const SUBSIDIARY_KEY_INSIGHTS = `https://www.cortellis.com/generics/subsidiary/${companyInfo?.id}/keyinsights`;

        const fdaMapping = {
            [alwaysVisibleInspectionKey]: 'US FDA',
            'GDUFA Fee Payment': 'gdufaFeePaymentYear',
            'Self Identified Registration': 'facultyRegistrationDate',
            'FDA Warning Letter': 'fdaWarningLetterDate'
        };

        return (
            <div className='company-settings__inspection-content company-profile__card'>
                <div className='company-profile__card-title'>
                    <img
                        src={getAppPrefix() + '/assets/images/horizon/shield.svg'} alt='inspections'
                        className='company-profile__alert-icon'
                    />
                    Regulatory Inspections
                </div>
                <div className='company-settings__inspections'>
                    <div className='company-settings__inspection-table'>
                        <h2 className='company-settings__inspection-title'>
                            <a
                                className='company-profile__cgi-link-subsidiary-key-insights'
                                href={SUBSIDIARY_KEY_INSIGHTS}
                                target='_blank'
                                rel='noreferrer'
                            >
                                <div>US FDA</div>
                                <img
                                    src={getAppPrefix() + '/assets/images/horizon/outer_link_arrow-dark.svg'}
                                    className='company-profile__cgi-img-subsidiary-key-insights'
                                    alt=''
                                />
                            </a>
                        </h2>
                        <div className='company-settings__inspection-table-header'>
                            <div className='company-settings__inspection-column-title'>Inspection</div>
                            <div className='company-settings__inspection-column-title'>Date</div>
                        </div>
                        {usFdaRows.map((insp, ix) => {
                                return (
                                    <div key={`${insp}-${ix}`} className='company-settings__inspection-row'>
                                        <VerifiedStatus
                                            status={this.state.regulatoryInspections[fdaMapping[insp]]?.verified}
                                            hasPermissions={isPremiumUserSku(user) && userLinkedToCompany}
                                        />
                                        <div className='company-settings__inspection-value'>{insp}</div>
                                        <div className='company-settings__inspection-value'>
                                            {(isPremiumUserSku(user) || insp === alwaysVisibleInspectionKey) && (this.state.regulatoryInspections[fdaMapping[insp]]?.value ||
                                                <span style={{ color: '#DADADA' }}>Not Reported</span>)}
                                            {(isFreemiumUserSku(user) && insp !== alwaysVisibleInspectionKey) && <LockSymbol />}
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                    <div className='company-settings__inspection-table'>
                        <h2 className='company-settings__inspection-title'>Other</h2>
                        {this.state.otherInspections.length > 0 &&
                        <div className='company-settings__inspection-table-header'>
                            <div className='company-settings__inspection-column-title'>Inspection</div>
                            <div className='company-settings__inspection-column-title'>Date</div>
                        </div>}
                        {this.state.otherInspections.length === 0
                            ? <span style={{ color: '#DADADA' }}>None Reported</span>
                            : this.state.otherInspections.map((insp, ix) => {
                                const inspDate = new Date(insp.inspectionDate);
                                const formattedDate = moment.utc(inspDate).format('D-MMM-YYYY');
                                return (
                                    <div key={`${insp}-${ix}`} className='company-settings__inspection-row'>
                                        <VerifiedStatus
                                            status={insp.verified}
                                            hasPermissions={isPremiumUserSku(user) && userLinkedToCompany}
                                        />
                                        <div
                                            className='company-settings__inspection-value'
                                            title={(insp.agencyName.length > 25) && insp.agencyName}
                                        >{insp.agencyName}
                                        </div>
                                        <div className='company-settings__inspection-value'>
                                            {(isPremiumUserSku(user)) && formattedDate}
                                            {(isFreemiumUserSku(user)) && <LockSymbol />}
                                        </div>
                                    </div>);
                            })}
                    </div>
                </div>
            </div>
        )
    }

    renderManufacturingCapabilities() {
        const { user = {}, companyInfo = {} } = this.props;
        const userLinkedToCompany = companyInfo?.id === user?.companyInfo?.id;
        const { cmo } = companyInfo;
        const { capabilities = [] } = this.state;

        const visibleCapabilities = this.state.showAllCapabilities ? [...capabilities] : capabilities.slice(0, this.initialCapabilitiesCount);

        return (
            <div className='company-profile__manufacturing-capabilities company-profile__card'>
                <div className='company-profile__card-title'>
                    <img
                        src={getAppPrefix() + '/assets/images/horizon/tiles.svg'} alt='capabilities'
                        className='company-profile__alert-icon'
                    />
                    Manufacturing Capabilities
                    <div className='company-profile__card-items-total'>{capabilities.length} Total</div>
                </div>
                <div className='company-profile__CMO-info'>
                    Contract Manufacturing Organization (CMO/CDMO) —
                    <div className={`company-profile__CMO-info-value-${cmo ? 'yes' : 'no'}`}>{cmo ? 'Yes' : 'No'}</div>
                </div>
                <div className='company-profile__card-items'>
                    {visibleCapabilities.map((cap, index) => (
                            <div
                                className='company-profile__manufacturing-capability company-profile__item-card'
                                key={`${cap.value}-${index}`}
                                onClick={console.log}
                            >
                                <div className='company-profile__manufacturing-capability-type'>
                                    {cap.type}
                                </div>
                                <div
                                    className='company-profile__manufacturing-capability-value company-profile__item-card-value'
                                >
                                    <VerifiedStatus
                                        status={cap.verified}
                                        hasPermissions={isPremiumUserSku(user) && userLinkedToCompany}
                                    />
                                    {cap.value}
                                </div>
                            </div>
                        )
                    )}
                </div>
                {
                    !this.state.showAllCapabilities && (capabilities.length > this.initialCapabilitiesCount) &&
                    (<div className='company-profile__show-more'>
                        {isPremiumUserSku(user)
                        && <div className='company-profile__show-more-btn' onClick={this.showMoreCapabilities}>
                            +&nbsp;Show more
                        </div>}
                        {isFreemiumUserSku(user) &&
                        <div className='company-profile__show-more-btn__disabled'><LockSymbol />+&nbsp;Show more</div>}
                    </div>)
                }
            </div>
        )
    }

    renderOtherServices() {
        const { user = {}, companyInfo = {} } = this.props;
        const otherServices = companyInfo?.otherServices || [];
        const visibleOtherServices = this.state.showAllOtherServices ? [...otherServices] : otherServices.slice(0, this.initialOtherServicesCount);
        return (
            <div className='company-profile__other-services company-profile__card'>
                <div className='company-profile__card-title space-between'>
                    <div className='company-profile__title'>
                        <img
                            src={getAppPrefix() + '/assets/images/horizon/workspaces_filled.svg'} alt='product'
                            className='company-profile__alert-icon'
                        />
                        Other Services
                        <div className='company-profile__card-items-total'>{otherServices.length} Total</div>
                    </div>
                </div>
                <div className='company-profile__card-items'>
                    {visibleOtherServices.map((service, ix) =>
                        (<div
                            key={`${service}-${ix}`} className='company-profile__other-services company-profile__item-card'
                            data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                            data-event-label={service}
                            data-event-action={SNOWPLOW_ACTION.CLICK}
                        >
                            <div
                                className='company-profile__product-type'
                                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                                data-event-label={service}
                                data-event-action={SNOWPLOW_ACTION.CLICK}
                            >
                                Service
                            </div>
                            <div
                                className='company-profile__item-card-value'
                                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                                data-event-label={service}
                                data-event-action={SNOWPLOW_ACTION.CLICK}
                            >
                                {service}
                            </div>
                        </div>)
                    )}
                </div>
                {
                    !this.state.showAllOtherServices && (otherServices.length > this.initialOtherServicesCount) &&
                    (<div className='company-profile__show-more'>
                        {isPremiumUserSku(user) && <div className='company-profile__show-more-btn' onClick={this.showMoreOtherServices}>+&nbsp;Show more</div>}
                        {isFreemiumUserSku(user) && <div className='company-profile__show-more-btn__disabled'><LockSymbol />&nbsp;Show more</div>}
                    </div>)
                }
            </div>
        )
    }

    renderCompanyProducts() {
        const { user = {}, companyInfo = {} } = this.props;
        const { companyProducts = [] } = this.state;
        const userLinkedToCompany = companyInfo?.id === user?.companyInfo?.id;
        const { id: companyId } = companyInfo;
        const visibleCompanyProducts = this.state.showAllProducts ? [...companyProducts] : companyProducts.slice(0, this.initialProductsCount);
        const getDisplayProduct = (type) => {
            const displayType = {
                active: true,
                name: type
            }

            if (type) {
                switch (type) {
                    case productTabs.API.productType:
                        displayType.name = type.toUpperCase();
                        displayType.active = true;
                        break;
                    case productTabs.INTERMEDIATE.productType:
                        displayType.name = `${type} / Reagent`;
                        displayType.active = false;
                        break;
                    case productTabs.INACTIVE_INGREDIENTS.productType:
                        displayType.name = type;
                        displayType.active = false;
                        break;
                    default:
                        displayType.name = type;
                        displayType.active = true;
                        break;
                }
            } else {
                displayType.active = false;
                displayType.name = ''
            }

           return displayType;
        }
        return (
            <div className='company-profile__company-products company-profile__card'>
                <div className='company-profile__card-title space-between'>
                    <div className='company-profile__title'>
                        <img
                            src={getAppPrefix() + '/assets/images/horizon/pill.svg'} alt='product'
                            className='company-profile__alert-icon'
                        />
                        Products
                        <div className='company-profile__card-items-total'>{companyProducts.length} Total</div>
                    </div>
                    <div className='company-profile__search'>
                        <HorizonDropdown disabled currentValue='Sort by' />
                    </div>
                </div>
                <div className='company-profile__card-items'>
                    {visibleCompanyProducts.map((prod, ix) =>
                        (<div
                            key={`${prod.name}-${ix}`}
                            className={`company-profile__item-card ${!getDisplayProduct(prod.type).active && 'company-profile__item-card__product-disabled'}`}
                            onClick={() => {getDisplayProduct(prod.type).active && this.goToProductPage(companyId, prod);}}
                            data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                            data-event-label={prod.mainName}
                            data-event-action={SNOWPLOW_ACTION.CLICK}
                        >
                            <div
                                className='company-profile__product-type'
                                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                                data-event-label={getDisplayProduct(prod.type).name}
                                data-event-action={SNOWPLOW_ACTION.CLICK}
                            >
                                { getDisplayProduct(prod.type).name }
                            </div>
                            <div
                                className='company-profile__product-name company-profile__item-card-value'
                                data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                                data-event-label={prod.name}
                                data-event-action={SNOWPLOW_ACTION.CLICK}
                            >
                                <VerifiedStatus
                                    status={prod.isVerified}
                                    hasPermissions={isPremiumUserSku(user) && userLinkedToCompany}
                                />
                                {prod.name}
                            </div>

                            <div className='company-profile__product-alerts'>
                                {prod?.alerts?.map((alert, ix) => (
                                    <div
                                        key={`${alert}-${ix}`}
                                        className='company-profile__product-alert'
                                        data-event-category={SNOWPLOW_CATEGORY.SUPPLIER_PROFILE_MANUFACTURER_PRODUCTS_ALGESTONE}
                                        data-event-label={alert}
                                        data-event-action={SNOWPLOW_ACTION.CLICK}
                                    >
                                        {alert}
                                    </div>
                                ))}
                            </div>
                        </div>)
                    )}
                </div>
                {
                    !this.state.showAllProducts && (companyProducts.length > this.initialProductsCount) &&
                    (<div className='company-profile__show-more'>
                        {isPremiumUserSku(user) && <div className='company-profile__show-more-btn' onClick={this.showMoreProducts}>+&nbsp;Show more</div>}
                        {isFreemiumUserSku(user) && <div className='company-profile__show-more-btn__disabled'><LockSymbol />&nbsp;Show more</div>}
                    </div>)
                }
            </div>
        );
    }

    renderAdditionalSupplierInfo() {
        const { filesList = [] } = this.props?.companyInfo || {};
        const additionalTitle = filesList.length ? 'Supporting documents have been uploaded by the supplier' : 'No supporting documents have been shared';
        return (
            <>
                <div className='company-profile__additional-supplier-info'>
                    <div className='company-profile__additional-supplier-info-hint'>
                        <div className='company-profile__additional-supplier-info-hint-title'>
                            Additional Supplier Information
                        </div>
                        <div className='company-profile__additional-supplier-info-hint-text'>{additionalTitle}</div>
                    </div>
                    <div className='company-profile__documents-list'>
                        {filesList.map(file => {
                            return this.renderAdditionalSupplierInfoRow(file);
                        })}
                    </div>
                </div>
            </>
        );
    }

    renderAdditionalSupplierInfoRow(file) {
        return (
            <div className='company-profile__document'>
                <div className='company-profile__document-type'>
                    PDF
                </div>
                <div className='company-profile__document-name'>
                    <a href={file.link} target='_blank' rel='noreferrer'>{file.fileName}</a>
                </div>
            </div>
        );
    }

    getLinkToProductPage(companyId, product) {
        switch (product.type) {
            case productTabs.API.productType:
                return `${getAppPrefix()}/product-profile/profile/${companyId}/${product.id}`;
            case productTabs.DOSE_FORM.productType:
                return `${getAppPrefix()}/product-profile/Manufacturer/${companyId}/${product.id}`;
            default:
                console.log('Redirecting to a page with a product of this type is not yet supported');
                return window.location.href;
        }
    }

    goToProductPage(companyId, product) {
        if (companyId && product.id) {
            window.location = this.getLinkToProductPage(companyId, product);
        }
    }

    showMoreProducts = () => {
        this.setState({ showAllProducts: true });
    }

    showMoreCapabilities = () => {
        this.setState({ showAllCapabilities: true });
    }

    showMoreOtherServices = () => {
        this.setState({showAllOtherServices: true});
    }

    render() {
        const { id } = this.props.companyInfo;
        const companyLink = id ? `/generics/subsidiary/${id}/keyinsights` : '/generics/';
        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={this.props.user} />
                </div>
                <MainContent className='company-profile' user={this.props.user}>
                    {this.renderCompanyHeader()}
                    <div className='company-profile__content-container'>
                        <div className='company-profile__content'>
                            {this.renderRegulatoryInspections()}
                            {this.renderManufacturingCapabilities()}
                            {this.renderOtherServices()}
                            {this.renderCompanyProducts()}
                            <div className='unlock-more-results-banner__wrapper-company-page'>
                                <UnlockMoreResultsBanner user={this.props.user} page={companyPPs.appString} />
                            </div>
                        </div>
                        <div className='company-profile__additional-content'>
                            {this.renderAdditionalSupplierInfo()}
                            <MoreInformation description={COMPANY_MORE_INFO_DESCRIPTION} detailsLink={companyLink} />
                        </div>
                    </div>
                </MainContent>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        companyInfo: state.companyReducer.companyInfo,
        companyProducts: state.companyReducer.companyProducts,
        isFollowCompany: state.companyReducer.isFollowCompany
    };
};

export const CompanyContainer = connect(mapStateToProps)(CompanyPage);
