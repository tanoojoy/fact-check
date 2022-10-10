'use strict';
const React = require('react');
if (typeof window !== 'undefined') { var $ = window.$; }

class DepartmentList extends React.Component {
    constructor(props) {
        super(props)
    }
    
    onDeleteClick(id) {
        const target = $(".popup-area.item-remove-popup");
        const cover = $("#cover");

        target.fadeIn();
        cover.fadeIn();
        $(".my-btn.btn-saffron").attr('data-key', "item");
        $(".my-btn.btn-saffron").attr('data-id', id);
    }

    renderDepartments() {
        if (this.props.departments && this.props.departments.TotalRecords && this.props.departments.TotalRecords > 0) {
            const { Records } = this.props.departments;
            if (Records && Records.length > 0) {
                return Records.map(dept => 
                    <tr className="account-row" data-key="item" data-id={dept.Id} key={dept.Id} >
                        <td data-th="Department Name"><a href="#">{dept.Name}</a></td>
                        <td className="text-center" data-th="No. of Workflow(s)">{dept.WorkflowCount}</td>
                        <td className="action-cell" data-th="Action">
                            <div className="item-actions action-inline">
                                <ul>
                                    <li><a href={`/approval/departments/${dept.Id}`}><i className="icon icon-edit"></i></a></li>
                                    <li>
                                        <a href="#" className="delete_item" data-id={dept.Id} onClick={() => this.onDeleteClick(dept.Id)}>
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
            <div className="subaccount-data-table table-responsive">
    			<table className="table order-data1 sub-account tbl-department">
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th className="text-center">No. of Workflow(s)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderDepartments()}
                    </tbody>
                </table>
            </div>
		);
	}
}

module.exports = DepartmentList;