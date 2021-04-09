let canvas = document.createElement("canvas");
document.querySelector("body").appendChild(canvas);
let ctx = canvas ? canvas.getContext("2d") : null;

function resolution(width = 400, height = 400) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}
let snake, snakeLength, food;

function initialize() {
    resolution(600, 600);
    input.listen();
    snakeLength = 1;
    snake = new Snake('head');
    food = new Food();
    loop();
}
let input = {
    left: false,
    down: false,
    right: false,
    up: false,
    listen() {
        addEventListener('keydown', e => {
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
        }, false)
    }
}

class Snake {
    constructor(i, type) {
        this.x = type == 'tail' ? historyPath[i].x : 0;
        this.y = type == 'tail' ? historyPath[i].y : 0;
        this.type = type;
        this.index = i;
        this.delay = 10;
        this.size = ctx.canvas.width / 24;
        this.color = "white";
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        if (this.delay < 0) {
            if (this.type == "tail") {
                this.x = historyPath[this.index].x;
                this.y = historyPath[this.index].y;
            } else {
                this.delay = 10;
                if (input.left) {
                    this.x -= ctx.canvas.width / 24;
                }
                if (input.right) {
                    this.x += ctx.canvas.width / 24;
                }
                if (input.up) {
                    this.y -= ctx.canvas.width / 24;
                }
                if (input.down) {
                    this.y += ctx.canvas.width / 24;
                }
                // bounding box => 
                if (this.x + ctx.canvas.width / 24 > ctx.canvas.width) {
                    this.x = 0;
                }
                if (this.y + ctx.canvas.height / 24 > ctx.canvas.width) {
                    this.y = 0;
                }
                if (this.y < 0) {
                    this.y = ctx.canvas.height - ctx.canvas.height / 24;
                }
                if (this.x < 0) {
                    this.x = ctx.canvas.width - ctx.canvas.width / 24;
                }
                collision({ ...this })
                historyKeeper(snakeLength, { x: this.x, y: this.y })
            }
        } else {
            this.delay--;
        }
    }

}
function collision(snake) {
    if (snake.x == food.x && snake.y == food.y) {
        food.newFood();
        tails.push(new Snake(snakeLength - 1, 'tail'))
        snakeLength++;
        snake.delay - 1;
    }
}
class Food extends Snake {
    constructor() {
        super();
        this.x = (Math.floor(Math.random() * 24)) * ctx.canvas.width / 24;
        this.y = (Math.floor(Math.random() * 24)) * ctx.canvas.height / 24;
        this.color = `hsl(${Math.floor(Math.random() * 200)}, 100%, 50%)`;
    }
    update() {
        this.draw();
    }
    newFood() {
        this.color = `hsl(${Math.floor(Math.random() * 200)}, 100%, 50%)`;
        this.x = ((Math.floor(Math.random() * 24)) * ctx.canvas.width / 24);
        this.y = ((Math.floor(Math.random() * 24)) * ctx.canvas.height / 24);
    }
}
let historyPath = []

function historyKeeper(limit, loc) {
    historyPath.push(loc);
    if (historyPath.length > limit) {
        historyPath.shift();
    }
}
let tails = []
function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.update();
    if (tails.length) {
        for (let i = 0; i < tails.length; i++) {
            tails[i].update();
        }
    }
    food.update();
};


initialize();
