class Ball {
    constructor() {
        this.velocity = [0, 0];
        this.position = [0, 0];
        this.element = $('#ball');
        this.paused = false;
        this.owner = undefined;
    }

    move(t) {
        if (this.owner !== undefined) {
            const ownerPosition = this.owner.getPosition();
            this.position[1] = ownerPosition[1] + 64;
            this.position[0] = this.owner.getSide() === 'left' ? ownerPosition[0] + 64 : ownerPosition[0];
        } else {
            if (this.position[1] - 32 <= 0 || this.position[1] + 32 >= window.innerHeight) {
                this.velocity[1] = -this.velocity[1];
            }
            this.position[0] += this.velocity[0] * t;
            this.position[1] += this.velocity[1] * t;
        }
        this.element.css('left', `${this.position[0] - 32}px`);
        this.element.css('top', `${this.position[1] - 32}px`);
    }

    update(t) {
        if (!this.paused) {
            this.move(t);
        }
        if (this.owner !== undefined) {
            return;
        }
        const playerPosition = player.getPosition();
        if (this.position[0] <= 128 && this.position[1] >= playerPosition[1] && this.position[1] <= playerPosition[1] + 128) {
            console.log("Grabbed by player!");
            this.owner = player;
        }
        const opponentPosition = opponent.getPosition();
        if (this.position[0] >= window.innerWidth - 128 && this.position[1] >= opponentPosition[1] && this.position[1] <= opponentPosition[1] + 128) {
            console.log("Grabbed by opponent!");
            this.owner = opponent;
        }
    }

    pause() {
        this.paused = true;
    }

    start() {
        this.paused = false;
    }

    setVelocity(v) {
        this.velocity = v;
    }

    setOwner(owner) {
        this.owner = owner;
    }

    getOwner() {
        return this.owner;
    }
}

class Player {
    constructor(elementName, side) {
        this.position = [0, 0];
        this.element = $(`#${elementName}`);
        this.side = side;
        this.aim = 0;
    }

    move(y) {
        this.position[1] += y;
        if (this.position[1] <= 0) {
            this.position[1] = 0;
        }
        if (this.position[1] >= window.innerHeight - 128) {
            this.position[1] = window.innerHeight - 128;
        }
        if (this.side === 'right') {
            this.position[0] = window.innerWidth - 128;
        }
        this.element.css('left', `${this.position[0]}px`);
        this.element.css('top', `${this.position[1]}px`);
    }

    setAim(a) {
        this.aim = a;
    }

    fire() {
        if (ball.getOwner() !== this) {
            return;
        }
        let v = [0, 0];
        if (this.side === 'left') {
            switch (this.aim) {
                case -1:
                    v = [0.707, -0.707];
                    break;
                case 0:
                    v = [1, 0];
                    break;
                case 1:
                    v = [0.707, 0.707];
                    break;
            }
        } else {
            switch (this.aim) {
                case -1:
                    v = [-0.707, -0.707];
                    break;
                case 0:
                    v = [-1, 0];
                    break;
                case 1:
                    v = [-0.707, 0.707];
                    break;
            }
        }
        ball.setVelocity(v);
        ball.setOwner(undefined);
    }

    getSide() {
        return this.side;
    }

    getPosition() {
        return this.position;
    }
}

class AI {
    constructor(playerToControl) {
        this.ctl = playerToControl;
        this.State = {
            WAITING: 0,
            FOLLOWING: 1,
            AIMING: 2
        };
        this.currentState = this.State.FOLLOWING;
    }

    update() {
        switch (this.currentState) {
            case this.State.FOLLOWING:
                this.moveTowardsBall();
                this.currentState = this.State.WAITING;
                break;
            case this.State.WAITING:
                setTimeout(() => {
                    this.currentState = this.State.FOLLOWING;
                }, 400);
                break;
            case this.State.AIMING:
                // Do something to aim.
                break;
        }
    }

    moveTowardsBall() {
        if (ball.getPosition()[1] >= this.ctl.getPosition()[1] + 64) {
            this.ctl.move(distance);
        } else {
            this.ctl.move(-distance);
        }
    }

    aimAndFire() {
        const numRepeats = Math.floor(5 + Math.random() * 5);
        const randomMove = () => {
            if (Math.random() > 0.5) {
                this.ctl.move(-distance);
            } else {
                this.ctl.move(distance);
            }
        };
        const randomAimAndFire = () => {
            const d = Math.floor(Math.random() * 3 - 1);
            opponent.setAim(d);
            opponent.fire();
            this.currentState = this.State.FOLLOWING;
        };
        this.repeat(randomMove, randomAimAndFire, 250, numRepeats);
    }

    repeat(cb, cbFinal, interval, count) {
        if (count <= 0) {
            cbFinal();
        } else {
            cb();
            setTimeout(() => {
                this.repeat(cb, cbFinal, interval, count - 1);
            }, interval);
        }
    }
}

const distance = 24; // The amount to move the player each step.
let lastUpdate = 0;
const player = new Player('player', 'left');
player.move(0);
const opponent = new Player
