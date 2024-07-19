// Game Implementation
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const codeInput = document.getElementById('codeInput');
const output = document.getElementById('output');
const memoryVisualization = document.getElementById('memoryVisualization');
const levelInfo = document.getElementById('levelInfo');
const suggestion = document.getElementById('suggestion');

const player = {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    speed: 5
};

let platforms = [];
let goal = { x: 0, y: 0, width: 30, height: 30 };
let currentLevel = 1;

let cameraX = 0;
const keys = {};
let brainfuckCode = "";
let generatedCode = "";
const brainfuckGPT = new BrainfuckGPT();
const interpreter = new BrainfuckInterpreter();

function generateLevel() {
    platforms = [
        { x: 0, y: 450, width: 800, height: 50 }  // Ground
    ];

    // Generate random platforms
    for (let i = 0; i < 5 + currentLevel; i++) {
        platforms.push({
            x: Math.random() * 700 + 50,
            y: Math.random() * 300 + 100,
            width: Math.random() * 100 + 50,
            height: 20
        });
    }

    // Set goal position
    goal = {
        x: 700 + currentLevel * 50,
        y: 400,
        width: 30,
        height: 30
    };

    // Reset player position
    player.x = 50;
    player.y = 200;

    updateLevelInfo();
}

function updateLevelInfo() {
    levelInfo.textContent = `Level: ${currentLevel} | Goal: Reach x = ${goal.x}`;
}

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
}

function drawPlatforms() {
    ctx.fillStyle = 'green';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
    });
}

function drawGoal() {
    ctx.fillStyle = 'gold';
    ctx.fillRect(goal.x - cameraX, goal.y, goal.width, goal.height);
}

function drawCode() {
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText(generatedCode, 10, 30);
}

function update() {
    // Apply gravity
    player.y += 5;

    // Check platform collisions
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height) {
            player.y = platform.y - player.height;
        }
    });

    // Check for goal collision
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        currentLevel++;
        generateLevel();
    }

    cameraX = player.x - 400;
    if (cameraX < 0) cameraX = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawGoal();
    drawPlayer();
    drawCode();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateMemoryVisualization(memory, pointer) {
    const visibleCells = 50;
    const start = Math.max(0, pointer - Math.floor(visibleCells / 2));
    const end = Math.min(memory.length, start + visibleCells);
    
    const canvas = document.createElement('canvas');
    canvas.width = memoryVisualization.clientWidth;
    canvas.height = memoryVisualization.clientHeight;
    const ctx = canvas.getContext('2d');

    const cellWidth = canvas.width / visibleCells;
    const maxValue = Math.max(...memory.slice(start, end), 1);

    for (let i = start; i < end; i++) {
        const x = (i - start) * cellWidth;
        const height = (memory[i] / maxValue) * canvas.height;
        const y = canvas.height - height;

        ctx.fillStyle = i === pointer ? 'red' : 'blue';
        ctx.fillRect(x, y, cellWidth, height);
        ctx.strokeRect(x, y, cellWidth, height);
    }

    memoryVisualization.innerHTML = '';
    memoryVisualization.appendChild(canvas);
}

codeInput.