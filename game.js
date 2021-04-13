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
    maxScore: window.localStorage.getItem('maxScore') || undefined,
    effects: []
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
        return Math.floor(Math.random() * 360);
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
    },
    hsl2rgb(hue, saturation, lightness) {
        // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
        if (hue == undefined) {
            return [0, 0, 0];
        }

        var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
        var huePrime = hue / 60;
        var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

        huePrime = Math.floor(huePrime);
        var red;
        var green;
        var blue;

        if (huePrime === 0) {
            red = chroma;
            green = secondComponent;
            blue = 0;
        } else if (huePrime === 1) {
            red = secondComponent;
            green = chroma;
            blue = 0;
        } else if (huePrime === 2) {
            red = 0;
            green = chroma;
            blue = secondComponent;
        } else if (huePrime === 3) {
            red = 0;
            green = secondComponent;
            blue = chroma;
        } else if (huePrime === 4) {
            red = secondComponent;
            green = 0;
            blue = chroma;
        } else if (huePrime === 5) {
            red = chroma;
            green = 0;
            blue = secondComponent;
        }

        var lightnessAdjustment = lightness - (chroma / 2);
        red += lightnessAdjustment;
        green += lightnessAdjustment;
        blue += lightnessAdjustment;

        return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
    }
};

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
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "#181825";
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
        this.color = pubVars.currentHue = `hsl(${helpers.randHue()}, 100%, 55%)`;
    }
    draw() {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 50;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
    respawnFood() {
        pubVars.effects.push(new Effect(pubVars.food.x, pubVars.food.y, pubVars.currentHue, pubVars.food.size, pubVars.effects.length - 1));
        this.color = pubVars.currentHue = `hsl(${helpers.randHue()}, 100%, 50%)`;
        this.x = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
        this.y = (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;
        for (let i = 0; i < pubVars.historyPath.length; i++) {
            if (this.x == pubVars.historyPath[i].x && this.y == pubVars.historyPath[i].y) {
                this.respawnFood();
            }
        }
    }
}

class Effect {
    constructor(x, y, color, size, i) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.ttl = 0;
        this.angle = 1;
        this.index = i;
    }
    draw() {
        let hsl = this.color.split('').filter(l => l.match(/[^hsl()$% ]/g)).join('').split(',').map(n => +n);
        let [r, g, b] = helpers.hsl2rgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
        ctx.save();
        ctx.translate(this.size / 2 + this.x, this.size / 2 + this.y);
        ctx.rotate(this.angle * Math.PI / 180.0);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgb(${r},${g},${b},${1 / this.ttl})`;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
    update() {
        this.draw();
        if (this.size > 0) {
            this.y -= 1;
            this.ttl >= 40 ? pubVars.effects.splice(this.i + 1, 1) : this.ttl += 0.5;
            this.angle += 7;
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
            for (let i = 0; i < pubVars.effects.length; i++) {
                pubVars.effects[i].update();
            }
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
