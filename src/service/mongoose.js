const mongoose = require('mongoose'),
    config = require('../../config/default');

mongoose.connect(config.db.connection_url, (err) => {

    if(err){
        return console.log('MongoDB connection error %s', err)
    }

    console.log('MongoDB connection established');
});

module.exports = mongoose;