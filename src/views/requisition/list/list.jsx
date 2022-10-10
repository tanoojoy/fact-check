'use strict'; 

const React = require('react');
var BaseComponent = require('../../shared/base');
const Moment = require('moment');

class RequisitionComponent extends BaseComponent {

    componentDidMount() {
        const self = this;
    }

    render() {
        const self = this;
        const { requisitions } = self.props || [];

        return (
            <div className="subaccount-data-table table-responsive">
                <table className="table order-data1 sub-account clickable">
                    <thead>
                        <tr>
                            <th>Requisition No.</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Requestor Name</th>
                            <th>Supplier</th>
                            <th>Department Name</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            requisitions.map(function (requisition) {
                                const metadata = JSON.parse(requisition.MetaData);
                                return (
                                    <tr key={requisition.ID} className="account-row " data-key="item" data-id={requisition.ID}>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`}>{requisition.CosmeticNo != null && requisition.CosmeticNo != "" ? requisition.CosmeticNo : requisition.RequisitionOrderNo}</a></td>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`} style={{fontWeight: '400'}}>{self.formatDateTime(requisition.CreatedDateTime)}</a></td>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`} style={{fontWeight: '400'}}>{requisition.Status}</a></td>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`} style={{fontWeight: '400'}}>{requisition.RequestorName}</a></td>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`} style={{fontWeight: '400'}}>{requisition.SupplierName}</a></td>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`} style={{fontWeight: '400'}}>{metadata && metadata.Department ? metadata.Department.Name : ''}</a></td>
                                        <td><a href={`/requisition/detail?id=${requisition.ID}`} style={{fontWeight: '400'}}>{metadata && metadata.Workflow ? metadata.Workflow.Reason : ''}</a></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

module.exports = RequisitionComponent;