import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { ChooseUserRoleLayout } from '../../views/choose-user-role';

if (window.APP === 'choice-user-role') {
    const store = Store.createSettingsStore(window.REDUX_DATA);

    const app = document.getElementById('root');
    reactDom.hydrate(
        <Provider store={store}>
            <ChooseUserRoleLayout />
        </Provider>,
        app);
}
