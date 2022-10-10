'use strict';
var React = require('react');
var reactDom = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');
var Store = require('../../redux/store.js');

if (window.APP == "chat-inbox") {
    var ChatInboxPage = require('../../views/chat/inbox/main').ChatInboxPage;
    console.log('chat-inbox', window.REDUX_DATA);
    const store = Store.createInboxStore(window.REDUX_DATA);
    console.log('store', store);
    const app = document.getElementById("root");

    reactDom.hydrate(
        <ReactRedux.Provider store={store}>
            <ChatInboxPage />
        </ReactRedux.Provider>,
        app);

}
