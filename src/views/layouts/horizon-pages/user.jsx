import React, { Component } from 'react';
import { connect } from 'react-redux';

export class UserInfo extends Component {
    render() {
        let lastName, email, active;
        if (this.props.userInfo) {
            ({ last_name: lastName, email, active } = this.props.userInfo);
        }
        return (
            <>
                <h1>User info</h1>
                <p>Last name:{lastName}</p>
                <p>Email:{email}</p>
                <p>Active:{ active && active.toString() }</p>
            </>
        );
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        userInfo: state.userReducer.userInfo
    };
};

export const UserInfoContainer = connect(mapStateToProps)(UserInfo);
