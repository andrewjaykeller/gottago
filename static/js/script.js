'use strict';

var tinderContainer = document.querySelector('.tinder');
var allCards = document.querySelectorAll('.tinder--card');
var nope = document.getElementById('nope');
var love = document.getElementById('love');
var img1 = document.getElementById('img1');
var title1 = document.getElementById('title1');
var headline1 = document.getElementById('headline1');
var currentCard = {
  "title": "Clean Up The City SF's Volunteer Weekend w/ Free Lunch + Happy Hours (Nov. 4-5)",
  "headline": "Join the Clean Up the City movement and beautify our neighborhoods",
  "description": "Participate in our weekly trash-pick ups and enjoy free lunch with fellow San Franciscans. Post-cleanup, mingle with cool people during a happy hour sponsored by the CivicJoyFund.org. All the gear will be provided. Sign up today and let’s beautify San Francisco together!",
  "generativeImagePrompt": "Volunteers cleaning San Francisco streets with bags and tools in hand, later enjoying lunch and happy hour together.",
  "keyWords": ["Volunteer", "Clean Up", "Community", "Free Lunch", "Happy Hour"],
  "date": "Sunday, November 5, 2023 - 10:00 am to 11:00 am",
  "cost": "Free",
  "category": "Volunteering",
  "link": "https://sf.funcheap.com/clean-up-the-city-sfs-volunteer-weekend-w-free-lunch-happy-hours-nov-4-5/",
  "id": 1
};
var nextId = Math.floor(Math.random() * 24);

function initCards(card, index) {
  // var newCards = document.querySelectorAll('.tinder--card:not(.removed)');
  var newCards = document.querySelectorAll('.tinder--card');

  newCards.forEach(function (card, index) {
    card.style.zIndex = allCards.length - index;
    card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
    card.style.opacity = (10 - index) / 10;
  });
  
  tinderContainer.classList.add('loaded');
}

initCards();
updateCard();

allCards.forEach(function (el) {
  var hammertime = new Hammer(el);

  hammertime.on('pan', function (event) {
    el.classList.add('moving');
  });

  hammertime.on('pan', function (event) {
    if (event.deltaX === 0) return;
    if (event.center.x === 0 && event.center.y === 0) return;

    tinderContainer.classList.toggle('tinder_love', event.deltaX > 0);
    tinderContainer.classList.toggle('tinder_nope', event.deltaX < 0);

    var xMulti = event.deltaX * 0.03;
    var yMulti = event.deltaY / 80;
    var rotate = xMulti * yMulti;

    event.target.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
  });

  hammertime.on('panend', function (event) {
    el.classList.remove('moving');
    tinderContainer.classList.remove('tinder_love');
    tinderContainer.classList.remove('tinder_nope');

    var moveOutWidth = document.body.clientWidth;
    var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

    console.log("keep: " + keep);

    // event.target.classList.toggle('removed', !keep);

    if (keep) {
      event.target.style.transform = '';
    } else {
      var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
      var toX = event.deltaX > 0 ? endX : -endX;
      var endY = Math.abs(event.velocityY) * moveOutWidth;
      var toY = event.deltaY > 0 ? endY : -endY;
      var xMulti = event.deltaX * 0.03;
      var yMulti = event.deltaY / 80;
      var rotate = xMulti * yMulti;

      if (toX > 0) {
        console.log("like");
      }
      else {
        console.log("dislike");
      }

      sendUserFeedbackToServer({
        userFeedback: toX > 0 ? 1 : 0,
        ...currentCard
      });
      event.target.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
      initCards();
    }
  });
});

function sendUserFeedbackToServer(data) {
  fetch('/api/user-feedback', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {

      console.log('Success:', data);
      nextId = data.nextId;
      updateCard();
      
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

function updateCard() {
  fetch('/api/get-new-card', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: nextId})
  })
  .then(response => response.json())
  .then(data => {
    var {id, title, headline, link} = data.data;
    currentCard = {
      ...currentCard,
      id,
      title,
      headline,
      link
    }
    var strId = id > 9 ? `100${id}` : `1000${id}`;
    img1.src = `static/images/image-${strId}.png`;
    title1.innerHTML = title;
    headline1.innerHTML = headline;
  })
  .catch((error) => {
      console.error('Error:', error);
  });

}

document.addEventListener('DOMContentLoaded', (event) => {
  var myDiv = document.getElementById('card1');
  console.log("refreshed");
  fetch('/reset')
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

  nextId = Math.floor(Math.random() * 24);

  myDiv.addEventListener('dblclick', function() {
      console.log('Div clicked!');
      window.open(currentCard.link, '_blank');
      // Handle the click event
  });
});