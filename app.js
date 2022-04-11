// Main js
class Sprite {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.height = 150;
        this.lastKey;
    }
    
    draw() {
        c.fillStyle = "red";
        c.fillRect(this.position.x, this.position.y, 50, this.height);
    }

    update() {
        this.draw();
        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
        } else this.velocity.y += gravity;
    }
}

function updateGame() {
    window.requestAnimationFrame(updateGame);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    enemy.update();

    // player movement
    player.velocity.x = 0;

    if (keys.a.pressed && player.lastKey === "a") {
        player.velocity.x = -2;
    } else if (keys.d.pressed && player.lastKey === "d") {
        player.velocity.x = 2;
    }
    // enemy movement
    enemy.velocity.x = 0;

    if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
        enemy.velocity.x = -2;
    } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
        enemy.velocity.x = 2;
    }

}

function setupWorld() {
    c = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 576;
    c.fillRect(0, 0, canvas.width, canvas.height);

    player = new Sprite({position: {x: 0, y: 0}, velocity: {x: 0, y: 0}});
    enemy = new Sprite({position: {x: 400, y: 100}, velocity: {x: 0, y: 0}});

    gravity = 0.2;

    keys = {a: {pressed: false}, 
            d: {pressed: false}, 
            w: {pressed: false},
            ArrowRight: {pressed: false},
            ArrowLeft: {pressed: false},
            ArrowUp: {pressed: false}
    }

    startGame();
}

function startGame() {
    updateGame();
}

function handleKeyDown(e) {
    switch (e.key) {
        case "d":
            keys.d.pressed = true;
            player.lastKey = "d";
            break
        case "a":
            keys.a.pressed = true;
            player.lastKey = "a";
            break
        case "w":
            player.velocity.y = -10;
            break
        case "ArrowRight":
            keys.ArrowRight.pressed = true;
            enemy.lastKey = "ArrowRight";
            break
        case "ArrowLeft":
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = "ArrowLeft";
            break
        case "ArrowUp":
            enemy.velocity.y = -10;
            break
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case "d":
            keys.d.pressed = false;
            break
        case "a":
            keys.a.pressed = false;
            break
       
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break
    }
}

// Get DOM Elements
const canvas = document.querySelector("[data-game]");

// Global variables
let c;
let player;
let enemy;
let gravity;
let keys;

// Add Eventlistener
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Init
setupWorld();


