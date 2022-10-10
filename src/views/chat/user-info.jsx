'use strict';
var React = require('react');
var Moment = require('moment');
const CommonModule = require('../../public/js/common');

if (typeof window !== 'undefined') {
    var $ = window.$;
}

class ChatUserInformationComponent extends React.Component {

    constructor(props) {
        super(props);

        this.url = `${CommonModule.getAppPrefix()}/chat/inbox/requests-quotes`;
    }

    render() {
        const { userDetail } = this.props;
        return (
            <div className="section-chat" id="seller-detail">
                <div className="chat-offer-section">
                    <div className="chat-offer-navigation">
                        <a class="top-nav-close" href={this.url}>
                            <i class="icon icon-chat-arrow-back"></i>
                            <span class="mobi-nav-back-icon"></span>
                        </a>
                        <div className="chat-user-profile">
                            <span className="cname">{ userDetail.name}</span>
                            <span className="ccity">{ userDetail.address && userDetail.address.length > 0 ? userDetail.address[0] : '' }</span>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ChatUserInformationComponent;
