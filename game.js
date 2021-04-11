let replay = document.querySelector('#replay');
let score = document.querySelector('#score');
let canvas = document.createElement("canvas");
document.querySelector("#canvas").appendChild(canvas);
let ctx = canvas ? canvas.getContext("2d") : null;

function cnvRes(width = 400, height = 400) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}
let pubVars = {
    snake: undefined,
    snakeLength: undefined,
    food: undefined,
    currentHue: undefined,
    fractions: undefined,
    historyPath: [],
    gameOver: false,
    tails: [],
    update: undefined,
    maxScore: window.localStorage.getItem('maxScore') || undefined
}
let helpers = {
    collision(isSelfCol, snakeHead) {
        if (isSelfCol) {
            if (snakeHead.x == pubVars.food.x && snakeHead.y == pubVars.food.y) {
                pubVars.food.respawnFood();
                pubVars.tails.push(new Snake(pubVars.snakeLength - 1, "tail"));
                pubVars.snakeLength++;
                pubVars.snake.delay - 0.5;
            }
        } else {
            for (let i = 1; i < pubVars.historyPath.length; i++) {
                if (snakeHead.x == pubVars.historyPath[i].x && snakeHead.y == pubVars.historyPath[i].y) {
                    pubVars.gameOver = true;
                }
            }
        }
    },
    randHue() {
        let randH = Math.floor(Math.random() * 255);
        currentHue = randH;
        return randH;
    },
    randCor(newCors) {
        let randX = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
        let randY = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;

        if (newCors) {
            randX = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
            randY = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;
            return { randX, randY };
        } else {
            return { randX, randY };
        }

    },
    positionLogger(limit, loc) {
        pubVars.historyPath.push(loc);
        if (pubVars.historyPath.length > limit) {
            pubVars.historyPath.shift();
        }
    }
}

let input = {
    left: false,
    down: false,
    right: true,
    up: false,
    listen() {
        addEventListener(
            "keydown",
            (e) => {
                switch (e.key) {
                    case "ArrowLeft":
                        if (!this.right) {
                            this.left = true;
                            this.down = false;
                            this.right = false;
                            this.up = false;
                        }
                        break;
                    case "ArrowRight":
                        if (!this.left) {
                            this.left = false;
                            this.down = false;
                            this.right = true;
                            this.up = false;
                        }
                        break;
                    case "ArrowUp":
                        if (!this.down) {
                            this.left = false;
                            this.down = false;
                            this.right = false;
                            this.up = true;
                        }
                        break;
                    case "ArrowDown":
                        if (!this.up) {
                            this.left = false;
                            this.down = true;
                            this.right = false;
                            this.up = false;
                        }
                        break;
                    default:
                        break;
                }
            },
            false
        );
    }
};

class Snake {
    constructor(i, type) {
        this.x = type == "tail" ? pubVars.historyPath[i].x : 0;
        this.y = type == "tail" ? pubVars.historyPath[i].y : 0;
        this.type = type;
        this.index = i;
        this.delay = 10;
        this.localDelay = 10;
        this.size = ctx.canvas.width / pubVars.fractions;
        this.color = "white";
    }
    draw() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#2b2d33";
        ctx.fillStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        if (this.localDelay < 0) {
            if (this.type == "tail") {
                this.x = pubVars.historyPath[this.index].x;
                this.y = pubVars.historyPath[this.index].y;
            } else {
                this.localDelay = this.delay;
                if (input.left) {
                    this.x -= ctx.canvas.width / pubVars.fractions;
                }
                if (input.right) {
                    this.x += ctx.canvas.width / pubVars.fractions;
                }
                if (input.up) {
                    this.y -= ctx.canvas.width / pubVars.fractions;
                }
                if (input.down) {
                    this.y += ctx.canvas.width / pubVars.fractions;
                }
                // bounding box =>
                if (this.x + ctx.canvas.width / pubVars.fractions > ctx.canvas.width) {
                    this.x = 0;
                }
                if (this.y + ctx.canvas.height / pubVars.fractions > ctx.canvas.width) {
                    this.y = 0;
                }
                if (this.y < 0) {
                    this.y = ctx.canvas.height - ctx.canvas.height / pubVars.fractions;
                }
                if (this.x < 0) {
                    this.x = ctx.canvas.width - ctx.canvas.width / pubVars.fractions;
                }
                helpers.collision(true, { ...this });
                helpers.collision(false, { ...this });
                helpers.positionLogger(pubVars.snakeLength, { x: this.x, y: this.y });
            }
        } else {
            this.localDelay--;
        }
    }
}

class Food extends Snake {
    constructor() {
        super();
        this.x = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
        this.y = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;
        this.color = `hsl(${helpers.randHue()}, 100%, 55%)`;
    }
    draw() {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.shadowColor = `hsl(${currentHue}, 100%, 50%)`;
        ctx.shadowBlur = 50;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = `hsl(${currentHue}, 100%, 80%)`
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
    respawnFood() {
        this.color = `hsl(${helpers.randHue()}, 100%, 50%)`;
        this.x = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
        this.y = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;
        for (let i = 0; i < pubVars.historyPath.length; i++) {
            if (this.x == pubVars.historyPath[i].x && this.y == pubVars.historyPath[i].y) {
                this.respawnFood();
            }
        }

    }
}
function scoreManager() {
    let currentScore = pubVars.snakeLength - 1;
    score.innerText = currentScore.toString();
}

function setup() { // Intialization of the game.
    cnvRes();
    input.listen();
    pubVars.fractions = 32;
    pubVars.snakeLength = 1;
    pubVars.snake = new Snake("head");
    pubVars.food = new Food();
    loop();
};

function loop() {
    pubVars.update = setInterval(() => {
        if (!pubVars.gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pubVars.snake.update();
            if (pubVars.tails.length) {
                for (let i = 0; i < pubVars.tails.length; i++) {
                    pubVars.tails[i].update();
                }
            }
            pubVars.food.draw();
            scoreManager();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameOver();
        }
    }, 1000 / 60)
}
setup();

replay.addEventListener('click', () => {
    reset();
});
function gameOver() {
    pubVars.maxScore ? null : pubVars.maxScore = pubVars.snakeLength - 1;
    pubVars.snakeLength - 1 > pubVars.maxScore ? pubVars.maxScore = pubVars.snakeLength - 1 : null;
    window.localStorage.setItem('maxScore', pubVars.maxScore)
    ctx.fillStyle = "#4cffd7";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Poppins, sans-serif";
    ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.font = "15px Poppins, sans-serif";
    ctx.fillText(`SCORE   ${pubVars.snakeLength - 1}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 60);
    ctx.fillText(`MAXSCORE   ${pubVars.maxScore}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 80);
}
function reset() {
    clearInterval(pubVars.update);
    pubVars.snake = undefined;
    pubVars.snakeLength = undefined;
    pubVars.food = undefined;
    pubVars.currentHue = undefined;
    pubVars.fractions = undefined;
    pubVars.historyPath = [];
    pubVars.gameOver = false;
    pubVars.tails = [];
    pubVars.update = undefined;
    input.left = false;
    input.down = false;
    input.right = true;
    input.up = false;
    setup();
}

