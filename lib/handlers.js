const helpers = require('./helpers');
require('../db/mongoose');
const User = require('../db/models/User');
const Phrase = require('../db/models/Phrase');
const Token = require('../db/models/Token');

let handlers = {};

handlers.index = function (data, callback) {
  if (data.method == 'get') {
    let templateData = {
      'head.title': 'Learn with curiousity',
      'head.description': '',
      'body.class': 'index'
    };
    helpers.getTemplate('index', templateData, function (err, str) {
      if (!err && str) {

        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {

            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

handlers.home = function (data, callback) {
  
}


handlers.accountCreate = function (data, callback) {

  if (data.method == 'get') {

    let templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only takes a few seconds.',
      'body.class': 'accountCreate'
    };

    helpers.getTemplate('accountCreate', templateData, function (err, str) {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

handlers.sessionCreate = function (data, callback) {
  if (data.method == 'get') {
    let templateData = {
      'head.title': 'Login to your account.',
      'head.description': 'Please enter your phone number and password to access your account.',
      'body.class': 'sessionCreate'
    };
    helpers.getTemplate('sessionCreate', templateData, function (err, str) {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

handlers.phrasesManage = function (data, callback) {
  if (data.method == 'get') {
    let templateData = {
      'head.title': 'Create a New Phrase',
      'body.class': 'phrasesManage'
    };
    helpers.getTemplate('phrasesManage', templateData, function (err, str) {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

handlers.phrasesTrain = function (data, callback) {
  if (data.method == 'get') {
    let templateData = {
      'head.title': 'Train',
      'body.class': 'getPhrase'
    };
    helpers.getTemplate('phrasesTrain', templateData, function (err, str) {
      if (!err && str) {
        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

handlers.public = function (data, callback) {
  if (data.method == 'get') {
    let trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      helpers.getStaticAsset(trimmedAssetName, function (err, data) {
        if (!err && data) {
          let contentType = 'plain';

          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }

          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }
          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }

          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }

          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }

  } else {
    callback(405);
  }
};

handlers.ping = function (data, callback) {
  callback(200);
};

handlers.notFound = function (data, callback) {
  callback(404);
};

handlers.users = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

handlers._users.post = function (data, callback) {

  let firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 5 ? data.payload.phone.trim() : false;
  let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;


  if (firstName && lastName && phone && password) {

    User.findOne({ phone: phone }, function (err, userInfo) {
      if (!userInfo) {

        let hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          let userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword
          };

          let userForDb = new User(userObject);
          userForDb.save()
            .then(() => {
              callback(200);
            })
            .catch(err => {
              callback(500, { 'Error': err });
            })

        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password.' });
        }
      } else {
        callback(400, { 'Error': 'A user with that phone number already exists' })
      }
    })

  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }
};

handlers._users.get = function (data, callback) {
  let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        _data.read('users', phone, function (err, data) {
          if (!err && data) {
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { "Error": "Missing required token in header, or token is invalid." })
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};

handlers.tokens = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

handlers._tokens.post = function (data, callback) {
  let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 5 ? data.payload.phone.trim() : false;
  let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if (phone && password) {
    User.findOne({ phone: phone }, function (err, userData) {
      if (!err && userData) {
        let hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          let userId = userData._id.toString();
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60;
          let tokenObject = {
            'userId': userId,
            'token_id': tokenId,
            'expires': expires
          };

          let token = new Token(tokenObject);
          token.save(function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create the new token' });
            }
          });

        } else {
          callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });
        }
      } else {
        callback(400, { 'Error': 'Could not find the specified user.' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field(s).' })
  }
}

handlers._tokens.get = function (data, callback) {
  let id = typeof (data.queryStringObject.token_id) == 'string' && data.queryStringObject.token_id.trim().length == 20 ? data.queryStringObject.token_id.trim() : false;
  if (id) {
    Token.findOne({ token_id: id }, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field, or field invalid' })
  }
};

handlers._tokens.put = function (data, callback) {
  let token_id = typeof (data.payload.token_id) == 'string' && data.payload.token_id.trim().length == 20 ? data.payload.token_id.trim() : false;
  let extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if (token_id && extend) {
    Token.findOne({ token_id: token_id }, function (err, tokenData) {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          expires = Date.now() + 1000 * 60 * 60;
          Token.updateOne({ token_id: token_id }, { expires: expires }, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token\'s expiration.' });
            }
          })
        } else {
          callback(400, { "Error": "The token has already expired, and cannot be extended." });
        }
      } else {
        callback(400, { 'Error': 'Specified user does not exist.' });
      }
    })
  } else {
    callback(400, { "Error": "Missing required field(s) or field(s) are invalid." });
  }
};

handlers._tokens.delete = function (data, callback) {
  let id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 24 ? data.payload.id.trim() : false;
  if (id) {
    Token.deleteOne({ userId: id }).then(() => { callback(200); }).catch(err => { callback(400, err) });
  };
}

handlers._tokens.verifyToken = function (id, phone, callback) {
  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

handlers.phrases = function (data, callback) {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._phrases[data.method](data, callback);
  } else {
    callback(405);
  }
}

handlers._phrases = {};

handlers._phrases.post = function (data, callback) {
  let phrase = data.payload.phrase.length > 0 ? data.payload.phrase : false;
  let translation = data.payload.translation.length > 0 ? data.payload.translation : false;
  let owner = data.payload.userId.length > 0 ? data.payload.userId : false;

  if (phrase && translation) {
    let phraseObj = { phrase, translation, owner };
    let phrasetosave = new Phrase(phraseObj);
    phrasetosave.save().then(() => {
      callback(200);
    })
      .catch(err => {
        callback(500, { 'Error': err });
      })
  } else {
    callback(400, { 'Error': 'Missing required data' });
  }
}

handlers._phrases.get = function (data, callback) {
  let userId = typeof (data.queryStringObject.userId) == 'string' ? data.queryStringObject.userId : false;
  if (userId) {
    Phrase.find({ owner: userId }).then((phrases) => callback(200, phrases)).catch(err => { callback(400, err) });
  } else {
    callback(500, { 'Error': 'Go fuck yourself!' })
  }
}

handlers._phrases.delete = function (data, callback) {
  let phraseId = typeof (data.payload.phraseId) == 'string' ? data.payload.phraseId : false;
  if (phraseId) {
    Phrase.deleteOne({ _id: phraseId }).then(() => callback(200, 'OK')).catch(err => { callback(400, err) });
  } else {
    callback(500, { 'Error': 'Go fuck yourself!' })
  }
}


module.exports = handlers;
