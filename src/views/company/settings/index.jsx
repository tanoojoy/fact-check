'use strict';

var React = require('react');
var ReactRedux = require('react-redux');
require('daterangepicker');

import BaseComponent from '../../shared/base';
var CompanySettingsProfileComponent = require('./profile');
var companyActions = require('../../../redux/companyActions');
import { typeOfSearchBlock } from '../../../consts/search-categories';
import SearchPanel from '../../common/search-panel/index';
import { HeaderLayoutComponent as HeaderLayout } from '../../../views/layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import CompanySettingsRegulatoryInfoComponent from './regulartory-info';
import CompanySettingsProductListComponent from './product-list';
import CompanySettingsTeamComponent from './team';
import { getUpgradeToPremiumPaymentLink, sendInviteColleaguesEmail } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import { US_FDA_LABEL, US_FDA_MAPPING } from '../../../consts/us-fda';
import UnlockMoreResultsBanner from '../../common/unlock-more-results';
import { isFreemiumUserSku } from '../../../utils';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class CompanySettingsIndexComponent extends BaseComponent {
    
    constructor(props) {
        super(props);

        this.state = {
            showActionButtons: false,
            activeTab: props.activeTab || 'Profile'
        }

        this.trails = [{name: 'Home', redirectUrl: '/'}, {name: 'Company Settings', redirectUrl: ''}]
    }

    componentDidMount() {
        let activeTab = '';
        let addActiveTab = false;
        if (this.props.activeTab) {
            activeTab = this.props.activeTab;
        }
        else {
            activeTab = 'Profile';
            addActiveTab = true;
        }
        switch (activeTab) {
            case 'Profile':
                $('#profile-tab').click();
                break;
            case 'Regulatory Information':
                $('#regulatory-information-tab').click();
                break;
            case 'Product List':
                $('#product-list-tab').click();
                break
            case 'Team':
                $('#team-tab').click();
                break;
        }
        if (addActiveTab) {
            this.addActiveTabToUrl(activeTab);
        }
        const self = this;
        $('.mainTab').click(function () {
            console.log('this');
            const query = $(this).data('query')
            self.addActiveTabToUrl(query);
        });
        //$('.advanced-select .parent-check input[type=checkbox]').on('change', function (e) {
        //    var $this = $(this);
        //    var $ul = $this.parents('ul');
        //    if ($this.is(":checked")) {
        //        $ul.find('input[type=checkbox]').prop("checked", true);
        //    } else {
        //        $ul.find('input[type=checkbox]').prop("checked", false);
        //    }
        //});

        ////sub with parent
        //$('.advanced-select .has-sub > .x-check  input[type=checkbox]').on('change', function (e) {
        //    var $this = $(this);
        //    var $ul = $this.parents('li.has-sub');
        //    if ($this.is(":checked")) {
        //        $ul.find('input[type=checkbox]').prop("checked", true);
        //    } else {
        //        $ul.find(' input[type=checkbox]').prop("checked", false);
        //    }
        //});

        ////Serching
        //$('.advanced-select .q').on('keyup', function () {
        //    var input, filter, ul, li, a, i;
        //    input = $(this);
        //    filter = $.trim(input.val().toLowerCase());
        //    div = input.parents('.dropdown').find('.dropdown-menu');
        //    div.find("li:not(.skip-li)").each(function () {
        //        var $this = $(this).find('label');
        //        if ($this.text().toLowerCase().indexOf(filter) > -1) {
        //            $this.parents('li').show();
        //        } else {
        //            $this.parents('li').hide()
        //        }
        //    })
        //});

        ////Count on ready
        //$('.advanced-select .x-check:not(.parent-check) input[type=checkbox]').trigger('change');

        //Prevent dropdown to close
        $('.advanced-select .dropdown').on('hide.bs.dropdown', function () {
            return false;
        });

        //
        //$('.advanced-select .x-clear').click(function () {
        //    var $this = $(this);
        //    $this.parents('.advanced-select').find('.x-check.parent-check input[type=checkbox]').prop('checked', false).trigger('change');
        //});

        //Close dropdown to click outside
        $('body').on('click', function (e) {
            var $target = $(e.target);
            if (!($target.hasClass('.advanced-select') || $target.parents('.advanced-select').length > 0)) {
                $('.advanced-select .dropdown').removeClass('open');
            }
        });

        $('.advanced-select .trigger').on('click', function () {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
            } else {
                $('.advanced-select .dropdown.open').removeClass('open');
                $(this).parents('.advanced-select').find('.btn-toggle').dropdown('toggle');
            }
        });

        //Toggle sub items
        $('.advanced-select li.has-sub .toggle-sub').on('click', function (e) {
            var $this = $(this);
            //$this.parents('.dropdown').addClass('open--');
            var $icon = $this.find('.x-arrow');
            var $ul = $this.next('.sub-items');
            $ul.slideToggle();
            //console.log( $this.parents('.dropdown').length );
            $this.parents('.dropdown').addClass('open');
            if ($icon.hasClass('x-arrow-down')) {
                $icon.removeClass('x-arrow-down');
                $icon.addClass('x-arrow-up');
            } else {
                $icon.removeClass('x-arrow-up');
                $icon.addClass('x-arrow-down');
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.userDetailsKey !== this.props.userDetailsKey) {
            this.showButtonGroup(false);
        }
    }

    addActiveTabToUrl = (query) => {
        this.setState({
            activeTab: query
        }, () => {
            const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?activeTab=${query}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        });

        //if (history.pushState) {
        //    const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?activeTab=${this.state.activeTab}`;
        //    window.history.pushState({ path: newUrl }, '', newUrl);
        //}
    }

    saveCompanyProfile = (e) => {
        if (this.companySettingsProfileComponentRef.validateFields()) return;
        let companyInfo = this.companySettingsProfileComponentRef.getCompanyInfo();
        let [otherInfo] = companyInfo.CustomFields;
        const updatedInspectionsInfo = this.companySettingsRegulatoryInfoComponentRef.getInspectionsInfo();
        let usFDA = {
            agencyName: 'US FDA',
            inspectionDate: ''
        }
        const usFDAMap = updatedInspectionsInfo.fdaMapping.find(ins => ins.inspection === US_FDA_LABEL.FDA_INSPECTION);
        if (usFDAMap) {
            usFDA.inspectionDate = usFDAMap.inspectionDate;
        }        
        otherInfo.inspectionsInfo = [
            usFDA,
            ...updatedInspectionsInfo.otherInspectionsMapping.map(oth => {
                return {
                    agencyName: oth.inspection,
                    inspectionDate: oth.inspectionDate
                }
            })
        ];
        const gdufaFeeMap = updatedInspectionsInfo.fdaMapping.find(ins => ins.inspection === US_FDA_LABEL.GDUFA_FEE_PAYMENT);
        if (gdufaFeeMap) {
            otherInfo.gdufaFeePaymentYear = gdufaFeeMap.inspectionDate ? new Date(gdufaFeeMap.inspectionDate).getFullYear() : null;
        }
        const facultyRegMap = updatedInspectionsInfo.fdaMapping.find(ins => ins.inspection === US_FDA_LABEL.SELF_IDENTIFIED_REGISTRATION);
        if (facultyRegMap) {
            otherInfo.facultyRegistrationDate = facultyRegMap.inspectionDate ? new Date(facultyRegMap.inspectionDate) : new Date(null).toISOString();
        }
        const fdaWarningMap = updatedInspectionsInfo.fdaMapping.find(ins => ins.inspection === US_FDA_LABEL.FDA_WARNING_LATTER);
        if (fdaWarningMap) {
            otherInfo.fdaWarningLetterDate = fdaWarningMap.inspectionDate ? new Date(fdaWarningMap.inspectionDate) : null;
        }
        const filesList = otherInfo.filesList;
        this.props.updateCompanyInfo(companyInfo, filesList);
    }

    disregardCompanyProfileChanges = (e) => {        
        this.companySettingsProfileComponentRef.discardCompanyInfoChanges();
        this.companySettingsRegulatoryInfoComponentRef.disregardRegulartoryInfoChanges();
        this.showButtonGroup(false);
    }

    showButtonGroup = (show) => {
        this.setState({
            showActionButtons: show
        });
    }

    render() {
        console.log('CompanySettingsIndexComponent', this.props);
        const { companyInfo, subsidiaryTypes, predefinedAlerts, contractManufacturingOrganizationList, otherServices, companyProducts, manufacturerCapabilities, countries, subsAccounts, userDetailsKey } = this.props;
        const otherInfo = companyInfo.CustomFields[0];
        const isFreemium = isFreemiumUserSku(this.props.user);
        
        return(
            <React.Fragment>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className='header mod' id='header-section'>
                    <HeaderLayout user={this.props.user} sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail} />
                </div>

                <div className="main" style={{paddingTop: '95px'}}>        
                    <BreadcrumbsComponent 
                        trails={this.trails}
                    />
                    <SearchPanel
                        type={typeOfSearchBlock.HEADER}
                        searchCategory={this.props.searchCategory}
                        searchResults={this.props.searchResults}
                        searchString={this.props.searchString}
                        setSearchCategory={this.props.setSearchCategory}
                        gotoSearchResultsPage={this.props.gotoSearchResultsPage}
                        setSearchString={this.props.setSearchString}
                    />   
                    <div className="settings-container">
                        <div className="settings-tab-container">
                            <div className="container">
                                <div className="settings-content">
                                    <div className="setting-top"> <span className="h-text">Update My Company Page</span>
                                        <div className="setting-tab pull-left">
                                            <ul className="nav nav-pills">
                                                <li className="active"><a data-toggle="tab" href="#Profile" id='profile-tab' className='mainTab' data-query='Profile'>Profile</a></li>
                                                <li><a data-toggle="tab" href="#RegulatoryInformation" id='regulatory-information-tab' className='mainTab' data-query='Regulatory Information'>Regulatory Information</a></li>
                                                <li><a data-toggle="tab" href="#ProductList" id='product-list-tab' className='mainTab' data-query='Product List'>Products List</a></li>
                                                <li><a data-toggle="tab" href="#Team" id='team-tab' className='mainTab' data-query='Team'>Team</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="container tabs-container">
                            <div className="setting-bot clearfix">
                                <div className="tab-content">
                                    <CompanySettingsProfileComponent 
                                        companyInfo={companyInfo} 
                                        subsidiaryTypes={subsidiaryTypes} 
                                        predefinedAlerts={predefinedAlerts}
                                        contractManufacturingOrganizationList={contractManufacturingOrganizationList}
                                        otherServices={otherServices} 
                                        manufacturerCapabilities={manufacturerCapabilities}
                                        showButtonGroup={this.showButtonGroup}
                                        countries={countries}
                                        isFreemium={isFreemium}
                                        ref={(ref) => this.companySettingsProfileComponentRef = ref}
                                    />

                                    <CompanySettingsRegulatoryInfoComponent 
                                        otherInfo={otherInfo}
                                        showButtonGroup={this.showButtonGroup}
                                        userDetailsKey={this.props.userDetailsKey}
                                        ref={(ref) => this.companySettingsRegulatoryInfoComponentRef = ref}
                                    />

                                    <CompanySettingsProductListComponent 
                                        companyProducts={companyProducts}
                                    />

                                    <CompanySettingsTeamComponent
                                        subsAccounts={subsAccounts}
                                    />
                                </div>
                                <UnlockMoreResultsBanner
                                    user={this.props.user}
                                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                                    page={'companySettings'}
                                />
                            </div>

                        </div>

                    </div>

                    {
                        this.state.showActionButtons && 
                        (
                            <div className="action-buttons">
                                <div className="btn-gray" onClick={this.disregardCompanyProfileChanges}>Discard Changes</div>
                                <div className="btn-blue" onClick={this.saveCompanyProfile}>Save Changes</div>
                            </div>
                        )
                    }                    
                </div>
            
                <div className="footer-grey">
                    <FooterLayoutComponent user={this.props.user} />                    
                </div>
            </React.Fragment>
        )
        
    }
}

function mapStateToProps(state) {
    return {
        user: state.userReducer.user,
        companyInfo: state.userReducer.userDetails,
        userDetailsKey: state.userReducer.userDetailsKey,
        subsidiaryTypes: state.companyReducer.predefinedValues.subsidiaryTypes, 
        predefinedAlerts: state.companyReducer.predefinedValues.predefinedAlerts,
        contractManufacturingOrganizationList: state.companyReducer.predefinedValues.contractManufacturingOrganizationList,
        otherServices: state.companyReducer.predefinedValues.otherServices, 
        companyProducts: state.userReducer.userDetails.companyProducts, 
        manufacturerCapabilities: state.companyReducer.predefinedValues.manufacturerCapabilities, 
        countries: state.companyReducer.predefinedValues.countries,
        subsAccounts: state.userReducer.subsAccounts,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateCompanyInfo: (companyInfo, filesList) => dispatch(companyActions.updateCompanyInfo(companyInfo, filesList)),
        getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
    }
}

const CompanySettingsIndex = ReactRedux.connect(
    mapStateToProps, 
    mapDispatchToProps
)(CompanySettingsIndexComponent);

module.exports = {
    CompanySettingsIndex, 
    CompanySettingsIndexComponent
}