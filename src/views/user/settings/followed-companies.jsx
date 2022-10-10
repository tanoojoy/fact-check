'use strict';
var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
import { userRoles } from '../../../consts/horizon-user-roles';
import { getAppPrefix } from '../../../public/js/common';
import PaginationComponent from '../../common/pagination';

var $ = require('jquery');

class FollowedCompaniesSettingsComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        let companyToDisplay = [];
        if (props.extendedFollowerCompanies && props.extendedFollowerCompanies.followers) {
            companyToDisplay = this.getByPage(props.extendedFollowerCompanies.followers, 1, 5)
        }
        this.state = {
            page: 1,
            size: 5,
            companyToDisplay
        }
    }

    getCompanyByPage = (page) => {
        let { size } = this.state;
        const companyToDisplay = this.getByPage(this.props.extendedFollowerCompanies.followers, page, size);
        this.setState({
            page,
            companyToDisplay
        });
    }

    onPagingSizeChanged = (size) => {
        const companyToDisplay = this.getByPage(this.props.extendedFollowerCompanies.followers, 1, size);
        this.setState({
            page: 1,
            size,
            companyToDisplay
        });
    }

    getByPage = (companies, page, size) => {
        return companies.slice((page - 1) * size, (size * page));
    }

    render() {
        const { extendedFollowerCompanies } = this.props;
        const { page, size, companyToDisplay } = this.state;
        return (
            <div id="FollowedCompanies" class="tab-pane fade">
                <div className="company-section product-list">
                    {
                        extendedFollowerCompanies.count > 0 &&
                        (
                            <React.Fragment>
                                <div className="pull-left">
                                    <h4>{extendedFollowerCompanies.count} Companies Total</h4>
                                </div>
                
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th width="50">#</th>
                                            <th>Company Name</th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {companyToDisplay.map((item, index) => {
                                            return (
                                                <tr>
                                                    <td>
                                                        <div class="table-box"><span class="grey-col">{index + 1}</span></div>
                                                    </td>
                                                    <td>
                                                        <div class="table-box">
                                                            <a href={`${getAppPrefix()}/company/${item.companyId}`} class="product-name">{item.companyName}</a>
                                                        </div>
                                                    </td>
                                                    <td><div class="table-box"></div></td>
                                                    <td><div class="table-box"></div></td>
                                                    <td><div class="table-box"></div></td>
                                                </tr>
                                            )
                                        })}                                        
                                    </tbody>
                                </table>
                                <PaginationComponent
                                    key='paging-key'
                                    pagingId='followed-companies-paging'
                                    pageNumber={page}
                                    pageSize={size}
                                    totalRecords={extendedFollowerCompanies.count}
                                    onPageNumberClicked={this.getCompanyByPage}
                                    onPageSizeChanged={this.onPagingSizeChanged}
                                    ref={(ref) => this.pagingComponentRef = ref}
                                />
                            </React.Fragment>
                        )
                    }
                </div>
            </div>
        )
    }
}

module.exports = FollowedCompaniesSettingsComponent;