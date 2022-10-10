# Arcadier API Template
Fully customisable front-end for your marketplace using our API template

## Table of contents
* [Requirements](https://github.com/Arcadier/BespokeTemplate#requirements)
* [Setting up the API template](https://github.com/Arcadier/BespokeTemplate#setting-up-the-api-template)
  * [Cloning the repo](https://github.com/Arcadier/BespokeTemplate#clone-this-repository)
  * [Set up the `.env` file](https://github.com/Arcadier/BespokeTemplate#set-up-your-env-file)
    * [Basic Settings](https://github.com/Arcadier/BespokeTemplate#basic-settings)
    * [Marketplace Settings](https://github.com/Arcadier/BespokeTemplate#marketplace-settings)
    * [Additional Marketplace Settings (B2B vs B2C)](https://github.com/Arcadier/BespokeTemplate#additional-marketplace-settings)
* [Running the API template](https://github.com/Arcadier/BespokeTemplate#running-the-application)
* [Front-End Modifications](https://github.com/Arcadier/BespokeTemplate#front-end-modifications)
  * [Creating a new static page](https://github.com/Arcadier/BespokeTemplate/blob/master/Creating%20a%20static%20new%20page.md)
  * [Creating a new page that can fetch data from APIs](https://github.com/Arcadier/BespokeTemplate/blob/master/Creating%20a%20new%20page%20and%20perform%20API%20calls.md)
  * [Linking users together after SSO login](https://github.com/Arcadier/BespokeTemplate/blob/master/How%20to%20link%20to%20company%20at%20login.md)
* [Back-end Modifications](https://github.com/Arcadier/BespokeTemplate#back-end-modifications)

## Requirements
1. An active marketplace on Arcadier
2. Node.js installed in your servers/on your local machine

## Setting up the API template
### Clone this repository
Clone this repository on your server/local using the following command in your directory:
```bash
git clone https://github.com/Arcadier/BespokeTemplate.git
```

![Git Clone](https://bootstrap.arcadier.com/github/gitcloning.gif)

### Set up your `.env` file
Set up your `{root}/.env` file to match your marketplace's settings, you can find all options in `.env.sample`

#### Basic settings
```bash
CLIENT_ID = found-in-your-admin-portal
CLIENT_SECRET = found-in-your-admin-portal
OAUTH_URL = www.sandbox.arcadier.io
BASE_URL = your-arcadier-marketplace-domain
PROTOCOL = https

SECRET_KEY = a-long-key-to-sign-cookie-sesssion
NODE_ENV = production
```



#### Marketplace settings
```bash
TEMPLATE =
GOOGLE_MAP_API_KEY =
DEFAULT_CURRENCY = SGD


# date format
DATE_FORMAT = DD/MM/YYYY
DATETIME_FORMAT = DD/MM/YYYY HH:mm
TIME_FORMAT = HH:mm
YEAR_FORMAT = YYYY

# currency format
MONEY_FORMAT = 0,0.00

# fulfillment statuses
DELIVERY_FULFILLMENT_STATUSES=Created,Acknowledged,Delivered
PICKUP_FULFILLMENT_STATUSES=Created,Acknowledged,Ready For Consumer Collection,Collected
COMMON_FULFILLMENT_STATUSES=Created,Acknowledged

#order statuses
DELIVERY_FULFILLMENT_STATUSES_b2b=Created,Acknowledged,Delivered,Rejected
PICKUP_FULFILLMENT_STATUSES_b2b=Created,Acknowledged,Ready For Consumer Collection,Collected,Rejected
```

`TEMPLATE` takes the following default value:
* `trillia` (default)

`DATE_FORMAT`, `DATETIME_FORMAT`, `TIME_FORMAT`, and `YEAR_FORMAT`:
* They can take any of the values defined in the documentation of [Known Date Formats](https://momentjs.com/guides/#/parsing/known-formats/) of [Moment.js](https://momentjs.com/). You can also click "[See the API documentation on parsing strings for a full listing."](https://momentjs.com/docs/#/parsing/string/) link under [Known Date Formats](https://momentjs.com/guides/#/parsing/known-formats/) section to view the other possible formats.

`MONEY_FORMAT` takes only one value relevant to Arcadier marketplaces:
* `0,0.00`
  The API template uses the [Numeral.js](http://numeraljs.com/) dependency, so if you want to customize how certain numbers are displayed on the front end, you can refer to their [documentation](http://numeraljs.com/) to find out about their other formats.

  In Arcadier's databases, currency values are stored in this format: `0,0.00`

`#fulfilment statuses` and `#order_statuses`
* They take the values as described in the example above.



#### Additional marketplace settings
```bash
PRICING_TYPE = country_level
CHECKOUT_TYPE = single_merchant
CHECKOUT_FLOW_TYPE = b2b
APPROVAL_PLUGIN = b9c77e69-04c0-4253-80fc-9fd27c75a839
```

`CHECKOUT_FLOW_TYPE` takes one of the following values:
* `b2b` - Setting this allows the buyer to go through a B2B flow, a.k.a: `Checkout` -> `Requisition` -> `Approval Process` -> `Purchase Order` - `Goods Received Note` -> `Invoicing` -> `Payment`
* `b2c` - Buyer goes from `Checkout` -> `Payment` straight

`PRICING_TYPE` takes one of the following values:
* `country_level` - The same item can take different prices depending on the availability set for different countries
* `variants_level` - The same item can take different prices depending on its variants (typical retail marketplace)
The difference can be seen when you login as a merchant and attempt to upload an item.

`CHECKOUT_TYPE` takes one of the following values:
* `single_merchant` - the buyer will only be able to proceed to checkout with items from a **single** merchant 
* `multiple_merchant` - the buyer can proceed to checkout with items from **one or more** merchants

Any combination of the above variables is possible except for 1 combination:
If `CHECKOUT_FLOW_TYPE` is set "b2b", then `CHECKOUT_TYPE` **has** to be "single_merchant"

![API template possible settings combinations](https://bootstrap.arcadier.com/github/API%20template%20flows%20-%20Page%201.png)

##### Examples
  For a B2C marketplace, with single merchant checkout, and country level pricing type:
```bash
CHECKOUT_FLOW_TYPE = b2c
CHECKOUT_TYPE = single_merchant
PRICING_TYPE = country_level
```

For a B2B marketplace, single_merchant is mandatory, and country level pricing type:
```bash
CHECKOUT_FLOW_TYPE = b2b
CHECKOUT_TYPE = single_merchant
PRICING_TYPE = country_level
```

For a B2C marketplace, with multiple merchant checkout and variant level pricing type (aka typical bespoke template):
```bash
CHECKOUT_FLOW_TYPE = b2c
CHECKOUT_TYPE = multiple_merchant
PRICING_TYPE = variants_level
```

#### Other Settings:

##### User-Sub Accounts

Enabling the User-Sub Accounts not only requires you to toggle the feature on in "Buyer Docs" but also requires a plug-in for it to work. *You will need to contact us to make this Plug-In installable in your marketplace.*

##### Approval Flow
Enabling the Approval Flow not only requires you to toggle the feature on in "Buyer Docs" but also requires some custom tables to work. These custom tables can be created by yourself via your own Plug-In and installed on your admin portal

1. Create a new Plug-In
2. Create the following custom tables in the new Plug-In:

    **Table name**: *Approvals*
    |RequisitionID|Status|UserID|
    |:-----------:|:----:|:----:|
    |(string)|(string)|(string)|

    **Table name**: *Departments*
    |Departments|Name|WorkflowCount|WorkflowID|
    |:---------:|:--:|:-----------:|:---------|
    |(string)|(string)|(integer)|(string)|

    **Table name**: *Settings*
    |Enabled|UserID|
    |:-----:|:----:|
    |(integer)|(string)|

    **Table name**: *Workflows*
    |Active|Reason|WorkflowCount|UserID|Values|
    |:---------:|:--:|:-----------:|:---------|:---:|
    |(integer)|(string)|(integer)|(string)|(string)|

3. Upload an empty `.zip` file.
4. Save the Plug-In and install it in your marketplace via your **Admin Portal**.
5. Copy the Plug-In's ID/package ID and paste it in the following variable in the `.env` file:

    ```bash
    APPROVAL_PLUGIN = 
    ```
6. Run ```npm run-script build```.
### Running the application

Once you're done setting up the `.env` file, run the following npm commands in your terminal:

```bash
npm install
npm run-script build
npm start
```

```npm install``` will install the required dependencies, libraries, and frameworks in your directory and only needs to be run once ever.

```npm run-script build``` will build your marketplace according to your `.env` file and needs to be run every time you make a change to the `.env` file.

```npm start``` will run an instance of the React Template on your `localhost:3000` and take you to the marketplace's landing page. The port number can be changed in the `{root}/src/server.js` file.


### Front-end Modifications
All the React files that render the front end of the API template can be found in the `{root}/src/views` folder.

#### Example
If you want to modify the HTML layout of the Home page, navigate to `{root}/src/views/home` and you will find the `.jsx` files used to render different parts of the home page.

Each folder in the `views` folder contains the React files rendering different sections of different pages of the marketplace.

The JS and CSS affecting the look and feel of all pages can be found in the `{root}/src/public` folder. 

***For every front-end modification that you do, saving the changes in your code editor suffices to apply the changes to the deployed API template. Just refresh your browser to see the results.***

<p align=center><img src="https://bootstrap.arcadier.com/github/Screenshot%202020-11-10%20132429.png"></p>

### Back-End modifications
All of Arcadier's APIs are wrapped in an SDK found in the `{root}/sdk/resources` folder. The full documentation can also be found [here](https://apiv2.arcadier.com) and downloaded to your local machine via Postman. 

You can do so by clicking the button below:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/346b915f84ec00600260)