'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store');
import { product as productPPs,productSettings as productSettingsPPs } from '../../consts/page-params';

if (window.APP == productPPs.appString) {
    var ItemDetailsHome = require('../../views/item/index').ItemDetailsHome;

    const store = Store.createItemDetailStore(window.REDUX_DATA);

    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ItemDetailsHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP == productSettingsPPs.appString) {
    const AddEditProductContainer = require('../../views/company/add-edit-product/index').AddEditProductContainer;

    const store = Store.createItemUploadEditStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <AddEditProductContainer />
        </ReactRedux.Provider>,
        app);
}

if (window.APP == 'create-rfq') {
    const { CreateRfqHome } = require('../../views/item/rfq/create-rfq');
    const store = Store.createProductPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CreateRfqHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP == 'view-rfq') {
    const { ViewRfqHome } = require('../../views/item/rfq/view-rfq');
    const store = Store.createProductPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ViewRfqHome />
        </ReactRedux.Provider>,
        app);
}

if (window.APP === 'create-licensing-inquiry') {
    const { CreateLicensingInquiryHome } = require('../../views/item/rfq/create-licensing-inquiry');
    const store = Store.createProductPageStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <CreateLicensingInquiryHome />
        </ReactRedux.Provider>,
        app);
}