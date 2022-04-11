// Main js
class Sprite {
    constructor({position, velocity, color, keys, offset}) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.height = 150;
        this.width = 50;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x, 
                y: this.position.y
            },
            offset,
            width: 100, 
            height: 50}
        this.isAttacking;
        this.keys = keys;
        this.isDoubleJumped = false;
    }
    
    getKey(value) {
        return Object.keys(this.keys).find(property => this.keys[property].key === value);
    }

    isKeyClicked(clickedKey) {
        for (let move in this.keys) {
            if (this.keys[move].key === clickedKey) return true;
        }
        return false;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        // attack Box
        if (this.isAttacking) {
            c.fillStyle = "green";
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }    
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    move() {
        this.velocity.x = 0;
        if (this.keys.moveLeft.pressed && this.lastKey === this.keys.moveLeft) {
            this.velocity.x = -2;
        } else if (this.keys.moveRight.pressed && this.lastKey === this.keys.moveRight) {
            this.velocity.x = 2;
        }
    }

    jump() {
        if (this.isDoubleJumped) return;
        // If object still in the air, set doubleJumped to true
        if (this.position.y + this.height <= canvas.height) this.isDoubleJumped = true;
        this.velocity.y = -8;
    }

    update() {
        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;
        this.draw();

        this.position.x += this.velocity.x;
        // Object not overlap on left
        if (this.position.x + this.velocity.x <= 0) this.position.x = 0;
        // Object not overlap on right
        if (this.position.x + this.width + this.velocity.x >= canvas.width) this.position.x = canvas.width - this.width;

        this.position.y += this.velocity.y;

        // Object staying on the ground
        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
            this.isDoubleJumped = false;
        // Object not going over the top
        } else if (this.position.y + this.velocity.y <= 0) {
            this.velocity.y = 0;
            this.position.y = 1;
        } else this.velocity.y += gravity;
    }
}

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x && 
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}

function updateGame() {
    window.requestAnimationFrame(updateGame);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    enemy.update();

    // player movement
    player.move();
    // enemy movement
    enemy.move();
   
    // if player or enemy is attacking, check for collision
    if (player.isAttacking && rectangularCollision({rectangle1: player, rectangle2:enemy})) {
        player.isAttacking = false;
        console.log("Hit");
    }
    if (enemy.isAttacking && rectangularCollision({rectangle1: enemy, rectangle2: player})) {
        enemy.isAttacking = false;
        console.log("hit by enemy")
    }
}

function setupWorld() {
    c = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 576;
    c.fillRect(0, 0, canvas.width, canvas.height);

    const playerKeys = {moveLeft: {key: "a", pressed: false}, moveRight: {key: "d", pressed: false}, jump: {key: "w", pressed: false}, attack: {key: " ", pressed: false}};
    player = new Sprite({position: {x: 0, y: 0}, velocity: {x: 0, y: 0}, color: "red", keys: playerKeys, offset: {x: 0, y: 0}});

    const enemyKeys = {moveLeft: {key: "ArrowLeft", pressed: false}, moveRight: {key: "ArrowRight", pressed: false}, jump: {key: "ArrowUp", pressed: false}, attack: {key: "ArrowDown", pressed: false}};
    enemy = new Sprite({position: {x: 400, y: 100}, velocity: {x: 0, y: 0}, color: "blue", keys: enemyKeys, offset: {x: 50, y: 0}});

    gravity = 0.2;

    startGame();
}

function startGame() {
    // later use
    updateGame();
}

function handleKeyDown(e) {
    const pressedKey = e.key;

    if (!player.isKeyClicked(pressedKey) && !enemy.isKeyClicked(pressedKey)) return;
    const gameObject = player.isKeyClicked(pressedKey) ? player : enemy;
    const action = gameObject.getKey(pressedKey);

    if (action === "jump") gameObject.jump();
    else if (action === "attack") gameObject.attack();
    else {
        gameObject.keys[action].pressed = true;
        gameObject.lastKey = gameObject.keys[action];
    }
    
}

function handleKeyUp(e) {
    const pressedKey = e.key;
    if (!player.isKeyClicked(pressedKey) && !enemy.isKeyClicked(pressedKey)) return;
    const gameObject = player.isKeyClicked(pressedKey) ? player : enemy;
    const action = gameObject.getKey(pressedKey);

    gameObject.keys[action].pressed = false;
    
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


