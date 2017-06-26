const mongoose = require('../service/mongoose'),
    { Schema } = mongoose;

const WordClassSchema = new Schema({
    name: String,
});

module.exports = mongoose.model('Word_Class', WordClassSchema);



