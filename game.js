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
    
    // Game state management
    const GAME_STATE = {
        MENU: 0,
        PLAYING: 1,
        PAUSED: 2,
        GAME_OVER: 3
    };
    let gameState = GAME_STATE.MENU;
    let animationFrameId = null;
    let lastFrameTime = 0;
    let score = 0;
    let lives = 3;
    let pelletCount = 0;

    // Game variables
    let pacman = {
        x: 14 * CELL_SIZE,
        y: 23 * CELL_SIZE,
        size: CELL_SIZE,
        speed: 2,
        direction: 'right',
        nextDirection: 'right',
        color: 'yellow',
        mouthOpen: true,
        mouthAngle: 0.2,
        currentMouthAngle: 0,
        mouthSpeed: 0.02
    };

    // Simple ghost
    let ghost = {
        x: 14 * CELL_SIZE,
        y: 11 * CELL_SIZE,
        size: CELL_SIZE,
        speed: 1,
        color: 'red',
        mode: 'chase',
        modeTimer: 0,
        modeDuration: { chase: 20000, scatter: 7000 },
        scatterTarget: { x: 0, y: 0 },
        frightened: false
    };

    // Fix maze array to match standard Pac-Man layout
    const maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        // ...rest of maze layout...
    ];

    // Game controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                pacman.nextDirection = 'up';
                break;
            case 'ArrowDown':
                pacman.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                pacman.nextDirection = 'left';
                break;
            case 'ArrowRight':
                pacman.nextDirection = 'right';
                break;
            case 'p':
            case 'P':
                if (gameState === GAME_STATE.PLAYING) {
                    gameState = GAME_STATE.PAUSED;
                } else if (gameState === GAME_STATE.PAUSED) {
                    gameState = GAME_STATE.PLAYING;
                    lastFrameTime = performance.now();
                }
                break;
        }
    });

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

    // Simple function to move ghost
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
        if (Math.abs(ghost.x - pacman.x) < pacman.size && Math.abs(ghost.y - pacman.y) < pacman.size) {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                alert('Game Over!');
                resetGame();
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

    function showGameOverScreen(message) {
        menu.style.display = 'block';
        startButton.textContent = 'Play Again';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }

    // Draw the maze
    function drawMaze() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                } else if (maze[y][x] === 2) {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
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

    // Function to collect pellets
    function collectPellets() {
        const gridX = Math.floor((pacman.x + CELL_SIZE / 2) / CELL_SIZE);
        const gridY = Math.floor((pacman.y + CELL_SIZE / 2) / CELL_SIZE);
        
        if (maze[gridY][gridX] === PELLET) {
            maze[gridY][gridX] = PATH;
            score += 10;
            scoreElement.textContent = score;
            pelletCount--;
        } else if (maze[gridY][gridX] === POWER_PELLET) {
            maze[gridY][gridX] = PATH;
            score += 50;
            scoreElement.textContent = score;
            pelletCount--;
            ghost.frightened = true;
            setTimeout(() => { ghost.frightened = false; }, 8000);
        }
    }

    // Function to handle ghost collision
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

    // Update pacman and ghost
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
        if (checkGhostCollision()) {
            handleGhostCollision();
        }
    }

    function checkWallCollision(x, y) {
        const gridX = Math.floor((x + CELL_SIZE / 2) / CELL_SIZE);
        const gridY = Math.floor((y + CELL_SIZE / 2) / CELL_SIZE);
        return maze[gridY]?.[gridX] === WALL;
    }

    function checkGhostCollision() {
        const dx = ghost.x - pacman.x;
        const dy = ghost.y - pacman.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < CELL_SIZE;
    }

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

    function countPellets() {
        pelletCount = 0;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === PELLET || maze[y][x] === POWER_PELLET) {
                    pelletCount++;
                }
            }
        }
        return pelletCount;
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

        if (gameState === GAME_STATE.PLAYING) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            updatePacman(deltaTime);
            updateGhost(deltaTime);
            
            drawMaze();
            drawPacman();
            drawGhost();
            
            if (pelletCount <= 0) {
                gameState = GAME_STATE.GAME_OVER;
                showGameOverScreen('You Win!');
                return;
            }
        } else if (gameState === GAME_STATE.PAUSED) {
            drawPauseScreen();
        }

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function drawPauseScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    // Draw the maze
    function drawMaze() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                } else if (maze[y][x] === 2) {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
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

    function countPellets() {
        pelletCount = 0;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === PELLET || maze[y][x] === POWER_PELLET) {
                    pelletCount++;
                }
            }
        }
        return pelletCount;
    }

    // Start the game
    startButton.addEventListener('click', () => {
        gameState = GAME_STATE.PLAYING;
        menu.style.display = 'none';
        resetGame();
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
    });

    // Start the first loop
    gameLoop();
});
