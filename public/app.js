let app = {};

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

  let requestUrl = path+'?';
  let counter = 0;
  for(let queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       if(counter > 1){
         requestUrl+='&';
       }
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  for(let headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        let statusCode = xhr.status;
        let responseReturned = xhr.responseText;

        if(callback){
          try{
            let parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }

        }
      }
  }

  let payloadString = JSON.stringify(payload);
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

  let userId = typeof(app.config.sessionToken.userId) == 'string' ? app.config.sessionToken.userId : false;

  let payload = {
    'id' : userId
  };
  app.client.request(undefined,'api/tokens','DELETE',undefined,payload,function(statusCode,responsePayload){
    if(statusCode == 200){
      app.setSessionToken(false);

      if(redirectUser){
        window.location = '/';
      }
    } else {
      console.log(statusCode,responsePayload);
    }
   

  });
};

app.bindForms = function(){
  if(document.querySelector("form")){

    let allForms = document.querySelectorAll("form");
    for(let i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){

        e.preventDefault();
        let formId = this.id;
        let path = this.action;
        let method = this.method.toUpperCase();
        let payload = {};

        let elements = this.elements;
        for(let i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            let valueOfElement = elements[i].value;
            if(elements[i].name == '_method'){
              method = valueOfElement;
            } else {
              payload[elements[i].name] = valueOfElement;
            }

          }
        }

        if(formId == 'phrasesCreate'){
          let token = app.config.sessionToken;
          userId = token.userId;
          payload['userId'] = userId;
        }

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
    let newPayload = {
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
  let tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      let token = JSON.parse(tokenString);
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
  let target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

app.setSessionToken = function(token){
  app.config.sessionToken = token;
  let tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

app.loadDataOnPage = function(){
  let bodyClasses = document.querySelector("body").classList;
  let primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  if(primaryClass == 'getPhrase'){
    app.loadPhraseTrainingPage();
  }
  if(primaryClass == 'phrasesManage'){
    app.loadPhrasesManagePage();
  }
};

app.loadPhrasesManagePage = function(){
  userId = app.config.sessionToken.userId;
  let queryStringObject = {'userId' : userId }
  app.client.request(undefined,'api/phrases','GET',queryStringObject,undefined,function(statusCode,responsePayload){
    if(statusCode == 200){
      let phrases = responsePayload;
      console.log(phrases);
      utils.displayPhrases(responsePayload)
    } else {
      console.log(responsePayload);
  }});
}

app.loadPhraseTrainingPage = function(){

  let tokenString = localStorage.getItem('token');
  userId = JSON.parse(tokenString).userId;

  let queryStringObject = {'userId' : userId }

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
