import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { CreateRFQLayout } from '../../views/layouts/horizon-pages/create-rfq/create-rfq';
import { ChatRFQContainer } from '../../views/layouts/horizon-pages/rfq-chat';

if (window.APP === 'rfq-chat') {
    const store = Store.createProductPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');
    reactDom.hydrate(
        <Provider store={store}>
            <ChatRFQContainer />
        </Provider>,
        app);
}

// TODO: TO BE DELETED
// if (window.APP === 'create-rfq') {
//     const store = Store.createRFQPageStore(window.REDUX_DATA);

//     const app = document.getElementById('root');
//     reactDom.hydrate(
//         <Provider store={store}>
//             <CreateRFQLayout />
//         </Provider>,
//         app);
// }
