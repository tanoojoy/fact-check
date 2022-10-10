'use strict';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { userRoles } from '../../consts/horizon-user-roles';
import { getAppPrefix } from '../../public/js/common';
import ConfirmUserRoleModal from './confirm-user-role-modal';
import PageHeader from '../choose-user-company/header';
import { FooterLayoutComponent } from '../layouts/footer';
import { updateUserRole } from '../../redux/userActions';


const ChooseUserRole = ({
    user = null,
    updateUserRole = () => null
})  =>  {

    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const onRoleClick = (e, role) => {
        setSelectedRole(role);
        setShowModal(true);
        e.preventDefault();
    }

    const hideModal = () => {
        setSelectedRole(null);
        setShowModal(false);
    }

    const chooseUserRole = () => {
        if (!selectedRole) return;
        updateUserRole(selectedRole, (redirectUrl) => {
            hideModal();
            if (redirectUrl) window.location.href = redirectUrl;
        });
    }

    return (
        <>
            <PageHeader 
                title='Select Your Role'
                currentStep={1}
            />
            <div className="landing-login" id="landing-origin">
                <div className="btn-login-buyer">
                    <a href="#" onClick={(e) => onRoleClick(e, userRoles.subBuyer)}>
                        I am a Buyer
                        <br />
                        <span>Identify, assess and connect with potential suppliers</span>
                    </a>
                </div>
                <div className="btn-login-seller">
                    <a href="#" onClick={(e) => onRoleClick(e, userRoles.subMerchant)}>
                        I am a Seller
                        <br/>
                        <span>Manage your company profile and engage with buyers</span>
                    </a>
                </div>
                <a className="skip-style pull-right"  href={`${getAppPrefix()}/choice-user-company`}>Skip step</a>
                <div className="intrest-area text-center">
                    <a href={`${getAppPrefix()}/`}>Not yet a subscriber? Learn more</a>
                </div>
            </div>
            <div className="footer fixed" id="footer-section">
                <FooterLayoutComponent user={user} />
            </div>
            <ConfirmUserRoleModal
                showModal={showModal}
                selectedRole={selectedRole}
                onConfirm={chooseUserRole}
                onHideModal={hideModal}
            />
            {showModal && <div className='modal-backdrop in'></div>}
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
        updateUserRole: (role, callback) => dispatch(updateUserRole(role, callback))
    };
}


const ChooseUserRoleLayout = connect(
    mapStateToProps,
    mapDispatchToProps
)(ChooseUserRole);

module.exports = {
    ChooseUserRole,
    ChooseUserRoleLayout
};
