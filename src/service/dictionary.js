const DictionaryRepository = require('../repository/dictionary');

function Dictionary(){}

Dictionary.prototype.lookup = function(word, lang = 'de'){
    return DictionaryRepository.findOneByWord(word);
};

module.exports = new Dictionary();