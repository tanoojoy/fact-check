import React from 'react';
import reactDom from 'react-dom';
import { Provider } from 'react-redux';
import Store from '../../redux/store';
import { itemSearch as itemSearchPPs } from '../../consts/page-params';
import { SearchResultsHome } from '../../views/search';

if (window.APP === itemSearchPPs.appString) {
    const store = Store.createSearchStore(window.REDUX_DATA);

    const app = document.getElementById('root');
    reactDom.hydrate(
        <Provider store={store}>
            <SearchResultsHome />
        </Provider>,
        app);
}
