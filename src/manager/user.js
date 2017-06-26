const UserRepository = require('../repository/user'),
    UserModel = require('../models/user'),
    FacebooApi = require('../service/facebook_api');

function UserManager() {
}

UserManager.prototype.getUser = function ({ fb_id }, createIfNotFound = true) {

    const manager = this;

    return new Promise((resolve, reject) => {

        UserRepository
            .findOneByFbId(fb_id)
            .then(user => {

                if(!user && createIfNotFound) {
                    return manager
                        .createUser({ fb_id })
                        .then(resolve)
                        .catch(reject);
                }

                return resolve(user);
            })
            .catch(err => reject(err));
    });
};

UserManager.prototype.createUser = function ({ fb_id }) {

    return this
        .fetchFacebookProfile(fb_id)
        .then(result => JSON.parse(result))
        .then(result => {

            return new Promise((resolve, reject) => {

                const user = new UserModel();
                user.fb_id = fb_id;
                user.first_name = result.first_name;
                user.last_name = result.last_name;
                user.profile_pic = result.profile_pic;
                user.locale = result.locale;
                user.timezone = result.timezone;
                user.gender = result.gender;

                user.save((err, result) => {

                    if(err) {
                        return reject && reject(err);
                    }

                    return resolve && resolve(result);
                });
            })
        })
};

UserManager.prototype.fetchFacebookProfile = function (user_id) {
    return FacebooApi.userProfile(user_id);
};

module.exports = new UserManager();