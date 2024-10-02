// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const difficultySelect = document.getElementById('difficulty');
    const newGameButton = document.getElementById('new-game');
    const resetGameButton = document.getElementById('reset-game');
    const hintButton = document.getElementById('hint-button');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const errorToggle = document.getElementById('error-toggle');
    const errorIcon = document.getElementById('error-icon');
    const timerElement = document.getElementById('timer');
    const resultsElement = document.getElementById('results');
    const keypadElement = document.querySelector('.keypad .grid');
    const eraseButton = document.getElementById('erase-button');
  
    let startTime = null;
    let timerInterval = null;
    let solution = null;
    let puzzleBoard = null;
    let initialPuzzle = null;
    let errorHighlighting = true;
    let selectedCell = null;
  
    // Function to generate the Sudoku grid
    function generateGrid(puzzle) {
      gridElement.innerHTML = '';
      for (let i = 0; i < 81; i++) {
        const cell = document.createElement('input');
        cell.type = 'text';
        cell.readOnly = false; // Allow keyboard input
        cell.maxLength = 1;
        cell.dataset.index = i;
        cell.value = puzzle[i] !== '.' ? puzzle[i] : '';
        if (puzzle[i] !== '.') {
          cell.disabled = true;
        } else {
          cell.addEventListener('focus', () => selectCell(cell));
          cell.addEventListener('input', onCellInput);
        }
        gridElement.appendChild(cell);
      }
    }
  
    // Function to select a cell
    function selectCell(cell) {
      if (selectedCell) {
        selectedCell.classList.remove('selected');
      }
      selectedCell = cell;
      selectedCell.classList.add('selected');
    }
  
    // Function to handle cell input via keyboard
    function onCellInput(e) {
      const value = e.target.value;
      const index = parseInt(e.target.dataset.index);
      if (value >= '1' && value <= '9') {
        puzzleBoard[index] = parseInt(value);
      } else {
        puzzleBoard[index] = 0;
        e.target.value = '';
      }
  
      // Check for errors if highlighting is enabled
      if (errorHighlighting) {
        if (checkConflicts(index, puzzleBoard[index])) {
          e.target.classList.add('error');
        } else {
          e.target.classList.remove('error');
        }
      } else {
        e.target.classList.remove('error');
      }
  
      // Save game state
      saveGameState();
  
      // Check for completion
      if (isComplete()) {
        if (isSolved()) {
          clearInterval(timerInterval);
          setTimeout(() => {
            alert(`Congratulations! You solved the puzzle in ${formatTime(new Date() - startTime)}.`);
            saveResult();
            loadResults();
          }, 100);
        } else {
          alert('There are errors in your solution.');
        }
      }
    }
  
    // Function to handle keypad input
    function onKeypadInput(value) {
      if (!selectedCell) return;
      const index = parseInt(selectedCell.dataset.index);
  
      // Update the puzzle board
      puzzleBoard[index] = parseInt(value);
      selectedCell.value = value;
  
      // Check for errors if highlighting is enabled
      if (errorHighlighting) {
        if (checkConflicts(index, parseInt(value))) {
          selectedCell.classList.add('error');
        } else {
          selectedCell.classList.remove('error');
        }
      } else {
        selectedCell.classList.remove('error');
      }
  
      // Save game state
      saveGameState();
  
      // Check for completion
      if (isComplete()) {
        if (isSolved()) {
          clearInterval(timerInterval);
          setTimeout(() => {
            alert(`Congratulations! You solved the puzzle in ${formatTime(new Date() - startTime)}.`);
            saveResult();
            loadResults();
          }, 100);
        } else {
          alert('There are errors in your solution.');
        }
      }
    }
  
    // Function to create the keypad
    function createKeypad() {
      keypadElement.innerHTML = '';
      for (let i = 1; i <= 9; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => onKeypadInput(i));
        keypadElement.appendChild(button);
      }
    }
  
    // Function to erase the selected cell
    function eraseCell() {
      if (!selectedCell) return;
      const index = parseInt(selectedCell.dataset.index);
  
      puzzleBoard[index] = 0;
      selectedCell.value = '';
      selectedCell.classList.remove('error');
  
      // Save game state
      saveGameState();
    }
  
    // Function to check for conflicts
    function checkConflicts(index, value) {
      if (value === 0) return false; // Empty cell
  
      const row = Math.floor(index / 9);
      const col = index % 9;
  
      // Check row and column
      for (let i = 0; i < 9; i++) {
        const rowIndex = row * 9 + i;
        const colIndex = i * 9 + col;
        if (rowIndex !== index && puzzleBoard[rowIndex] === value) return true;
        if (colIndex !== index && puzzleBoard[colIndex] === value) return true;
      }
  
      // Check box
      const startRow = row - (row % 3);
      const startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const idx = (startRow + i) * 9 + (startCol + j);
          if (idx !== index && puzzleBoard[idx] === value) return true;
        }
      }
  
      return false;
    }
  
    // Function to check if the puzzle is complete
    function isComplete() {
      return puzzleBoard.every(num => num !== 0);
    }
  
    // Function to check if the puzzle is solved correctly
    function isSolved() {
      return puzzleBoard.join('') === solution.join('');
    }
  
    // Function to start the timer
    function startTimer() {
      startTime = new Date();
      timerInterval = setInterval(() => {
        const elapsed = new Date() - startTime;
        timerElement.textContent = `Time: ${formatTime(elapsed)}`;
      }, 1000);
    }
  
    // Function to format time in mm:ss
    function formatTime(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
  
    // Function to generate a complete, valid Sudoku board
    function generateCompleteBoard() {
      const board = Array(81).fill(0);
  
      function isValid(num, pos) {
        const row = Math.floor(pos / 9);
        const col = pos % 9;
  
        // Check row
        for (let i = 0; i < 9; i++) {
          if (board[row * 9 + i] === num) return false;
        }
  
        // Check column
        for (let i = 0; i < 9; i++) {
          if (board[i * 9 + col] === num) return false;
        }
  
        // Check box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const idx = (startRow + i) * 9 + (startCol + j);
            if (board[idx] === num) return false;
          }
        }
  
        return true;
      }
  
      function fillBoard(pos) {
        if (pos >= 81) return true;
  
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums);
  
        for (let num of nums) {
          if (isValid(num, pos)) {
            board[pos] = num;
            if (fillBoard(pos + 1)) return true;
            board[pos] = 0;
          }
        }
        return false;
      }
  
      fillBoard(0);
      return board;
    }
  
    // Function to remove numbers from the complete board based on difficulty
    function createPuzzle(board, difficulty) {
      let clues;
      switch (difficulty) {
        case 'easy':
          clues = 45;
          break;
        case 'medium':
          clues = 35;
          break;
        case 'hard':
          clues = 25;
          break;
        default:
          clues = 35;
      }
  
      board = board.slice();
      const positions = Array.from({ length: 81 }, (_, i) => i);
      shuffleArray(positions);
  
      for (let i = 0; i < 81 - clues; i++) {
        board[positions[i]] = 0;
      }
  
      return board;
    }
  
    // Function to start a new game
    function startNewGame() {
      clearInterval(timerInterval);
      startTimer();
      const difficulty = difficultySelect.value;
      const completeBoard = generateCompleteBoard();
      solution = completeBoard.slice();
      puzzleBoard = createPuzzle(completeBoard, difficulty);
      initialPuzzle = puzzleBoard.slice();
      const puzzleString = puzzleBoard.map(num => (num === 0 ? '.' : num)).join('');
      generateGrid(puzzleString);
      createKeypad();
      saveGameState();
    }
  
    // Function to reset the game
    function resetGame() {
      clearInterval(timerInterval);
      startTimer();
      puzzleBoard = initialPuzzle.slice();
      const puzzleString = puzzleBoard.map(num => (num === 0 ? '.' : num)).join('');
      generateGrid(puzzleString);
      createKeypad();
      saveGameState();
    }
  
    // Function to provide a hint
    function provideHint() {
      const emptyIndices = puzzleBoard
        .map((num, idx) => (num === 0 ? idx : null))
        .filter(idx => idx !== null);
  
      if (emptyIndices.length === 0) return;
  
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      puzzleBoard[randomIndex] = solution[randomIndex];
  
      const cells = gridElement.querySelectorAll('input');
      const cell = cells[randomIndex];
      cell.value = solution[randomIndex];
      cell.disabled = true;
      cell.classList.add('hint-cell');
  
      saveGameState();
  
      // Check for completion after providing a hint
      if (isComplete() && isSolved()) {
        clearInterval(timerInterval);
        setTimeout(() => {
          alert(`Congratulations! You solved the puzzle in ${formatTime(new Date() - startTime)}.`);
          saveResult();
          loadResults();
        }, 100);
      }
    }
  
    // Function to save the result
    function saveResult() {
      const endTime = new Date();
      const duration = Math.floor((endTime - startTime) / 1000); // in seconds
      const results = JSON.parse(localStorage.getItem('sudokuResults')) || [];
      const newResult = {
        date: endTime.toISOString(),
        duration: duration,
        difficulty: difficultySelect.value
      };
      results.push(newResult);
      localStorage.setItem('sudokuResults', JSON.stringify(results));
    }
  
    // Function to load results from storage
    function loadResults() {
      const results = JSON.parse(localStorage.getItem('sudokuResults')) || [];
      const now = new Date();
      const validResults = results.filter(result => {
        const resultTime = new Date(result.date);
        const diffHours = (now - resultTime) / (1000 * 60 * 60);
        return diffHours <= 10; // Keep results from the last 10 hours
      });
      localStorage.setItem('sudokuResults', JSON.stringify(validResults));
      displayResults(validResults);
    }
  
    // Function to display results on the dashboard
    function displayResults(results) {
      resultsElement.innerHTML = '';
      if (results.length === 0) {
        resultsElement.textContent = 'No results to display.';
        return;
      }
  
      results.reverse(); // Show latest results first
  
      results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
  
        const icon = document.createElement('div');
        icon.className = 'card-icon text-blue-500 dark:text-blue-400';
        icon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
        card.appendChild(icon);
  
        const content = document.createElement('div');
        content.className = 'card-content';
  
        const duration = document.createElement('div');
        duration.innerHTML = `<span class="label"><i class="fa-solid fa-clock"></i> Duration:</span><span class="value"> ${result.duration} seconds</span>`;
        content.appendChild(duration);
  
        const difficulty = document.createElement('div');
        difficulty.innerHTML = `<span class="label"><i class="fa-solid fa-signal"></i> Difficulty:</span><span class="value capitalize"> ${result.difficulty}</span>`;
        content.appendChild(difficulty);
  
        card.appendChild(content);
  
        const date = document.createElement('div');
        date.className = 'card-date mt-2';
        date.innerHTML = `<i class="fa-solid fa-calendar-alt"></i> ${new Date(result.date).toLocaleString()}`;
        card.appendChild(date);
  
        resultsElement.appendChild(card);
      });
    }
  
    // Function to save game state to localStorage
    function saveGameState() {
      const gameState = {
        puzzleBoard,
        initialPuzzle,
        solution,
        startTime: startTime.toISOString(),
        difficulty: difficultySelect.value,
        errorHighlighting
      };
      localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
    }
  
    // Function to load game state from localStorage
    function loadGameState() {
      const savedState = JSON.parse(localStorage.getItem('sudokuGameState'));
      if (savedState) {
        puzzleBoard = savedState.puzzleBoard;
        initialPuzzle = savedState.initialPuzzle;
        solution = savedState.solution;
        startTime = new Date(savedState.startTime);
        difficultySelect.value = savedState.difficulty;
        errorHighlighting = savedState.errorHighlighting;
        if (errorHighlighting) {
          errorIcon.classList.remove('fa-eye-slash');
          errorIcon.classList.add('fa-eye');
        } else {
          errorIcon.classList.remove('fa-eye');
          errorIcon.classList.add('fa-eye-slash');
        }
  
        generateGrid(puzzleBoard.map(num => (num === 0 ? '.' : num)).join(''));
        createKeypad();
        resumeTimer();
      } else {
        startNewGame();
      }
    }
  
    // Function to resume the timer
    function resumeTimer() {
      timerInterval = setInterval(() => {
        const elapsed = new Date() - startTime;
        timerElement.textContent = `Time: ${formatTime(elapsed)}`;
      }, 1000);
    }
  
    // Function to toggle dark mode
    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.theme = isDark ? 'dark' : 'light';
      darkModeIcon.classList.toggle('fa-moon', !isDark);
      darkModeIcon.classList.toggle('fa-sun', isDark);
    }
  
    // Function to toggle error highlighting
    function toggleErrorHighlighting() {
      errorHighlighting = !errorHighlighting;
      if (errorHighlighting) {
        errorIcon.classList.remove('fa-eye-slash');
        errorIcon.classList.add('fa-eye');
        // Re-apply error highlighting
        puzzleBoard.forEach((value, index) => {
          const cell = gridElement.children[index];
          if (value !== 0 && checkConflicts(index, value)) {
            cell.classList.add('error');
          }
        });
      } else {
        errorIcon.classList.remove('fa-eye');
        errorIcon.classList.add('fa-eye-slash');
        // Remove existing error highlights
        gridElement.querySelectorAll('input').forEach(cell => {
          cell.classList.remove('error');
        });
      }
      saveGameState();
    }
  
    // Utility Function to shuffle an array
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  
    // Event listeners
    newGameButton.addEventListener('click', startNewGame);
    resetGameButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', provideHint);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    errorToggle.addEventListener('click', toggleErrorHighlighting);
    eraseButton.addEventListener('click', eraseCell);
  
    // Initialize the game
    loadGameState();
    loadResults();
  });
  