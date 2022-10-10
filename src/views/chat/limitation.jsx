import React, { useState, useEffect } from 'react';

export const FREEMIUM_LIMITATION_POSITION = {
    rfq: 'rfq',
    licensingInquiry: 'licensingInquiries',
    quote: 'quote',
    chat: 'chat',
    inbox: 'inbox',
    inboxEnquiries: 'inboxEnquiries'
};

const FREEMIUM_LIMITATION_POSITION_VALUES = Object.values(FREEMIUM_LIMITATION_POSITION);

const MESSAGES = {
    rfq: 'You are limited to 3 RFQs per month',
    licensingInquiries: 'You are limited to 3 licensing inquiries per month',
    quote: 'You are limited to 3 quotes per month',
    chat: 'You can send 3 messages per month',
    inbox: 'You can send 3 messages per month',
    inboxEnquiries: 'You can send 3 messages per month'
};


export const getLimits = (position = '', flags) => {
    if (!flags || !position) {
        console.log('properties "flags" or "position" are incorrect. Check arguments and data from BE');
        return { current: 3, limit: 3 };
    }

    switch (position) {
        case FREEMIUM_LIMITATION_POSITION.rfq:
            return flags?.rfq;
        case FREEMIUM_LIMITATION_POSITION.licensingInquiry:
            return flags?.rfq;
        case FREEMIUM_LIMITATION_POSITION.quote:
            return flags?.quote;
        case FREEMIUM_LIMITATION_POSITION.chat:
        case FREEMIUM_LIMITATION_POSITION.inbox:
        case FREEMIUM_LIMITATION_POSITION.inboxEnquiries:
            return flags?.chat;
    }
};


export const FreemiumLimitationBlock = ({ position, user = {} }) =>  {
    
    if (!FREEMIUM_LIMITATION_POSITION_VALUES.find((possiblePosition) => possiblePosition === position)) {
        throw new TypeError('Invalid position value. Use one of the FREEMIUM_LIMITATION_POSITION values');
    }

    const [limits, setLimits] = useState(null);

    useEffect(() => {
        const limits = getLimits(position, user?.flags);
        setLimits(limits);
    }, [user?.flags]);

    return (
        <>
            <span className="yellow-bg">
                <i className="icon icon-alert" />&nbsp;
                {MESSAGES[position]}
            </span>
            <span className="yellow-bg">{limits?.current}&nbsp;/&nbsp;{limits?.limit}</span>
        </>
    );
}