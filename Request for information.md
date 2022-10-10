## RFP/RFQ/Category Requests/Information Updates

* *Party A requests information.*
  * *all requests for information are consolidated in a table and presented in a "Outbox".*
* *Party B receives Request*
  * *all requests on Party B are shown in a "Inbox"*
* *Party B responds to request.*
* *Party A sees response.*
  * *presented in "Inbox"*



1. **Main concept:**
  [Create new pages for each scenario](https://github.com/Arcadier/BespokeTemplate/blob/master/Creating%20a%20new%20page%20and%20perform%20API%20calls.md)
  Create relevant custom tables for each scenario
  Mimick the RFQ Plugin concepts - translate that into React and Node SDK, instead of JS and PHP SDK.
<br>

2. **Each Scenario:**
    * New page for **Party A** that acts as a form to collect data
    * New Page must have the ability to let **Party A**  to ask as much information as they want (a.k.a dynamically be able to add as many fields as they want) - 
    * Connect the new page front end to back-end via Custom Table APIs
    * Data is saved in a **Custom Table A1** for **Party A**
    * Create a new page for **Party B** that fetches data from **Custom Table A1**
        This new page allows **Party B** to choose which request to respond to. 
    * Responses data is saved in **Custom Table B** that serves as history for **Party B**.
    * Responses data is also saved in **Custom Table A2**, which belongs to **party A**, that shows responses from **Party B** only