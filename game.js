document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');

    // Game constants
    const CELL_SIZE = 16;
    const ROWS = 31;
    const COLS = 28;

    // Game variables
    let score = 0;
    let lives = 3;
    let pacman = {
        x: 14 * CELL_SIZE,
        y: 23 * CELL_SIZE,
        size: CELL_SIZE,
        speed: 2,
        direction: 'right',
        nextDirection: 'right',
        color: 'yellow',
        mouthOpen: true,
        mouthAngle: 0.2
    };

    // Simple ghost
    let ghost = {
        x: 14 * CELL_SIZE,
        y: 11 * CELL_SIZE,
        size: CELL_SIZE,
        speed: 1,
        color: 'red'
    };

    // Simple maze layout (1 for walls, 0 for paths, 2 for pellets)
    let maze = Array(ROWS).fill().map(() => Array(COLS).fill(2));
    // Adding some walls for demonstration
    for (let i = 0; i < ROWS; i++) {
        maze[i][0] = 1;
        maze[i][COLS - 1] = 1;
    }
    for (let j = 0; j < COLS; j++) {
        maze[0][j] = 1;
        maze[ROWS - 1][j] = 1;
    }
    // Clear pacman's starting position
    maze[23][14] = 0;

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
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        
        // Reset maze
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (x > 0 && x < COLS-1 && y > 0 && y < ROWS-1) {
                    maze[y][x] = 2;
                }
            }
        }
        maze[23][14] = 0;
        
        resetPositions();
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

    // Game loop
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawMaze();
        drawPacman();
        drawGhost();
        
        movePacman();
        moveGhost();
        
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    gameLoop();
});
