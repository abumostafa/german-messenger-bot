const mongoose = require('../service/mongoose'),
    { Schema } = mongoose;

const WordArticleSchema = new Schema({
    name: String,
    sign: String,
});

module.exports = mongoose.model('Word_Article', WordArticleSchema);



