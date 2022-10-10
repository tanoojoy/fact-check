'use strict';

var React = require('react');
var ReactRedux = require('react-redux');
const CommonModule = require('../../../public/js/common');
import { typeOfSearchBlock } from '../../../consts/search-categories';

import BaseComponent from '../../shared/base';
import { HeaderLayoutComponent as HeaderLayout } from '../../../views/layouts/header/index';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner'
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';

import CompanyDetailsHeaderComponent from './header';
import CompanyDetailsOtherInfoComponent from './other-info';
import SendEmailModal, { EmailSentModal } from '../../common/send-email-modal';
import chatActions from '../../../redux/chatActions';
import userActions from '../../../redux/userActions';
import { sendInviteColleaguesEmail } from '../../../redux/userActions';
import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
} from '../../../redux/searchActions';
import { isFreemiumUserSku } from '../../../utils';

class CompanyDetailsIndexComponent extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            isSelfCompany: false,
            showSendCompanyProfileModal: false,
            isProcessingSendEmail: false,
            showEmailSentModal: false
        }

        this.trails = [{name: 'Home', redirectUrl: '/'}, {name: props.userDetails.name, redirectUrl: ''}]
    }

    componentDidMount() {
        const { user, userDetails } = this.props;
        const isSelfCompany = user.companyId == userDetails.id;
        this.setState({
            isSelfCompany
        });
    }

    shareCompanySendEmail = (data) => {
        const { emails, comment } = data;
        const { isProcessingSendEmail } = this.state;
        //, companyId, companyName
        if (isProcessingSendEmail) return;
        this.setState({
            isProcessingSendEmail: true
        });
        this.props.shareCompanySendEmail({
            emails: JSON.stringify(emails),
            comment,
            companyId: this.props.userDetails.id,
            companyName: this.props.userDetails.name
        }, () => {
            this.setState({
                isProcessingSendEmail: false,
                showEmailSentModal: true
            });
        });
    }

    setShowSendCompanyProfileModal = (show) => {
        this.setState({
            showSendCompanyProfileModal: show
        });
    }

    setShowEmailSentModal = (show) => {
        this.setState({
            showEmailSentModal: show
        });
    }

    toggleShareCompanyProfileModal = (show) => {
        this.setState({
            showSendCompanyProfileModal: show
        });
    }

    render() {
        const companyInfo = this.props.userDetails;   
        const { user } = this.props;
        const isFreemium = isFreemiumUserSku(user);
        const { isSelfCompany, showSendCompanyProfileModal, showEmailSentModal } = this.state;
        const { companyProducts, CustomFields } = companyInfo;
        return (
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
                    <div className="store-container">
                        <CompanyDetailsHeaderComponent 
                            companyInfo={companyInfo}
                            customFields={CustomFields}
                            isSelfCompany={isSelfCompany}
                            userInfo={user.userInfo}
                            createChat={this.props.createChat}
                            toggleShareCompanyProfileModal={this.toggleShareCompanyProfileModal}
                            followCompany={this.props.followCompany}
                        />
                        <CompanyDetailsOtherInfoComponent 
                            companyInfo={companyInfo}
                            companyProducts={companyProducts}
                            customFields={CustomFields}
                            isFreemium={isFreemium}
                            appPrefix={CommonModule.getAppPrefix()}
                            user={user}
                        />
                    </div>
                </div>
            
                <div className="footer-grey">
                    <FooterLayoutComponent user={this.props.user} />
                </div>

                {/*<CompanyDetailsShareCompanyModal show={showSendCompanyProfileModal} toggleShareCompanyProfileModal={this.toggleShareCompanyProfileModal} shareCompanySendEmail={this.shareCompanySendEmail} />*/}
                <SendEmailModal
                    id='shareCompany'
                    title='Share Company Profile'
                    cancelLabel='Cancel'
                    confirmLabel='Share'
                    defaultMessage={'Hello! I thought you might find this pharmaceutical company information useful. If you don\'t already have access to Cortellis Supply Chain Network, you can register for free to view this content.'}
                    showModal={showSendCompanyProfileModal}
                    setShowModal={this.setShowSendCompanyProfileModal}
                    onConfirm={this.shareCompanySendEmail}
                />
                <EmailSentModal
                    title='Share Company Profile'
                    successMessage='Company profile shared successfully.'
                    success={true}
                    showModal={showEmailSentModal}
                    setShowModal={this.setShowEmailSentModal}
                />
            </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return {        
        user: state.userReducer.user,
        userDetails: state.userReducer.userDetails,
        subAccounts: state.userReducer.subAccounts,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        createChat: (userClarivateId, arcadierUserId, twillioChatId, isInitiator, incomingCoId, outgoingCoId) => dispatch(chatActions.createChat(userClarivateId, arcadierUserId, twillioChatId, isInitiator, incomingCoId, outgoingCoId)),
        shareCompanySendEmail: (data, callback) => dispatch(userActions.shareCompanySendEmail(data, callback)),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
        followCompany: (data, callback) => dispatch(userActions.followCompany(data, callback)),
        setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 3) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
        setSearchCategory: (category) => dispatch(setSearchCategory(category)),
        gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
    }
}

const CompanyDetailsIndex = ReactRedux.connect(
    mapStateToProps, 
    mapDispatchToProps
)(CompanyDetailsIndexComponent);

module.exports = {
    CompanyDetailsIndex, 
    CompanyDetailsIndexComponent
}