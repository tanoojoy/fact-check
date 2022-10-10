import React from 'react';
import $ from 'jquery';
import CommonModule from '../../../../public/js/common.js';
import axios from 'axios';

export class UnreadIndicator extends React.Component {
    componentDidMount() {
        axios.get(`${CommonModule.getAppPrefix()}/inbox/getchats`).then(chats => {
            chats = chats.data;
            axios.get(`${CommonModule.getAppPrefix()}/product-profile/token/${chats.username}`).then(data => {
                data = data.data;
                Twilio.Chat.Client.create(data.token).then(client => {
                    const chatClient = client;
                    chats.chatIds.map(channelName => {
                        chatClient.getChannelByUniqueName(channelName)
                            .then(function(channel) {
                                channel.join().finally(() => {
                                    channel.getUnconsumedMessagesCount().then(res => {
                                        channel.getMessagesCount().then(msgCount => {
                                            if (res !== 0 && msgCount !== 0 ) {
                                                $(`#globalUnreadMark`).css("display", "flex");
                                            }
                                        })
                                    });
                                }).catch(() => {});
                            }).catch(function() {
                                console.log('No messages yet in channel');
                            });
                    });
                }).catch(error => {
                    console.error(error);
                });
            })
        });
    }

    render() {

        return (
            <div id='globalUnreadMark' className='inbox__unread-mark-header'/>
        );
    }
};

