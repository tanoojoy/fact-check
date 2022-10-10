'use strict';
var React = require('react');
var reactDom = require('react-dom');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == 'homepage') {
    var Homepage = require('../../views/home/index').Homepage;

    const store = Store.createHomepageStore(window.REDUX_DATA);

    const app = document.getElementById("root");
    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <Homepage />
        </ReactRedux.Provider>,
        app);
}
