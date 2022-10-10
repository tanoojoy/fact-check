'use strict';
import { FooterLayout } from '../../views/layouts/footer';

const React = require('react');
const reactDom = require('react-dom');

const ReactRedux = require('react-redux');
const Store = require('../../redux/store.js');
const app = document.getElementById('footer-section');

if (app !== null) {
    const store = Store.createFooterStore(window.REDUX_DATA);
    reactDom.hydrate(<ReactRedux.Provider store={store}><FooterLayout /></ReactRedux.Provider>, app);
}
