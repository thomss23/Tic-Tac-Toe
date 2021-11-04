
/*
====PLAN====
1) Setup a main menu where the user could select whether to play vs another player or vs AI - done
2) After the user selects an option, setup HTML && CSS for the board - done
3) Write PVP logic first - done
4) Figure out PVE logic using minimax algorithm
Rule of thumb: if you only ever need ONE of something (gameBoard, displayController), use a module. If you need multiples of something (players!), create them with factories.
*/

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

const DisplayController = (() => {

    let xPlayer;
    let oPlayer;
    const squares = document.querySelectorAll(".board-column");
    const result = document.querySelector(".result");
    const restartOp = document.querySelector(".restart");
    const restartButton = restartOp.querySelector(".option");
    const gameMenu = document.querySelector(".game-menu");
    const backToMenuButton = gameMenu.querySelector(".option");
    const boardElement = document.querySelector(".board");
    const menuElements = document.querySelector(".menu");
    const pvpElement = menuElements.querySelectorAll(".option")[0];
    const pveElement = menuElements.querySelectorAll(".option")[1];
    const minimaxInfo = menuElements.querySelector(".info");

    let currentPlayer; 
    let gameOver = false;
    let playerSelection;

    squares.forEach(element => {
        element.addEventListener('click', () => {
            
            if(playerSelection == "player") {
                pvp(element);
            } else {
                pve(element);
            }
        
        })

    });


    const displayTie = () => {
        result.textContent = "Tie";
        result.classList.remove("hidden");

    }

    const displayWinner = (winner) => {

        result.textContent = winner.getName() + " won!";
        result.classList.remove("hidden");
    }

    const restartGame = () => {
        resetParams();
        restartOp.style.display = "none";
        result.classList.add("hidden");

    }

    const resetParams = () => {
        resetBoard();
        gameOver = false;
        currentPlayer = xPlayer; 
    }

    const resetBoard = () => {
        squares.forEach(square => {
            square.firstChild.textContent = '';
        })
        Gameboard.initBoard();
    }

    const returnToMenu = () => {
        boardElement.style.display = "none";
        resetParams();
        gameMenu.style.display = "none";
        menuElements.classList.toggle("hidden");
        result.classList.add("hidden");
        restartOp.style.display = "none";
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

        let winOrTie = Gameboard.checkForWinner();

        if(winOrTie) {

            gameOver = true;

            if(winOrTie == "X") {
                displayWinner(xPlayer);
            } else if(winOrTie == "O") {
                displayWinner(oPlayer);
            } else {
                displayTie();
            }

            displayRestartOption();
        }

        changePlayer();

    }

    const displayRestartOption = () => {
        restartOp.style.display = "flex";
    }

    const pve = (element) => {
        console.log(xPlayer.getName() + " " + xPlayer.getMarker());
        console.log(oPlayer.getName() + " " + oPlayer.getMarker());
    }

    function playGame()  {

        Gameboard.initBoard();
        playerSelection = this;

        if(playerSelection == "player") {

            let playerX = prompt("Player X name");
            let playerO = prompt("Player O name");

            if(!playerX) playerX = "Default1";
            if(!playerO) playerO = "Default2";

            xPlayer = playerFactory(playerX, "X");
            oPlayer = playerFactory(playerO, "O");

        } else {

            let playerName = prompt("Your name");
            let optionXorO = prompt("Play X or O?");
            
            if(!playerName) playerName = "Default";
            if(!optionXorO) optionXorO = "X";

            if(optionXorO.toUpperCase() == "X") {
                xPlayer = playerFactory(playerName, "X");
                oPlayer = playerFactory("AI", "O");
            } else {
                xPlayer = playerFactory(playerName, "O");
                oPlayer = playerFactory("AI", "X");
            }
        }
        
        currentPlayer = xPlayer;
        showBoardAndGameMenu();
    }

    pvpElement.addEventListener('click', playGame.bind("player"));
    pveElement.addEventListener('click', playGame.bind("ai"));

    const showBoardAndGameMenu = () => {
        boardElement.style.display = "flex";
        gameMenu.style.display = "flex";
        hideMainMenu();
    }

    const hideMainMenu = () => {
        menuElements.classList.toggle("hidden");
    }

    
})();
