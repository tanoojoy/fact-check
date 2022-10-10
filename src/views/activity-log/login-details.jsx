'use strict';

const React = require('react');
const ReactRedux = require('react-redux');
const PaginationComponent = require('../common/pagination');
const BaseComponent = require('../shared/base');

class LoginDetailsComponent extends BaseComponent {

    getCityAndCountry(value, array) {
        if (value) {
            return array === 1 ? value.split(',')[1].split(':')[1] : value.split(',')[2].split(':')[1];
        }
    }

    renderMessages() {
        const self = this;
        if (this.props.messages != null && this.props.messages.length > 0) {
            var html = this.props.messages.map(function(message) {
                return (
                    <tr key={message.ID}>
                        <td>{self.formatDateTime(message.StartDateTime, process.env.DATETIME_FORMAT)}</td>
                        <td>{message.EndDateTime !== null ? self.formatDateTime(message.EndDateTime, process.env.TIME_FORMAT) : ''}</td>
                        <td>{self.getCityAndCountry(message.GeoLocation, 1)}</td>
                        <td>{self.getCityAndCountry(message.GeoLocation, 2)}</td>
                        <td>{message.Browser}</td>
                        <td>{message.UserID}</td>
                        <td>{message.Username}</td>
                    </tr>
                );
            });
            return html;
        }
        return <tr></tr>;
    }

    render() {
        const self = this;
        return (
            <React.Fragment>
                <div id='tab-login' className='tab-pane fade in active'>
                    <div className='subaccount-data-table'>
                        <table className='table order-data sub-account' id='tbl-login'>
                            <thead>
                                <tr>
                                    <th>Start Date Time</th>
                                    <th>End Date Time</th>
                                    <th>City</th>
                                    <th>Country</th>
                                    <th>Browser</th>
                                    <th>User ID</th>
                                    <th>Username</th>
                                </tr>
                            </thead>
                            <tbody>
                                {self.renderMessages()}
                            </tbody>
                        </table>

                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = LoginDetailsComponent;
