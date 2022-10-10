'use strict';

const React = require('react');
if (typeof window !== 'undefined') { var $ = window.$; }

class WorkflowList extends React.Component {

    componentDidMount() {
        $('.not-approved').on('click', function() {
            var target = $(".popup-area.item-not-approved-popup");
            var cover = $("#cover");

            target.fadeIn();
            cover.fadeIn();
        });
    }

    handleDeleteWorkflow(id) {
        const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");

        target.fadeIn();
        cover.fadeIn();

        $(".my-btn.btn-saffron").attr('data-key', "item");
        $(".my-btn.btn-saffron").attr('data-id', id);
    }
    
    renderApprovalWorkflows() {
        if (this.props.workflows && this.props.workflows.TotalRecords && this.props.workflows.TotalRecords > 0) {
            const { Records } = this.props.workflows;
            if (Records && Records.length > 0) {
                return Records.map(r => 
                    <tr className="account-row" key={r.Id} data-key="item" data-id={r.Id}>
                        <td data-th="Reason"><a href={`/approval/workflows/${r.Id}`}>{r.Reason}</a></td>
                        <td className="text-center" data-th="No. of Workflow(s)">{r.WorkflowCount}</td>
                        <td className="action-cell" data-th="Action">
                            <div className="item-actions action-inline text-center">
                                <ul>
                                    <li>
                                        <a href="#" className="delete_item" data-id={r.Id} onClick={() => this.handleDeleteWorkflow(r.Id)}>
                                            <i className="fas fa-trash-alt" style={{ fontSize: '26px', color: '#999', textAlign: 'center' }}></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                )
            }
        }
        return;
    }
	render() {
		return (
			<div className="subaccount-data-table">
                <table className="table order-data1 sub-account tbl-workflow">
                    <thead>
                        <tr>
                            <th>Reason</th>
                            <th className="text-center">No. of Workflow(s)</th>
                            <th className="text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderApprovalWorkflows()}
                    </tbody>
                </table>
            </div>
		);
	}
}

module.exports = WorkflowList;