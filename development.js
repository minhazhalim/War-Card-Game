const valueMap = {
     ACE: 14,
     KING: 13,
     QUEEN: 12,
     JACK: 11,
};
let deckId = "";
let playerScore = 0;
let computerScore = 0;
fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
     .then((response) => response.json())
     .then((data) => {
          deckId = data.deck_id;
     });
function getCardValue(value){
     return valueMap[value] || parseInt(value);
}
function drawCards(){
     fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
          .then((response) => response.json())
          .then((data) => {
               const playerData = data.cards[0];
               const computerData = data.cards[1];
               const playerCard = document.getElementById('player-card');
               const computerCard = document.getElementById('computer-card');
               playerCard.src = playerData.image;
               computerCard.src = computerData.image;
               Promise.all([
                    new Promise((resolve) => (playerCard.onload = resolve)),
                    new Promise((resolve) => (computerCard.onload = resolve)),
               ]).then(() => {
                    const playerValue = getCardValue(playerData.value);
                    const computerValue = getCardValue(computerData.value);
                    const resultText = document.getElementById('result-text');
                    if(playerValue > computerValue){
                         playerScore += 1;
                         resultText.textContent = 'you Win This Round 🎉';
                    }else if(playerValue < computerValue){
                         computerScore += 1;
                         resultText.textContent = 'Computer Wins This Round 😔';
                    }else {
                         resultText.textContent = "It's a tie! No Points Awarded";
                    }
                    document.getElementById('player-score').textContent = playerScore;
                    document.getElementById('computer-score').textContent = computerScore;
               });
          });
}