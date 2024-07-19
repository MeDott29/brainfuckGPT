class GameLogic {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.player = {
            x: 50,
            y: 200,
            width: 30,
            height: 30,
            xVelocity: 0,
            yVelocity: 0,
            maxSpeed: 5,
            acceleration: 0.5,
            friction: 0.9,
            jumpStrength: 12,
            isJumping: false
        };
        this.platforms = [];
        this.goal = { x: 0, y: 0, width: 30, height: 30 };
        this.currentLevel = 1;
        this.score = 0;
        this.gravity = 0.5;
    }

    generateLevel() {
        this.platforms = [
            { x: 0, y: this.canvasHeight - 50, width: this.canvasWidth * 2, height: 50 }
        ];

        const numPlatforms = 5 + this.currentLevel;
        for (let i = 0; i < numPlatforms; i++) {
            this.platforms.push({
                x: Math.random() * (this.canvasWidth * 2 - 100) + 50,
                y: Math.random() * (this.canvasHeight - 150) + 100,
                width: Math.random() * 100 + 50,
                height: 20
            });
        }

        this.goal = {
            x: this.canvasWidth * 1.5 + this.currentLevel * 50,
            y: this.canvasHeight - 100,
            width: 30,
            height: 30
        };

        this.player.x = 50;
        this.player.y = this.canvasHeight - 100;
    }

    update() {
        this.player.xVelocity *= this.player.friction;
        this.player.x += this.player.xVelocity;

        this.player.yVelocity += this.gravity;
        this.player.y += this.player.yVelocity;

        let onGround = false;
        for (let platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                onGround = true;
                this.player.y = platform.y - this.player.height;
                this.player.yVelocity = 0;
                break;
            }
        }

        this.player.isJumping = !onGround;

        if (this.checkCollision(this.player, this.goal)) {
            this.score += 100;
            this.currentLevel++;
            this.generateLevel();
        }

        if (this.player.y > this.canvasHeight) {
            this.player.y = this.canvasHeight - this.player.height;
            this.player.yVelocity = 0;
        }
    }

    movePlayer(action) {
        switch (action) {
            case 'left':
                this.player.xVelocity = Math.max(this.player.xVelocity - this.player.acceleration, -this.player.maxSpeed);
                break;
            case 'right':
                this.player.xVelocity = Math.min(this.player.xVelocity + this.player.acceleration, this.player.maxSpeed);
                break;
            case 'jump':
                if (!this.player.isJumping) {
                    this.player.yVelocity = -this.player.jumpStrength;
                    this.player.isJumping = true;
                }
                break;
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    getGameState() {
        return {
            playerX: Math.floor(this.player.x),
            playerY: Math.floor(this.player.y),
            goalX: Math.floor(this.goal.x),
            goalY: Math.floor(this.goal.y),
            level: this.currentLevel,
            score: this.score
        };
    }
}