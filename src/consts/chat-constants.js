export const chatConstants = {
    systemName: 'system message',

    RFQDeclinedMsg: 'RFQ Declined',
    LicensingInquiryDeclinedMsg: 'Licensing Inquiry Declined',
    QuoteReceivedMsg: 'New Quote Submitted',
    RFQReceivedMsg: 'New RFQ Submitted',
    LicensingInquiryReceivedMsg: 'New Licensing Inquiry Submitted',
    QuoteAcceptedMsg: 'Quote Accepted',
    QuoteDeclinedMsg: 'Quote Rejected',

    'RFQ Declined': 'rfq-declined',
    'Licensing Inquiry Declined' : 'rfq-declined',
    'New Quote Submitted': 'quote-received',
    'New RFQ Submitted': 'rfq-received',
    'New Licensing Inquiry Submitted': 'rfq-received',
    'Quote Accepted': 'quote-accepted',
    'Quote Rejected': 'quote-rejected',

    // for styling old system messages
    'Your RFQ has been declined': 'rfq-declined',
    'You have received a new quote': 'quote-received',
    'You have received a new RFQ': 'rfq-received',
    'Your quote has been accepted': 'quote-accepted',
    'Your quote has been rejected': 'quote-rejected',

    typesOfChat: {
        commonChat: 'commonChat',
        rfqChat: 'rfqChat'
    }
};
