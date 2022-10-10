import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../../header';
import HorizonFooterComponent from '../../horizon-components/footer';
import ProfileTab from './tabs/profile-tab';
import InspectionsTab from './tabs/inspection-tab';
import ProductsTab from './tabs/product-tab';
import { isPremiumUserSku, objectsEqual } from '../../../../utils';
import { getAppPrefix } from '../../../../public/js/common';
import MainContent from '../../horizon-components/main-content';
import UnlockMoreResultsBanner from '../../horizon-components/unlock-more-results-banner';
import { companySettings as companySettingsPPs } from '../../../../consts/page-params';
import { PrimaryButton, SecondaryButton } from '../../horizon-components/buttons';
import BreadcrumbsBlock from '../../horizon-components/breadcrumbs-block';
import { array, object, string } from 'prop-types';

const prefix = getAppPrefix();
export const TABS = {
    profile: 'Profile',
    regulatoryInformation: 'Regulatory Information',
    productsList: 'Product List'
};

export class CompanySettingsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: props?.activeTab || TABS.profile,
            touched: false,
            needReset: false
        };
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            companyProducts: [...this.props.companyProducts || []],
            companyInfo: { ...this.props.companyInfo },
            updatedCompanyInfo: null,
            activeTab: this.props?.activeTab || TABS.profile
        }, this.addActiveTabToUrl);
    }

    addActiveTabToUrl = () => {
        if (history.pushState) {
            const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?activeTab=${this.state.activeTab}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    }

    setActiveTab(tab) {
        this.setState({ activeTab: tab }, this.addActiveTabToUrl);
    }

    handleDataChange(companyInfo) {
        if (!objectsEqual(this.state.companyInfo, companyInfo)) {
            this.setState({
                ...this.state,
                companyInfo: { ...this.props.companyInfo, ...companyInfo },
                touched: true
            });
        }
    }

    handleFormReset() {
        this.setState({
            ...this.state,
            needReset: false
        });
    }

    handleDiscardChange() {
        const companyInfo = this.state.updatedCompanyInfo || this.props.companyInfo;
        companyInfo.alerts = companyInfo.alerts ? [...companyInfo.alerts] : [];
        this.setState({
            ...this.state,
            companyInfo: { ...companyInfo },
            touched: false,
            needReset: true
        });
    }

    handleSaveChange() {
        const companyInfoToUpdate = { ...this.state.companyInfo };
        companyInfoToUpdate.inspectionsInfo = companyInfoToUpdate.inspectionsInfo.filter(inspection => Boolean(inspection.agencyName));
        companyInfoToUpdate.gdufaFeePaymentYear = companyInfoToUpdate.gdufaFeePaymentYear ? moment.utc(companyInfoToUpdate.gdufaFeePaymentYear.toString()).year() : 0;
        companyInfoToUpdate.facultyRegistrationDate = companyInfoToUpdate.facultyRegistrationDate || 0;

        companyInfoToUpdate.cmo = companyInfoToUpdate.contractManufacturingOrganization === 'yes';
        delete companyInfoToUpdate.contractManufacturingOrganization;

        axios.put(prefix + '/company/update', companyInfoToUpdate)
            .then(({ data }) => {
                this.setState({
                    ...this.state,
                    updatedCompanyInfo: { ...data.companyInfo },
                    companyInfo: { ...data.companyInfo },
                    touched: false,
                    needReset: true
                });
            });
    }

    addNewProduct = (product) => {
        axios
            .post(prefix + '/company/update/add-new-exist-product', { product })
            .then(r => {
                this.setState({
                    companyProducts: r?.data?.companyProducts ? [...r?.data?.companyProducts] : [...this.props.companyProducts]
                });
            });
    }

    render() {
        const user = this.props?.user || {};
        const companyProducts = this.state?.companyProducts || this.props?.companyProducts || [];
        const predefinedValues = this.props?.predefinedValues || {};
        const searchResults = this.props?.searchResults || '';
        const searchString = this.props?.searchString || '';
        const premiumUser = isPremiumUserSku(user);
        const {
            activeTab,
            touched,
            needReset,
            companyInfo
        } = this.state;

        return (
            <>
                <div className='header mod' id='header-section'>
                    <HeaderLayoutComponent user={user} />
                </div>
                <MainContent className='company-settings' user={user}>
                    <BreadcrumbsBlock />
                    <div className='company-settings__header'>
                        <h1 className='company-settings__header-title'>Update My Company Page</h1>
                        <div className='company-settings__tab-titles'>
                            <div
                                className={activeTab === TABS.profile ? 'company-settings__tab--active' : 'company-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.profile);
                                }}
                            >
                                {TABS.profile}
                            </div>
                            <div
                                className={activeTab === TABS.regulatoryInformation ? 'company-settings__tab--active' : 'company-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.regulatoryInformation);
                                }}
                            >
                                {TABS.regulatoryInformation}
                            </div>
                            <div
                                className={activeTab === TABS.productsList ? 'company-settings__tab--active' : 'company-settings__tab--non-active'}
                                onClick={() => {
                                    this.setActiveTab(TABS.productsList);
                                }}
                            >
                                {TABS.productsList}
                            </div>
                        </div>
                    </div>
                    <div className='company-settings__content'>
                        {activeTab === TABS.profile && <ProfileTab
                            premium={premiumUser}
                            companyInfo={companyInfo}
                            resetForm={needReset}
                            predefinedValues={predefinedValues}
                            onProfileDataChange={(companyInfo) => this.handleDataChange(companyInfo)}
                            onFormReset={() => this.handleFormReset()}
                            user={user}
                        />}
                        {activeTab === TABS.regulatoryInformation && <InspectionsTab
                            resetForm={needReset}
                            companyInfo={companyInfo}
                            onIspectionsChange={(companyInfo) => this.handleDataChange(companyInfo)}
                            onFormReset={() => this.handleFormReset()}
                            user={user}
                        />}
                        {activeTab === TABS.productsList && <ProductsTab
                            companyProducts={companyProducts}
                            searchResults={searchResults}
                            searchString={searchString}
                            addNewProduct={this.addNewProduct}
                            user={user}
                        />}
                    </div>
                    <div className='unlock-more-results-banner__wrapper-company-settings'>
                        <UnlockMoreResultsBanner user={user} page={companySettingsPPs.appString} />
                    </div>
                    {touched && (
                        <div className='company-settings__apply-changes-container'>
                            <SecondaryButton onClick={() => this.handleDiscardChange()}>
                                Discard Changes
                            </SecondaryButton>

                            <PrimaryButton onClick={() => this.handleSaveChange()}>
                                Save Changes
                            </PrimaryButton>
                        </div>)}
                </MainContent>
                <div className='footer' id='footer-section'>
                    <HorizonFooterComponent />
                </div>
            </>
        );
    }
}

CompanySettingsPage.propTypes = {
    activeTab: string,
    companyProducts: array,
    companyInfo: object,
    user: object,
    predefinedValues: object,
    searchResults: string,
    searchString: string
};

const mapStateToProps = (state, ownProps) => {
    return {
        companyProducts: state.companyReducer.companyProducts,
        companyInfo: state.companyReducer.companyInfo,
        user: state.userReducer.user,
        predefinedValues: state.companyReducer.predefinedValues,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        activeTab: state.userReducer.activeTab
    };
};

const mapDispatchToProps = dispatch => ({});

export const CompanySettingsContainer = connect(mapStateToProps, mapDispatchToProps)(CompanySettingsPage);
