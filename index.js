// Declarations
const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const highScoreElement = document.querySelector("#highScore"); // Updated ID
const avgScoreElement = document.querySelector("#avgScore")
const speedSliderElement = document.getElementById("speedSlider");
const autoplay = document.getElementById("autoplayCheck");
const replayButton = document.getElementById("replayButton");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackgroundLight = "white";
const boardBackgroundDark = "#EDF4F2";
const snakeColor = "#469E48";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 25; // size of anything in the game
let running = false; // variable for whether game is running or not
let paused = false; // variable for whether game is paused or not
let xVelocity = unitSize; // how far the snake moves on the x-axis every game tick
let yVelocity = 0; // how far the snake moves on the y-axis every game tick. Originally zero at game start.
let foodX; // x-coordinate of food
let foodY; // y-coordinate of food
let score = 0;
let highScore = sessionStorage.getItem('highScore') || 0; // gets high score from sessionStorage
let sessionScores = []; // Array to store scores of the current session
let gameSpeed = 50;
let gameInterval; // Interval ID for the game loop

speedSliderElement.addEventListener('input', function() {
    const value = speedSliderElement.value;
    gameSpeed = value;
    if (running && !paused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(nextTick, gameSpeed);
    }
});

// Displays high score
highScoreElement.textContent = 'High Score: ' + highScore;

// Create the snake's initial body
let snake = [
    {x: unitSize * 4, y: 0},
    {x: unitSize * 3, y: 0},
    {x: unitSize * 2, y: 0},
    {x: unitSize, y: 0},
    {x: 0, y: 0}
];

// Event listeners
window.addEventListener("keydown", changeDirection);

// Prevent window from scrolling when using arrow keys
window.addEventListener("keydown", function(e) {
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
});

// Event listener for the "P" key to pause/resume the game
window.addEventListener("keydown", function(e) {
    if (e.key === "p" || e.key === "P") {
        togglePause();
    }
});

replayButton.addEventListener('click', function(){
    location.reload();
});

gameStart();

// Game functions
function gameStart(){
    running = true;
    paused = false;
    scoreText.textContent = score;
    createFood();
    drawFood();
    gameInterval = setInterval(nextTick, gameSpeed);
}

function nextTick(){
    if (running) {
        if (!paused) {
            clearBoard();
            drawFood();
            moveSnake();
            drawSnake();
            checkGameOver();
        }
    } else {
        clearInterval(gameInterval);
        displayGameOver();
    }
}

function clearBoard() {
    drawCheckeredBoard();
}

function drawCheckeredBoard() {
    for (let x = 0; x < gameWidth; x += unitSize) {
        for (let y = 0; y < gameHeight; y += unitSize) {
            ctx.fillStyle = (x / unitSize % 2 === y / unitSize % 2) ? boardBackgroundLight : boardBackgroundDark;
            ctx.fillRect(x, y, unitSize, unitSize);
        }
    }
}

function createFood() {
    function randomFood(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }

    let foodPositionIsValid = false;

    while (!foodPositionIsValid) {
        foodX = randomFood(0, gameWidth - unitSize);
        foodY = randomFood(0, gameHeight - unitSize);

        // Check if the food position collides with the snake
        foodPositionIsValid = !snake.some(part => part.x === foodX && part.y === foodY);
    }



    console.log(foodX, foodY);

}
function drawFood(){
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

function moveSnake() {
    const path = findPath(snake[0], { x: foodX, y: foodY });

    if (path.length > 1) {
        const nextMove = path[1]; // The first element is the current position
        const xDiff = nextMove.x - snake[0].x;
        const yDiff = nextMove.y - snake[0].y;

        // Set the velocity based on the next move
        xVelocity = xDiff;
        yVelocity = yDiff;
    }

    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);

    // If food is eaten
    if (snake[0].x === foodX && snake[0].y === foodY) {
        score += 1;
        scoreText.textContent = score;
        createFood();
    } else {
        snake.pop();
    }
    updateHighScore(); // Updates high score
}


function drawSnake(){
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });
}

function changeDirection(event) {
    // Disable player control
}

function checkGameOver(){
    switch (true) {
        case (snake[0].x < 0):
            running = false;
            break;
        case (snake[0].x >= gameWidth):
            running = false;
            break;
        case (snake[0].y < 0):
            running = false;
            break;
        case (snake[0].y >= gameHeight):
            running = false;
            break;
    }
    for (let i = 1; i < snake.length; i += 1) {
        if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
            running = false;
        }
    }
}

function displayGameOver(){
    ctx.font = "bold 80px Verdana";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", gameWidth / 2, gameHeight / 2);
    running = false;
    //Automatically start game if autoplay is enabled
    if(autoplay.checked){
        setTimeout(resetGame, 300);
    }
}

function resetGame(){
    console.log("Round Score: " + score)
    updateAvgScore();
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;

    // Create the snake's initial body
    snake = [
        {x: unitSize * 4, y: 0},
        {x: unitSize * 3, y: 0},
        {x: unitSize * 2, y: 0},
        {x: unitSize, y: 0},
        {x: 0, y: 0}
    ];
    gameStart();
}

function findPath(start, goal) {
    const openList = [];
    const closedList = [];
    openList.push(start);

    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    gScore[`${start.x},${start.y}`] = 0;
    fScore[`${start.x},${start.y}`] = heuristic(start, goal);

    while (openList.length > 0) {
        // Get the node with the lowest fScore
        const current = openList.reduce((prev, curr) => {
            return fScore[`${prev.x},${prev.y}`] < fScore[`${curr.x},${curr.y}`] ? prev : curr;
        });

        // If the goal is reached
        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        // Remove current from openList and add to closedList
        openList.splice(openList.indexOf(current), 1);
        closedList.push(current);

        // Get neighbors
        const neighbors = getNeighbors(current);

        //check if neighbor is in closedList or if its part of the body
        neighbors.forEach(neighbor => {
            if (closedList.some(node => node.x === neighbor.x && node.y === neighbor.y) ||
                snake.some(part => part.x === neighbor.x && part.y === neighbor.y)) {
                return;
            }

            const tentative_gScore = gScore[`${current.x},${current.y}`] + 1;

            if (!openList.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                openList.push(neighbor);
            } else if (tentative_gScore >= gScore[`${neighbor.x},${neighbor.y}`]) {
                return;
            }

            cameFrom[`${neighbor.x},${neighbor.y}`] = current;
            gScore[`${neighbor.x},${neighbor.y}`] = tentative_gScore;
            fScore[`${neighbor.x},${neighbor.y}`] = gScore[`${neighbor.x},${neighbor.y}`] + heuristic(neighbor, goal);
        });
    }

    return [];
}

function getNeighbors(node) {
    const neighbors = [];
    const possibleMoves = [
        { x: node.x + unitSize, y: node.y },
        { x: node.x - unitSize, y: node.y },
        { x: node.x, y: node.y + unitSize },
        { x: node.x, y: node.y - unitSize }
    ];

    possibleMoves.forEach(move => {
        if (move.x >= 0 && move.x < gameWidth && move.y >= 0 && move.y < gameHeight) {
            neighbors.push(move);
        }
    });

    return neighbors;
}

function heuristic(node, goal) {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
}

function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom[`${current.x},${current.y}`]) {
        current = cameFrom[`${current.x},${current.y}`];
        totalPath.unshift(current);
    }
    return totalPath;
}


// Updates high score if current score is higher
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        sessionStorage.setItem('highScore', highScore);
        highScoreElement.textContent = 'High Score: ' + highScore;
    }
}

// Updates avg score
function updateAvgScore() {
    sessionScores.push(score);
    let sum = (sessionScores.reduce((accumulator, currValue) => accumulator + currValue, 0));
    let avgScore = roundIfDecimal((sum/sessionScores.length),1);
    console.log("Avgerage score: " + avgScore);

    avgScoreElement.textContent = 'Avg Score: ' + avgScore;
}

//rounds number if it is a decimal
function roundIfDecimal(num, decimalPlaces) {
    // Check if the number has a fractional part
    if (num % 1 !== 0) {
        return parseFloat(num.toFixed(decimalPlaces));
    }
    return num;
}

function togglePause() {
    paused = !paused;
    if (paused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(nextTick, gameSpeed);
    }
}
