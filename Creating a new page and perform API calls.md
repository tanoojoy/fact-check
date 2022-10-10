
## Performing API call using the SDK within the API template

In this example, we will modify the endpoint we made on the previous guide ([Creating a new Static page: Option 1](https://github.com/Arcadier/BespokeTemplate/blob/master/Creating%20a%20static%20new%20page.md)) and display simple text on the example page, indicating if a marketplace is private or not. This is achieved calling on of our API's to retrieve information about the marketplace settings. 

On `src/routes/index.js`
1. Create a promise object that will execute the API call. In the example, we use `client.Marketplaces.getMarketplaceInfo` since we want to retrieve data about the marketplace. 

    `sdk/resources` contains files for API requests which are linked to `sdk/client.js` for modularization.
    ```javascript
    const promiseMarketplaceInfo = new Promise((resolve, reject) => {
        client.Marketplaces.getMarketplaceInfo(null, function(err, result){ //this line is possible because the SDK client was included in routes/index.js : var client = require('../../sdk/client');
            if(!err){
                resolve(result);
            }
        })
    })

    ```

    `getMarketplaceInfo` accepts two arguments namely options and callback. Value of options will depend on what data is needed by the API in order to process the request. 

2. Promise.all takes an array of promises and is resolved into a single promise. The variable responses will contain an array of all the resolved results from the promises.

    ```javascript
    Promise.all([promiseMarketplaceInfo]).then((responses) => {

    });
    ```

3. The response from the API call can be accessed as `responses[0]`. From the response, we can determine if the marketplace is private or not.

    ```javascript
    Promise.all([promiseMarketplaceInfo]).then((responses) => {
        const marketplaceInfo = responses[0];
        var isPrivate = false; //default value

        //some logic
        if(marketplaceInfo != null && marketplaceInfo['Settings']['private-settings']['private-settings-area'].enabled === 'true'){
            isPrivate = true; //set to true if the marketplace is a private marketplace
        }
    });
    ```

4. Next, we need to set up the Redux store. On `src/redux/store.js`
    ```javascript
    const ExamplePageReducer = redux.combineReducers({
        marketplaceReducer
    });

    function createExamplePageStore(initialState){
        return redux.createStore(ExamplePageReducer, initialState, redux.applyMiddleware(thunk));
    }
    ```

    `ExamplePageReducer` holds the combined reducers. We combine reducers (`src/redux/reducers`) based on the data we want to access on a specific page. At the end of the file (`src/redux/store.js`), add `createExamplePageStore` on the exports, and all the changes above, once done, should look like this:

    <p align=center><img src="https://bootstrap.arcadier.com/github/reducers.png"></p>


5. On `src/routes/index.js`, import the store by adding 
    ```javascript
    var Store = require('../redux/store');
    ```
    Then call the `createExamplePageStore` function and supply the initial state. 

    ```javascript
    const s = Store.CreateExamplePageStore({
        marketplaceReducer: { isPrivate: isPrivate }
    });

    const reduxSTate = s.getState();
    ```

6. Next we need to modify our `/src/views/layouts/example` page. 
    Import react-redux. 
    ```javascript
    var ReactRedux = require('react-redux');
    ```
    We use React Redux for our components to access data on the store and dispatch actions so we could perform various actions like API call or state modification. For more info on Redux, refer to https://react-redux.js.org/introduction/quick-start

7. Define `mapStateToProps` and `mapDispatchToProps` functions.

    ```javascript
    function mapStateToProps(state, ownProps){
        return {

        };
    }

    function mapDispatchToProps (dispatch){
        return {

        };
    }
    ```

8. Connect redux and update module.exports object
    ```javascript
    const ExampleLayout = ReactRedux.connect(
        mapStateToProps,
        mapDispatchToProps
    )(Example)

    module.exports = {
        ExampleLayout,
        Example
    };
    ```
 
9. On `src/routes/index.js`, replace this  
    ```javascript
    var ExamplePage = require('../views/layouts/example');
    ```

    with this:
    ```javascript
    var ExamplePage = require('../views/layouts/example').Example;
    ```

    The replacement above is necessary, since `module.exports` is now an object (containing ExampleLayout and Example) 
    Note: We will use the component here (in this case Example not the ExampleLayout)
    <br>

10. Use `renderToString` on the component in the `src/routes/index.js` file and include the data (`isPrivateEnabled`) as props.
    ```javascript
    const ExampleApp = reactDom.renderToString(<ExamplePage isPrivate={isPrivate} />);
    ```


    Overview of updated `src/routes/index.js`

    ```javascript
    var ExamplePage = require('../views/layouts/example').Example;

    homepageRouter.get('/example', function(req, res){
        const promiseMarketplaceInfo = new Promise((resolve, reject) => {
            client.Marketplaces.getMarketplaceInfo(null, function(err, result){ //this line is possible because the SDK client was included in routes/index.js : var client = require('../../sdk/client');
                if(!err){
                    resolve(result);
                }
            });
        });

        Promise.all([promiseMarketplaceInfo]).then((responses) => {
            const marketplaceInfo = responses[0];
            var isPrivate = false; //default value

            //some logic
            if(marketplaceInfo != null && marketplaceInfo['Settings']['private-settings']['private-settings-area'].enabled === 'true'){
                isPrivate = true; //set to true if the marketplace is a private marketplace
            }

            const s = Store.CreateExamplePageStore({
                marketplaceReducer: { isPrivate: isPrivate }
            });

            const reduxSTate = s.getState();

            const appString = "homepage"
            const ExampleApp = reactDom.renderToString(<ExamplePage isPrivate={isPrivate} />);
            res.send(template('page-home', '', appString, reduxState));
        });
    });
    ```


11. Finally, add `isPrivateEnabled` on the `mapStateToProps` function (`src/views/layouts/example.jsx`) which we can access on our component as `this.props.isPrivateEnabled`.

    ```javascript
    'use strict'

    //import libraries or module you need
    var React = require('react');
    var ReactRedux = require('react-redux');

    /*
    class ComponentName extends React.Component {
        render(){
            return(
                //insert code here
            )
        }
    }
    */

    class Example extends React.Component {
        render(){
            return(
                <div>
                    <p>Hello World</p>
                    <h3>
                    {
                        this.props.isPrivate ? 'This Marketplace is private' : 'This Marketplace is not private'
                    }
                    </h3>
                </div>
            )
        }
    }

    function mapStateToProps(state, ownProps){
    return {
            isPrivate: state.marketplaceReducer.isPrivate
        };
    }

    function mapDispatchToProps (dispatch){
        return {

        };
    }

    const ExampleLayout = ReactRedux.connect(
        mapStateToProps,
        mapDispatchToProps
    )(Example)

    module.exports = {
        ExampleLayout,
        Example
    }
    ```


Save changes and wait for app to restart (or restart manually by typing rs on the command line).