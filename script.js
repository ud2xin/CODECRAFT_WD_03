const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#status");
const resetBtn = document.querySelector("#reset");
const aiSound = new Audio("assets/aiSound.mp3");
const clickSound = new Audio("assets/clickSound.mp3");
const winSound = new Audio("assets/winSound.mp3");
const tieSound = new Audio("assets/tieSound.m4a");
const btnSound = new Audio("assets/btnSound.mp3");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let running = true;

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

cells.forEach(cell => cell.addEventListener("click", cellClicked));

resetBtn.addEventListener("click", resetGame);

statusText.textContent = `Player ${currentPlayer}'s turn`;

function cellClicked() {
    clickSound.play();
    const cellIndex = this.getAttribute("data-index");
    if (board[cellIndex] !== "" || !running) {
        return;
    }

    updateCell(this, cellIndex);
    checkWinner();
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

function checkWinner() {
    let winnerFound = false;
    let winningCombo = [];

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            winnerFound = true;
            winningCombo = [a, b, c];
            break;
        }
    }

    if (winnerFound) {
        winSound.play();
        statusText.textContent = `Player ${currentPlayer} wins! 🎉`;
        winningCombo.forEach(index => cells[index].classList.add("winning-cell")); // ✅ highlight
        running = false;
    } else if (!board.includes("")) {
        tieSound.play();
        statusText.textContent = "It's a draw! 🤝";
        running = false;
    } else {
        changePlayer();

        // kalau mode AI dan giliran O
        if (vsAI && currentPlayer === "O" && running) {
            setTimeout(aiMove, 500);
        }
    }
}

function changePlayer() {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function resetGame(randomFirst = false) {
    btnSound.play();
    if (randomFirst) {
        currentPlayer = Math.random() < 0.5 ? "X" : "O";
    } else {
        currentPlayer = "X";
    }
    board = ["", "", "", "", "", "", "", "", ""];
    running = true;
    statusText.textContent = `Player ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winning-cell");
    });
}

// Event listener PvP tetap
document.querySelector("#pvpBtn").addEventListener("click", () => {
    btnSound.play();
    resetGame(true); // random giliran pertama
    vsAI = false;
    statusText.textContent = `Mode: Player vs Player. Player ${currentPlayer}'s turn`;
});

// Event listener AI
document.querySelector("#aiBtn").addEventListener("click", () => {
    btnSound.play();
    resetGame(true); // random giliran pertama
    vsAI = true;
    statusText.textContent = `Mode: Player vs AI. Player ${currentPlayer}'s turn`;
    // Jika AI duluan, langsung jalan
    if (currentPlayer === "O") {
        setTimeout(aiMove, 500);
    }
});

function aiMove() {
    aiSound.play();
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    if (move !== undefined) {
        updateCell(cells[move], move);
        checkWinner();
    }
}

function minimax(newBoard, depth, isMaximizing) {
    let result = checkWinnerForMinimax(newBoard);
    if (result !== null) {
        if (result === "O") return 10 - depth;
        if (result === "X") return depth - 10;
        if (result === "draw") return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "O";
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "X";
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax(bd) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
            return bd[a];
        }
    }
    if (!bd.includes("")) return "draw";
    return null;
}