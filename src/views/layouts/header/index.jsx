'use strict';
import React from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

import LeftNavigationMenu from './left-nav/index';
import RightNavigationMenu from './right-nav/index';

import commonModule from '../../../public/js/common';

import { sendInviteColleaguesEmail } from '../../../redux/userActions';
import { updateUnreadIndicator } from '../../../redux/inboxAction';
import { getLogoutUrl } from '../../../redux/accountAction';

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class HeaderLayoutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: ''
        };
    }

    componentDidMount() {        
        if (typeof window !== 'undefined') {
            if (this.props.user && typeof this.props.updateUnreadIndicator === 'function') {
                this.props.updateUnreadIndicator();
            }

            if (window.location.search !== '') {
                let keyword = window.location.search.split('keywords=')[1];
                if (keyword === undefined) {
                    keyword = '';
                } else {
                    keyword = window.location.search.split('keywords=')[1].split('&')[0];
                }
                this.setState({ keyword: keyword });
            }
            this.bindWindowClick();
            commonModule.init();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        commonModule.initHeaderMenuScroll();
    }

    bindWindowClick() {
        const $menu = $('.h-st-menus');
        $(document).mouseup(e => {
            if (!$menu.is(e.target) && $menu.has(e.target).length === 0) {
                $menu.hide();
            }
        });
        $(window).on('click', function(e) {
            $('.h-dd-menu').hide();
        });

        $(".h-dd-menu").on("click", function(event){
            event.stopPropagation();
        });
    }

    render() {
        const { user, hasUnreadMessages, customContainerClass = '' } = this.props;
        return (
            <div className='header-top'>
                <div className={customContainerClass || 'container'}>
                    <LeftNavigationMenu />
                    <RightNavigationMenu
                        user={user}
                        hasUnreadMessages={hasUnreadMessages}
                        sendInviteColleaguesEmail={this.props.sendInviteColleaguesEmail}
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        hasUnreadMessages: state.inboxReducer.hasUnreadMessages,
    }; 
}

function mapDispatchToProps(dispatch) {
    return {
        getLogoutUrl: (callback) => dispatch(getLogoutUrl(callback)),
        updateUnreadIndicator: () => dispatch(updateUnreadIndicator()),
        sendInviteColleaguesEmail: (data, callback) => dispatch(sendInviteColleaguesEmail(data, callback)),
    };
}

const HeaderLayout = connect(
    mapStateToProps,
    mapDispatchToProps
)(HeaderLayoutComponent);

module.exports = {
    HeaderLayout,
    HeaderLayoutComponent
};
