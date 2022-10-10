'use strict';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PageHeader from './header';
import ConfirmLinkToCompanyModal from './confirm-link-to-company-modal';
import ConfirmLinkToUnknownCompanyModal from './confirm-link-to-unknown-company-modal';
import { FooterLayoutComponent } from '../layouts/footer';
import { getAppPrefix } from '../../public/js/common';
import { 
    ManufacturersDropdown,
    ManufacturersSearchFilter
} from '../company/add-edit-product/modals/manufacturers';
import { searchCompaniesByFilters } from '../../redux/merchantItemActions';
import { requestLinkToCompany } from '../../redux/userActions';

const ChooseUserCompany = ({
    user = {},
    searchCompaniesByFilters = () => null,
    requestLinkToCompany = () => null,
}) => {
    const [searchStr, setSearchStr] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [city, setCity] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [countries, setCountries] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);

    const [website, setWebsite] = useState('');
    const [comment, setComment] = useState('');
    const [unknownCompanyData, setUnknownCompanyData] = useState(null);

    const [showConfirmLinkToCompanyModal, setShowConfirmLinkToCompanyModal] = useState(false);
    const [showConfirmLinkToCompanyUnknownModal, setShowConfirmLinkToUnknownCompanyModal] = useState(false);

    const [hasRequestError, setHasRequestError] = useState(false);
    const [requestSuccessfullySent, setRequestSuccessfullySent] = useState(false);

    const handleSearchStrChange = (e) => {
        setSelectedCountry('');
        setCity('');
        setSelectedManufacturer(null);
        setSearchStr(e.target.value);
    }

    const onManufacturerClick = (e, company) => {
        setSelectedManufacturer(company);
        setShowConfirmLinkToCompanyModal(true);
    }

    const sendRequestLinkToCompany = () => {
        if (!selectedManufacturer) return;
        const { companyId } = selectedManufacturer;
        const data = companyId ? { companyId } : { unknownCompany: { ...unknownCompanyData } };
        requestLinkToCompany(data, ({ success }) => {
            if (!success) {
                setHasRequestError(true);
            } else {
                setRequestSuccessfullySent(true);
                hideConfirmLinkToCompanyModal();
            }
        });
    }

    const sendRequestLinkToUnknownCompany = (data) => {
        hideConfirmLinkToUnknownCompanyModal();
        setSelectedManufacturer({ companyName: [data.company] });
        setUnknownCompanyData(data);
        setShowConfirmLinkToCompanyModal(true);
    }

    const hideConfirmLinkToCompanyModal = () => {
        setShowConfirmLinkToCompanyModal(false);
        setHasRequestError(false);
        setUnknownCompanyData(null);
        setSelectedManufacturer(null);
    }

    const resetUnknownCompanyForm = () => {
        setHasRequestError(false);
        setSelectedCountry('');
        setCountries([]);
        setCity('');
        setCompanyName('');
        setSearchStr('');
        setWebsite('');
        setComment('');
    }

    const hideConfirmLinkToUnknownCompanyModal = () => {
        resetUnknownCompanyForm();
        setShowConfirmLinkToUnknownCompanyModal(false);
    }

    const handleCannotFindCompanyBtnClick = (e) => {
        resetUnknownCompanyForm();
        setShowConfirmLinkToUnknownCompanyModal(true);
        const filters = {
            keywords: '',
            country: '',
            city: ''
        }
        searchCompaniesByFilters(filters, ({ companies = [] , countries = [] }) => {
            setCountries(countries);
            if (selectedCountry && !countries.includes(selectedCountry)) {
                setSelectedCountry(null);
            }
        });
        e.preventDefault();
    }

    useEffect(() => {
        if (!showConfirmLinkToCompanyUnknownModal) {
            if (searchStr.length >= 1) {
                const filters = {
                    keywords: searchStr,
                    country: selectedCountry,
                    city: city
                }
                searchCompaniesByFilters(filters, ({ companies = [] , countries = [] }) => {
                    setCountries(countries);
                    if (selectedCountry && !countries.includes(selectedCountry)) {
                        setSelectedCountry(null);
                    }
                    $(".dropdown-options").niceScroll({
                        cursorcolor: "#9D9D9C",
                        cursorwidth: "6px",
                        cursorborderradius: "5px",
                        cursorborder: "1px solid transparent",
                        touchbehavior: true,
                    });
                });
            } else {
                setCountries([]);
                setSuggestions([]);
            }
        }
    }, [searchStr, selectedCountry, city])

    const showBackdrop = showConfirmLinkToCompanyModal || showConfirmLinkToCompanyUnknownModal;

    return (
        <>
            {
                !requestSuccessfullySent &&
                <>
                    <PageHeader 
                        title='Select Your Company'
                        currentStep={2}
                    />
                    <div className="landing-login" id="buyerOptions">
                        <div className="company-tab full-width">
                            <ManufacturersSearchFilter
                                showCompanyNameLabel
                                countriesDropdownPlaceholder='Select From The List'
                                searchStr={searchStr}
                                selectedCountry={selectedCountry}
                                city={city}
                                countries={countries}
                                handleSearchStrChange={handleSearchStrChange}
                                handleSelectedCountryChange={(e) => setSelectedCountry(e.target.value)}
                                handleCityInputChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <span className="with-links pull-left">
                            Can't find your company? &nbsp;
                            <a className="skip-style" href="#" onClick={handleCannotFindCompanyBtnClick}>Let us know.</a>
                        </span>
                        <a className="skip-style pull-right"  href={`${getAppPrefix()}/`}>Skip step</a>
                    </div>
                    <ManufacturersDropdown
                        suggestions={suggestions}
                        onOptionClick={onManufacturerClick}
                        showDropdownHeader
                    />
                    <div className="footer fixed" id="footer-section">
                        <FooterLayoutComponent user={user} />
                    </div>
                    <ConfirmLinkToCompanyModal 
                        showModal={showConfirmLinkToCompanyModal}
                        onHideModal={hideConfirmLinkToCompanyModal}
                        selectedManufacturer={selectedManufacturer}
                        onConfirm={sendRequestLinkToCompany}
                        hasRequestError={hasRequestError}
                    />
                    <ConfirmLinkToUnknownCompanyModal
                        showModal={showConfirmLinkToCompanyUnknownModal}
                        onHideModal={hideConfirmLinkToUnknownCompanyModal}
                        onConfirm={sendRequestLinkToUnknownCompany}
                        companyName={companyName}
                        selectedCountry={selectedCountry}
                        city={city}
                        countries={countries}
                        handleCompanyNameChange={(e) => setCompanyName(e.target.value)}
                        handleSelectedCountryChange={(e) => setSelectedCountry(e.target.value)}
                        handleCityInputChange={(e) => setCity(e.target.value)}
                        website={website}
                        handleWebsiteChange={(e) => setWebsite(e.target.value)}
                        comment={comment}
                        handleCommentChange={(e) => setComment(e.target.value)}
                    />
                    {showBackdrop && <div className='modal-backdrop in'></div>}
                </>
            }
            {
                requestSuccessfullySent &&
                <>
                    <PageHeader />
                    <div className="landing-login congrats">
                        <div>
                            <i className="icon icon-tick-green-large"></i>
                            <span className="congrats-title">Congratulations!</span>
                            <span className="congrats-message">
                                Your request has been submitted successfully.
                                <br />
                                You will receive email confirmation in 1-2 business days.
                            </span>
                        </div>
                        <div className="intrest-area text-center">
                            <span className="congrats-span-message">
                                Until then, you can still access
                                <br/>
                                Cortellis Supply Chain Network with some limitations.
                            </span>
                            <a className="purple-btn" href={`${getAppPrefix()}/`}>Access Now</a>
                        </div>
                    </div>
                    <div className="footer fixed" id="footer-section">
                        <FooterLayoutComponent user={user} />
                    </div>
                </>
            }
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        user: state.userReducer.user,
    }; 
}

const mapDispatchToProps = (dispatch) => {
    return {
        searchCompaniesByFilters: (filters, callback) => dispatch(searchCompaniesByFilters(filters, callback)),
        requestLinkToCompany: (data, callback) => dispatch(requestLinkToCompany(data, callback))
    };
}

const ChooseUserCompanyLayout = connect(
    mapStateToProps,
    mapDispatchToProps
)(ChooseUserCompany);

module.exports = {
    ChooseUserCompany,
    ChooseUserCompanyLayout
};
