document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const startButton = document.getElementById('startButton');
    const menu = document.getElementById('menu');

    // Game constants
    const CELL_SIZE = 16;
    const ROWS = 31;
    const COLS = 28;
    
    // Tile types
    const WALL = 1;
    const PATH = 0;
    const PELLET = 2;
    const POWER_PELLET = 3;

    // Define complete maze layout first, before any functions or game logic
    const maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Game state management
    const GAME_STATE = {
        MENU: 0,
        PLAYING: 1,
        PAUSED: 2,
        GAME_OVER: 3
    };
    
    // Initialize basic variables
    let gameState = GAME_STATE.MENU;
    let animationFrameId = null;
    let lastFrameTime = 0;
    let score = 0;
    let lives = 3;
    let pelletCount = countPellets(); // Now safe to call after maze is defined

    // Game objects initialization
    let pacman = {
        x: 14 * CELL_SIZE,
        y: 23 * CELL_SIZE,
        direction: 'right',
        nextDirection: 'right',
        speed: CELL_SIZE,
        size: CELL_SIZE,
        color: 'yellow',
        mouthAngle: 0.5,
        mouthOpen: true
    };
    let ghost = {
        x: 14 * CELL_SIZE,
        y: 11 * CELL_SIZE,
        speed: CELL_SIZE,
        size: CELL_SIZE,
        color: 'red',
        frightened: false,
        mode: 'chase',
        modeTimer: 0,
        modeDuration: { chase: 3000, scatter: 3000 },
        scatterTarget: { x: 1, y: 1 },
        frightMode: true
    };

    // Move initialization into a proper setup function
    function initializeGame() {
        pelletCount = countPellets();
        resetPositions();
        score = 0;
        lives = 3;
        gameState = GAME_STATE.PLAYING;
        scoreElement.textContent = score;
        livesElement.textContent = lives;
    }

    function countPellets() {
        let count = 0;
        if (!maze) return 0;
        
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === PELLET || maze[y][x] === POWER_PELLET) {
                    count++;
                }
            }
        }
        return count;
    }

    // Pause functionality
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
    });

    function togglePause() {
        if (gameState === GAME_STATE.PLAYING) {
            gameState = GAME_STATE.PAUSED;
            drawPauseScreen();
       } else if (gameState === GAME_STATE.PAUSED) {
            gameState = GAME_STATE.PLAYING;
            lastFrameTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    // Pause screen display
    function drawPauseScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    // Function to check if a position is valid (not a wall)
    function isValidPosition(x, y) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);
        return gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS && maze[gridY][gridX] !== 1;
    }

    // Function to move pacman
    function movePacman() {
        let newX = pacman.x;
        let newY = pacman.y;

        // Try to change direction if requested
        if (pacman.nextDirection !== pacman.direction) {
            if (pacman.nextDirection === 'up') newY -= pacman.speed;
            if (pacman.nextDirection === 'down') newY += pacman.speed;
            if (pacman.nextDirection === 'left') newX -= pacman.speed;
            if (pacman.nextDirection === 'right') newX += pacman.speed;

            if (isValidPosition(newX, newY)) {
                pacman.direction = pacman.nextDirection;
            } else {
                newX = pacman.x;
                newY = pacman.y;
            }
        }

        // Move in the current direction
        if (pacman.direction === 'up') newY -= pacman.speed;
        if (pacman.direction === 'down') newY += pacman.speed;
        if (pacman.direction === 'left') newX -= pacman.speed;
        if (pacman.direction === 'right') newX += pacman.speed;

        // Update position if valid
        if (isValidPosition(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;
        }

        // Check for pellets
        const gridX = Math.floor(pacman.x / CELL_SIZE);
        const gridY = Math.floor(pacman.y / CELL_SIZE);
        if (maze[gridY][gridX] === 2) {
            maze[gridY][gridX] = 0;
            score += 10;
            scoreElement.textContent = score;
        }

        // Animate mouth
        pacman.mouthOpen = !pacman.mouthOpen;
    }

    // Function to update pacman position
    function updatePacman(deltaTime) {
        // Update mouth animation
        pacman.currentMouthAngle += pacman.mouthSpeed * deltaTime;
        if (pacman.currentMouthAngle >= 0.5 || pacman.currentMouthAngle <= 0) {
            pacman.mouthSpeed *= -1;
        }

        // Calculate new position
        const speed = pacman.speed * (deltaTime / 16); // Normalize speed for 60fps
        let newX = pacman.x;
        let newY = pacman.y;

        // Move based on current direction
        if (pacman.direction === 'right') newX += speed;
        if (pacman.direction === 'left') newX -= speed;
        if (pacman.direction === 'up') newY -= speed;
        if (pacman.direction === 'down') newY += speed;

        // Handle tunnel wrapping
        if (newX < -CELL_SIZE) newX = canvas.width;
        if (newX > canvas.width) newX = -CELL_SIZE;

        // Check wall collision and update position
        if (!checkWallCollision(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;
        }

        // Check and collect pellets
        collectPellets();
    }

    // Function to move ghost
    function moveGhost() {
        // Simple random movement
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        let newX = ghost.x;
        let newY = ghost.y;
        
        if (direction === 'up') newY -= ghost.speed;
        if (direction === 'down') newY += ghost.speed;
        if (direction === 'left') newX -= ghost.speed;
        if (direction === 'right') newX += ghost.speed;
        
        if (isValidPosition(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }
        
        // Check collision with pacman
        checkGhostCollision();
    }

    function updateGhost(deltaTime) {
        const speed = ghost.speed * (deltaTime / 16);
        
        // Update ghost mode
        ghost.modeTimer += deltaTime;
        if (ghost.modeTimer >= ghost.modeDuration[ghost.mode]) {
            ghost.mode = ghost.mode === 'chase' ? 'scatter' : 'chase';
            ghost.modeTimer = 0;
        }

        // Update target based on mode
        if (ghost.mode === 'chase') {
            ghost.targetTile = {
                x: Math.floor(pacman.x / CELL_SIZE),
                y: Math.floor(pacman.y / CELL_SIZE)
            };
        } else {
            ghost.targetTile = ghost.scatterTarget;
        }

        // Calculate next move using A* pathfinding
        const nextMove = calculateNextMove(ghost, ghost.targetTile);
        if (nextMove) {
            ghost.x += nextMove.x * speed;
            ghost.y += nextMove.y * speed;
        }

        // Check collision with Pacman
        checkGhostCollision();
    }

    // Check for wall collision
    function checkWallCollision(x, y) {
        const gridX = Math.floor((x + CELL_SIZE / 2) / CELL_SIZE);
        const gridY = Math.floor((y + CELL_SIZE / 2) / CELL_SIZE);
        return maze[gridY]?.[gridX] === WALL;
    }

    // Check for collision with Pacman
    function checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy) < CELL_SIZE;
    }

    // Function to check if a ghost collides with pacman
    function checkGhostCollision() {
        if (checkCollision(ghost, pacman)) {
            handleGhostCollision();
        }
    }

    // Function for ghost to avoid pacman
    function calculateNextMove(ghost, target) {
        const currentTile = {
            x: Math.floor(ghost.x / CELL_SIZE),
            y: Math.floor(ghost.y / CELL_SIZE)
        };
        
        // Avoid reversing direction unless necessary
        const possibleMoves = [
            {x: 1, y: 0}, {x: -1, y: 0},
            {x: 0, y: 1}, {x: 0, y: -1}
        ].filter(move => {
            const newX = currentTile.x + move.x;
            const newY = currentTile.y + move.y;
            return maze[newY]?.[newX] !== WALL;
        });

        if (ghost.frightened) {
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        return possibleMoves.reduce((best, move) => {
            const newX = currentTile.x + move.x;
            const newY = currentTile.y + move.y;
            const distance = Math.abs(newX - target.x) + Math.abs(newY - target.y);
            return !best || distance < best.distance ? { move, distance } : best;
        }, null)?.move;
    }

    // Function to check for pellet collisions
    function collectPellets() {
        const gridX = Math.floor((pacman.x + CELL_SIZE / 2) / CELL_SIZE);
        const gridY = Math.floor((pacman.y + CELL_SIZE / 2) / CELL_SIZE);
        
        if (maze[gridY][gridX] === PELLET) {
            maze[gridY][gridX] = PATH;
            score += 10;
            pelletCount--;
            scoreElement.textContent = score;
        } else if (maze[gridY][gridX] === POWER_PELLET) {
            maze[gridY][gridX] = PATH;
            score += 50;
            pelletCount--;
            scoreElement.textContent = score;
            activatePowerMode();
        }
    }

    // Activate power mode by making ghosts vulnerable
    function activatePowerMode() {
        ghost.frightened = true;
        ghost.color = 'blue';
        // Revert color after 8 seconds
        setTimeout(() => {
            ghost.frightened = false;
            ghost.color = 'red';
        }, 8000);
    }

    // Initialize pellet count
    pelletCount = (() => {
        let count = 0;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === PELLET || maze[y][x] === POWER_PELLET) {
                    count++;
                }
            }
        }
        return count;
    })();

    // Optimize game loop
    function gameLoop(timestamp) {
        if (!lastFrameTime) {
            lastFrameTime = timestamp;
            animationFrameId = requestAnimationFrame(gameLoop);
            return;
        }

        const deltaTime = timestamp - lastFrameTime;
        if (deltaTime < 16) { // Cap at ~60 FPS
            animationFrameId = requestAnimationFrame(gameLoop);
            return;
        }

        lastFrameTime = timestamp;

        updateGame(deltaTime);
        drawGame();

        if (pelletCount <= 0) {
            gameState = GAME_STATE.GAME_OVER;
            showGameOverScreen('You Win!');
            return;
        }
    }

    // Update the game state
    function updateGame(deltaTime) {
        updatePacman(deltaTime);
        moveGhost(deltaTime);
        
        if (checkCollision(pacman, ghost)) {
            handleGhostCollision();
        }
    }

    // Draw pacman
    function drawPacman() {
        ctx.fillStyle = pacman.color;
        ctx.beginPath();
        
        const mouthAngle = pacman.mouthOpen ? pacman.mouthAngle : 0;
        let startAngle = 0;
        let endAngle = Math.PI * 2;
        
        if (pacman.direction === 'right') {
            startAngle = mouthAngle;
            endAngle = Math.PI * 2 - mouthAngle;
        } else if (pacman.direction === 'left') {
            startAngle = Math.PI + mouthAngle;
            endAngle = Math.PI - mouthAngle;
        } else if (pacman.direction === 'up') {
            startAngle = Math.PI * 1.5 + mouthAngle;
            endAngle = Math.PI * 1.5 - mouthAngle;
        } else if (pacman.direction === 'down') {
            startAngle = Math.PI * 0.5 + mouthAngle;
            endAngle = Math.PI * 0.5 - mouthAngle;
        }
        
        ctx.arc(pacman.x + pacman.size / 2, pacman.y + pacman.size / 2, pacman.size / 2, startAngle, endAngle);
        ctx.lineTo(pacman.x + pacman.size / 2, pacman.y + pacman.size / 2);
        ctx.fill();
    }

    // Draw ghost
    function drawGhost() {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size / 2, ghost.y + ghost.size / 2, ghost.size / 2, Math.PI, 0);
        ctx.lineTo(ghost.x + ghost.size, ghost.y + ghost.size);
        ctx.lineTo(ghost.x + ghost.size * 0.75, ghost.y + ghost.size * 0.75);
        ctx.lineTo(ghost.x + ghost.size * 0.5, ghost.y + ghost.size);
        ctx.lineTo(ghost.x + ghost.size * 0.25, ghost.y + ghost.size * 0.75);
        ctx.lineTo(ghost.x, ghost.y + ghost.size);
        ctx.lineTo(ghost.x, ghost.y + ghost.size / 2);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size / 3, ghost.y + ghost.size / 3, ghost.size / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size * 2/3, ghost.y + ghost.size / 3, ghost.size / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size / 3, ghost.y + ghost.size / 3, ghost.size / 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size * 2/3, ghost.y + ghost.size / 3, ghost.size / 12, 0, Math.PI * 2);
        ctx.fill();
    }

    // Function to handle collision with ghosts
    function handleGhostCollision() {
        if (ghost.frightened) {
            score += 200;
            scoreElement.textContent = score;
            ghost.x = 14 * CELL_SIZE;
            ghost.y = 11 * CELL_SIZE;
            ghost.frightened = false;
        } else {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                gameState = GAME_STATE.GAME_OVER;
                showGameOverScreen('Game Over');
            } else {
                resetPositions();
            }
        }
    }

    // Function to reset positions
    function resetPositions() {
        pacman.x = 14 * CELL_SIZE;
        pacman.y = 23 * CELL_SIZE;
        pacman.direction = 'right';
        pacman.nextDirection = 'right';
        
        ghost.x = 14 * CELL_SIZE;
        ghost.y = 11 * CELL_SIZE;
    }

    // Function to show game over screen
    function showGameOverScreen(message) {
        menu.style.display = 'block';
        startButton.textContent = 'Play Again';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }

    // Function to reset the game
    function resetGame() {
        score = 0;
        lives = 3;
        gameState = GAME_STATE.PLAYING;
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        resetPositions();
        countPellets();
    }

    // Function to start the game
    function startGame() {
        gameState = GAME_STATE.PLAYING;
        menu.style.display = 'none';
        lastFrameTime = performance.now();
        gameLoop(lastFrameTime);
    }

    // Optimize game loop
    function gameLoop(timestamp) {
        if (!lastFrameTime) {
            lastFrameTime = timestamp;
            animationFrameId = requestAnimationFrame(gameLoop);
            return;
        }

        const deltaTime = timestamp - lastFrameTime;
        if (deltaTime < 16) { // Cap at ~60 FPS
            animationFrameId = requestAnimationFrame(gameLoop);
            return;
        }

        lastFrameTime = timestamp;

        updateGame(deltaTime);
        drawGame();

        if (pelletCount <= 0) {
            gameState = GAME_STATE.GAME_OVER;
            showGameOverScreen('You Win!');
            return;
        }
    }

    // Draw game
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw maze and update score
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const tile = maze[y][x];
                if (tile === WALL) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
        drawPacman();
        drawGhost();
        // Draw score
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${score}`, 20, 30);
        ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);
    }

    // Function initialization
    startButton.addEventListener('click', startGame);
    gameLoop();

});
