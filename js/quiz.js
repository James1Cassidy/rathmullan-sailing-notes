const questions = [
    {
        question: "Which side of the boat is 'Port'?",
        options: ["Left", "Right", "Front", "Back"],
        correct: 0
    },
    {
        question: "What color is the light on the Starboard side?",
        options: ["Red", "Green", "White", "Yellow"],
        correct: 1
    },
    {
        question: "If the wind is coming over the right side of the boat, what tack are you on?",
        options: ["Port Tack", "Starboard Tack", "No Tack", "Running"],
        correct: 1
    },
    {
        question: "Which knot is best for creating a fixed loop at the end of a rope?",
        options: ["Reef Knot", "Clove Hitch", "Bowline", "Figure of Eight"],
        correct: 2
    },
    {
        question: "When two sailing boats are on opposite tacks, which one has the right of way?",
        options: ["The boat on Port Tack", "The boat on Starboard Tack", "The faster boat", "The larger boat"],
        correct: 1
    },
    {
        question: "What is the 'Leeward' side?",
        options: ["The side the wind is hitting", "The side away from the wind", "The front of the boat", "The back of the boat"],
        correct: 1
    },
    {
        question: "Which knot is used to join two ropes of different thicknesses?",
        options: ["Sheet Bend", "Reef Knot", "Round Turn and Two Half Hitches", "Bowline"],
        correct: 0
    },
    {
        question: "What does 'luffing' mean?",
        options: ["Sailing faster", "The sails flapping because the boat is too close to the wind", "Capsizing", "Turning away from the wind"],
        correct: 1
    },
    {
        question: "Who has right of way: a sailing boat under sail or a powerboat?",
        options: ["Powerboat", "Sailing boat", "Whichever is faster", "Whichever is larger"],
        correct: 1
    },
    {
        question: "What is the term for turning the bow of the boat through the wind?",
        options: ["Gybing", "Tacking", "Luffing", "Bearing Away"],
        correct: 1
    },
    // New Questions
    {
        question: "What is the Beaufort Scale used to measure?",
        options: ["Water Depth", "Wind Speed", "Temperature", "Wave Height"],
        correct: 1
    },
    {
        question: "What should you shout if someone falls into the water?",
        options: ["Help!", "Man Overboard!", "Swimmer!", "Ahoy!"],
        correct: 1
    },
    {
        question: "Which sail control primarily affects the twist of the mainsail?",
        options: ["Cunningham", "Outhaul", "Kicker (Vang)", "Halyard"],
        correct: 2
    },
    {
        question: "What is the 'No Go Zone'?",
        options: ["The area directly downwind", "The area directly into the wind where the boat cannot sail", "A restricted area in the harbor", "The area behind the boat"],
        correct: 1
    },
    {
        question: "When overtaking another boat, which boat is the 'Give Way' vessel?",
        options: ["The overtaking boat", "The boat being overtaken", "The faster boat", "The boat on starboard tack"],
        correct: 0
    },
    {
        question: "What is a 'gybe'?",
        options: ["Turning the bow through the wind", "Turning the stern through the wind", "Stopping the boat", "Sailing backwards"],
        correct: 1
    },
    {
        question: "What is the purpose of a daggerboard or centerboard?",
        options: ["To steer the boat", "To prevent leeway (sideways drift)", "To hold the mast up", "To sit on"],
        correct: 1
    },
    {
        question: "What does a 'figure of eight' knot do?",
        options: ["Joins two ropes", "Creates a loop", "Acts as a stopper knot", "Ties up the boat"],
        correct: 2
    },
    {
        question: "Which cloud type often indicates approaching bad weather?",
        options: ["Cumulus", "Cirrus", "Cumulonimbus", "Stratus"],
        correct: 2
    },
    {
        question: "What is the 'clew' of a sail?",
        options: ["The top corner", "The bottom front corner", "The bottom back corner", "The middle of the sail"],
        correct: 2
    }
];

let currentQuestionIndex = 0;
let score = 0;

const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score-display');
const questionCounter = document.getElementById('question-counter');
const finalScoreEl = document.getElementById('final-score');
const resultMessageEl = document.getElementById('result-message');

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', startQuiz);

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    // Shuffle questions for variety
    shuffleArray(questions);

    startScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    updateScore();
    showQuestion();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    optionsContainer.innerHTML = '';
    feedbackEl.classList.add('hidden');
    feedbackEl.className = 'mt-6 hidden p-4 rounded-lg text-center font-semibold'; // Reset classes
    nextBtn.disabled = true;
    nextBtn.classList.add('cursor-not-allowed', 'bg-gray-200', 'text-gray-500');
    nextBtn.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.className = 'w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 font-medium text-gray-700';
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, selectedBtn) {
    // Disable all buttons
    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    const q = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === q.correct;

    if (isCorrect) {
        score++;
        selectedBtn.classList.remove('border-gray-200', 'hover:border-blue-400', 'hover:bg-blue-50');
        selectedBtn.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
        feedbackEl.textContent = "Correct! Well done.";
        feedbackEl.classList.add('bg-green-100', 'text-green-800');
    } else {
        selectedBtn.classList.remove('border-gray-200', 'hover:border-blue-400', 'hover:bg-blue-50');
        selectedBtn.classList.add('bg-red-100', 'border-red-500', 'text-red-800');

        // Highlight correct answer
        buttons[q.correct].classList.add('bg-green-100', 'border-green-500', 'text-green-800');

        feedbackEl.textContent = `Incorrect. The correct answer is: ${q.options[q.correct]}`;
        feedbackEl.classList.add('bg-red-100', 'text-red-800');
    }

    feedbackEl.classList.remove('hidden');
    updateScore();

    // Enable Next button
    nextBtn.disabled = false;
    nextBtn.classList.remove('cursor-not-allowed', 'bg-gray-200', 'text-gray-500');
    nextBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function endQuiz() {
    questionScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    finalScoreEl.textContent = `${score}/${questions.length}`;

    let message = "";
    let suggestion = "";
    let link = "";
    let linkText = "";

    const percentage = (score / questions.length) * 100;

    if (percentage === 100) {
        message = "Perfect Score! You're a master mariner!";
        suggestion = "You seem ready for our Advanced Courses.";
        link = "advanced.html";
        linkText = "Check out Advanced Courses";
    } else if (percentage >= 80) {
        message = "Great job! You really know your stuff.";
        suggestion = "We recommend checking out our Improving Skills course.";
        link = "improving_skills.html";
        linkText = "Explore Improving Skills";
    } else if (percentage >= 60) {
        message = "Good effort! You have a solid foundation.";
        suggestion = "The Basic Skills course would be perfect for you.";
        link = "basic_skills.html";
        linkText = "View Basic Skills";
    } else if (percentage >= 40) {
        message = "Not bad! A little more practice will help.";
        suggestion = "Start with our Start Sailing course to build confidence.";
        link = "start_sailing.html";
        linkText = "Go to Start Sailing";
    } else {
        message = "Time to hit the books (and the water)!";
        suggestion = "We recommend starting from the beginning with Taste of Sailing.";
        link = "taste_of_sailing.html";
        linkText = "Discover Taste of Sailing";
    }

    resultMessageEl.innerHTML = `
        <p class="text-xl font-bold mb-2">${message}</p>
        <p class="text-gray-600 mb-6">${suggestion}</p>
        <a href="${link}" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">${linkText}</a>
    `;
}
