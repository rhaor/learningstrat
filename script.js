// Sample flashcards data
const flashcards = [
    {
        question: "What is this brain area called?",
        answer: "frontal lobe",
        questionImage: "assets/frontal-q.png",         // Optional
        answerImage: null                               // No image for answer
    },
    {
        question: "What is this brain area called?",
        answer: "parietal lobe",
        questionImage: "assets/parietal-q.png",         // Optional
        answerImage: null                               // No image for answer
    },
    {
        question: "What is the frontal lobe responsible for?",
        answer: "personality, decision making, speech",
        // No images for this card
    },
    {
        question: "What is the parietal lobe responsible for?",
        answer: "sensory processing, spatial awareness, attention",
        // No images for this card
    }
];

// Fixed strategy order: first two are review, last two are generate
const strategies = ['review', 'review', 'generate', 'generate'];

// Order of cards in study phase (indices into flashcards array)
const studyOrder = [0, 2, 1, 3];  // Example: show frontal lobe first, then its function, then parietal lobe, then its function

// Logging functionality
const logs = [];
const logEvent = (event, details = '') => {
    const now = new Date();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const hundredths = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
    const timestamp = `${minutes}:${seconds}.${hundredths}`;
    logs.push(`${timestamp}: ${event} ${details}`);
};

// DOM Elements
const learnPhase = document.getElementById('learn-phase');
const studyPhase = document.getElementById('study-phase');
const logsSection = document.getElementById('logs-section');
const learnCards = document.getElementById('learn-cards');
const studyCards = document.getElementById('study-cards');
const startLearnBtn = document.getElementById('start-learn');
const startStudyBtn = document.getElementById('start-study');
const copyLogsBtn = document.getElementById('copy-logs');
const logsDisplay = document.getElementById('logs-display');

// Phase transition function
function showPhase(phase) {
    // Hide all phases
    [learnPhase, studyPhase, logsSection].forEach(p => p.classList.add('hidden'));
    // Show the requested phase
    phase.classList.remove('hidden');
}

// Learn Phase
let currentLearnCard = 0;
let learnInterval;

function showLearnCard(index) {
    const card = flashcards[index];
    learnCards.innerHTML = `
        <div class="card active">
            <div class="card-progress">Card ${index + 1}/${flashcards.length} (6s)</div>
            <div class="card-content">
                <div class="question">Question: ${card.question}</div>
                ${card.questionImage ? `<img src="${card.questionImage}" alt="Question image" class="card-image">` : ''}
                <div class="answer">Answer: ${card.answer}</div>
                ${card.answerImage ? `<img src="${card.answerImage}" alt="Answer image" class="card-image">` : ''}
            </div>
        </div>
    `;
    logEvent('LEARN_CARD_SHOWN', `Card ${index + 1}: ${card.question}`);
}

function startLearnPhase() {
    startLearnBtn.disabled = true;
    currentLearnCard = 0;
    // Hide instructions
    learnPhase.querySelector('.instructions').classList.add('hidden');
    showLearnCard(currentLearnCard);
    
    learnInterval = setInterval(() => {
        currentLearnCard++;
        if (currentLearnCard < flashcards.length) {
            showLearnCard(currentLearnCard);
        } else {
            clearInterval(learnInterval);
            logEvent('LEARN_PHASE_COMPLETED');
            // Show study phase after a short delay
            setTimeout(() => {
                showPhase(studyPhase);
                startStudyBtn.disabled = false;
            }, 1000);
        }
    }, 6000);
    
    logEvent('LEARN_PHASE_STARTED');
}

// Study Phase
let currentStudyCard = 0;
let studyInterval;
let studyCardsShown = [];
let currentStrategy = '';
let answerShown = false;
let generateTimeoutId = null;  // Track the timeout for generate answers

function createStudyCard(index, strategy) {
    const card = flashcards[index];
    const isReview = strategy === 'review';
    const strategyText = isReview ? 'Review' : 'Generate';
    
    return `
        <div class="card active">
            <div class="card-progress">Card ${currentStudyCard + 1}/4: ${strategyText}</div>
            <div class="card-content">
                <div class="question">Question: ${card.question}</div>
                ${card.questionImage ? `<img src="${card.questionImage}" alt="Question image" class="card-image">` : ''}
                <div class="answer-container"></div>
                <div class="study-section">
                    <div class="study-label">Study:</div>
                    <textarea placeholder="Type your answer here..."></textarea>
                </div>
            </div>
            <button class="btn submit-btn">Submit</button>
        </div>
    `;
}

function showStudyCard(index, strategy) {
    currentStrategy = strategy;
    answerShown = false;
    const cardIndex = studyOrder[index];  // Get the actual card index from studyOrder
    studyCards.innerHTML = createStudyCard(cardIndex, strategy);
    logEvent('STUDY_CARD_SHOWN', `Card ${index + 1} with ${strategy} strategy`);
    
    // Clear any existing timeout
    if (generateTimeoutId) {
        clearTimeout(generateTimeoutId);
        generateTimeoutId = null;
    }
    
    // Show answer immediately for review cards
    if (strategy === 'review') {
        const answerContainer = studyCards.querySelector('.answer-container');
        answerContainer.innerHTML = `
            <div class="answer">Answer: ${flashcards[cardIndex].answer}</div>
            ${flashcards[cardIndex].answerImage ? `<img src="${flashcards[cardIndex].answerImage}" alt="Answer image" class="card-image">` : ''}
        `;
    }
    
    if (strategy === 'generate') {
        generateTimeoutId = setTimeout(() => {
            answerShown = true;
            const answerContainer = studyCards.querySelector('.answer-container');
            answerContainer.innerHTML = `
                <div class="answer">Answer: ${flashcards[cardIndex].answer}</div>
                ${flashcards[cardIndex].answerImage ? `<img src="${flashcards[cardIndex].answerImage}" alt="Answer image" class="card-image">` : ''}
            `;
            logEvent('GENERATE_ANSWER_SHOWN', `Card ${index + 1}`);
        }, 6000);
    }

    // Add event listeners for the new card
    const submitBtn = studyCards.querySelector('.submit-btn');
    const textarea = studyCards.querySelector('textarea');
    
    submitBtn.addEventListener('click', () => handleSubmit(index));
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(index);
        }
    });
}

function handleSubmit(index) {
    // Clear any pending timeout for generate answers
    if (generateTimeoutId) {
        clearTimeout(generateTimeoutId);
        generateTimeoutId = null;
    }

    const textarea = studyCards.querySelector('textarea');
    const answer = textarea.value;
    logEvent('ANSWER_SUBMITTED', `Card ${index + 1}: ${answer}`);
    
    currentStudyCard++;
    if (currentStudyCard < flashcards.length) {
        showStudyCard(currentStudyCard, strategies[currentStudyCard]);
    } else {
        logEvent('STUDY_PHASE_COMPLETED');
        setTimeout(() => {
            showPhase(logsSection);
        }, 1000);
    }
}

function startStudyPhase() {
    startStudyBtn.disabled = true;
    currentStudyCard = 0;
    studyCardsShown = [];
    // Hide instructions
    studyPhase.querySelector('.instructions').classList.add('hidden');
    
    showStudyCard(currentStudyCard, strategies[currentStudyCard]);
    logEvent('STUDY_PHASE_STARTED');
}

// Event Listeners
startLearnBtn.addEventListener('click', startLearnPhase);
startStudyBtn.addEventListener('click', startStudyPhase);

// Log copying functionality
copyLogsBtn.addEventListener('click', () => {
    logsDisplay.value = logs.join('\n');
    logsDisplay.select();
    document.execCommand('copy');
    logEvent('LOGS_COPIED');
});

// Track text input in study phase
studyCards.addEventListener('input', (e) => {
    if (e.target.tagName === 'TEXTAREA') {
        logEvent('ANSWER_TYPED', `Card ${currentStudyCard + 1}: ${e.target.value}`);
    }
}); 