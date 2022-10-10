'use strict';
var React = require('react');
import BaseComponent from '../../shared/base';

class CompanySettingsTeamComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const { subsAccounts } = this.props;
        console.log('this.props CompanySettingsFollowedCompanies', this.props);
        return (
            <div id="Team" className="tab-pane fade ">
                <h6 className="tiny-title"></h6>
                <div className="company-section">
                    <div className="pull-left">
                        <h4>7 Team Members Total</h4>
                    </div>
                    <div className="pull-right">
                        {/*<a href="javascript:void(0)" class="invite-colleague-btn"><i class="icon icon-cross-pale-blue"></i>Invite Colleague</a>*/}
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th width="50">#</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Access Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                subsAccounts && subsAccounts.map((acct, index) => {
                                    const role = acct.role.includes('Buyer') ? 'Buyer' : 'Seller';
                                    return (
                                        <tr>

                                            <td><div className="table-box"><span class="grey-col">{index + 1}</span></div></td>
                                            <td><div className="table-box">{acct.email}</div></td>
                                            <td><div className="table-box">{role}</div></td>
                                            <td>
                                                <div className="table-box">
                                                    {acct.sku === 'Premium' ? acct.sku : (<a href="https://clarivate.com/products/biopharma/cortellis-supply-chain-network/pricing/" class="upgrade-btn">Upgrade Options Available</a>) }
                                                </div>
                                            </td>
                                        </tr>                                        
                                    )
                                })
                            }
                        </tbody>

                    </table>

                </div>



            </div>
        )
    }    
}

module.exports = CompanySettingsTeamComponent;