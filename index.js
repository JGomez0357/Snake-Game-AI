// Declarations
const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const highScoreElement = document.querySelector("#highScore"); // Updated ID
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackgroundLight = "white";
const boardBackgroundDark = "#EDF4F2";
const snakeColor = "#469E48";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 25; // size of anything in the game
let running = false; // variable for whether game is running or not
let xVelocity = unitSize; // how far the snake moves on the x-axis every game tick
let yVelocity = 0; // how far the snake moves on the y-axis every game tick. Originally zero at game start.
let foodX; // x-coordinate of food
let foodY; // y-coordinate of food
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // gets high score from localStorage

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

gameStart();

// Game functions
function gameStart() {
    running = true;
    scoreText.textContent = score;
    createFood();
    drawFood();
    nextTick();
}

function nextTick() {
    if (running) {
        setTimeout(() => {
            clearBoard();
            drawFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            nextTick();
        }, 75);
    } else {
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
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

function moveSnake() {
    const head = {x: snake[0].x + xVelocity, y: snake[0].y + yVelocity};

    snake.unshift(head);
    // if food is eaten
    if (snake[0].x === foodX && snake[0].y === foodY) {
        score += 1;
        scoreText.textContent = score;
        createFood();
    } else {
        snake.pop();
    }
    updateHighScore(); // Updates high score
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = (yVelocity === -unitSize);
    const goingDown = (yVelocity === unitSize);
    const goingRight = (xVelocity === unitSize);
    const goingLeft = (xVelocity === -unitSize);

    switch (true) {
        case (keyPressed === LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case (keyPressed === RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }
}

function checkGameOver() {
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
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            running = false;
        }
    }
}

function displayGameOver() {
    ctx.font = "bold 80px Verdana";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", gameWidth / 2, gameHeight / 2);
    running = false;

    setTimeout(resetGame, 500);
}

function resetGame() {
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

// Updates high score if current score is higher
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = 'High Score: ' + highScore;
    }
}
