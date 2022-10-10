'use strict';
const React = require('react');
const ReactRedux = require('react-redux');
const HeaderLayoutComponent = require('../../../views/layouts/header/index').HeaderLayoutComponent;
const SidebarLayoutComponent = require('../../../views/layouts/sidebar').SidebarLayoutComponent;
const CommonModule = require('../../../public/js/common.js');

const approvalActions = require('../../../redux/approvalActions');

if (typeof window !== 'undefined') { var $ = window.$; }

class ApprovalSettingsComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			approvalEnabled: false,
		}
	}

	toggleApprovalSettings() {
		const data = { enabled: !this.state.approvalEnabled, rowId: this.props.settings.ID };
		this.props.updateApprovalSettings(data);
		this.setState({ approvalEnabled: !this.state.approvalEnabled });
	}

	loadApprovalSettings() {
		this.setState({ approvalEnabled: this.props.settings.Enabled });
	}

	componentDidMount() {
		this.loadApprovalSettings();
	}

	render() {
		return (
			<React.Fragment>
				<div className="header mod" id="header-section">
					<HeaderLayoutComponent user={this.props.user} />
				</div>
				<aside className="sidebar" id="sidebar-section">
					<SidebarLayoutComponent user={this.props.user} approvalSettings={this.props.settings} />
				</aside>
				<div className="main-content">
					<div className="main less_content footer_fixed">
						<div className="orderlist-container">
							<div className="container-fluid">
								<div className="sc-upper">
									<div className="sc-u title-sc-u sc-u-mid full-width">
			                            <span className="sc-text-big">Approval Settings</span>
			                        </div>
			                        <div className="sc-tops" />
								</div>
								<div className="panel panel-default approve-panel">
			                        <div className="panel-body">
			                            <div className="row">
			                                <div className="col-md-8">
			                                    <h4>
			                                    	Enable Approval Flow before making a purchase with this account
			                                    	<a href="https://support.arcadier.com/hc/en-us"><img src={CommonModule.getAppPrefix() + "/assets/images/Info.svg"} /></a>
			                                    </h4>
			                                    <p>You will need to setup with the approval workflow and the department to use this feature</p>
			                                </div>
			                                <div className="col-md-4">
			                                    <div className="pull-right">
			                                        <span>
			                                            <div className="onoffswitch">
			                                                <input
			                                                	type="checkbox"
			                                                	name="onoffswitch"
			                                                	className="onoffswitch-checkbox"
			                                                	id="approval-check"
			                                                	checked={this.state.approvalEnabled}
			                                                	onChange={() => this.toggleApprovalSettings()}
			                                                />
			                                                <label className="onoffswitch-label" htmlFor="approval-check">
			                                                	<span className="onoffswitch-inner"/>
			                                                	<span className="onoffswitch-switch"/>
			                                                </label>
			                                            </div>
			                                        </span>
			                                    </div>
			                                </div>
			                            </div>
			                        </div>
			                    </div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.userReducer.user,
        settings: state.approvalReducer.settings,
    };
}

function mapDispatchToProps(dispatch) {
    return {
    	updateApprovalSettings: (settings, callback) => dispatch(approvalActions.updateApprovalSettings(settings, callback)),
    };
}

const ApprovalSettingsHome = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ApprovalSettingsComponent);

module.exports = {
    ApprovalSettingsHome,
    ApprovalSettingsComponent
};
