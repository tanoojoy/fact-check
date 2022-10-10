# ApiTemplateReact

## Docker
1. Stable version of Node.js used (12)
2. The working directory "_horizon-frontend_" is in the root directory
3. **All** files are copied to the working directory, except those specified in the _.dockerignore_ file
4. The dependencies described in the package.json file are installed
5. The project is being assembled for production using webpack. The settings are described in the _webpack.config.js_
6. Port is set (3000)
7. Web server is started using _nodemon_ https://www.npmjs.com/package/nodemon

###### Attention
The "Arcadier" environment settings are described in the _.env_ file. For deployment, you need to update this file, specifying the parameters of the marketplace (for each of the environments).
An example of settings is in the file _.env.sample_. 
For correct assembly, you need to create an _.env_ file! 

### Initalizing new chats account
Important! After changing TWILIO keys in .env, run `node .\initchats.js` to initalize sync service for twilio client service

### Twillio Chats workflow
There are 2 types of chats: Chats over products (aka Deal chats), and direct chats between two companies(aka chats without product)

all chats over proucts returned by one of the following endpoint `/api/deals/buyerId/{buyerId}` for buyer or by `/api/deals/companyId/{companyId}/productId/{productId}` for seller. Main field for chats is chatId.

#### Chat actions
To make any action with chat(like getiing recent messages, sending message, sending system message etc) we need to initalize twilio client with token, which is generated on `/product-profile/token/{username}` (bff endpoint) and join twilio channel(with creation if it's new one) on the client side on corresponding page
```js
Twilio.Chat.Client.create(data.token).then(client => {
...
    const channelName = /*chatId here from endpoints above*/;
    chatClient.getChannelByUniqueName(channelName)
            .then(function(channel) {
                channel.join().finally(() => {...}
}
```
Here we can get latest message, send messages etc.

**Note**: joining chats could take some time, so if we have troubles with _Chat service not available_ it might be issue about trying to do smth with chat before it's not yet initalized.

#### Chats Torubleshooting
First of all we need to be sure to get correct chats list from `/api/deals/buyerId/{buyerId}` and `/api/deals/companyId/{companyId}/productId/{productId}`. After that check the initialization of twilio chat client and twilio channel on frontend side (chats actions like joining channels and creating chat client are consoled in browser)