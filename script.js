const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

let currentPlayer = 'D';
let gameMode = localStorage.getItem('mode');
let boardState = Array(9).fill('');

const winningCombinations = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

function checkWinner(board=boardState) {
    for (let combo of winningCombinations) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {winner: board[a], combo: combo};
        }
    }
    if (!board.includes('')) return {winner: 'Draw'};
    return null;
}

function makeMove(index, player) {
    if (!boardState[index]) {
        boardState[index] = player;
        cells[index].innerText = player;
        const result = checkWinner();
        if (result) {
            if (result.winner === 'Draw') {
                status.innerText = "It's a Draw!";
            } else {
                status.innerText = `${result.winner} Wins!`;
                highlightWinningCells(result.combo);
            }
            cells.forEach(cell => cell.removeEventListener('click', handleClick));
            restartBtn.style.display = 'inline-block';
            return true;
        }
        return false;
    }
}

function highlightWinningCells(combo) {
    if (!combo) return;
    combo.forEach(i => {
        cells[i].classList.add('winning-cell');
    });
}

function handleClick(e) {
    const index = e.target.dataset.index;
    if (gameMode === 'friend' || (gameMode === 'robot' && currentPlayer === 'D')) {
        const gameOver = makeMove(index, currentPlayer);
        if (!gameOver) {
            currentPlayer = currentPlayer === 'D' ? 'S' : 'D';
            if (gameMode === 'robot' && currentPlayer === 'S') {
                setTimeout(robotMove, 300);
            }
        }
    }
}

function robotMove() {
    const bestMove = minimax(boardState, 'S').index;
    makeMove(bestMove, 'S');
    currentPlayer = 'D';
}

function minimax(newBoard, player) {
    const availSpots = newBoard.map((v,i) => v === '' ? i : null).filter(i => i !== null);
    const result = checkWinner(newBoard);
    if (result) {
        if (result.winner === 'D') return {score: -10};
        if (result.winner === 'S') return {score: 10};
        if (result.winner === 'Draw') return {score: 0};
    }

    const moves = [];
    for (let i of availSpots) {
        const move = {};
        move.index = i;
        newBoard[i] = player;

        if (player === 'S') {
            move.score = minimax(newBoard, 'D').score;
        } else {
            move.score = minimax(newBoard, 'S').score;
        }

        newBoard[i] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'S') {
        let bestScore = -Infinity;
        for (let m of moves) {
            if (m.score > bestScore) {
                bestScore = m.score;
                bestMove = m;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let m of moves) {
            if (m.score < bestScore) {
                bestScore = m.score;
                bestMove = m;
            }
        }
    }
    return bestMove;
}

function restartGame() {
    boardState = Array(9).fill('');
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('winning-cell');
    });
    status.innerText = '';
    currentPlayer = 'D';
    restartBtn.style.display = 'none';
    cells.forEach(cell => cell.addEventListener('click', handleClick));
    if (gameMode === 'robot' && currentPlayer === 'S') {
        setTimeout(robotMove, 300);
    }
}

function goBack() {
    window.location.href = 'index.html';
}

restartBtn.addEventListener('click', restartGame);
cells.forEach(cell => cell.addEventListener('click', handleClick));
