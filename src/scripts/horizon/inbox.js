'use strict';
import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { InboxLayout } from '../../views/layouts/horizon-pages/inbox';
import { EnquiryLayout } from '../../views/layouts/horizon-pages/enquiry';

if (window.APP === 'inbox') {
    const store = Store.createInboxPageStore(window.REDUX_DATA);
    const app = document.getElementById("root");
    reactDom.hydrate(
        <Provider store={store}>
            <InboxLayout />
        </Provider>,
        app);
}

if (window.APP === 'enquiry') {
    const store = Store.createInboxPageStore(window.REDUX_DATA);
    const app = document.getElementById("root");
    reactDom.hydrate(
        <Provider store={store}>
            <EnquiryLayout />
        </Provider>,
        app);
}
