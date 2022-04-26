// Actions for fighters

class MovementKeys {
    constructor({ idle, moveLeft, moveRight, jump, fall, attack }) {
        this.idle = idle;
        this.moveLeft = { ...moveLeft, pressed: false };
        this.moveRight = { ...moveRight, pressed: false };
        this.jump = { ...jump, pressed: false, isJumped: false, isDoubleJumped: false };
        this.fall = fall;
        this.attack = { ...attack, pressed: false, isAble: true, delay: 500, isAttacking: false };
    }
}