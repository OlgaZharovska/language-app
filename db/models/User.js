var mongoose = require('mongoose');
var User = mongoose.model('User', {
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phone: {
        type: String
    },
    hashedPassword: {
        type: String
    }
})

module.exports = User;