var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

// if (window.APP === 'company') {
//     const store = Store.createCompanyPageStore(window.REDUX_DATA);
//     const app = document.getElementById('root');
//     reactDom.hydrate(
//         <Provider store={store}>
//             <CompanyContainer />
//         </Provider>,
//         app);
// }

if (window.APP === 'companySettings') {
    var CompanySettingsIndex = require('../../views/company/settings/index').CompanySettingsIndex;
    const store = Store.createCompanyPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CompanySettingsIndex />
        </ReactRedux.Provider>,
        app);
}

if (window.APP === 'companyDetails') {
    var CompanyDetailsIndex = require('../../views/company/details/index').CompanyDetailsIndex;
    const store = Store.createCompanyPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CompanyDetailsIndex />
        </ReactRedux.Provider>,
        app);
}