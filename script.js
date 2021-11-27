
const playerFactory = (name, marker) => {
    const getName = () => name;
    const getMarker = () => marker;
    return {getName, getMarker};
};


const Gameboard = (() => {

    const board = new Array(9);

    const initBoard = () => board.fill(0, 0, 9);

    const getBoard = () => board;

    const checkForWinner = () => {
        return checkColumnsForWinner() || checkDiagonalsForWinner() || checkRowsForWinner() || checkForTie();
    }

    const checkDiagonalsForWinner = () => {

        let diagonal1 = [board[0], board[4], board[8]];
        let diagonal2 = [board[2], board[4], board[6]];

        return checkDiagonal(diagonal1) || checkDiagonal(diagonal2);
    }

    const checkDiagonal = diagonal => {

        if (diagonal.every(field => field == 'X')) {
            return "X";
        } else if (diagonal.every(field => field == 'O')) {
            return "O";
        }

        return null;
    }

    const checkForTie = () => {
        if(board.every(field => field != 0)) return "Tie";
    }

    const checkRowsForWinner = () => {

        for(let i = 0; i < 3; i++) {
            let row = [];

            for(let j = i * 3; j < i * 3 + 3; j++) {
                row.push(board[j]);
            }

            if (row.every(field => field == 'X')) {
                return "X";
            } else if (row.every(field => field == 'O')) {
                return "O";
            }
        }

        return null;
    }


    const checkColumnsForWinner = () => {

        for(let i = 0; i < 3; i++) {
            let row = [];

            for(let j = 0; j <3; j++) {
                row.push(board[i + 3 * j]);
            }

            if (row.every(field => field == 'X')) {
                return "X";
            } else if (row.every(field => field == 'O')) {
                return "O";
            }
        }

        return null;
    }

    return {getBoard, initBoard, checkForWinner};

    
})();

const GameController = (() => {

    let xPlayer;
    let oPlayer;

    const squares = document.querySelectorAll(".board-column");
    const menuElements = document.querySelector(".menu");
    const gameMenu = document.querySelector(".game-menu");
    const restartOp = document.querySelector(".restart");
    const restartButton = restartOp.querySelector(".option");
    const backToMenuButton = gameMenu.querySelector(".option");
    const pvpElement = menuElements.querySelectorAll(".option")[0];
    const pveElement = menuElements.querySelectorAll(".option")[1];

    let currentPlayer; 
    let gameOver = false;
    let playerSelection;;

    squares.forEach(element => {
        element.addEventListener('click', () => {
            
            if(playerSelection == "player") {
                pvp(element);
            } else {
                pve(element);
            }
        
        })

    });

    const restartGame = () => {
        resetParams();
        DisplayController.restartGameUI();
        initiateMoveIfComputer();
    }

    const resetBoard = () => {
        DisplayController.resetBoardUI();
        Gameboard.initBoard();
    }

    const resetParams = () => {
        resetBoard();
        gameOver = false;
        currentPlayer = xPlayer; 
    }

    const returnToMenu = () => {
        DisplayController.returnToMenuUI();
        resetParams();
    }

    restartButton.addEventListener('click', restartGame);
    backToMenuButton.addEventListener('click', returnToMenu);

    const changePlayer = () => {

        if(currentPlayer.getMarker() == "X") {
            currentPlayer = oPlayer;
        } else {
            currentPlayer = xPlayer;
        }
    }

    const pvp = (element) => {

        let index = element.dataset.index;

        if(Gameboard.getBoard()[index] || gameOver) {
            return;
        } 

        Gameboard.getBoard()[index] = currentPlayer.getMarker();

        element.firstChild.textContent = currentPlayer.getMarker();

        checkWinConditions()

        changePlayer();

    }

    const pve = (element) => {

        let index = element.dataset.index;

        if(Gameboard.getBoard()[index] || gameOver) {
            return;
        } 

        Gameboard.getBoard()[index] = currentPlayer.getMarker();

        element.firstChild.textContent = currentPlayer.getMarker();

        checkWinConditions()

        let computerMarker;
        if(currentPlayer.getName() != "AI") {

            if(currentPlayer.getMarker() == "X") {
                computerMarker = "O";
            } else {
                computerMarker = "X";
            }

            let bestPosIndex = AI(computerMarker, currentPlayer.getMarker()).bestMove();
            changePlayer();
            squares.item(bestPosIndex).click();

        } else {
            changePlayer();
        }

    }

    function checkWinConditions() {

        let winOrTie = Gameboard.checkForWinner();

        if(winOrTie) {

            gameOver = true;

            if(winOrTie == "X") {
                DisplayController.displayWinner(xPlayer);
            } else if(winOrTie == "O") {
                DisplayController.displayWinner(oPlayer);
            } else {
                DisplayController.displayTie();
            }

            DisplayController.displayRestartOption();
        }
    }

    function playGame()  {

        Gameboard.initBoard();
        playerSelection = this;

        if(playerSelection == "player") {
            configurePVPMatch();
        } else {
            configurePVEMatch();
        }
    
        currentPlayer = xPlayer;
        DisplayController.showBoardAndGameMenu();
        initiateMoveIfComputer();

    }

    function configurePVPMatch() {
        let playerX = prompt("Player X name");
        let playerO = prompt("Player O name");

        if(!playerX) playerX = "Default1";
        if(!playerO) playerO = "Default2";

        xPlayer = playerFactory(playerX, "X");
        oPlayer = playerFactory(playerO, "O");
    }

    function configurePVEMatch() {

        let playerName = prompt("Your name");
        let optionXorO = prompt("Play X or O?");

        if(!playerName) playerName = "Default";
        if(!optionXorO || optionXorO != "O") optionXorO = "X";

        if(optionXorO.toUpperCase() == "X") {
            xPlayer = playerFactory(playerName, "X");
            oPlayer = playerFactory("AI", "O");
        } else {
            xPlayer = playerFactory("AI", "X");
            oPlayer = playerFactory(playerName, "O");
        }
    }

    const initiateMoveIfComputer = () => {
        let playerMarker;
        if(currentPlayer.getName() == "AI") {

            if(currentPlayer.getMarker() == "X") {
                playerMarker = "O";
            } else {
                playerMarker = "X";
            }

            let bestPosIndex = AI(currentPlayer.getMarker(), playerMarker).bestMove();
            squares.item(bestPosIndex).click();
        }
    }

    pvpElement.addEventListener('click', playGame.bind("player"));
    pveElement.addEventListener('click', playGame.bind("ai"));
 
})();

const DisplayController = (() => {

    const squares = document.querySelectorAll(".board-column");
    const result = document.querySelector(".result");
    const restartOp = document.querySelector(".restart");
    const gameMenu = document.querySelector(".game-menu");
    const boardElement = document.querySelector(".board");
    const menuElements = document.querySelector(".menu");


    const displayTie = () => {
        result.textContent = "Tie";
        result.classList.remove("hidden");

    }

    const displayWinner = (winner) => {

        result.textContent = winner.getName() + " won!";
        result.classList.remove("hidden");
    }

    const restartGameUI = () => {
        restartOp.style.display = "none";
        result.classList.add("hidden");
    }

    const resetBoardUI = () => {
        squares.forEach(square => {
            square.firstChild.textContent = '';
        })
    }

    const returnToMenuUI = () => {
        boardElement.style.display = "none";
        gameMenu.style.display = "none";
        menuElements.classList.toggle("hidden");
        result.classList.add("hidden");
        restartOp.style.display = "none";
    }

    const showBoardAndGameMenu = () => {
        boardElement.style.display = "flex";
        gameMenu.style.display = "flex";
        DisplayController.hideMainMenu();
    }

    const hideMainMenu = () => {
        menuElements.classList.toggle("hidden");
    }

    const displayRestartOption = () => {
        restartOp.style.display = "flex";
    }

    return {displayWinner, displayTie, restartGameUI, resetBoardUI, returnToMenuUI, showBoardAndGameMenu, hideMainMenu, displayRestartOption}

})();


const AI = ((ai, human) => {

    let scores;
    let board = Gameboard.getBoard();

    if(ai == "O") {
        scores = {
            'O':10,
            'X':-10,
            'Tie': 0
        }
    
    } else {
        scores = {
            'X':10,
            'O':-10,
            'Tie': 0
        }
    }

    const bestMove = () => {
        let bestScore = -Infinity;
        let move;
        for(let i = 0; i < 9; i++) {

            if(board[i] == 0) {

                board[i] = ai;
                let score = minimax(false);
                board[i] = 0;

                if(score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }

    const minimax = (isMaximizing) => {
        let result = Gameboard.checkForWinner();

        if(result != null) {
            let score = scores[result];
            return score;
        }

        if(isMaximizing) {
            let bestScore = -Infinity;
            for(let i = 0; i < 9; i++) {

                if(board[i] == 0) {
                    board[i] = ai;
                    let score = minimax(false);
                    board[i] = 0;
                    bestScore = Math.max(score, bestScore);
                }

            }

            return bestScore;
    
        } else {

            let bestScore = Infinity;
            for(let i = 0; i < 9; i++) {

                if(board[i] == 0) {
                    board[i] = human;
                    let score = minimax(true);
                    board[i] = 0;
                    bestScore = Math.min(score, bestScore);
                }

            }
            return bestScore;
        }
    } 

    return {bestMove};

});

