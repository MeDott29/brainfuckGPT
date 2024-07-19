class GameRenderer {
    constructor(canvas, gameLogic) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameLogic = gameLogic;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms
        this.ctx.fillStyle = 'green';
        for (let platform of this.gameLogic.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // Draw goal
        this.ctx.fillStyle = 'gold';
        this.ctx.fillRect(this.gameLogic.goal.x, this.gameLogic.goal.y, this.gameLogic.goal.width, this.gameLogic.goal.height);

        // Draw player
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.gameLogic.player.x, this.gameLogic.player.y, this.gameLogic.player.width, this.gameLogic.player.height);
    }
}