let replay = document.querySelector("#replay");
let score = document.querySelector("#score");
let canvas = document.createElement("canvas");
document.querySelector("#canvas").appendChild(canvas);
let ctx = canvas ? canvas.getContext("2d") : null;

function cnvRes(width = 400, height = 400) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}
let _vars = {
    snake: undefined,
    snakeLength: undefined,
    food: undefined,
    currentHue: undefined,
    segments: undefined,
    historyPath: [],
    gameOver: false,
    tails: [],
    update: undefined,
    maxScore: window.localStorage.getItem("maxScore") || undefined,
    effects: [],
    effectCount: 50
};
let _helpers = {
    collision(isSelfCol, snakeHead) {
        if (isSelfCol) {
            if (snakeHead.x == _vars.food.x && snakeHead.y == _vars.food.y) {
                _vars.food.respawn();
                _vars.tails.push(new Snake(_vars.snakeLength - 1, "tail"));
                _vars.snakeLength++;
                _vars.snake.delay - .5;
            }
        } else {
            for (let i = 1; i < _vars.historyPath.length; i++) {
                if (
                    snakeHead.x == _vars.historyPath[i].x &&
                    snakeHead.y == _vars.historyPath[i].y
                ) {
                    _vars.gameOver = true;
                }
            }
        }
    },
    randHue() {
        return Math.floor(Math.random() * 360);
    },
    randCor(newCors) {
        let randX =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.width) /
            _vars.segments;
        let randY =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.height) /
            _vars.segments;

        if (newCors) {
            randX =
                (Math.floor(Math.random() * _vars.segments) * ctx.canvas.width) /
                _vars.segments;
            randY =
                (Math.floor(Math.random() * _vars.segments) * ctx.canvas.height) /
                _vars.segments;
            return { randX, randY };
        } else {
            return { randX, randY };
        }
    },
    positionLogger(limit, loc) {
        _vars.historyPath.push(loc);
        if (_vars.historyPath.length > limit) {
            _vars.historyPath.shift();
        }
    },
    hsl2rgb(hue, saturation, lightness) {
        if (hue == undefined) {
            return [0, 0, 0];
        }

        var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
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

        var lightnessAdjustment = lightness - chroma / 2;
        red += lightnessAdjustment;
        green += lightnessAdjustment;
        blue += lightnessAdjustment;

        return [
            Math.round(red * 255),
            Math.round(green * 255),
            Math.round(blue * 255)
        ];
    },
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }
};

let _input = {
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
        console.log(i, 100 / i)
        this.x = type == "tail" ? _vars.historyPath[i].x : 0;
        this.y = type == "tail" ? _vars.historyPath[i].y : 0;
        this.type = type;
        this.index = i;
        this.delay = 10;
        this.localDelay = 10;
        this.size = ctx.canvas.width / _vars.segments;
        this.color = type == "tail" ? "#d3d6e1" : "white";
    }
    draw() {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#181825";
        ctx.fillStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        if (this.localDelay < 0) {
            if (this.type == "tail") {
                this.x = _vars.historyPath[this.index].x;
                this.y = _vars.historyPath[this.index].y;
            } else {
                this.localDelay = this.delay;
                if (_input.left) {
                    this.x -= ctx.canvas.width / _vars.segments;
                }
                if (_input.right) {
                    this.x += ctx.canvas.width / _vars.segments;
                }
                if (_input.up) {
                    this.y -= ctx.canvas.width / _vars.segments;
                }
                if (_input.down) {
                    this.y += ctx.canvas.width / _vars.segments;
                }
                if (this.x + ctx.canvas.width / _vars.segments > ctx.canvas.width) {
                    this.x = 0;
                }
                if (this.y + ctx.canvas.height / _vars.segments > ctx.canvas.width) {
                    this.y = 0;
                }
                if (this.y < 0) {
                    this.y = ctx.canvas.height - ctx.canvas.height / _vars.segments;
                }
                if (this.x < 0) {
                    this.x = ctx.canvas.width - ctx.canvas.width / _vars.segments;
                }
                _helpers.collision(true, { ...this });
                _helpers.collision(false, { ...this });
                _helpers.positionLogger(_vars.snakeLength, { x: this.x, y: this.y });
            }
        } else {
            this.localDelay--;
        }
    }
}

class Food extends Snake {
    constructor() {
        super();
        this.x =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.width) /
            _vars.segments;
        this.y =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.height) /
            _vars.segments;
        this.color = _vars.currentHue = `hsl(${_helpers.randHue()}, 100%, 55%)`;
    }
    draw() {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
    respawn() {
        for (let i = 0; i < _vars.effectCount; i++) {
            _vars.effects.push(
                new Effect(
                    _vars.food.x,
                    _vars.food.y,
                    _vars.currentHue,
                    _vars.food.size
                )
            );
        }
        this.color = _vars.currentHue = `hsl(${_helpers.randHue()}, 100%, 50%)`;
        this.x =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.width) /
            _vars.segments;
        this.y =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.height) /
            _vars.segments;
        for (let i = 0; i < _vars.historyPath.length; i++) {
            if (
                this.x == _vars.historyPath[i].x &&
                this.y == _vars.historyPath[i].y
            ) {
                this.respawn();
            }
        }
    }
}

class Effect {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size / 2;
        this.ttl = 0;
        this.gravity = .1;
        this.vel = {
            x: Math.random() * 5 - 2.5,
            y: Math.random() * 5 - 2.5
        };
    }
    draw() {
        let hsl = this.color
            .split("")
            .filter((l) => l.match(/[^hsl()$% ]/g))
            .join("")
            .split(",")
            .map((n) => +n);
        let [r, g, b] = _helpers.hsl2rgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
        ctx.fillStyle = `rgb(${r},${g},${b},${1})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        this.size -= .3;
        this.ttl += .5;
        this.y += this.vel.y;
        this.x += this.vel.x;
        this.vel.y += this.gravity;
    }
}
function scoreManager() {
    let currentScore = _vars.snakeLength - 1;
    score.innerText = currentScore.toString();
}
function cleanMem() {
    for (let i = 0; i < _vars.effects.length; i++) {
        if (_vars.effects[i].size <= 0) {
            _vars.effects.splice(i, 1);
        }
    }
}
function setup() {
    cnvRes();
    _input.listen();
    _vars.segments = 32;
    _vars.snakeLength = 1;
    _vars.snake = new Snake("head");
    _vars.food = new Food();
    loop();
}

function loop() {
    _vars.update = setInterval(() => {
        if (!_vars.gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            _vars.snake.update();
            if (_vars.tails.length) {
                for (let i = 0; i < _vars.tails.length; i++) {
                    _vars.tails[i].update();
                }
            }
            _vars.food.draw();
            scoreManager();
            for (let i = 0; i < _vars.effects.length; i++) {
                _vars.effects[i].update();
            }
            cleanMem();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameOver();
        }
    }, 1000 / 60);
}
setup();

replay.addEventListener("click", () => {
    reset();
});
function gameOver() {
    _vars.maxScore ? null : (_vars.maxScore = _vars.snakeLength - 1);
    _vars.snakeLength - 1 > _vars.maxScore
        ? (_vars.maxScore = _vars.snakeLength - 1)
        : null;
    window.localStorage.setItem("maxScore", _vars.maxScore);
    ctx.fillStyle = "#4cffd7";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Poppins, sans-serif";
    ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.font = "15px Poppins, sans-serif";
    ctx.fillText(
        `SCORE   ${_vars.snakeLength - 1}`,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2 + 60
    );
    ctx.fillText(
        `MAXSCORE   ${_vars.maxScore}`,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2 + 80
    );
}

function reset() {
    clearInterval(_vars.update);
    _vars.snake = undefined;
    _vars.snakeLength = undefined;
    _vars.food = undefined;
    _vars.currentHue = undefined;
    _vars.segments = undefined;
    _vars.historyPath = [];
    _vars.gameOver = false;
    _vars.tails = [];
    _vars.update = undefined;
    _input.left = false;
    _input.down = false;
    _input.right = true;
    _input.up = false;
    setup();
}
