const { NOTIFICATION_SILENT_PUSH } = require('../types'),
    mongoose = require('../service/mongoose'),
    { Schema } = mongoose;

const UserSchema = new Schema({
    fb_id: { type: Number, index: { unique: true } },
    first_name: String,
    last_name: String,
    profile_pic: String,
    locale: String,
    timezone: Number,
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    active: {
        type: Number,
        default: 1,
    },
    notification: {
        type: String,
        default: NOTIFICATION_SILENT_PUSH,
    }
});


module.exports = mongoose.model('User', UserSchema);



