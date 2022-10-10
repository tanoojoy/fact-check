## Create a static new page on the API template

1. Go to `ApiTemplate/src/views` and create necessary files for our static page. Create a folder where we can put jsx files for the static pages. This folder can be named after the module you want to create (In this example, it is named "**example**"). Another option is to just create a `.jsx` file under an existing folder (ex. `src/views/layouts` or `src/views/home`)

2. On the jsx file, import the module needed for the page and create the component.

    ```javascript
    'use strict'

    //import libraries or module you need
    var React = require('react');

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
                <p>Hello World</p>
            )
        }
    }

    module.exports = Example;
    ```
3. Now that we have finished setting up the view of the static page, we need to configure the server side to allow users to access the contents of "Example" page. On `src/routes/main-routes.js`, routes are modularized corresponding to the path of the feature.

    <p align=center><img src="https://bootstrap.arcadier.com/github/main-route.png"></p>

    For example, requests like getting item details or uploading items will go to the route under `/items`. Requests with the `/items` endpoint will handled on `src/routes/items.js` 


    If we want to access our page as `localhost:3000/example`, we can put our endpoint under the existing `src/routes/index.js`.

    <br>
 
    **Option 1**:  Adding endpoint on an **existing** route
    1. Go to `src/routes/index.js`

    2. Import the component on `example.jsx` file by adding:
        ```javascript 
        var ExamplePage = require('../views/layouts/example');
        ```
    3. We need to add a ```homepageRouter.get()``` function to allow users to view the page. 
    ```javascript
    var ExamplePage = require('../views/layouts/example');

    homePageRouter.get('/example', function(req, res){
        const appString = "homepage";
        const context = {};

        const ExampleApp = reactDom.renderToString(<ExamplePage context={context} />);
        res.send(template('page-home', '', ExampleApp, appString, {}));
    });

    module.exports = homePageRouter;
    ```

    Once saved, the changes will apply, and you can refresh your browser. You can now access the new page on <marketplacedomain>/example.

    <br>

    **Option 2:** Creating a new route
    
    You can also create our own module by doing the following
    1. Add a new js file under `src/routes` named `test.js`. The newly created file is where we will set up the route and controller to handle requests we need for the page we will create. 
    2. On `main-routes.js`, import the file we created on step 1 (line 32) and add ```MainRouter.use(‘/test’, test);``` (line 65)

    <p align=center><img src="https://bootstrap.arcadier.com/github/main%20router%20new.png"></p>


    3. Add libraries or modules you will need for your route module, in `src/routes/test.js`.
        ```javascript
        'use strict';
        var React = require('react');
        var express = require('express');
        var reactDom = require('react-dom/server');

        var template = require('../views/layouts/template'); //used to define a route
        var client = require('../../sdk/client'); //includes the SDK to be used for API calls

        var testRouter = express.Router(); //used in the next step
        var ExamplePage = require('../views/layouts/example'); //the new page's component you created
        ```

    4. Define a sample route with a GET function using `testRouter.get()`. 
        ```javascript
        testRouter.get('/example', function(req, res){
            const appString = 'examplepage';

            const ExampleApp = reactDom.renderToString(<ExamplePage />);
            res.send(template('page-home', '', ExampleApp, appString, {}));
        });
        ```
    5. The whole file should look like this:
        ```javascript
        'use strict';
        var React = require('react');
        var express = require('express');
        var reactDom = require('react-dom/server');

        var template = require('../views/layouts/template'); //used to define a route
        var client = require('../../sdk/client'); //includes the SDK to be used for API calls

        var testRouter = express.Router(); //used in the next step
        var ExamplePage = require('../views/layouts/example'); //the new page's component you created

        testRouter.get('/example', function(req, res){
            const appString = 'examplepage';

            const ExampleApp = reactDom.renderToString(<ExamplePage />);
            res.send(template('page-home', '', ExampleApp, appString, {}));
        });

        module.exports = testRouter;
        ```

    6. Save the code and refresh your browser to access `<marketplacedomain>/test/example` to view the page.
 