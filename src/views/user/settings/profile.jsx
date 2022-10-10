'use strict';
var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');


var $ = require('jquery');

class ProfileSettingsComponent extends BaseClassComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            userInfo: props ? props.userInfo : {}
        }
    }

    componentDidMount() {
        
    }

    handleInputChange = (e) => {
        const {name, value} = e.currentTarget;
        let { userInfo } = this.state;
        if (name.includes('horizon_user')) {
            const [otherInfo] = userInfo.CustomFields;
            let { horizon_user } = userInfo.CustomFields[0];
            otherInfo.horizon_user = {
                ...otherInfo.horizon_user, 
                [name.split('.')[2]]: value
            }
            userInfo = {
                ...userInfo
            };
        }
        else {
            userInfo = {
                ...userInfo,
                [name]: value
            };
        }        
        this.setState({
            userInfo
        });
    }

    getProfileChanges = () => {
        return this.state.userInfo;
    }

    render() {
        
        const { userInfo } = this.state;
        const [otherInfo] = userInfo.CustomFields;
        return (
            <React.Fragment>
                
                <div id="Profile" className="tab-pane fade in active" >
                    <div className="profile-img hide"> <img src="images/NCD-logo.svg" />
                        <button className="btn-change">Change</button>
                    </div>
                    <div className="set-content clearfix">
                        <div className="mini-container">
                            <div className="item-form-group clearfix">
                                <div className="col-md-12">
                                    <label>First Name</label>
                                    <input type="text" name="First Name" id="input-firstName" className="required" name='FirstName' value={userInfo.FirstName} placeholder="First Name" onChange={this.handleInputChange} />
                                    <div className="msg-error-dname"></div>
                                </div>
                                <div className="col-md-12">
                                    <label>Last Name</label>
                                    <input type="text" name="Last Name" id="input-lastName" className="required" name='LastName' value={userInfo.LastName} placeholder="Last Name" onChange={this.handleInputChange} /> 
                                    <div className="msg-error-dname"></div>
                                </div>
                                <div className="col-md-12" style={{ display: 'none' }}>
                                    <label>Work Email</label>
                                    <input type="text" name="Work Email" id="input-workEmail" className="required" name='Email' value={userInfo.Email} placeholder="Work Email" onChange={this.handleInputChange} />
                                    <div className="msg-error-dname"></div>
                                </div>
                                <div className="col-md-12" style={{ display: 'none' }}>
                                    <label>Contact No.</label>
                                    <input type="text" name="Contact No." id="input-displayName" className="required" name='otherInfo.horizon_user.PhoneNumber' value={otherInfo.horizon_user.PhoneNumber} placeholder="Type here" onChange={this.handleInputChange} />
                                    <div className="msg-error-dname"></div>
                                </div>
                            </div>
                            <div className="actionbtn-con">
                                <a className="save-btn" onClick={this.props.onProfileSave}>
                                    Save
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

module.exports = ProfileSettingsComponent;
