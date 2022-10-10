'use strict';

const React = require('react');
const CommonModule = require('../../../public/js/common.js');

class DepartmentHeading extends React.Component {

    getNumOfEntries() {
        if (this.props.departments && this.props.departments.TotalRecords) {
            return this.props.departments.TotalRecords;
        }
        return 0;
    }
	render() {
		return (
			<div className="sc-upper">
				<div className="sc-u title-sc-u sc-u-mid full-width">
                    <span className="sc-text-big">
                    	Department &nbsp;
                    	<a href="https://support.arcadier.com/hc/en-us">
                    		<img src={CommonModule.getAppPrefix() + "/assets/images/Info.svg"} />
                    	</a>
                    </span>
                    <small>{`${this.getNumOfEntries()} entries`}</small>
                </div>
                <div className="sc-tops">
                    <a className="top-title" href="/approval/create-department">
                    	<i className="fas fa-plus fa-fw" />
                    	Create new Department
                    </a>
                </div>
			</div>
		);
	}
}

module.exports = DepartmentHeading;
