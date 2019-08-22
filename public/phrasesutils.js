var utils = {};

utils.trainingFunc = function(phrases){
    console.log(phrases);
    var transformedPhrases = [];
    for(var i = 0; i < phrases.length; i++){
        transformedPhrases.push([phrases[i].phrase, phrases[i].translation])
    }

    console.log(transformedPhrases);

    var state = {};

    state.currentPhraseNum = null;

    var buttonChecker = document.querySelector('#checker');
    var buttonShow = document.querySelector('#show');
    var buttonNext = document.querySelector('#next');
    var screen = document.querySelector('#screen');
    var inputValue = document.querySelector('#phrase_input');

    state.makeRandomNum = function(min, max) {
      return 0 + Math.floor(Math.random() * (max + 1 - min)); 
    }
  
    state.getRandomPhraseAndDisplay = function() {
      state.currentPhraseNum = state.makeRandomNum(0,  transformedPhrases.length - 1);

      console.log(transformedPhrases[state.currentPhraseNum][0]);
      console.log(state.currentPhraseNum);
      screen.innerHTML = `<div class="heading-secondary">${transformedPhrases[state.currentPhraseNum][0]}</div>`;
    }
  
    state.checkingInput = function(){
    console.log(state.currentPhraseNum);
    if (inputValue.value ===  transformedPhrases[state.currentPhraseNum][1]) {
        console.log('Success!');
        screen.innerHTML = `<div class="heading-secondary-success">Correct!</div>`;
        setTimeout(function reload(){
        window.location.reload();
    }, 1000)} else {
        screen.innerHTML = `<div class="heading-secondary-danger">Incorrect! Try again :)</div>`;
        setTimeout(function(){
        screen.innerHTML = `<div class="heading-secondary">${transformedPhrases[state.currentPhraseNum][0]}</div>`;
    }, 3000)
    }
  }

    state.getRandomPhraseAndDisplay();

    buttonChecker.addEventListener('click', state.checkingInput);

    buttonShow.addEventListener('click', function(){
        screen.innerHTML = `<div class="heading-secondary">${transformedPhrases[state.currentPhraseNum][1]}</div>`
    });

    buttonNext.addEventListener('click', function(){
        window.location.reload();
    });
};

utils.displayPhrases = function(phrases){
    console.log(phrases);
    var phrasescontainer = document.querySelector('.phrases-container');
    for(var i = 0; i < phrases.length; i++ ){
        phrasebox = document.createElement('div');
        phrasebox.className = 'phrasebox';
        phrasebox.id = `${phrases[i]['_id']}`;
        phrasebox.innerHTML = `<div class="phrase heading-tertiary">
          ${phrases[i]['phrase']}</div>
          <div class="translation heading-tertiary">
          ${phrases[i]['translation']}</div>
          <div class="delete-btn"></div>`
        phrasescontainer.appendChild(phrasebox);
    }
  
    document.addEventListener('click', function(e){
        var element = e.target;
        if(element.classList.contains('delete-btn')){
          console.log('Dupsko');
          var payload = {
            'phraseId': e.target.parentElement.id,
            'userId': app.config.sessionToken['userId']
          }
          app.client.request(undefined, 'api/phrases', 'DELETE', undefined, payload, function(statusCode,responsePayload){
            if(statusCode !==200){
              console.log(responsePayload);
            } else {
              e.target.parentElement.remove();
              console.log('Phrase deleted');
            }
        })}
    })
}


