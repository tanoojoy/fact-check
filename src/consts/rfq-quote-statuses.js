module.exports = {
    rfqStatuses: {
        pending: 'pending',
        submitted: 'submitted',
        declined: 'declined'
    },
    quoteStatuses: {
        pending: 'pending',
        declined: 'declined',
        accepted: 'accepted'
    },
    rfqStatusMessages: {
        pending: {
            sellerMessage: 'RFQ — Pending Response',
            buyerMessage: 'RFQ — Pending Response'
        },
        submitted: {
            sellerMessage: 'RFQ submitted',
            buyerMessage: 'RFQ submitted'
        },
        declined: {
            sellerMessage: 'RFQ Declined',
            buyerMessage: 'RFQ Declined'
        }
    },
    licensingInquiryStatusMessages: {
        pending: {
            sellerMessage: 'Pending Response',
            buyerMessage: 'Pending Response'
        },
        submitted: {
            sellerMessage: 'Responded',
            buyerMessage: 'Responded'
        },
        declined: {
            sellerMessage: 'Licensing Inquiry Declined',
            buyerMessage: 'Licensing Inquiry Declined'
        }
    },
    licensingInquiryMessages: {
        submitted: {
            sellerMessage: 'Licensing Inquiry Sent',
            buyerMessage: 'Licensing Inquiry Received'
        },
        pending: {
            sellerMessage: 'Licensing Inquiry Sent',
            buyerMessage: 'Licensing Inquiry Received'
        }
    },
    quoteStatusMessages: {
        accepted: {
            sellerMessage: 'Quote Accepted',
            buyerMessage: 'Quote Accepted'
        },
        declined: {
            sellerMessage: 'Quote Rejected',
            buyerMessage: 'Quote Rejected'
        },
        pending: {
            sellerMessage: 'Quote Sent',
            buyerMessage: 'Quote Received'
        }
    }
};
