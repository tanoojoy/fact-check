import React from 'react';
import { string } from 'prop-types';
import { rfqStatuses, rfqStatusMessages } from '../../../../consts/rfq-quote-statuses';

const RfqStatus = ({ status }) => {
    if (!Object.values(rfqStatuses).includes(status)) return null;

    let text;
    switch (status) {
    case rfqStatuses.declined:
        text = rfqStatusMessages.declined.buyerMessage;
        break;
    case rfqStatuses.pending:
        text = rfqStatusMessages.pending.buyerMessage;
        break;
    default:
        text = '';
    }
    return (
        <div className='row'>
            <div className='col-xs-12'>
                <div className={`rfq-status ${status}`}>
                    <div className='text'>{text}</div>
                </div>
            </div>
        </div>
    );
};

RfqStatus.propTypes = {
    status: string
};

export default RfqStatus;
