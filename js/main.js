function MakeGame(token) {
    this.token = token;
    this.score = 0;
    this.highscore = localStorage.getItem('jeopardyHighscore') || 0;
    this.selectedQs = "";
    this.answered = 0;
    this.selectedPts = 0;
    this.totalQs = 30;
    this.questions = {
        31: [],
        32: [],
        10: [],
        11: [],
        14: [],
        15: []
    };

    this.getQuestion = async function(amount, category, difficulty, type) {
        await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}&token=${this.token}`)
        .then(res => res.json())
        .then(data => {
            this.questions[category].push(...data.results);
        });
    }.bind(this);

    this.getQuestions = async function() {
        // 6 categories - 31 (anime), 32 (cartoon), books (10), film (11), tv (14), video games (15)
        // 2 true / false, 3 multiple choice (2 multiple choice + 1 written)
        // 1 easy 1 medium                    2 medium            1 hard

        // anime - 31
        await this.getQuestion(1, 31, 'easy', 'boolean'); // 200                0
        await this.getQuestion(1, 31, 'medium', 'boolean'); // 400              1
        await this.getQuestion(2, 31, 'medium', 'multiple'); // 600, 800        2 3
        await this.getQuestion(1, 31, 'hard', 'multiple'); // 1000              4

        // cartoons - 32;
        await this.getQuestion(1, 32, 'easy', 'boolean');
        await this.getQuestion(1, 32, 'medium', 'boolean');
        await this.getQuestion(2, 32, 'medium', 'multiple');
        await this.getQuestion(1, 32, 'hard', 'multiple');

        // books - 10
        await this.getQuestion(1, 10, 'easy', 'boolean');
        await this.getQuestion(1, 10, 'medium', 'boolean');
        await this.getQuestion(2, 10, 'medium', 'multiple');
        await this.getQuestion(1, 10, 'hard', 'multiple');

        // film - 11
        await this.getQuestion(1, 11, 'easy', 'boolean');
        await this.getQuestion(1, 11, 'medium', 'boolean');
        await this.getQuestion(2, 11, 'medium', 'multiple');
        await this.getQuestion(1, 11, 'hard', 'multiple');

        // tv - 14
        await this.getQuestion(1, 14, 'easy', 'boolean');
        await this.getQuestion(1, 14, 'medium', 'boolean');
        await this.getQuestion(2, 14, 'medium', 'multiple');
        await this.getQuestion(1, 14, 'hard', 'multiple');

        // video games - 15
        await this.getQuestion(1, 15, 'easy', 'boolean');
        await this.getQuestion(1, 15, 'medium', 'boolean');
        await this.getQuestion(2, 15, 'medium', 'multiple');
        await this.getQuestion(1, 15, 'hard', 'multiple');

    }.bind(this);

    this.addSmurfsToQuestions = function() {
        const qs = document.querySelectorAll('td');
        Array.from(qs).forEach(element => element.addEventListener('click', this.displayQuestion, true))
    }.bind(this);

    this.displayQuestion = function(e) {
        let [category, index] = this.parseId(e.target.id);

        this.selectedQs = this.questions[category][index];
        this.selectedPts = 200 * (index+1);

        document.querySelector("#qna").classList.remove('hidden');

        document.querySelector('#question').innerHTML = this.selectedQs.question;
        document.querySelector('#answer').innerHTML = '';

        if (this.selectedQs.type === 'boolean') {
            this.displayBoolean();
        } else if (this.selectedQs.type === 'multiple' && this.selectedQs.difficulty === 'medium') {
            let choices = this.randomizeAnswerOrder();
            this.displayMultiple(choices);
        } else if (this.selectedQs.type === 'multiple' && this.selectedQs.difficulty === 'hard') {
            this.displayWritten();
        }
        
        document.querySelector('button').addEventListener('click', this.checkAnswer);
        this.displayAnsweredQs(e.target.id);
        

    }.bind(this);

    this.displayAnsweredQs = function(id) {
        document.querySelector(`#${id}`).removeEventListener('click', this.displayQuestion, true);
        document.querySelector(`#${id}`).classList.add('answered');
    }

    this.parseId = function(id) {
        let category = id.split("-")[0];
        let index = id.split("-")[1];

        if (category === 'anime') {
            category = 31;
        } else if (category === 'cartoons') {
            category = 32;
        } else if (category === 'books') {
            category = 10;
        } else if (category === 'film') {
            category = 11;
        } else if (category === 'tv') {
            category = 14;
        } else if (category === 'games') {
            category = 15;
        } 

        return [String(category), Number(index)];
    }.bind(this);

    this.displayBoolean = function() {
        document.querySelector('#answer').innerHTML = '<input type="radio" name="playerAnswer" value="true"/><label for="true">True</label>';
        document.querySelector('#answer').innerHTML += '<input type="radio" name="playerAnswer" value="false"/><label for="false">False</label>';
    }

    this.displayMultiple = function(choices) {        
        for (let i = 0; i < choices.length; i++) {
            document.querySelector('#answer').innerHTML += `<input type="radio" name="playerAnswer" value="${choices[i]}"/><label for="${choices[i]}">${choices[i]}</label>`;
        }
    }

    this.displayWritten = function() {
        document.querySelector('#answer').innerHTML = '<input type="text" name="playerAnswer" />';
    }

    this.randomizeAnswerOrder = function() {
        /* Randomize array in-place using Durstenfeld shuffle algorithm */
        let choices = [this.selectedQs.correct_answer, ...this.selectedQs.incorrect_answers];
        for (let i = choices.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = choices[i];
            choices[i] = choices[j];
            choices[j] = temp;
        }
        
        return choices;
    }.bind(this);

    this.checkAnswer = function() {
        document.querySelector("#qna").classList.add('hidden');

        let playerAnswer = this.selectedQs.difficulty !== 'hard' ? document.querySelector(`input[name=playerAnswer]:checked`).value : document.querySelector(`input[name=playerAnswer]`).value;

        if (playerAnswer.trim().toLowerCase() === this.selectedQs.correct_answer.toLowerCase()) {
            this.score += this.selectedPts;
        } else {
            this.score -= this.selectedPts;
        }

        document.querySelector('#score').innerText = this.score;
        this.answered++;
        
        if (this.answered === 30) {
            this.gameOver();
        }

    }.bind(this);

    this.gameOver = function() {
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('jeopardyHighscore', this.score);
        }

        document.querySelector('#final-score').innerText = this.score;

        document.querySelector('#highscore').innerText = this.highscore;
        document.querySelector('.game-over').classList.remove('hidden');
        document.querySelector('.play-button').addEventListener('click', this.newGame);
    }

    this.newGame = async function() {
        this.token = await getSessionToken();
        this.score = 0;
        this.answered = 0;
        this.questions = {
            31: [],
            32: [],
            10: [],
            11: [],
            14: [],
            15: []
        };

        const qs = document.querySelectorAll('td');
        Array.from(qs).forEach(element => element.classList.remove('answered'));

        document.querySelector('.game-over').classList.add('hidden');

        document.querySelector('#score').innerText = this.score;

        await this.getQuestions();
        this.addSmurfsToQuestions();

    }.bind(this);

    
    

}

async function getSessionToken() {
    const request = await fetch('https://opentdb.com/api_token.php?command=request');
    const response = await request.json();
    const token = await response.token;
    console.log("getting session token...", token);

    return token;
}

async function setUp() {
    let token = await getSessionToken();

    document.querySelector('#highscore').innerText = localStorage.getItem('jeopardyHighscore') || 0;

    let board = new MakeGame(token);
    await board.getQuestions();
    board.addSmurfsToQuestions();


    console.log(board);

}

setUp();

