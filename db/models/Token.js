var mongoose = require('mongoose');
var Token = mongoose.model('Token', {
    userId: {
        type: String
    },
    token_id : {
        type: String
    },
    expires: {
        type: String
    }
});

module.exports = Token;