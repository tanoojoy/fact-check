import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { ChooseUserCompanyLayout } from '../../views/choose-user-company';

if (window.APP === 'choice-user-company') {
    const store = Store.createSettingsStore(window.REDUX_DATA);

    const app = document.getElementById('root');
    reactDom.hydrate(
        <Provider store={store}>
            <ChooseUserCompanyLayout />
        </Provider>,
        app);
}
