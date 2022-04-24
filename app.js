import {time, timer} from "./timer.js";
import MovementKeys from "./actions.js";

// Main js
class Sprite {
    constructor({position, color, keys, offset}) {
        this.position = position;
        this.velocity = {x: 0, y: 0};
        this.color = color;
        this.height = 150;
        this.width = 50;
        this.lastKey = {primary: "", secondary: ""}
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
        this.isDoubleJumped;
        this.health = 100;
        this.isJumping = false;
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
        this.keys.attack.isAble = false;
        setTimeout(() => {
            this.keys.attack.isAble = true;
            this.keys.attack.hasHit = false;
        }, this.keys.attack.delay)
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    
    jump() {
        // If object still in the air, set doubleJumped to true
        if (this.position.y + this.height < canvas.height ) this.isDoubleJumped = true;
        this.velocity.y = -8;
    }
    
    action() {
        this.velocity.x = 0;

        if (this.keys.jump.pressed && this.lastKey.secondary === this.keys.jump && !this.isDoubleJumped && !this.isJumping) {
            this.jump();
            this.isJumping = true;
            return;
            //this.keys.jump.pressed = false;
        }
        if (this.keys.attack.pressed && this.lastKey.secondary === this.keys.attack && this.keys.attack.isAble) {
            this.attack();
            return;
        }
       
        if (this.keys.moveLeft.pressed && this.lastKey.primary === this.keys.moveLeft) this.velocity.x = -2;

        if (this.keys.moveRight.pressed && this.lastKey.primary === this.keys.moveRight) this.velocity.x = 2;

    }
    update() {
        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;
        this.draw();

        if (!gameRunning) return;
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
            this.isJumping = false;
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

function determineWinner() {
    messageElement.classList.remove("hide");
    if (player.health === enemy.health) {
        messageElement.innerText = "Tie";
    } else if (player.health > enemy.health) {
        messageElement.innerText = "Player 1 Wins";
    } else if (player.health < enemy.health) {
        messageElement.innerText = "Player 2 Wins";
    }
}

function gameOver() {
    determineWinner();
    setTimeout(() => { 
        gameReadyToStart = true;
    }, 1000);
    gameRunning = false;
}


function updateGame() {
    window.requestAnimationFrame(updateGame);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    
    player.update();
    enemy.update();
    
    if (!gameRunning) {
        time.refresh();
        return;
    }
    // player movement
    player.action();
    // enemy movement
    enemy.action();
   
    // if player or enemy is attacking, check for collision
    if (player.isAttacking && rectangularCollision({rectangle1: player, rectangle2:enemy}) &&!player.keys.attack.hasHit) {
        enemy.health -= 20;
        player.keys.attack.hasHit = true;
    }
    if (enemy.isAttacking && rectangularCollision({rectangle1: enemy, rectangle2: player}) &&!enemy.keys.attack.hasHit) {
        player.health -= 20;
        enemy.keys.attack.hasHit = true;
    }
    // sync healthbar with health
    enemyHealthBar.style.width = enemy.health + "%";
    playerHealthBar.style.width = player.health + "%";

    // end game based on health
    if (player.health <= 0 || enemy.health <= 0) gameOver();

    // Update time
    countDown.update();
    if (countDown.timePassed <= 0) gameOver();
}

function setupWorld() {
    countDown.update();

    c = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 576;
    c.fillRect(0, 0, canvas.width, canvas.height);

    playerKeys = new MovementKeys({leftKey: "a", rightKey: "d", jumpKey: "w", attackKey: " "});
    player = new Sprite({position: {x: 200, y: canvas.height - 150}, color: "red", keys: playerKeys, offset: {x: 0, y: 0}});
    
    enemyKeys = new MovementKeys({leftKey: "ArrowLeft", rightKey: "ArrowRight", jumpKey: "ArrowUp", attackKey: "ArrowDown"});
    enemy = new Sprite({position: {x: canvas.width - 200, y: canvas.height - 150}, color: "blue", keys: enemyKeys, offset: {x: 50, y: 0}});
    
    gravity = 0.2;
    updateGame();
}

function startGame() {

    time.refresh();
    messageElement.classList.add("hide");
    gameRunning = true;
    gameReadyToStart = false;

    player = new Sprite({position: {x: 200, y: canvas.height - 150}, color: "red", keys: playerKeys, offset: {x: 0, y: 0}});
    
    enemy = new Sprite({position: {x: canvas.width - 200, y: canvas.height - 150}, color: "blue", keys: enemyKeys, offset: {x: 50, y: 0}});    
}

function handleKeyDown(e) {
    const pressedKey = e.key;
    
    if (pressedKey === "Enter" && gameReadyToStart) {
        startGame();
        return
    }

    if (!gameRunning) return;

    if (!player.isKeyClicked(pressedKey) && !enemy.isKeyClicked(pressedKey)) return;
    const gameObject = player.isKeyClicked(pressedKey) ? player : enemy;
    const action = gameObject.getKey(pressedKey);

    if (action === "jump" || action === "attack") gameObject.lastKey.secondary = gameObject.keys[action];
    else gameObject.lastKey.primary = gameObject.keys[action];

    gameObject.keys[action].pressed = true;
}

function handleKeyUp(e) {
    if (!gameRunning) return;
    const pressedKey = e.key;
    if (!player.isKeyClicked(pressedKey) && !enemy.isKeyClicked(pressedKey)) return;
    const gameObject = player.isKeyClicked(pressedKey) ? player : enemy;
    const action = gameObject.getKey(pressedKey);

    gameObject.keys[action].pressed = false;
    if (action === "jump") gameObject.isJumping = false
}

// Get DOM Elements
const canvas = document.querySelector("[data-game]");
const enemyHealthBar = document.querySelector("[data-enemy-health]");
const playerHealthBar = document.querySelector("[data-player-health]");
const countDownElement = document.querySelector("[data-timer]");
const messageElement = document.querySelector("[data-game-message]");

// Global variables
let c;
let player;
let enemy;
let gravity;
let gameRunning = false;
let gameReadyToStart = true;
let playerKeys;
let enemyKeys;

const countDown = new timer(59, countDownElement);

// Add Eventlistener
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Init
setupWorld();
