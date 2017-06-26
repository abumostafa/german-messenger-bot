const httpClient = require('request'),
    Promise = require('promise'),
    config = require('../../config/default');

function FacebookApi() {
}

FacebookApi.prototype.userProfile = function (user_id) {

    return new Promise((resolve, reject) => {

        httpClient({
            uri: `${config.facebook.api.host}/${user_id}?access_token=${config.facebook.page.token}`
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

module.exports = new FacebookApi();