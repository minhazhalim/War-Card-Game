const cardObjectDefinitions = [
     {id: 1,imagePath: './images/card-KingHearts.png'},
     {id: 2,imagePath: './images/card-JackClubs.png'},
     {id: 3,imagePath: './images/card-QueenDiamonds.png'},
     {id: 4,imagePath: './images/card-AceSpades.png'},
];
const aceId = 4;
const cardBackImagePath = './images/card-back-blue.png';
const winColor = 'green';
const loseColor = 'red';
const primaryColor = 'black';
const localStorageGameKey = 'HTA';
const playGameButtonElement = document.getElementById('playGame');
const cardContainerElement = document.querySelector('.card-container');
const currentGameStatusElement = document.querySelector('.current-status');
const scoreContainerElement = document.querySelector('.header-score-container');
const scoreElement = document.querySelector('.score');
const roundContainerElement = document.querySelector('.header-round-container');
const roundElement = document.querySelector('.round');
const collapsedGridAreaTemplate = '"a a" "a a"';
const cardCollectionCellClass = '.card-position-a';
const numberCards = cardObjectDefinitions.length;
let cards = [];
let cardPositions = [];
let gameObject = {};
let gameInProgress = false;
let shufflingInProgress = false;
let cardsRevealed = false;
let score = 0;
let roundNumber = 0;
let maximumNumbers = 4;
function initializeCardPositions(card){
     cardPositions.push(card.id);
}
function createElement(elementType){
     return document.createElement(elementType);
}
function addClassToElement(element,className){
     element.classList.add(className);
}
function addIdToElement(element,id){
     element.id = id;
}
function addSrcToImageElem(imageElement,source){
     imageElement.src = source;
}
function addChildElement(parentElement,childElement){
     parentElement.appendChild(childElement);
}
function getSerializedObjectAsJSON(object){
     return JSON.stringify(object);
}
function getObjectFromJSON(json){
     return JSON.parse(json);
}
function updateLocalStorageItem(key,value){
     localStorage.setItem(key,value);
}
function removeLocalStorageItem(key){
     localStorage.removeItem(key);
}
function getLocalStorageItemValue(key){
     return localStorage.getItem(key);
}
function updateGameObject(score,round){
     gameObject.score = score;
     gameObject.round = round;
}
function canChooseCard(){
     return gameInProgress == true && !shufflingInProgress && !cardsRevealed;
}
function transformGridArea(areas){
     cardContainerElement.style.gridTemplateAreas = areas;
}
function removeShuffleClasses(){
     cards.forEach((card) => {
          card.classList.remove('shuffle-left');
          card.classList.remove('shuffle-right');
     });
}
function mapCardIdToGridCell(card){
     if(card.id == 1) return '.card-position-a';
     else if(card.id == 2) return '.card-position-b';
     else if(card.id == 3) return '.card-position-c';
     else if(card.id == 4) return '.card-position-d';
}
function calculateScoreToAdd(roundNumber){
     if(roundNumber == 1) return 100;
     else if(roundNumber == 2) return 50;
     else if(roundNumber == 3) return 25;
     else return 10;
}
function updateStatusElement(element,display,color,innerHTML){
     element.style.display = display;
     if(arguments.length > 2){
          element.style.color = color;
          element.innerHTML = innerHTML;
     }
}
function flipCard(card,flipToBack){
     const innerCardElement = card.firstChild;
     if(flipToBack && !innerCardElement.classList.contains('flip-it')){
          innerCardElement.classList.add('flip-it');
     }else if(innerCardElement.classList.contains('flip-it')){
          innerCardElement.classList.remove('flip-it');
     }
}
function flipCards(flipToBack){
     cards.forEach((card,index) => {
          setTimeout(() => {
               flipCard(card,flipToBack);
          },index * 100);
     });
}
function cardFlyInEffect(){
     const id = setInterval(flyIn,5);
     let cardCount = 0;
     let count = 0;
     function flyIn(){
          count++;
          if(cardCount == numberCards){
               clearInterval(id);
               playGameButtonElement.style.display = 'inline-block';
          }
          if(count == 1 || count == 250 || count == 500 || count == 750){
               cardCount++;
               let card = document.getElementById(cardCount);
               card.classList.remove('fly-in');
          }
     }
}
function animateShuffle(shuffleCount){
     const random1 = Math.floor(Math.random() * numberCards) + 1;
     const random2 = Math.floor(Math.random() * numberCards) + 1;
     let card1 = document.getElementById(random1);
     let card2 = document.getElementById(random2);
     if(shuffleCount % 4 == 0){
          card1.classList.toggle('shuffle-left');
          card1.style.zIndex = 100;
     }
     if(shuffleCount % 10 == 0){
          card2.classList.toggle('shuffle-right');
          card2.style.zIndex = 200;
     }
}
function randomizeCardPositions(){
     const random1 = Math.floor(Math.random() * numberCards) + 1;
     const random2 = Math.floor(Math.random() * numberCards) + 1;
     const temperature = cardPositions[random1 - 1];
     cardPositions[random1 - 1] = cardPositions[random2 - 1];
     cardPositions[random2 - 1] = temperature;
}
function returnGridAreasMappedToCardPos(){
     let firstPart = "";
     let secondPart = "";
     let areas = "";
     cards.forEach((card,index) => {
          if(cardPositions[index] == 1){
               areas = areas + 'a ';
          }else if(cardPositions[index] == 2){
               areas = areas + 'b ';
          }else if(cardPositions[index] == 3){
               areas = areas + 'c ';
          }else if(cardPositions[index] == 4){
               areas = areas + 'd ';
          }
          if(index == 1){
               firstPart = areas.substring(0,areas.length - 1);
               areas = "";
          }else if(index == 3){
               secondPart = areas.substring(0,areas.length - 1);
          }
     });
     return `"${firstPart}" "${secondPart}"`;
}
function gameOver(){
     updateStatusElement(scoreContainerElement,'none');
     updateStatusElement(roundContainerElement,'none');
     const gameOverMessage = `Game Over! Final Score - <span class = 'badge'>${score}</span> Click 'Play Game' button to play again`;
     updateStatusElement(currentGameStatusElement,'block',primaryColor,gameOverMessage);
     gameInProgress = false;
     playGameButtonElement.disabled = false;
}
function endRound(){
     setTimeout(() => {
          if(roundNumber == maximumNumbers){
               gameOver();
               return;
          }else startRound();
     },1000);
}
function chooseCard(card){
     if(canChooseCard()){
          evaluateCardChoice(card);
          saveGameObjectToLocalStorage(score,roundNumber);
          flipCard(card,false);
          setTimeout(() => {
               flipCards(false);
               updateStatusElement(currentGameStatusElement,'block',primaryColor,'Card Positions Revealed');
               endRound();
          },1000);
          cardsRevealed = true;
     }
}
function attachClickEventHandlerToCard(card){
     card.addEventListener('click',() => chooseCard(card));
}
function calculateScore(){
     const scoreToAdd = calculateScoreToAdd(roundNumber);
     score = score + scoreToAdd;
}
function updateScore(){
     calculateScore();
     updateStatusElement(scoreElement,'block',primaryColor,`Score <span class='badge'>${score}</span>`);
}
function outputChoiceFeedBack(hit){
     if(hit) updateStatusElement(currentGameStatusElement,'block',winColor,'Hit!! - Well Done!! :)');
     else updateStatusElement(currentGameStatusElement,'block',loseColor,'Missed!! :(")');
}
function evaluateCardChoice(card){
     if(card.id == aceId){
          updateScore();
          outputChoiceFeedBack(true);
     }else outputChoiceFeedBack(false);
}
function checkForIncompleteGame(){
     const serializedGameObject = getLocalStorageItemValue(localStorageGameKey);
     if(serializedGameObject){
          gameObject = getObjectFromJSON(serializedGameObject);
          if(gameObject.round >= maximumNumbers) removeLocalStorageItem(localStorageGameKey);
          else{
               if(confirm('Would You Like to Continue With Your Last Game?')){
                    score = gameObject.score;
                    roundNumber = gameObject.round;
               }
          }
     }
}
function initializeNewGame(){
     score = 0;
     roundNumber = 0;
     checkForIncompleteGame();
     shufflingInProgress = false;
     updateStatusElement(scoreContainerElement,'flex');
     updateStatusElement(roundContainerElement,'flex');
     updateStatusElement(scoreElement,'block',primaryColor,`Score <span class='badge'>${score}</span>`);
     updateStatusElement(roundElement,'block',primaryColor,`Round <span class='badge'>${roundNumber}</span>`);
}
function initializeNewRound(){
     roundNumber++;
     playGameButtonElement.disabled = true;
     gameInProgress = true;
     shufflingInProgress = true;
     cardsRevealed = false;
     updateStatusElement(currentGameStatusElement,'block',primaryColor,'Shuffling.....');
     updateStatusElement(roundElement,'block',primaryColor,`Round <span class='badge'>${roundNumber}</span>`);
}
function addCardsToGridAreaCell(cellPositionClassName){
     const cellPositionElement = document.querySelector(cellPositionClassName);
     cards.forEach((card,index) => {
          addChildElement(cellPositionElement,card);
     });
}
function collectCards(){
     transformGridArea(collapsedGridAreaTemplate);
     addCardsToGridAreaCell(cardCollectionCellClass);
}
function shuffleCards(){
     let shuffleCount = 0;
     const id = setInterval(shuffle,12);
     function shuffle(){
          randomizeCardPositions();
          animateShuffle(shuffleCount);
          if(shuffleCount == 500){
               clearInterval(id);
               shufflingInProgress = false;
               removeShuffleClasses();
               dealCards();
               updateStatusElement(currentGameStatusElement,'block',primaryColor,'Please Click the Card that You Think is the Ace of Spades...');
          }else shuffleCount++;
     }
}
function startRound(){
     initializeNewRound();
     collectCards();
     flipCards(true);
     shuffleCards();
}
function startGame(){
     initializeNewGame();
     startRound();
}
function loadGame(){
     createCards();
     cards = document.querySelectorAll('.card');
     cardFlyInEffect();
     playGameButtonElement.addEventListener('click',() => startGame());
     updateStatusElement(scoreContainerElement,'none');
     updateStatusElement(roundContainerElement,'none');
}
loadGame();
function dealCards(){
     addCardsToAppropriateCell();
     const areasTemplate = returnGridAreasMappedToCardPos();
     transformGridArea(areasTemplate);
}
function createCard(cardItem){
     const cardElement = createElement('div');
     const cardInnerElement = createElement('div');
     const cardFrontElement = createElement('div');
     const cardBackElement = createElement('div');
     const cardFrontImage = createElement('img');
     const cardBackImage = createElement('img');
     addClassToElement(cardElement,'card');
     addClassToElement(cardElement,'fly-in');
     addIdToElement(cardElement,cardItem.id);
     addClassToElement(cardInnerElement,'card-inner');
     addClassToElement(cardFrontElement,'card-front');
     addClassToElement(cardBackElement,'card-back');
     addSrcToImageElem(cardBackImage,cardBackImagePath);
     addSrcToImageElem(cardFrontImage,cardItem.imagePath);
     addClassToElement(cardBackImage,'card-image');
     addClassToElement(cardFrontImage,'card-image');
     addChildElement(cardFrontElement,cardFrontImage);
     addChildElement(cardBackElement,cardBackImage);
     addChildElement(cardInnerElement,cardFrontElement);
     addChildElement(cardInnerElement,cardBackElement);
     addChildElement(cardElement,cardInnerElement);
     addCardToGridCell(cardElement);
     initializeCardPositions(cardElement);
     attachClickEventHandlerToCard(cardElement);
}
function createCards(){
     cardObjectDefinitions.forEach((cardItem) => {
          createCard(cardItem);
     });
}
function addCardToGridCell(card){
     const cardPositionClassName = mapCardIdToGridCell(card);
     const cardPositionElement = document.querySelector(cardPositionClassName);
     addChildElement(cardPositionElement,card);
}
function addCardsToAppropriateCell(){
     cards.forEach((card) => {
          addCardToGridCell(card);
     });
}
function saveGameObjectToLocalStorage(score,round){
     updateGameObject(score,round);
     updateLocalStorageItem(localStorageGameKey,getSerializedObjectAsJSON(gameObject));
}