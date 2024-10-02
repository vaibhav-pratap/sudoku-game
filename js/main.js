// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const difficultySelect = document.getElementById('difficulty');
    const newGameButton = document.getElementById('new-game');
    const resultsElement = document.getElementById('results');
  
    let startTime = null;
  
    // Function to generate the Sudoku grid
    function generateGrid(puzzle) {
        gridElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
        const cell = document.createElement('input');
        cell.type = 'text';
        cell.maxLength = 1;
        cell.className = 'sudoku-cell bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
        if (puzzle[i] !== '.') {
            cell.value = puzzle[i];
            cell.disabled = true;
        } else {
            cell.value = '';
        }
        gridElement.appendChild(cell);
        }
    }
  
  
    // Function to generate a complete, valid Sudoku board
    function generateCompleteBoard() {
      const board = Array(81).fill(0);
  
      function isValid(num, pos) {
        const row = Math.floor(pos / 9);
        const col = pos % 9;
  
        // Check row
        for (let i = 0; i < 9; i++) {
          if (board[row * 9 + i] === num && (row * 9 + i) !== pos) return false;
        }
  
        // Check column
        for (let i = 0; i < 9; i++) {
          if (board[i * 9 + col] === num && (i * 9 + col) !== pos) return false;
        }
  
        // Check box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const idx = (startRow + i) * 9 + (startCol + j);
            if (board[idx] === num && idx !== pos) return false;
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
          attempts = 3;
          break;
        case 'medium':
          attempts = 5;
          break;
        case 'hard':
          attempts = 7;
          break;
        default:
          attempts = 5;
      }
  
      board = board.slice();
      while (attempts > 0) {
        const pos = Math.floor(Math.random() * 81);
        if (board[pos] !== 0) {
          const backup = board[pos];
          board[pos] = 0;
  
          // Make a copy to solve
          const boardCopy = board.slice();
          if (!hasUniqueSolution(boardCopy)) {
            board[pos] = backup;
            attempts--;
          }
        }
      }
      return board;
    }
  
    // Function to check if the board has a unique solution
    function hasUniqueSolution(board) {
      let solutions = 0;
  
      function solve(pos) {
        if (pos >= 81) {
          solutions++;
          return solutions === 1;
        }
  
        if (board[pos] !== 0) {
          return solve(pos + 1);
        }
  
        for (let num = 1; num <= 9; num++) {
          if (isValid(num, pos, board)) {
            board[pos] = num;
            if (!solve(pos + 1)) return false;
            board[pos] = 0;
          }
        }
        return true;
      }
  
      function isValid(num, pos, board) {
        const row = Math.floor(pos / 9);
        const col = pos % 9;
  
        // Check row
        for (let i = 0; i < 9; i++) {
          if (board[row * 9 + i] === num && (row * 9 + i) !== pos) return false;
        }
  
        // Check column
        for (let i = 0; i < 9; i++) {
          if (board[i * 9 + col] === num && (i * 9 + col) !== pos) return false;
        }
  
        // Check box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const idx = (startRow + i) * 9 + (startCol + j);
            if (board[idx] === num && idx !== pos) return false;
          }
        }
  
        return true;
      }
  
      solve(0);
      return solutions === 1;
    }
  
    // Function to shuffle an array
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  
    // Function to start a new game
    function startNewGame() {
      const difficulty = difficultySelect.value;
      const completeBoard = generateCompleteBoard();
      const puzzleBoard = createPuzzle(completeBoard, difficulty);
      const puzzleString = puzzleBoard.map(num => (num === 0 ? '.' : num)).join('');
      generateGrid(puzzleString);
      startTime = new Date();
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
  
    // Event listener for the "New Game" button
    newGameButton.addEventListener('click', () => {
      startNewGame();
    });
  
    // Initialize the game
    startNewGame();
    loadResults();
  
    // Save the result when the user leaves or refreshes the page
    window.addEventListener('beforeunload', () => {
      saveResult();
    });
  });
  