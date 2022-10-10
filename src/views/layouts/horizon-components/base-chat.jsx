import React, { Component } from 'react';
import { FREEMIUM_LIMITATION_POSITION, getLimits } from './limitation-block-freemium';
import { isFreemiumUserSku } from '../../../utils';
import axios from 'axios';
import { getAppPrefix } from '../../../public/js/common';

export class BaseChat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userInfo: { ...props.userInfo },
            isLockedChat: false,
            statusMessage: '',
        };
    }

    setLockedChat = () => {
        const { user = {} } = this.props;
        const { userInfo = {} } = this.state;
        const chatLimits = getLimits(FREEMIUM_LIMITATION_POSITION.chat, userInfo?.flags);
        if (isFreemiumUserSku(user) && chatLimits.current >= chatLimits.limit) {
            this.setState({
                isLockedChat: true
            });
        }
    }

    sendMessage = (generalChannel, $input) => {
        if (generalChannel && $input) {
            if (isFreemiumUserSku(this.props?.user)) {
                axios
                    .post(`${getAppPrefix()}/userinfo/increase-chat-counter`)
                    .then((response) => {
                        const userInfo = response.data;
                        this.setState({
                            userInfo
                        }, () => {
                            this.setLockedChat();
                        });
                    })
                    .catch(err => console.error(err));
            }
            generalChannel.sendMessage($input.val());
            $input.val('');
        } else {
            console.error('Wrong arguments.The message could not be sent');
        }
    }

    createQuote = () => {
        const rfqId = this.props?.rfqData?.id || '';
        window.location = `${getAppPrefix()}/cgi-quotation/create-template?id=${rfqId}`;
    }

    openQuote = () => {
        const rfqId = this.props?.rfqData?.id || '';
        const quoteId = this.props?.quoteData?.id || '';
        window.location = `${getAppPrefix()}/cgi-quotation/quote/${quoteId}?rfqId=${rfqId}`;
    }

    render() {
        return null;
    }
}
