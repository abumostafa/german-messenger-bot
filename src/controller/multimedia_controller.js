const fs = require('fs'),
    uuid = require('uuid4'),
    httpClient = require('request');

function MultiMediaController() {
}

MultiMediaController.prototype.getAction = (request, response, next) => {

    const { query } = request;

    response
        .writeHead(200, {
            "Content-Type": "audio/mpeg",
            'Transfer-Encoding': 'chunked'
        });

    httpClient
        .get(`http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=de&q=${encodeURIComponent(query.q)}`, {
                headers: {
                    "Referer": "http://translate.google.com/",
                    "User-Agent": "stagefright/1.2 (Linux;Android 5.0)",
                    "Content-type": "audio/mpeg"
                }
            }
        )
        .pipe(response);
};

module.exports = new MultiMediaController();