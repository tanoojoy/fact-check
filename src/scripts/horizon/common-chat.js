import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { CommonChatContainer } from '../../views/layouts/horizon-pages/common-chat';

if (window.APP === 'common-chat') {
    const store = Store.createProductPageStore(window.REDUX_DATA);
    const app = document.getElementById("root");
    reactDom.hydrate(
        <Provider store={store}>
            <CommonChatContainer />
        </Provider>,
        app);
}