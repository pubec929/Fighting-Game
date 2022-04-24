// Actions for fighters

export default class Actions {
    constructor({leftKey, rightKey, jumpKey, attackKey}) {
        this.moveLeft = {key: leftKey, pressed: false};
        this.moveRight = {key: rightKey, pressed: false};
        this.jump = {key: jumpKey, pressed: false, isJumped: false, isDoubleJumped: false};
        this.attack = {key: attackKey, pressed: false, isAble: true, delay: 500, isAttacking: false};
    }
}