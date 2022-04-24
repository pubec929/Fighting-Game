// All objects classes for the game

class Sprite {
    constructor({ position, imageSrc }) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }

    update() {
        this.draw();
    }
}


class Fighter {
    constructor({ position, color, keys, offset }) {
        this.position = position;
        this.velocity = { x: 0, y: 0 };
        this.enemy = enemy;
        this.color = color;
        this.height = 150;
        this.width = 50;
        this.lastKey = { primary: "", secondary: "" }
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 50
        }
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
        if (this.position.y + this.height < background.bottom) this.isDoubleJumped = true;
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
        if (this.position.y + this.height + this.velocity.y >= background.bottom) {
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