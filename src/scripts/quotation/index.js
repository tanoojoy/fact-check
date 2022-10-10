import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store';
import { QuotationListHome } from '../../views/quotation/quotation-list';
import { QuotationDetailHome } from '../../views/quotation/quotation-detail';
import { QuotationDetailViewHome } from '../../views/quotation/quotation-detail-view';
import { QuotationTemplateLayout } from '../../views/layouts/horizon-pages/quotation/create-quote-template';
import { CreateRFQLayout } from '../../views/layouts/horizon-pages/create-rfq/create-rfq';

if (window.APP == 'quotation-list') {
    const store = Store.createQuotationStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <Provider store={store}>
            <QuotationListHome />
        </Provider>,
        app);
}
if (window.APP == 'quotation-template') {
    const store = Store.createQuotationStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <Provider store={store}>
            <QuotationDetailHome />
        </Provider>,
        app);
}

// if (window.APP == 'view-rfq') {
//     const store = Store.createRFQPageStore(window.REDUX_DATA);
//     const app = document.getElementById('root');

//     reactDom.hydrate(
//         <Provider store={store}>
//             <CreateRFQLayout />
//         </Provider>,
//         app);
// }

if (window.APP == 'quotation-detail') {
    const store = Store.createQuotationStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <Provider store={store}>
            <QuotationDetailHome />
        </Provider>,
        app);
}

if (window.APP == 'quotation-view') {
    const store = Store.createQuotationStore(window.REDUX_DATA);
    const app = document.getElementById('root');

    reactDom.hydrate(
        <Provider store={store}>
            <QuotationDetailViewHome />
        </Provider>,
        app);
}




