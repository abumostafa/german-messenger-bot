const httpClient = require('request'),
    Promise = require('promise'),
    config = require('../../config/default');

function PonsApi() {
}

PonsApi.prototype.lookup = function (word, src_lang = 'de') {

    return new Promise((resolve, reject) => {

        httpClient({
            uri: `${config.pons.api.host}/dictionary?q=${word}&l=${src_lang}de&fm=1`,
            headers: {
                "X-Secret": config.pons.api.secret
            }
        }, (err, response, body) => {

            if(err) {
                return reject && reject(err)
            }

            if(response.statusCode > 200) {
                return reject && reject(new Error(`Http error ${response.statusCode}`))
            }

            return resolve && resolve(body, response);
        })
    });
};

module.exports = () => new PonsApi();