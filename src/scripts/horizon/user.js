'use strict';
import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { UserSettingsContainer } from '../../views/layouts/horizon-pages/user-settings';
import { userSettings as userSettingsPPs } from '../../consts/page-params';

if (window.APP === userSettingsPPs.appString) {
    const store = Store.createUserInfoStore(window.REDUX_DATA);
    const app = document.getElementById('root');
    reactDom.hydrate(
        <Provider store={store}>
            <UserSettingsContainer />
        </Provider>,
        app);
}
