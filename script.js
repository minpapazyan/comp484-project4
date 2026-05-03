const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElement = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const wpmDisplay = document.querySelector("#wpm");
const errorsDisplay = document.querySelector("#errors");
const scoreList = document.querySelector("#score-list");

// Array of random paragraphs for the typing test
const paragraphs = [
    "Typing quickly is useful, but typing accurately is even more important.",
    "JavaScript allows web pages to respond to user actions in real time.",
    "Practice every day and your typing speed will slowly improve over time.",
    "A good programmer writes code that is clear, organized, and easy to understand.",
    "The timer starts when you begin typing and stops when the text matches exactly."
];

let originText = "";
let timer = [0, 0, 0];
let interval;
let timerRunning = false;
let errorCount = 0;
let lastInputWasWrong = false;
let testCompleted = false;

// Add leading zero to numbers 9 or below
function leadingZero(time) {
    if (time <= 9) {
        time = "0" + time;
    }

    return time;
}

// Choose a random paragraph and display it on the page
function chooseRandomText() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    originText = paragraphs[randomIndex];
    originTextElement.innerHTML = originText;
}

// Run a standard minute/second/hundredths timer
function runTimer() {
    let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
    theTimer.innerHTML = currentTime;

    timer[2]++;

    if (timer[2] === 100) {
        timer[2] = 0;
        timer[1]++;
    }

    if (timer[1] === 60) {
        timer[1] = 0;
        timer[0]++;
    }

    updateWPM();
}

// Start the timer when the user begins typing
function startTimer() {
    if (testArea.value.length === 0 && timerRunning === false && testCompleted === false) {
        interval = setInterval(runTimer, 10);
        timerRunning = true;
    }
}

// Compare the user's typed text with the original text
function spellCheck() {
    if (testCompleted === true) {
        return;
    }

    let typedText = testArea.value;
    let originTextMatch = originText.substring(0, typedText.length);

    if (typedText === originText) {
        testWrapper.style.borderColor = "green";
        clearInterval(interval);
        timerRunning = false;
        testCompleted = true;
        saveScore();
    } else if (typedText === originTextMatch) {
        testWrapper.style.borderColor = "blue";
        lastInputWasWrong = false;
    } else {
        testWrapper.style.borderColor = "orangered";

        if (lastInputWasWrong === false) {
            errorCount++;
            errorsDisplay.innerHTML = errorCount;
            lastInputWasWrong = true;
        }
    }
}

// Calculate and display WPM
function updateWPM() {
    let totalSeconds = (timer[0] * 60) + timer[1] + (timer[2] / 100);
    let totalCharacters = testArea.value.length;

    if (totalSeconds > 0 && totalCharacters > 0) {
        let wpm = Math.round((totalCharacters / 5) / (totalSeconds / 60));
        wpmDisplay.innerHTML = wpm;
    } else {
        wpmDisplay.innerHTML = 0;
    }
}

// Save completed score to localStorage
function saveScore() {
    let completedTime = theTimer.innerHTML;
    let completedWPM = Number(wpmDisplay.innerHTML);

    let newScore = {
        time: completedTime,
        wpm: completedWPM,
        errors: errorCount
    };

    let savedScores = JSON.parse(localStorage.getItem("typingScores")) || [];

    savedScores.push(newScore);

    savedScores.sort(function(a, b) {
        return b.wpm - a.wpm;
    });

    savedScores = savedScores.slice(0, 3);

    localStorage.setItem("typingScores", JSON.stringify(savedScores));

    displayScores();
}

// Display the top three scores from localStorage
function displayScores() {
    let savedScores = JSON.parse(localStorage.getItem("typingScores")) || [];

    scoreList.innerHTML = "";

    if (savedScores.length === 0) {
        scoreList.innerHTML = "<li>No scores yet</li>";
    } else {
        for (let i = 0; i < savedScores.length; i++) {
            let scoreItem = document.createElement("li");
            scoreItem.innerHTML = savedScores[i].wpm + " WPM - Time: " + savedScores[i].time + " - Errors: " + savedScores[i].errors;
            scoreList.appendChild(scoreItem);
        }
    }
}

// Reset the test back to the starting state
function reset() {
    clearInterval(interval);

    interval = null;
    timer = [0, 0, 0];
    timerRunning = false;
    errorCount = 0;
    lastInputWasWrong = false;
    testCompleted = false;

    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    wpmDisplay.innerHTML = 0;
    errorsDisplay.innerHTML = 0;
    testWrapper.style.borderColor = "grey";

    chooseRandomText();
}

// Event listeners for keyboard input and reset button
testArea.addEventListener("keypress", startTimer);
testArea.addEventListener("keyup", spellCheck);
testArea.addEventListener("keyup", updateWPM);
testArea.addEventListener("paste", function(event) {
    event.preventDefault();
});

resetButton.addEventListener("click", reset);

// Initial page setup
chooseRandomText();
displayScores();