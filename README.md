# Learning Strategy Study

This is a web application designed to study different learning strategies using flashcards. The application consists of two main phases: a learning phase and a study phase.

## Features

### Phase 1: Learning
- Shows four flashcards one at a time
- Each card is displayed for 5 seconds
- Both question and answer are visible during this phase

### Phase 2: Study
- Implements two different study strategies:
  1. Review Strategy: Both question and answer are visible with a text box for typing answers
  2. Generate Strategy: Only the question is visible for 4 seconds, followed by the answer and a text box
- Randomly assigns strategies to cards
- Tracks user interactions and timing

### Logging
- Records all user interactions with timestamps
- Includes card views, answers typed, and phase transitions
- Provides a copy button to export the logs

## How to Use

1. Open `index.html` in a web browser
2. Click "Start Learning Phase" to begin the first phase
3. Watch each card for 5 seconds
4. Click "Start Study Phase" to begin the second phase
5. For each card:
   - Review Strategy: Type your answer while seeing both question and answer
   - Generate Strategy: Try to answer after seeing only the question for 4 seconds
6. Use the "Copy Logs" button to export your study session data

## Technical Details

The application is built using:
- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript for functionality
- No external dependencies required

## File Structure

- `index.html`: Main HTML file
- `styles.css`: CSS styles
- `script.js`: JavaScript functionality
- `README.md`: This documentation file 