import React, { useState, useEffect } from 'react';
import { bool, func, shape, string } from 'prop-types';
import CheckboxToggle from '../../../horizon-components/checkbox-toggle';
import { userRoles } from '../../../../../consts/horizon-user-roles';

const checkboxNotifications = [
    { key: 'chatMessageSent', value: 'New message received', visibleFor: [userRoles.subMerchant] },
    { key: 'rfqCreated', value: 'New RFQ received', visibleFor: [userRoles.subMerchant, userRoles.subBuyer] },
    { key: 'quoteCreated', value: 'New quote received', visibleFor: [userRoles.subBuyer] },
    { key: 'quoteAccepted', value: 'Your quote has been accepted', visibleFor: [userRoles.subMerchant] }
];

const normalizeNotifications = (notifications) => {
    if (notifications === null) {
        const normNotifications = {};
        checkboxNotifications.forEach((n) => { normNotifications[n.key] = true; });
        return normNotifications;
    }
    return notifications;
};

const NotificationsTab = ({ role, userInfo, updateSettings }) => {
    const notifications = userInfo?.flags?.notification;
    const [notificationState, setNotificationState] = useState({});

    useEffect(() => {
        setNotificationState(normalizeNotifications(notifications));
    }, [userInfo?.flags?.notification]);

    const setCheckBoxValue = (name, status) => {
        const newUserInfo = { ...userInfo };
        const newNotification = { ...notificationState };
        newNotification[name] = status;
        newUserInfo.flags.notification = { ...newNotification };

        setNotificationState(newNotification);
        updateSettings(newUserInfo);
    };

    const getCheckboxStatus = (checkboxName) => {
        return notificationState ? !notificationState[checkboxName] === false : false;
    };

    return (
        <div className='user-settings__notifications-tab'>
            <div className='user-settings__notifications-tab__header'>Email Notification Preferences</div>
            <div className='user-settings__notifications-tab__message'>
                Select which notifications to receive by email.<br />
                Your email notification preferences can be changed here at any time.
            </div>
            <div className='user-settings__notifications-tab__checkboxes'>
                {
                    checkboxNotifications.map((checkboxNotification) => {
                        const { key, value, visibleFor } = checkboxNotification;
                        if (visibleFor.includes(role)) {
                            return (
                                <div key={key} className='user-settings__notifications-tab__checkbox'>
                                    <CheckboxToggle
                                        callback={setCheckBoxValue}
                                        name={key}
                                        isActive={getCheckboxStatus(key)}
                                    />
                                    <div className={`user-settings__notifications-tab__checkbox-label${getCheckboxStatus(key) ? '-active' : ''}`}>
                                        {value}
                                    </div>
                                </div>
                            );
                        }
                    })
                }
            </div>
            <div className='user-settings__notifications-tab__preference_center'>
                Changes to your marketing preferences can be made through the&nbsp;
                <a href='https://discover.clarivate.com/_preference-center-access' target='_blank' rel='noreferrer'>
                    Preference center
                </a>.
            </div>
        </div>
    );
};

NotificationsTab.propTypes = {
    userInfo: shape({
        flags: shape({
            notification: shape({
                chatMessageSent: bool,
                rfqCreated: bool,
                quoteCreated: bool,
                quoteAccepted: bool
            }) | null
        })
    }),
    updateSettings: func,
    role: string
};

export default NotificationsTab;
