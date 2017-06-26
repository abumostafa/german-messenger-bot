const escapeStringRegexp = require('escape-string-regexp'),
    DictionaryModel = require('../models/dictionary');

function DictionaryRepository() {
}

DictionaryRepository.prototype.findOneByWord = function (word) {
    return this.findOneBy({ word: { $regex: new RegExp(`^${escapeStringRegexp(word)}$`, 'ig') } });
};

DictionaryRepository.prototype.findOneBy = function (criteria) {

    console.log(criteria);
    return new Promise((resolve, reject) => {

        DictionaryModel
            .findOne(criteria, 'word article class singular')
            .populate('class', 'name')
            .populate('article', 'name')
            .exec((err, result) => {

                if(err) {
                    return reject && reject(err);
                }

                return resolve && resolve(result);
            });
    });
};

module.exports = new DictionaryRepository();