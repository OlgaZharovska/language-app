var app = {};

app.config = {
  'sessionToken' : false
};

app.client = {}

app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  var requestUrl = path+'?';
  var counter = 0;
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       if(counter > 1){
         requestUrl+='&';
       }
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;

        if(callback){
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }

        }
      }
  }

  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

app.bindLogoutButton = function(){
    document.getElementById("logoutButton").addEventListener("click", function(e){
    e.preventDefault();
    app.logUserOut();
  });
};

app.logUserOut = function(redirectUser){
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  var userId = typeof(app.config.sessionToken.userId) == 'string' ? app.config.sessionToken.userId : false;

  var payload = {
    'id' : userId
  };
  app.client.request(undefined,'api/tokens','DELETE',undefined,payload,function(statusCode,responsePayload){
    if(statusCode == 200){
      app.setSessionToken(false);

      if(redirectUser){
        window.location = '/session/deleted';
      }
    } else {
      console.log(statusCode,responsePayload);
    }
   

  });
};

app.bindForms = function(){
  if(document.querySelector("form")){

    var allForms = document.querySelectorAll("form");
    for(var i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){

        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // // Hide the error message (if it's currently shown due to a previous error)
        // document.querySelector("#"+formId+" .formError").style.display = 'none';

        // // Hide the success message (if it's currently shown due to a previous error)
        // if(document.querySelector("#"+formId+" .formSuccess")){
        //   document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        // }

        var payload = {};

        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            var valueOfElement = elements[i].value;
            if(elements[i].name == '_method'){
              method = valueOfElement;
            } else {
              payload[elements[i].name] = valueOfElement;
            }

          }
        }

        if(formId == 'phrasesCreate'){
          var token = app.config.sessionToken;
          userId = token.userId;
          payload['userId'] = userId;
        }

        // var queryStringObject = method == 'DELETE' ? payload : {};

        app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
          if(statusCode !== 200){

            if(statusCode == 403){
              app.logUserOut();
            } else {
              console.log(responsePayload)
            }
          } else {
            app.formResponseProcessor(formId,payload,responsePayload);
          }
        });
      });
    }
  }
};

app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  if(formId == 'accountCreate'){
    var newPayload = {
      'phone' : requestPayload.phone,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      if(newStatusCode !== 200){

        console.log(newResponsePayload);
      } else {
        app.setSessionToken(newResponsePayload);
        window.location = '/phrases/manage';
      }
    });
  }

  if(formId == 'sessionCreate'){
    app.setSessionToken(responsePayload);
    window.location = '/phrases/manage';
  }

  if(formId == 'phrasesCreate'){
    window.location = '/phrases/manage';
  }

};

app.getSessionToken = function(){
  var tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

app.loadDataOnPage = function(){
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  if(primaryClass == 'getPhrase'){
    app.loadPhraseTrainingPage();
  }
  if(primaryClass == 'phrasesManage'){
    app.loadPhrasesManagePage();
  }
};

app.loadPhrasesManagePage = function(){
  userId = app.config.sessionToken.userId;
  var queryStringObject = {'userId' : userId }
  app.client.request(undefined,'api/phrases','GET',queryStringObject,undefined,function(statusCode,responsePayload){
    if(statusCode == 200){
      var phrases = responsePayload;
      console.log(phrases);
      utils.displayPhrases(responsePayload)
    } else {
      console.log(responsePayload);
  }});
}

app.loadPhraseTrainingPage = function(){

  var tokenString = localStorage.getItem('token');
  userId = JSON.parse(tokenString).userId;

  var queryStringObject = {'userId' : userId }

  app.client.request(undefined,'api/phrases','GET',queryStringObject,undefined,function(statusCode,responsePayload){
    if(statusCode == 200){
    console.log(responsePayload);
    utils.trainingFunc(responsePayload);
 } else {
    console.log('Fail')
  }
    
  });
}

app.init = function(){

  app.bindForms();

  app.bindLogoutButton();

  app.getSessionToken();

  app.loadDataOnPage();

};

window.onload = function(){
  app.init();
};
