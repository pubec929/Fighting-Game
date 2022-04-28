// All objects classes for the game

class Sprite {
    constructor({ position, imageSrc, framesMax = 1, scale = 1, offset = { x: 0, y: 0 }, framesHoldPerImage = 80 }) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.currentFrame = 0;
        this.framesElapsed = 0;
        this.framesHoldPerImage = framesHoldPerImage;
        this.offset = offset;
    }

    get PixelPerFrame() {
        return this.image.width / this.framesMax;
    }

    get framesHold() {
        return Math.floor(this.framesHoldPerImage / this.framesMax);
    }

    draw() {
        c.drawImage(
            this.image,
            this.PixelPerFrame * (this.currentFrame % this.framesMax), // start clipping x position
            0, // start clipping y position
            this.PixelPerFrame, // clipped image width
            this.image.height, // clipped image height
            this.position.x - this.offset.x, // positioning on canvas
            this.position.y - this.offset.y, // positioning on canvas
            this.PixelPerFrame * this.scale, // scaling the clipped image
            this.image.height * this.scale
        );
    }

    animatFrame() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold != 1) return;
        this.currentFrame = (this.currentFrame + 1) % this.framesMax;
    }

    update() {
        this.draw();
        this.animatFrame();
    }
}


class Fighter extends Sprite {
    constructor({ name, position, keys, offset, attackBox, scale = 1, framesHold, width = 50, height = 150 }) {
        const tempImageSrc = keys.idle.src;
        const tempFramesMax = keys.idle.framesMax;
        super({ position, imageSrc: tempImageSrc, scale, framesMax: tempFramesMax, offset, framesHold });

        this.name = name;
        this.velocity = { x: 0, y: 0 };
        this.height = height;
        this.width = width;
        this.lastKey = { primary: "", secondary: "" }
        this.isAttacking;
        this.keys = keys;
        this.isDoubleJumped;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height,
        }
        this.health = 100;
        this.isJumping = false;
        this.nameTag;
        this.isInAir = false;
        this.animatedAttack = false;
        this.setUpNameTag();

    }

    setUpNameTag() {
        // if a name tag is already existing return
        this.nameTag = document.querySelector(`[data-name='${this.name}']`);
        if (this.nameTag) return;

        // create name tag for player
        this.nameTag = document.createElement("div");

        world.appendChild(this.nameTag);
        this.nameTag.classList.add("player-tag");

        this.nameTag.innerText = this.name;
        this.nameTag.setAttribute("data-name", this.name);
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

    attack() {
        this.isAttacking = true;
        this.keys.attack.isAble = false;

        setTimeout(() => {
            this.keys.attack.isAble = true;
            this.keys.attack.hasHit = false;
            this.animatedAttack = false;
        }, this.keys.attack.delay)
    }


    jump() {
        // If object still in the air, set doubleJumped to true
        if (this.position.y + this.height < background.bottom) this.isDoubleJumped = true;
        this.velocity.y = -8;
        this.isJumping = true;
    }

    action() {
        this.velocity.x = 0;

        let actionTaken;

        if (this.keys.jump.pressed && this.lastKey.secondary === this.keys.jump && !this.isDoubleJumped && !this.isJumping) {
            this.jump();
            return;
        }
        if (this.keys.attack.pressed && this.lastKey.secondary === this.keys.attack && this.keys.attack.isAble) {
            this.switchFrame("attack");
            this.animatedAttack = true;
            this.attack();
            return;
        }

        if (this.keys.moveLeft.pressed && this.lastKey.primary === this.keys.moveLeft) {
            this.velocity.x = -2;
            this.switchFrame("moveLeft");
            actionTaken = true;
        }
        if (this.keys.moveRight.pressed && this.lastKey.primary === this.keys.moveRight) {
            this.velocity.x = 2;
            this.switchFrame("moveRight");
            actionTaken = true;
        }

        if (actionTaken) return;
        this.switchFrame("idle");
    }

    switchFrame(sprite) {
        const pattern = new RegExp(this.keys[sprite]?.src);
        if ((this.isInAir && sprite != "jump" && sprite != "fall" && sprite != "attack") || this.image.src.match(pattern) || this.animatedAttack) return;
        this.image.src = this.keys[sprite].src;
        this.framesMax = this.keys[sprite].framesMax;
        this.currentFrame = 0;
    }

    update() {
        // move attackbox to current position

        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y - this.attackBox.offset.y;

        if (this.name == "Kenji") {
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)
        }
        // move nameTag to current position
        this.nameTag.style.top = `${this.position.y - this.nameTag.clientHeight}px`;
        // center the tap upon the player
        this.nameTag.style.left = `${this.position.x + this.width / 2 - this.nameTag.clientWidth / 2}px`;

        // debugging purpose
        c.fillRect(this.position.x, this.position.y, this.width, this.height);


        this.draw();
        this.animatFrame();

        this.position.x += this.velocity.x;
        // Object not overlap on left
        if (this.position.x + this.velocity.x <= 0) this.position.x = 0;
        // Object not overlap on right
        if (this.position.x + this.width + this.velocity.x >= canvas.width) this.position.x = canvas.width - this.width;

        this.position.y += this.velocity.y;

        if (this.velocity.y > 0) {
            this.switchFrame("fall");
        } else if (this.velocity.y < 0) {
            this.switchFrame("jump");
        }

        // Object staying on the ground
        if (this.position.y + this.height + this.velocity.y >= background.bottom) {
            this.velocity.y = 0;
            this.position.y = background.bottom - this.height;
            this.isDoubleJumped = false;
            this.isJumping = false;
            this.isInAir = false;
            // Object not going over the top
        } else if (this.position.y + this.velocity.y <= 0) {
            this.velocity.y = 0;
            this.position.y = 1;
        } else {
            this.velocity.y += gravity;
            this.isInAir = true;
        }
    }
}