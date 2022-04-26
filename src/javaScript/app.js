// Main js


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
        messageElement.innerText = `${player.name} Wins`;
    } else if (player.health < enemy.health) {
        messageElement.innerText = `${enemy.name} Wins`;
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
    background.update();
    shop.update();

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
    //if (player.isAttacking && rectangularCollision({ rectangle1: player, rectangle2: enemy }) && !player.keys.attack.hasHit) {
    //    enemy.health -= 20;
    //    player.keys.attack.hasHit = true;
    //}
    //if (enemy.isAttacking && rectangularCollision({ rectangle1: enemy, rectangle2: player }) && !enemy.keys.attack.hasHit) {
    //    player.health -= 20;
    //    enemy.keys.attack.hasHit = true;
    //}
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
    // set background
    background = new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/img/background.png" });
    background.bottom = canvas.height - 95; // the y position from the background image bottom

    // set shop image in the background
    shop = new Sprite({ position: { x: 600, y: background.bottom - 320 }, imageSrc: "assets/img/shop.png", framesMax: 6, scale: 2.5 })

    playerKeys = new MovementKeys({ idle: { src: "assets/img/samuraiMack/Idle.png", framesMax: 8 }, moveLeft: { key: "a", src: "assets/img/samuraiMack/Run.png", framesMax: 8 }, moveRight: { key: "d", src: "assets/img/samuraiMack/Run.png", framesMax: 8 }, jump: { key: "w", src: "assets/img/samuraiMack/Jump.png", framesMax: 2 }, attack: { key: "s", src: "assets/img/samuraiMack/Attack1.png", framesMax: 6 }, fall: { src: "assets/img/samuraiMack/Fall.png", framesMax: 2 } });
    player = new Fighter({ name: "Samurai Mack", position: { x: 200, y: background.bottom - 150 }, keys: playerKeys, offset: { x: 215, y: 155 }, imageSrc: "assets/img/samuraiMack/Idle.png", framesMax: 8, scale: 2.5, framesHoldPerImage: 80 });

    //enemyKeys = new MovementKeys({ leftKey: "ArrowLeft", rightKey: "ArrowRight", jump: {key: "w", src: "assets/img/samuraiMack/Idle.png"}roattack: {key: "s", src: "assets/img/samuraiMack/Idle.png"ArrowDown" });
    enemyKeys = new MovementKeys({ idle: { src: "assets/img/kenji/Idle.png", framesMax: 4 }, moveLeft: { key: "j", src: "assets/img/kenji/Run.png", framesMax: 8 }, moveRight: { key: "l", src: "assets/img/kenji/Run.png", framesMax: 8 }, jump: { key: "i", src: "assets/img/kenji/Jump.png", framesMax: 2 }, attack: { key: "k", src: "assets/img/kenji/Attack1.png", framesMax: 4 }, fall: { src: "assets/img/kenji/Fall.png", framesMax: 2 } });
    enemy = new Fighter({ name: "Kenji", position: { x: canvas.width - 200, y: background.bottom - 150 }, keys: enemyKeys, offset: { x: 215, y: 170 }, imageSrc: "assets/img/kenji/Idle.png", framesMax: 4, scale: 2.5, framesHoldPerImage: 80 });

    gravity = 0.2;
    updateGame();
}

function startGame() {

    time.refresh();
    messageElement.classList.add("hide");
    gameRunning = true;
    gameReadyToStart = false;

    // fix this, objects shouldn't be recreated
    player = new Fighter({ name: "Samurai Mack", position: { x: 200, y: background.bottom - 150 }, keys: playerKeys, offset: { x: 215, y: 155 }, imageSrc: "assets/img/samuraiMack/Idle.png", framesMax: 8, scale: 2.5, framesHoldPerImage: 80 });
    enemy = new Fighter({ name: "Kenji", position: { x: canvas.width - 200, y: background.bottom - 150 }, keys: enemyKeys, offset: { x: 215, y: 170 }, imageSrc: "assets/img/kenji/Idle.png", framesMax: 4, scale: 2.5, framesHoldPerImage: 80 });


    player.enemy = enemy;
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
const world = document.querySelector("[data-world]");

// Global variables
let c;
let player;
let enemy;
let background;
let shop;

let gravity;
let gameRunning = false;
let gameReadyToStart = true;
let playerKeys;
let enemyKeys;

const countDown = new timer(240, countDownElement);
// Add Eventlistener
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Init
setupWorld();
