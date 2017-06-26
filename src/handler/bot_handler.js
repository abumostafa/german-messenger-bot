const UserManager = require('../manager/user'),
    config = require('../../config/default'),
    dictionary = require('../service/dictionary'),
    {
        TEXT_MESSAGE_TYPE_HELP,
        TEXT_MESSAGE_TYPE_NOTIFICATION,
        TEXT_MESSAGE_TYPE_EXIT,

        TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_ON,
        TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_SILENT,
        TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_OFF,

        NOTIFICATION_REGULAR,
        NOTIFICATION_SILENT_PUSH,
        NOTIFICATION_NO_PUSH,

        SENDER_ACTION_TYPING_ON,

        DICTIONARY_POST_BACK_ARTICLE,
        DICTIONARY_POST_BACK_LISTEN,
        DICTIONARY_POST_BACK_DEFINITION,
    } = require('../types');

function BotHandler() {
}

BotHandler.prototype.receiveMessage = function (event) {

    const { sender, timestamp, message } = event;
    const { id: senderID } = sender;

    console.log("Received message for user %d at %d with message: %s", senderID, timestamp, JSON.stringify(message));

    UserManager
        .getUser({ fb_id: sender.id })
        .then(user => console.log(user))
        .catch(err => console.log('Failed to get user: %s', err));

    this.replyMessage({ sender, message });
};

BotHandler.prototype.replyMessage = function ({ sender, message }) {

    let { mid: messageId, text: messageText, attachments: messageAttachments, quick_reply } = message;

    console.log("Message Text: %s, %s", JSON.stringify(quick_reply), messageText);

    if(quick_reply) {

        const { action, payload } = JSON.parse(quick_reply.payload);

        switch (action) {
            case TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_ON:
            case TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_SILENT:
            case TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_OFF:
                return this._sendMessageNotificationStatus(sender, action);
            case DICTIONARY_POST_BACK_ARTICLE:
                return this._sendMessageDictionaryArticle(sender, payload);
            // case DICTIONARY_POST_BACK_DEFINITION:
            //     return this._sendMessageDictionaryDefinition(sender, payload);
            case DICTIONARY_POST_BACK_LISTEN:
                return this._sendMessageDictionaryListen(sender, payload);
        }
    }

    if(messageText) {

        switch (messageText.toLowerCase()) {

            case TEXT_MESSAGE_TYPE_NOTIFICATION:
                return this._sendMessageNotification(sender);
            case TEXT_MESSAGE_TYPE_HELP:
                return this._sendMessageHelp(sender);
            default:
                return this._sendMessageDictionaryOptions(sender, messageText);
        }
    }

    if(messageAttachments) {

        const bot = this;
        this
            ._sendActionTyping(sender)
            .then(() => {
                setTimeout(() => {
                    bot._sendMessage({ recipient: sender, message: { text: "💀" } });
                }, 10000);
            });
    }
};

BotHandler.prototype._sendMessageHelp = function (recipient) {

    let text = "";
    text += "Hello, I'm DeutschBot.\r\n\r\n";
    text += "What can i do?\r\n";
    text += "I can tell you the article [der/die/das] and i can speak Deutsch\r\n\r\n";
    text += "list of commands will help you communicate with me:\r\n";
    text += `${ TEXT_MESSAGE_TYPE_HELP } (show help message).\r\n`;
    text += `${ TEXT_MESSAGE_TYPE_NOTIFICATION } (manage notification).\r\n`;
    // text += `- ${ TEXT_MESSAGE_TYPE_EXIT } (de-register yourself from the Bot).\r\n`;
    text += "";
    text += "Yours, DeutschBot";

    return this._sendMessage({ recipient, message: { text } });
};

BotHandler.prototype._sendMessageNotification = function (recipient) {

    return this._sendMessage({
        recipient,
        message: {
            text: "Notifications:",
            quick_replies: [
                {
                    "content_type": "text",
                    "title": "On",
                    "payload": JSON.stringify({ action: TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_ON, payload: null }),
                    "image_url": "https://cdn1.iconfinder.com/data/icons/basic-ui-elements-color/700/011_yes-32.png"
                },
                {
                    "content_type": "text",
                    "title": "Silent",
                    "payload": JSON.stringify({ action: TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_SILENT, payload: null }),
                    "image_url": "https://cdn2.iconfinder.com/data/icons/weby-flat-vol-2/512/weby-flat__off_speaker-mute-silent-sound_off-audi_off-60-32.png"
                },
                {
                    "content_type": "text",
                    "title": "Off",
                    "payload": JSON.stringify({ action: TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_OFF, payload: null }),
                    "image_url": "https://cdn1.iconfinder.com/data/icons/basic-ui-elements-color/700/010_x-32.png"
                }
            ]
        },
    });
};

BotHandler.prototype._sendMessageNotificationStatus = function (recipient, payload) {

    let text = '',
        status;

    switch (payload) {
        case TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_SILENT:
            text = 'Silent';
            status = NOTIFICATION_SILENT_PUSH;
            break;
        case TEXT_MESSAGE_TYPE_POST_BACK_NOTIFICATION_OFF:
            text = 'Off';
            status = NOTIFICATION_NO_PUSH;
            break;
        default:
            text = 'On';
            status = NOTIFICATION_REGULAR;
            break;
    }

    setTimeout(() => {

        UserManager
            .getUser({ fb_id: recipient.id })
            .then(user => {

                if(user) {
                    user.notification = status;
                    user.save((err, saved) => {

                        return this._sendMessage({
                                recipient,
                                message: { text: `Notification is ${ text }.` },
                            });
                    });
                }
            })
            .catch(err => console.log('Failed to update notifications'));
    }, 1000);
};

BotHandler.prototype._sendMessageDictionaryOptions = function (sender, messageText) {

    const bot = this;

    this
        ._sendActionTyping(sender)
        .then(response => {
            setTimeout(() => {

                dictionary
                    .lookup(messageText)
                    .then(dic => {

                        if(dic === null) {

                            let text = `Sorry "${messageText}" not found :|\r\n\r\n`;
                            text += "What can i do?\r\n";
                            text += "I can tell you the article [der/die/das] and i can speak Deutsch\r\n\r\n";
                            text += "list of commands will help you communicate with me:\r\n";
                            text += `${ TEXT_MESSAGE_TYPE_HELP } (show help message).\r\n`;
                            text += `${ TEXT_MESSAGE_TYPE_NOTIFICATION } (manage notification).\r\n`;

                            bot
                                ._sendMessage({
                                    recipient: sender,
                                    message: { text }
                                })
                                .then(res => console.log('Sent'))
                                .catch(err => console.log('Err %s', err));

                            return console.log('%s not found 1', messageText)
                        }

                        const buttons = [];

                        buttons.push({
                            "content_type": "text",
                            "title": "Article",
                            "payload": JSON.stringify({ action: DICTIONARY_POST_BACK_ARTICLE, payload: messageText }),
                            "image_url": "https://cdn0.iconfinder.com/data/icons/mobile-device/512/d-letter-uppercase-text-round-latin-keyboard-2-32.png"
                        });

                        buttons.push({
                            "content_type": "text",
                            "title": "Listen",
                            "payload": JSON.stringify({ action: DICTIONARY_POST_BACK_LISTEN, payload: messageText }),
                            "image_url": "https://cdn0.iconfinder.com/data/icons/mobile-device/512/play-player-blue-round-2-32.png"
                        });

                        bot._sendMessage({
                            recipient: sender,
                            message: { text: "Choose", quick_replies: buttons },
                        });

                    })
                    .catch(err => console.log('dictionary(lookup): %s', err));
            }, 1000);
        })
        .catch(err => console.log('_sendMessageDictionaryOptions(_sendActionTyping): %s', err));
    ;
};

BotHandler.prototype._sendMessageDictionaryArticle = function (sender, message) {

    const bot = this;

    this
        ._sendActionTyping(sender)
        .then(() => {
            setTimeout(() => {

                dictionary
                    .lookup(message)
                    .then(dic => {

                        if(!dic) {
                            bot._sendMessage({
                                recipient: sender,
                                message: {
                                    text: `Sorry "${message}" not found`,
                                }
                            });

                            return console.log('%s not found 2', message)
                        }

                        bot._sendMessage({
                            recipient: sender,
                            message: {
                                text: `${dic.article.name} ${dic.word} ${(!dic.singular ? '[pl]' : '')}`,
                                quick_replies: [
                                    {
                                        "content_type": "text",
                                        "title": "Listen",
                                        "payload": JSON.stringify({ action: DICTIONARY_POST_BACK_LISTEN, payload: `${dic.article.name} ${dic.word}}` }),
                                        "image_url": "https://cdn0.iconfinder.com/data/icons/mobile-device/512/play-player-blue-round-2-32.png"
                                    }
                                ]
                            },
                        });
                    })
                    .catch(err => console.log('dictionary(lookup): %s', err))
            })
            ;
        });
};

BotHandler.prototype._sendMessageDictionaryDefinition = function (sender, message) {

};

BotHandler.prototype._sendMessageDictionaryListen = function (sender, message) {

    const bot = this;

    this
        ._sendActionTyping(sender)
        .then(() => {

            this._sendMessage({
                recipient: sender,
                message: {
                    attachment: {
                        type: "audio",
                        payload: {
                            url: `${config.server.host}/listen?q=${encodeURIComponent(message)}`
                        }
                    }

                }
            })
        });
};

BotHandler.prototype._sendMessage = function ({ recipient, message, notification_type, sender_action }) {

    return new Promise((resolve, reject) => {
        UserManager
            .getUser({ fb_id: recipient.id })
            .then(user => {

                console.log('send message %s', JSON.stringify({ recipient, message, notification_type, sender_action }));

                if(undefined === notification_type) {
                    notification_type = user.notification;
                }

                return this._callApi({ recipient, message, notification_type, sender_action })
                    .then((body, response) => {

                        const { recipient_id, message_id } = body;
                        console.log("Successfully sent generic message with id %s to recipient %s", message_id, recipient_id);
                        return resolve && resolve(response);
                    })
                    .catch(err => {
                        console.error("FB Error:", err);
                        return reject && reject(err);
                    });
            })
            .catch(err => {
                console.error("getUser Error:", err);
                return reject && reject(err);
            });
    })
};

BotHandler.prototype._sendActionTyping = function (recipient) {

    return this._sendAction(recipient, SENDER_ACTION_TYPING_ON)
};

BotHandler.prototype._sendAction = function (recipient, action) {

    return this._sendMessage({
        recipient,
        sender_action: action
    });
};

BotHandler.prototype._callApi = function (data) {
    return callSendAPI(data);
};

function callSendAPI(messageData) {

    return new Promise((resolve, reject) => {
        require('request')({
            uri: `${config.facebook.api.host}/me/messages`,
            qs: { access_token: config.facebook.page.token },
            method: 'POST',
            json: messageData
        }, function (error, response, body) {

            console.log('API Call => payload:%s, response: %s\n\n', JSON.stringify(messageData), JSON.stringify(body));

            if(!error && response.statusCode == 200) {
                return resolve && resolve(body, response);
            }

            return reject && reject(error);
        });
    })
}

module.exports = BotHandler;

