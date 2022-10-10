'use strict';
const React = require('react');

class AddressSettingsButton extends React.Component {

    redirectTo() {
        if (this.isMerchant() === false) {
            this.props.updateUserToOnboard(this.props.user.Onboarded);
        } else {
            $('.nav-pills > .active').next('li').find('a').trigger('click');
        }
    }

    isMerchant() {
        if (this.props.user.Roles) {
            const temp = this.props.user.Roles.filter(x => x.toLowerCase() === 'merchant' || x.toLowerCase() === 'submerchant');
            if (temp.length > 0) return true;
        }
        return false;
    }

    render() {
        return (
            <div className="settings-button">
                <div className="btn-previous pull-left" onClick={(e) => { $('.nav-pills a:first').tab('show'); }}>Previous</div>
                <div className="btn-save pull-right" onClick={(e) => this.redirectTo()}>{this.isMerchant() ? 'Next' : 'Save'}</div>
            </div>
        )
    }
}

module.exports = AddressSettingsButton;