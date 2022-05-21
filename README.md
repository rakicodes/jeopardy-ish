# Jeopardy-ish
Entertainment trivia in the style of Jeopardy. Answer the questions correctly and earn points!
<section align="center">
  <img src="https://user-images.githubusercontent.com/101219940/169627256-4729c96e-53b4-4462-81b3-b46ca1e61630.gif" alt="game demo">
</section>

<br>

Link to project: [https://jeopardy-ish.netlify.app/](https://jeopardy-ish.netlify.app/)

# How It's Made
Technologies used: HTML5, CSS3, Javascript

This was built using the [Open Trivia Database](https://opentdb.com/browse.php). I used fetch to grab the questions and answers from the API. Then stored the questions and answers in a Javascript object- setting the properties as the question category and the properties value as an array of objects. Placing questions with the same category in the same array. The game logic is implemented in a constructor function. The data from the API is also stored in that constructor function.

# Lessons Learned
In this project, I learned that Javascript doesn't wait until a promise is fulfilled. I realized this when I kept getting undefined when I tried to use the data that I had fetch earlier on in the code. From googling, I found out that I had to use then or async/await. I decided to use async/await for this project. I also found out that I needed to use bind for my functions so that my data is binded to the "this" keyword otherwise the data won't get updated.
