const canvas = document.getElementById('gameCanvas');
const gameLogic = new GameLogic(canvas.width, canvas.height);
const gameRenderer = new GameRenderer(canvas, gameLogic);
const brainfuckGPT = new BrainfuckGPT();
const interpreter = new BrainfuckInterpreter();

let isAIControlled = false;
let aiActions = [];
let isAIReady = false;
let trainingIteration = 0;

async function initGame() {
    gameLogic.generateLevel();
    gameLoop();
    trainAIInBackground();
}

async function trainAIInBackground() {
    const initialTrainingData = [
        '++++[>+++++<-]>.',
        '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.',
        '+[-[<<[+[--->]-[<<<]]]>>>-]>-.---.>..>.<<<<-.<+.>>>>>.>.<<.<-.'
    ];
    try {
        console.log('Starting initial AI training...');
        document.getElementById('aiStatus').textContent = 'AI: Training...';
        await brainfuckGPT.train(initialTrainingData, 10);
        console.log('Initial AI training completed successfully');
        document.getElementById('generationLog').textContent += 'Initial AI training completed successfully\n';
        isAIReady = true;
        document.getElementById('aiStatus').textContent = 'AI: Ready';
        
        // Start continuous training
        continuousTraining();
    } catch (error) {
        console.error('Error during AI training:', error);
        document.getElementById('generationLog').textContent += `Error during AI training: ${error.message}\n`;
        document.getElementById('aiStatus').textContent = 'AI: Error';
    }
}

async function continuousTraining() {
    const additionalTrainingData = [
        '+[----->+++<]>+.+.[--->+<]>---.++[->+++<]>.-[----->+<]>-.+++++.',
        '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.',
        '+[-[<<[+[--->]-[<<<]]]>>>-]>-.---.>..>.<<<<-.<+.>>>>>.>.<<.<-.'
    ];
    
    while (true) {
        try {
            trainingIteration++;
            console.log(`Starting training iteration ${trainingIteration}...`);
            await brainfuckGPT.train(additionalTrainingData, 5);
            console.log(`Training iteration ${trainingIteration} completed`);
            document.getElementById('aiStatus').textContent = `AI: Ready (Iteration ${trainingIteration})`;
            
            // Wait for a short period before the next training iteration
            await new Promise(resolve => setTimeout(resolve, 10000));
        } catch (error) {
            console.error(`Error during training iteration ${trainingIteration}:`, error);
            document.getElementById('generationLog').textContent += `Error during training iteration ${trainingIteration}: ${error.message}\n`;
        }
    }
}

async function gameLoop() {
    gameLogic.update();
    
    if (isAIControlled && isAIReady && aiActions.length === 0) {
        const gameState = gameLogic.getGameState();
        const seed = '+'.repeat(gameState.playerX % 10) + 
                     '>'.repeat(gameState.playerY % 10) + 
                     '-'.repeat(gameState.level);
        try {
            const generatedCode = await brainfuckGPT.generate(seed, 20);
            document.getElementById('generatedCode').textContent = generatedCode;
            aiActions = brainfuckGPT.interpretOutput(generatedCode);
            console.log('Generated Brainfuck code:', generatedCode);
            console.log('Interpreted actions:', aiActions);
        } catch (error) {
            console.error('Error generating AI actions:', error);
            document.getElementById('generationLog').textContent += `Error generating AI actions: ${error.message}\n`;
        }
    }

    if (isAIControlled && aiActions.length > 0) {
        const action = aiActions.shift();
        gameLogic.movePlayer(action);
    }

    gameRenderer.draw();
    updateUI();

    requestAnimationFrame(gameLoop);
}

function updateUI() {
    document.getElementById('levelInfo').textContent = `Level: ${gameLogic.currentLevel}`;
    document.getElementById('score').textContent = `Score: ${gameLogic.score}`;
}

function handleKeyPress(event) {
    if (event.code === 'KeyT' && isAIReady) {
        isAIControlled = !isAIControlled;
        aiActions = []; // Clear any remaining AI actions
        console.log(`AI Control turned ${isAIControlled ? 'ON' : 'OFF'}`);
        document.getElementById('generationLog').textContent += `AI Control turned ${isAIControlled ? 'ON' : 'OFF'}\n`;
        document.getElementById('aiStatus').textContent = `AI: ${isAIControlled ? 'Active' : 'Ready'} (Iteration ${trainingIteration})`;
    } else if (!isAIControlled) {
        switch (event.code) {
            case 'ArrowLeft':
                gameLogic.movePlayer('left');
                break;
            case 'ArrowRight':
                gameLogic.movePlayer('right');
                break;
            case 'Space':
                gameLogic.movePlayer('jump');
                break;
        }
    }
}

document.addEventListener('keydown', handleKeyPress);

initGame().catch(error => {
    console.error('Error initializing game:', error);
    document.getElementById('generationLog').textContent += `Error initializing game: ${error.message}\n`;
});
