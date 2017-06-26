const config = require('../../config/default'),
    BotHandler = require('../handler/bot_handler'),
    TYPES = require('../types');

function WebHookController() {
}

WebHookController.prototype.getAction = (request, response, next) => {

    const { query } = request;

    if(TYPES.WEB_HOOK_MODE_SUBSCRIBE === query['hub.mode'] && config.facebook.app.verify_token === query['hub.verify_token']) {
        return response.status(200).send(query['hub.challenge']);
    }

    console.error("Invalid request: (query => %s)", JSON.stringify(query));
    return response.sendStatus(403);
};

WebHookController.prototype.postAction = (request, response, next) => {

    const data = request.body;

    if(data.object !== TYPES.WEB_HOOK_OBJECT_TYPE) {

        console.error("Invalid request: (body => %s)", JSON.stringify(data));
        return response.status(200).send('');
    }

    const { entry: entries } = data;

    entries.forEach(function ({ id, time, messaging }) {

        messaging.forEach(function (event) {

            try {
                if(!event.message) {
                    console.log("Webhook received unknown event: ", JSON.stringify(event));
                    return; // continue
                }

                (new BotHandler()).receiveMessage(event);
            } catch (e) {
                next(e);
            }
        });
    });

    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    response.sendStatus(200);
};

module.exports = new WebHookController;