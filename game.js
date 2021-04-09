let canvas = document.createElement("canvas");
document.querySelector("body").appendChild(canvas);
let ctx = canvas ? canvas.getContext("2d") : null;

function resolution(width = 400, height = 400) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}
let pubVars = {
    snake: undefined,
    snakeLength: undefined,
    food: undefined,
    currentHue: undefined,
    fractions: undefined
}
let helpers = {
    collision(isSelfCol, args) {
        if (isSelfCol) {
            if (args.x == pubVars.food.x && args.y == pubVars.food.y) {
                pubVars.food.respawnFood();
                tails.push(new Snake(pubVars.snakeLength - 1, "tail"));
                pubVars.snakeLength++;
                pubVars.snake.delay - 0.2;
            }
        } else {
            for (let i = 0; i < historyPath.length; i++) {
                if (args.x == historyPath[i].x && args.y == historyPath[i].y) {
                    alert('self-collision detected');
                }
            }
        }
    },
    randHue() {
        let randH = Math.floor(Math.random() * 255);
        currentHue = randH;
        return randH;
    },
    positionLogger(limit, loc) {
        historyPath.push(loc);
        if (historyPath.length > limit) {
            historyPath.shift();
        }
    }
}
function setup() {
    resolution();
    input.listen();
    pubVars.fractions = 16;
    pubVars.snakeLength = 2;
    pubVars.snake = new Snake("head");
    pubVars.food = new Food();
    loop();
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
                        this.left = true;
                        this.down = false;
                        this.right = false;
                        this.up = false;
                        break;
                    case "ArrowRight":
                        this.left = false;
                        this.down = false;
                        this.right = true;
                        this.up = false;
                        break;
                    case "ArrowUp":
                        this.left = false;
                        this.down = false;
                        this.right = false;
                        this.up = true;
                        break;
                    case "ArrowDown":
                        this.left = false;
                        this.down = true;
                        this.right = false;
                        this.up = false;
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
        this.x = type == "tail" ? historyPath[i].x : 0;
        this.y = type == "tail" ? historyPath[i].y : 0;
        this.type = type;
        this.index = i;
        this.delay = 10;
        this.localDelay = 10;
        this.size = ctx.canvas.width / pubVars.fractions;
        this.color = "white";
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        if (this.localDelay < 0) {
            if (this.type == "tail") {
                this.x = historyPath[this.index].x;
                this.y = historyPath[this.index].y;
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
        this.x =
            (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
        this.y =
            (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;
        this.color = `hsl(${helpers.randHue()}, 100%, 80%)`;
    }
    draw() {
        ctx.save();
        ctx.shadowColor = `hsl(${currentHue}, 100%, 50%)`;
        ctx.shadowBlur = 50;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
    update() {
        this.draw();
    }
    respawnFood() {
        this.color = `hsl(${helpers.randHue()}, 100%, 50%)`;
        this.x =
            (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.width) / pubVars.fractions;
        this.y =
            (Math.floor(Math.random() * pubVars.fractions) * ctx.canvas.height) / pubVars.fractions;
    }
}
let historyPath = [];

let tails = [];
function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pubVars.snake.update();
    if (tails.length) {
        for (let i = 0; i < tails.length; i++) {
            tails[i].update();
        }
    }
    pubVars.food.update();
}

setup();
