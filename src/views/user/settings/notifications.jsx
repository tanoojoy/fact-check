'use strict';
var React = require('react');
var BaseClassComponent = require('../../shared/base.jsx');
import { userRoles } from '../../../consts/horizon-user-roles';

var $ = require('jquery');

class NotificationSettingsComponent extends BaseClassComponent {
    constructor(props) {
        super(props);

        this.checkboxNotifications = [
            { key: 'chatMessageSent', value: 'New message received', visibleFor: [userRoles.subMerchant] },
            { key: 'rfqCreated', value: 'New RFQ received', visibleFor: [userRoles.subMerchant, userRoles.subBuyer] },
            { key: 'quoteCreated', value: 'New quote received', visibleFor: [userRoles.subBuyer] },
            { key: 'quoteAccepted', value: 'Your quote has been accepted', visibleFor: [userRoles.subMerchant] }
        ];

        const [otherInfo] = props.userInfo.CustomFields;
        this.selectedCheckBoxes = otherInfo.flags.notification || {};
    }

    changeCheckboxState = (e) => {
        const { checked, name } = e.target;
        this.selectedCheckBoxes[name] = checked;
        this.props.onProfileSave();
    }

    getSelectedNotifications = () => {
        return this.selectedCheckBoxes;
    }



    render() {
        const { userInfo, role } = this.props;
        
        return (
            <React.Fragment>
                <div id="Notifications" className="tab-pane fade">
                    <div className="set-content clearfix">
                        <div className="notif-container">
                            <div className="item-form-group clearfix">
                                <div className="col-md-12">
                                    <label class="title">Email Notifications Preferences</label>
                                    <p class="notification-paragraph">Select which notifications to receive by email.
                                        <br />
                                        Your email notification preferences can be changed here at anytime.
                                    </p>
                                    {
                                        this.checkboxNotifications.map(item => {                                            
                                            const { key, value, visibleFor } = item;
                                            if (visibleFor.includes(role)) {
                                                console.log('this.selectedCheckBoxes', this.selectedCheckBoxes);
                                                const isChecked = this.selectedCheckBoxes && this.selectedCheckBoxes[key];
                                                return (
                                                    <React.Fragment key={key}>
                                                        <div className="flex-notification-con">
                                                            <div className="onoffswitch">
                                                                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={"myonoffswitch" + key}  defaultChecked={isChecked} name={key} onClick={this.changeCheckboxState} />
                                                                <label className="onoffswitch-label" htmlFor={"myonoffswitch" + key}>
                                                                    <span className="onoffswitch-inner"></span>
                                                                    <span className="onoffswitch-switch"></span>
                                                                </label>
                                                            </div>
                                                            <div className="info-details">
                                                                <p className="title">{value}</p>                                                                
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                )
                                            }    
                                            else {
                                                return null;
                                            }                                        
                                        })
                                    }                                    
                                </div>
                            </div>
                        </div>

                        <div className="settings-button hide">
                            <div className="btn-next pull-right">Next</div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

module.exports = NotificationSettingsComponent;