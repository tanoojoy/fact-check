'use strict';

const React = require('react');
const CommonModule = require('../../../public/js/common.js');

class WorkflowHeading extends React.Component {
    getNumberOfEntries() {
        if (this.props.workflows) {
            return this.props.workflows.TotalRecords || 0;
        }
        return 0;
    }
	render() {
		return (
			<div className="sc-upper">
				<div className="sc-u title-sc-u sc-u-mid full-width">
                    <span className="sc-text-big">
                    	Approval Workflow &nbsp;
                    	<a href="https://support.arcadier.com/hc/en-us" title="info here">
                    		<img src={CommonModule.getAppPrefix() + "/assets/images/Info.svg"} />
                    	</a>
                    </span>
                    <small>{`${this.getNumberOfEntries()} entries`}</small>
                </div>
                <div className="sc-tops">
                    <a className="top-title" href="/approval/create-workflow">
                    	<i className="fas fa-plus fa-fw" />
                    	Create new Approval Workflow
                    </a>
                </div>
			</div>
		);
	}
}

module.exports = WorkflowHeading;
