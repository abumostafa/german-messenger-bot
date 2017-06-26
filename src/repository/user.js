const UserModel = require('../models/user');

function UserRepository() {
}

UserRepository.prototype.findOneByFbId = function (fb_id) {
    return this.findOneBy({ fb_id });
};

UserRepository.prototype.findOneBy = function (criteria) {

    return new Promise((resolve, reject) => {

        UserModel.findOne(criteria, (err, result) => {

            if(err) {
                return reject(err);
            }

            return resolve(result);
        });
    });
};

module.exports = new UserRepository;