// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const difficultySelect = document.getElementById('difficulty');
    const newGameButton = document.getElementById('new-game');
    const resultsElement = document.getElementById('results');
    const timerElement = document.getElementById('timer');
    const hintButton = document.getElementById('hint-button');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
  
    let startTime = null;
    let timerInterval = null;
    let solution = null;
    let puzzleBoard = null;
  
    // Function to generate the Sudoku grid
    function generateGrid(puzzle) {
      gridElement.innerHTML = '';
      for (let i = 0; i < 81; i++) {
        const cell = document.createElement('input');
        cell.type = 'text';
        cell.maxLength = 1;
        cell.dataset.index = i;
        cell.value = puzzle[i] !== '.' ? puzzle[i] : '';
        if (puzzle[i] !== '.') {
          cell.disabled = true;
        } else {
          cell.addEventListener('input', onCellInput);
          cell.addEventListener('focus', () => cell.select());
        }
        gridElement.appendChild(cell);
      }
    }
  
    // Function to handle cell input
    function onCellInput(e) {
      const cell = e.target;
      const index = parseInt(cell.dataset.index);
      const value = cell.value;
  
      // Remove non-numeric characters
      if (!/^[1-9]$/.test(value)) {
        cell.value = '';
        return;
      }
  
      // Update the puzzle board
      puzzleBoard[index] = parseInt(value);
  
      // Check for errors
      if (checkConflicts(index, parseInt(value))) {
        cell.classList.add('error');
      } else {
        cell.classList.remove('error');
      }
  
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
  
    // Function to check for conflicts
    function checkConflicts(index, value) {
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
      let attempts;
      switch (difficulty) {
        case 'easy':
          attempts = 30;
          break;
        case 'medium':
          attempts = 40;
          break;
        case 'hard':
          attempts = 50;
          break;
        default:
          attempts = 40;
      }
  
      board = board.slice();
      while (attempts > 0) {
        const pos = Math.floor(Math.random() * 81);
        if (board[pos] !== 0) {
          const backup = board[pos];
          board[pos] = 0;
  
          // Make a copy to solve
          const boardCopy = board.slice();
          let solutions = 0;
  
          function solve(pos) {
            if (pos >= 81) {
              solutions++;
              return solutions === 1;
            }
  
            if (boardCopy[pos] !== 0) {
              return solve(pos + 1);
            }
  
            for (let num = 1; num <= 9; num++) {
              if (isValid(num, pos, boardCopy)) {
                boardCopy[pos] = num;
                if (!solve(pos + 1)) return false;
                boardCopy[pos] = 0;
              }
            }
            return true;
          }
  
          function isValid(num, pos, board) {
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
  
          solve(0);
          if (solutions !== 1) {
            board[pos] = backup;
            attempts--;
          }
        }
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
      const puzzleString = puzzleBoard.map(num => (num === 0 ? '.' : num)).join('');
      generateGrid(puzzleString);
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
      const table = document.createElement('table');
      table.className = 'w-full text-left';
      const headerRow = document.createElement('tr');
      ['Date', 'Duration (s)', 'Difficulty'].forEach(text => {
        const th = document.createElement('th');
        th.className = 'border-b p-2';
        th.textContent = text;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);
      results.forEach(result => {
        const row = document.createElement('tr');
        ['date', 'duration', 'difficulty'].forEach(key => {
          const td = document.createElement('td');
          td.className = 'border-b p-2';
          td.textContent = key === 'date' ? new Date(result[key]).toLocaleString() : result[key];
          row.appendChild(td);
        });
        table.appendChild(row);
      });
      resultsElement.appendChild(table);
    }
  
    // Function to toggle dark mode
    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.theme = isDark ? 'dark' : 'light';
      darkModeIcon.textContent = isDark ? '☀️' : '🌙';
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
    hintButton.addEventListener('click', provideHint);
    darkModeToggle.addEventListener('click', toggleDarkMode);
  
    // Initialize the game
    startNewGame();
    loadResults();
  
    // Save the result when the user leaves or refreshes the page
    window.addEventListener('beforeunload', saveResult);
  });
  