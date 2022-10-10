'use strict';

const React = require('react');
const ReactRedux = require('react-redux');
const PaginationComponent = require('../common/pagination');
const BaseComponent = require('../shared/base');

class PageLogDetailsComponent extends BaseComponent {
    renderMessages() {
        const self = this;
        if (this.props.messages != null && this.props.messages.length > 0) {
            var html = this.props.messages.map(function (message) {
                return (
                    <tr key={message.ID}>
                        <td>{self.formatDateTime(message.StartDateTime, process.env.DATETIME_FORMAT)}</td>
                        <td> {message.EndDateTime!==null? self.formatDateTime(message.EndDateTime, process.env.TIME_FORMAT):''}</td>
                        <td>{message.PageUrl}</td>
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
                                    <th>Page URL</th>
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

module.exports = PageLogDetailsComponent;
