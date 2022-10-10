import React from 'react';
import { connect } from 'react-redux';
import { omit } from 'lodash';
import { getAppPrefix } from '../../../public/js/common';
import { Search } from '../../../consts/search-categories';
import { productTabs } from '../../../consts/product-tabs';
import { typeOfSearchBlock } from '../../../consts/search-categories';
import UpgradeToPremiumTopBanner from '../../common/upgrade-to-premium-top-banner';
import { HeaderLayoutComponent } from '../../layouts/header/index';
import { FooterLayoutComponent } from '../../layouts/footer';
import BreadcrumbsComponent from '../../common/breadcrumbs';
import SearchPanel from '../../common/search-panel/index';
import AddEditProductHeader from './add-edit-product-header/index';
import AddEditProductMain from './add-edit-product-main/index';
import VerificationStatusModal from './modals/verification-status';
import DeleteRowModal from './modals/delete-row';
import DiscardChangesModal from './modals/discard-changes';
import SavedChangesModal from './modals/saved-changes';
import UploadDocumentModal from './modals/upload-document';
import IntermediatesAndReagentsModal from './modals/intermediates-and-reagents';
import ManufacturersModal from './modals/manufacturers';
import { ModalTypes } from '../../../consts/modal-types';
import { getUpgradeToPremiumPaymentLink, sendInviteColleaguesEmail } from '../../../redux/userActions';
import { 
    updateItemData,
    updateSelectedRowInfo,
    resetToInitialItemData,
    updateItem,
    createItem,
    searchCompaniesByFilters
} from '../../../redux/merchantItemActions';

import { 
    gotoSearchResultsPage,
    setSearchCategory,
    setSearchString,
    getSearchResults
} from '../../../redux/searchActions';

import { getCustomFieldValues, objectsEqual } from '../../../utils';

const { SEARCH_BY } = Search;
const { DOSE_FORM } = productTabs;

const { 
    VERIFICATION,
    DELETE,
    DISCARD_CHANGES,
    SAVED_CHANGES,
    UPLOAD_DOCUMENT,
    INTERMEDIATES_AND_REAGENTS,
    I_R_MANUFACTURERS,
    R_MANUFACTURERS,
} = ModalTypes;

const keysForShowActionButtons = [
    { name : 'documents', defaultValue: [] },
    { name : 'doseForms', defaultValue: [] },
    { name : 'alerts', defaultValue: { alert1: null, alert2: null } },
    { name : 'specialOffer', defaultValue: { value: null, note: ''} },
    { name : 'subsidaryType', defaultValue: '' },
    { name : 'countriesLaunched', defaultValue: [] },
];

class AddEditProductPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showVerificationModal: false,
            showDeleteModal: false,
            showDiscardChangesModal: false,
            showSavedChangesModal: false,
            showUploadDocumentModal: false,
            showIntermediatesAndReagentsModal: false,
            showIntermediateAndReagentManufacturersModal: false,
            showRawMaterialsManufacturersModal: false,
            onConfirmSavedChanges: () => null,
            newProduct: {
                productId: null,
                companyId: null,
                type: '',
                chemicalName: ''
            },
            subsidaryType: '',
            countriesLaunched: [],
            showActionButtons: false,
            successfullySaved: false,
            errorMessage: '',
            processing: false,
            documents: [],
            doseForms: [],
            alerts: { alert1: null, alert2: null },
            specialOffer: { value: null, note: ''},
            manufacturerOfIntermediatesActive: false,
            manufacturerOfRawMaterialsActive: false,
        }
        this.isEditPageType = props.pageType === 'EDIT_ITEM';
        this.updateModalVisibility = this.updateModalVisibility.bind(this);
        this.onAddDocument = this.onAddDocument.bind(this);
        this.onConfirmDelete = this.onConfirmDelete.bind(this);
        this.onCancelDelete = this.onCancelDelete.bind(this);
        this.onConfirmDiscard = this.onConfirmDiscard.bind(this);
        this.chooseProduct = this.chooseProduct.bind(this);
        this.updateItemData = this.updateItemData.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
    }

	getBreadCrumbValues() {
        return [
            {
                name: 'Company Settings',
                redirectUrl: '/company/settings'
            },
            {
                name: 'Product List',
                redirectUrl: '/company/settings?activeTab=Product List'
            },
            {
                name: this.isEditPageType ? 'Edit Product' : 'Add New Product'
            }
        ];
	}

    updateModalVisibility(type, value) {
        const { showVerificationModal, showDeleteModal } = this.state;

        const stateUpdate = {};
        switch (type) {
            case VERIFICATION:
                stateUpdate.showVerificationModal = value;
                break;
            case DELETE:
                stateUpdate.showDeleteModal = value;
                break;
            case DISCARD_CHANGES:
                stateUpdate.showDiscardChangesModal = value;
                break;
            case SAVED_CHANGES:
                stateUpdate.showSavedChangesModal = value;
                break;
            case UPLOAD_DOCUMENT:
                stateUpdate.showUploadDocumentModal = value;
                break;
            case INTERMEDIATES_AND_REAGENTS:
                stateUpdate.showIntermediatesAndReagentsModal = value;
                break;
                break;
            case I_R_MANUFACTURERS:
                stateUpdate.showIntermediateAndReagentManufacturersModal = value;
                break;
            case R_MANUFACTURERS:
                stateUpdate.showRawMaterialsManufacturersModal = value;
                break;
            default:
                break;
        }

        this.setState(stateUpdate);
        return;
    }

    onAddDocument(document) {
        const updatedDocuments = [...this.state.documents, { title: document.title, file: document.file }];
        this.handleStateChange('documents', updatedDocuments)
    }

    onConfirmDelete() {
        const { selectedRow, item } = this.props;
        const { code = '', id = null } = selectedRow;
        
        if (code) {
            if (code === 'documents') {
                this.setState({ documents: this.state.documents.filter((_, index) => index !== id) });
            } else if (code === 'doseForms') {
                this.setState({ doseForms: this.state.doseForms.filter((_, index) => index !== id) });
            } else {
                const { CustomFields = [] } = item;
                const customFieldValues = getCustomFieldValues(CustomFields, code);
                if (customFieldValues) {
                    const updatedFieldValues = customFieldValues.filter((_, index) => index !== id);
                    this.props.updateItemData(code, updatedFieldValues, true);
                    this.setState({ showActionButtons: true });
                }
            }
        }
        return;
    }

    onCancelDelete() {
        this.props.updateSelectedRowInfo();
    }

    onConfirmDiscard() {
        this.props.resetToInitialItemData();
        this.props.setSearchString('');
        keysForShowActionButtons.forEach(key => this.setState({ [key.name]: key.defaultValue }));
        this.setState({ showActionButtons: false });
    }

    validateChanges() {
        let errorMessage = '';
        let hasError = false;
        const { newProduct } = this.state;
        
        const hasEmpty = Object.values(newProduct).some(x => x === null || x === '' ||  x === undefined);
        if (!this.isEditPageType && hasEmpty) {
            errorMessage = 'Product must be selected.';
            hasError =  true;
        }

        const { CustomFields = [], Categories = [] } = this.props.item;
        const isDoseForm = Categories && Categories[0] && Categories[0].Name === DOSE_FORM.productType;
        if (isDoseForm) {
            errorMessage = 'Coming Soon.';
            hasError =  true;
        }

        const minPrice = getCustomFieldValues(CustomFields, 'price-min', 'Code');
        const maxPrice = getCustomFieldValues(CustomFields, 'price-max', 'Code');
        if (minPrice && maxPrice && maxPrice - minPrice < 0) {
            errorMessage = 'Price range must be valid.';
            hasError =  true;
        }

        const checkFilled = (rows = []) => {
            const filteredRows = rows.map((row) => omit(row, ['filingNo', 'verified']));
            return !filteredRows.find((row) => {
                return Object.keys(row).find(key => typeof row[key] === 'undefined' || row[key] === '');
            });
        };

        const registrationFilings = getCustomFieldValues(CustomFields, 'registrationFilings') || [];
        const gmpCertificates = getCustomFieldValues(CustomFields, 'gmpCertificates') || [];
        if (!checkFilled(registrationFilings) || !checkFilled(gmpCertificates)) {
            errorMessage = 'All fields for API Regulatory Filings and GMP Certificates must be completed before changes can be saved.';
            hasError =  true;
        }
        return { hasError, errorMessage };
    }

    handleSaveChanges() {
        const self = this;
        const { processing, newProduct } = this.state;
        if (processing) return;
        this.setState({ processing: true });

        const { hasError, errorMessage } = this.validateChanges();
        if (hasError) {
            this.setState({
                successfullySaved: !hasError,
                errorMessage: errorMessage,
                showSavedChangesModal: true,
                showActionButtons: false,
                processing: false
            });
        } else {
            if (this.isEditPageType) {
                this.props.updateItem(({ success }) => {
                    self.setState({
                        successfullySaved: success,
                        errorMessage: '',
                        showSavedChangesModal: true,
                        showActionButtons: !success,
                        processing: false
                    });
                });
            } else {
                this.props.createItem(newProduct, ({success}) => {
                    self.setState({
                        successfullySaved: success,
                        errorMessage: '',
                        showSavedChangesModal: true,
                        showActionButtons: !success,
                        processing: false,
                        onConfirmSavedChanges: () => window.location.href = `${getAppPrefix()}/company/settings?activeTab=Product List`
                    });
                });
            }
        }
    }

    handleStateChange(key, value) {
        this.setState({ [key]: value });
        const keyNamesForShowActionButtons = keysForShowActionButtons.map(k => k.name);
        if (keyNamesForShowActionButtons.includes(key)) {
            this.setState({ showActionButtons: true });
        }
    }

    chooseProduct(productName) {
        const companyId = this.props?.user?.companyInfo?.id;
        const products = this.props.searchResults?.products || [];
        const searchResultProduct = products.find((product) => product.name === productName);
        const productType =  searchResultProduct?.productType || null;
        const newProduct = {
            productId: searchResultProduct?.dictId || null,
            chemicalName: searchResultProduct?.name || null,
            type: productType === 'API' ? 'Api' : productType,
            companyId: companyId || null,
        }

        this.setState({ newProduct });
        this.props.updateItemData('Name', productName);
        this.props.setSearchString('');
    }

    updateItemData(code, value, isCustomField = false) {
        this.props.updateItemData(code, value, isCustomField);
        if (!objectsEqual(this.props.item, this.props.referenceItem)) {
            this.setState({ showActionButtons: true });
        }
    }

	render() {
        const { 
            showVerificationModal,
            showDeleteModal,
            showDiscardChangesModal,
            showSavedChangesModal,
            showUploadDocumentModal,
            showIntermediatesAndReagentsModal,
            showIntermediateAndReagentManufacturersModal,
            showRawMaterialsManufacturersModal,
            showActionButtons,
            successfullySaved,
            errorMessage,
            processing,
            specialOffer,
            alerts,
            documents,
            doseForms,
            subsidaryType,
            countriesLaunched,
            onConfirmSavedChanges,
            manufacturerOfIntermediatesActive,
            manufacturerOfRawMaterialsActive
        } = this.state;

        const { CustomFields = [] } = this.props.item || {};
        const intermediates = getCustomFieldValues(CustomFields, 'upstreamSupply-intermediates', 'Code') || [];
        const intermediateReagentManufacturers = getCustomFieldValues(CustomFields, 'upstreamSupply-intermediateReagentManufacturers', 'Code') || [];
        const rawMaterialManufacturers = getCustomFieldValues(CustomFields, 'upstreamSupply-rawMaterialManufacturers', 'Code') || [];

		return (
            <>
                <UpgradeToPremiumTopBanner 
                    user={this.props.user}
                    getUpgradeToPremiumPaymentLink={this.props.getUpgradeToPremiumPaymentLink}
                />
                <div className="header mod" id="header-section">
                    <HeaderLayoutComponent 
                        user={this.props.user}
                        sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail}
                    />
                </div>
                <div className="main">
                    <BreadcrumbsComponent
                        trails={this.getBreadCrumbValues()}
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
                        <AddEditProductHeader 
                            user={this.props.user}
                            predefinedValues={this.props.predefinedValues}
                            item={this.props.item}
                            updateItemData={this.updateItemData}
                            getSearchResults={this.props.getSearchResults}
                            isEditPageType={this.isEditPageType}
                            chooseProduct={this.chooseProduct}
                            handleStateChange={this.handleStateChange}
                            resetToInitialItemData={this.props.resetToInitialItemData}
                        />
                        <AddEditProductMain 
                            isEditPageType={this.isEditPageType}
                            user={this.props.user}
                            predefinedValues={this.props.predefinedValues}
                            item={this.props.item}
                            updateModalVisibility={this.updateModalVisibility}
                            referenceItem={this.props.referenceItem}
                            updateItemData={this.updateItemData}
                            updateSelectedRowInfo={this.props.updateSelectedRowInfo}
                            handleStateChange={this.handleStateChange}
                            alerts={alerts}
                            specialOffer={specialOffer}
                            documents={documents}
                            doseForms={doseForms}
                            subsidaryType={subsidaryType}
                            countriesLaunched={countriesLaunched}
                            manufacturerOfIntermediatesActive={manufacturerOfIntermediatesActive}
                            manufacturerOfRawMaterialsActive={manufacturerOfRawMaterialsActive}
                        />
                    </div>
                    {
                        showActionButtons &&
                        <div id="action-buttons" className="action-buttons">
                            <div 
                                className="btn-gray"
                                onClick={() => !processing ? this.updateModalVisibility(DISCARD_CHANGES, true) : null}
                            >
                                Discard Changes
                            </div>
                            <div 
                                className={`btn-blue ${(processing && 'disabled') || ''}`}
                                onClick={() => this.handleSaveChanges()}
                            >
                                Save Changes
                            </div>
                        </div>
                    }
                </div>
                <div className="footer grey" id="footer-section">
                    <FooterLayoutComponent user={this.props.user} />
                </div>
                <VerificationStatusModal 
                    showModal={showVerificationModal}
                    setShowModal={(value) => this.updateModalVisibility(VERIFICATION, value)}
                />
                <DeleteRowModal 
                    showModal={showDeleteModal}
                    setShowModal={(value) => this.updateModalVisibility(DELETE, value)}
                    onConfirmDelete={this.onConfirmDelete}
                    onCancelDelete={this.onCancelDelete}
                />
                <DiscardChangesModal
                    showModal={showDiscardChangesModal}
                    setShowModal={(value) => this.updateModalVisibility(DISCARD_CHANGES, value)}
                    onConfirmDiscard={this.onConfirmDiscard}
                />
                <SavedChangesModal
                    showModal={showSavedChangesModal}
                    setShowModal={(value) => this.updateModalVisibility(SAVED_CHANGES, value)}
                    onConfirmSavedChanges={onConfirmSavedChanges}
                    isEditPageType={this.isEditPageType}
                    success={successfullySaved}
                    errorMessage={errorMessage}
                />
                <UploadDocumentModal
                    showModal={showUploadDocumentModal}
                    setShowModal={(value) => this.updateModalVisibility(UPLOAD_DOCUMENT, value)}
                    onAddDocument={this.onAddDocument}
                />
                <IntermediatesAndReagentsModal
                    id='intermediatesAndReagents'
                    showModal={showIntermediatesAndReagentsModal}
                    setShowModal={(value) => this.updateModalVisibility(INTERMEDIATES_AND_REAGENTS, value)}
                    data={intermediates}
                    updateItemData={this.updateItemData}
                    getSearchResults={this.props.getSearchResults}
                />
                <ManufacturersModal
                    id='upstreamSupply-intermediateReagentManufacturers'
                    showModal={showIntermediateAndReagentManufacturersModal}
                    setShowModal={(value) => this.updateModalVisibility(I_R_MANUFACTURERS, value)}
                    data={intermediateReagentManufacturers}
                    updateItemData={this.updateItemData}
                    searchCompaniesByFilters={this.props.searchCompaniesByFilters}
                />
                <ManufacturersModal
                    id='upstreamSupply-rawMaterialManufacturers'
                    showModal={showRawMaterialsManufacturersModal}
                    setShowModal={(value) => this.updateModalVisibility(R_MANUFACTURERS, value)}
                    data={rawMaterialManufacturers}
                    updateItemData={this.updateItemData}
                    searchCompaniesByFilters={this.props.searchCompaniesByFilters}
                />
            </>
		)
	}
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user,
        predefinedValues: state.uploadEditItemReducer.predefinedValues,
        item: state.uploadEditItemReducer.item,
        referenceItem: state.uploadEditItemReducer.referenceItem, //contains unchanged product info
        pageType: state.uploadEditItemReducer.pageType,
        selectedRow: state.uploadEditItemReducer.selectedRow,
        searchResults: state.searchReducer.searchResults,
        searchString: state.searchReducer.searchString,
        searchCategory: state.searchReducer.searchCategory,
    };
};
       
const mapDispatchToProps = dispatch => ({
    getUpgradeToPremiumPaymentLink: (callback) => dispatch(getUpgradeToPremiumPaymentLink(callback)),
    updateItemData: (key, value, isCustomField) => dispatch(updateItemData(key, value, isCustomField)),
    updateSelectedRowInfo: (code, id) => dispatch(updateSelectedRowInfo(code, id)),
    resetToInitialItemData: () => dispatch(resetToInitialItemData()),
    setSearchString: (searchString, searchBy, productType, stringCountToTriggerSearch = 1) => dispatch(setSearchString(searchString, searchBy, productType, stringCountToTriggerSearch)),
    getSearchResults: (searchString, searchBy, productType, callback) => dispatch(getSearchResults(searchString, searchBy, productType, callback)),
    updateItem: (callback) => dispatch(updateItem(callback)),
    createItem: (newProduct, callback) =>  dispatch(createItem(newProduct, callback)),
    searchCompaniesByFilters: (filters, callback) => dispatch(searchCompaniesByFilters(filters, callback)),
    setSearchCategory: (category) => dispatch(setSearchCategory(category)),
    sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
    gotoSearchResultsPage: (searchString, searchBy, ids) => dispatch(gotoSearchResultsPage(searchString, searchBy, ids)),
});

const AddEditProductContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AddEditProductPage);

module.exports = {
    AddEditProductContainer,
    AddEditProductPage,
};