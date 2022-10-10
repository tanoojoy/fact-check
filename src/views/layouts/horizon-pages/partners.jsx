import React from 'react';
import { connect } from 'react-redux';
import { HeaderLayoutComponent } from '../header';
import HorizonFooterComponent from '../horizon-components/footer';
import MainContent from '../horizon-components/main-content';

export const Partners = (props) => (
    <>
        <div className='header mod' id='header-section'>
            <HeaderLayoutComponent user={props.user} />
        </div>

        <MainContent user={props.user}>
            <h1>Partners</h1>
            <pre>{JSON.stringify(props.user, undefined, 2)}</pre>
        </MainContent>

        <div className='footer' id='footer-section'>
            <HorizonFooterComponent />
        </div>
    </>
);

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.userReducer.user
    };
};

const mapDispatchToProps = (dispatch) => {};

export const PartnersLayout = connect(mapStateToProps, mapDispatchToProps)(Partners);
