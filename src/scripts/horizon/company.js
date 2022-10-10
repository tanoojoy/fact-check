import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store.js';
import { CompanyContainer } from '../../views/layouts/horizon-pages/company';
import { CompanySettingsIndexComponent } from '../../views/company/settings/index';

if (window.APP === 'company') {
    const store = Store.createCompanyPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');
    reactDom.hydrate(
        <Provider store={store}>
            <CompanyContainer />
        </Provider>,
        app);
}

//TODO: TO BE DELETED
// if (window.APP === 'companySettings') {
//     alert('hydrate');
//     const store = Store.createCompanyPageStore(window.REDUX_DATA);
//     const app = document.getElementById('root');
//     reactDom.hydrate(
//         <Provider store={store}>
//             <CompanySettingsIndexComponent />
//         </Provider>,
//         app);
// }
