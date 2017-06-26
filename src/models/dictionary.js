const mongoose = require('../service/mongoose'),
    { Schema } = mongoose,
    Word_Class = require('./word_class'),
    Word_Article = require('./word_article');

const DictionarySchema = new Schema({
    word: String,
    class: { type: Schema.Types.ObjectId, ref: 'Word_Class' },
    article: { type: Schema.Types.ObjectId, ref: 'Word_Article' },
    singular: { type: Boolean, default: true },
});

module.exports = mongoose.model('Dictionary', DictionarySchema);



