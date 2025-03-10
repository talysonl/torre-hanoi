document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const initialScreen = document.getElementById('initial-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const startGameButton = document.getElementById('start-game');
    const resetGameButton = document.getElementById('reset-game');
    const playAgainButton = document.getElementById('play-again');
    const backToMenuButton = document.getElementById('back-to-menu');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const scoreElement = document.getElementById('score');
    const resultDifficultyElement = document.getElementById('result-difficulty');
    const resultTimeElement = document.getElementById('result-time');
    const resultMovesElement = document.getElementById('result-moves');
    const resultScoreElement = document.getElementById('result-score');
    const towers = document.querySelectorAll('.tower');
    
    // Game state variables
    let discsCount = 3; // Default difficulty
    let selectedDisc = null;
    let selectedTower = null;
    let moves = 0;
    let score = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;
    let difficultyText = "Fácil";
    
    // Initialize the game
    function init() {
        // Add event listeners for difficulty buttons
        difficultyButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Set discs count based on selected difficulty
                discsCount = parseInt(this.getAttribute('data-discs'));
                
                // Set difficulty text
                switch(discsCount) {
                    case 3:
                        difficultyText = "Fácil";
                        break;
                    case 4:
                        difficultyText = "Médio";
                        break;
                    case 5:
                        difficultyText = "Difícil";
                        break;
                }
            });
        });
        
        // Add event listener for start game button
        startGameButton.addEventListener('click', function() {
            // Hide initial screen and show game screen
            initialScreen.classList.remove('active');
            gameScreen.classList.add('active');
            
            // Setup the game
            setupGame();
        });
        
        // Add event listener for reset game button
        resetGameButton.addEventListener('click', function() {
            resetGame();
            setupGame();
        });
        
        // Add event listeners for result screen buttons
        playAgainButton.addEventListener('click', function() {
            // Hide results screen and show game screen
            resultsScreen.classList.remove('active');
            gameScreen.classList.add('active');
            
            // Reset and setup the game
            resetGame();
            setupGame();
        });
        
        backToMenuButton.addEventListener('click', function() {
            // Hide results screen and show initial screen
            resultsScreen.classList.remove('active');
            initialScreen.classList.add('active');
            
            // Reset game
            resetGame();
        });
    }
    
    function setupGame() {
        // Clear all towers
        towers.forEach(tower => {
            // Remove all discs but keep the base
            const discs = tower.querySelectorAll('.disc');
            discs.forEach(disc => disc.remove());
        });
        
        // Add discs to the first tower with staggered animation
        const firstTower = document.getElementById('tower-1');
        for (let i = discsCount; i > 0; i--) {
            const disc = document.createElement('div');
            disc.classList.add('disc');
            disc.classList.add(`disc-${i}`); // Add specific class for each disc size
            disc.setAttribute('data-size', i);
            
            // Add a small delay for each disc to create a staggered animation effect
            setTimeout(() => {
                firstTower.appendChild(disc);
                // Add and then remove a class to trigger the animation
                disc.classList.add('moving');
                setTimeout(() => disc.classList.remove('moving'), 500);
            }, (discsCount - i) * 150);
        }
        
        // Reset game state
        moves = 0;
        score = 0;
        timer = 0;
        gameStarted = true;
        updateUI();
        
        // Calculate total animation time: staggered delay for all discs + animation duration
        const totalAnimationTime = (discsCount - 1) * 150 + 500;
        
        // Start timer only after all disc animations are complete
        clearInterval(timerInterval);
        setTimeout(() => {
            timerInterval = setInterval(() => {
                timer++;
                updateUI();
            }, 1000);
        }, totalAnimationTime);
        
        // Add event listeners to towers
        setupTowerEvents();
    }
    
    function setupTowerEvents() {
        towers.forEach((tower, index) => {
            tower.onclick = () => handleTowerClick(tower, index);
        });
    }
    
    function handleTowerClick(tower, towerIndex) {
        if (!gameStarted) return;
        
        // If no disc is selected, try to select one
        if (!selectedDisc) {
            // Get the top disc of the clicked tower
            const discs = tower.querySelectorAll('.disc');
            if (discs.length === 0) return; // No discs on this tower
            
            const topDisc = discs[discs.length - 1];
            topDisc.classList.add('selected');
            selectedDisc = topDisc;
            selectedTower = tower;
            
            // Add hover effect to valid target towers
            highlightValidTowers();
        } else {
            // Try to move the selected disc to the clicked tower
            const targetTower = tower;
            const discs = targetTower.querySelectorAll('.disc');
            
            // Check if move is valid
            if (discs.length === 0 || parseInt(selectedDisc.getAttribute('data-size')) < parseInt(discs[discs.length - 1].getAttribute('data-size'))) {
                // Valid move
                selectedDisc.classList.remove('selected');
                selectedTower.removeChild(selectedDisc);
                
                // Add moving animation class
                selectedDisc.classList.add('moving');
                targetTower.appendChild(selectedDisc);
                
                // Remove the moving class after animation completes
                setTimeout(() => {
                    selectedDisc.classList.remove('moving');
                }, 500);
                
                // Play move sound
                playSound('move');
                
                // Increment moves
                moves++;
                updateUI();
                
                // Check if game is won
                checkWin();
            } else {
                // Invalid move, deselect the disc and show error animation
                selectedDisc.classList.remove('selected');
                selectedDisc.classList.add('invalid-move');
                
                // Play error sound
                playSound('error');
                
                // Remove the animation class after it completes
                setTimeout(() => {
                    selectedDisc.classList.remove('invalid-move');
                }, 500);
            }
            
            // Remove highlight from towers
            removeHighlightFromTowers();
            
            selectedDisc = null;
            selectedTower = null;
        }
    }
    
    // Function to highlight valid target towers
    function highlightValidTowers() {
        if (!selectedDisc) return;
        
        const selectedSize = parseInt(selectedDisc.getAttribute('data-size'));
        
        towers.forEach(tower => {
            if (tower === selectedTower) return; // Skip the tower with the selected disc
            
            const discs = tower.querySelectorAll('.disc');
            if (discs.length === 0 || selectedSize < parseInt(discs[discs.length - 1].getAttribute('data-size'))) {
                // This is a valid target tower
                tower.classList.add('valid-target');
            }
        });
    }
    
    // Function to remove highlight from towers
    function removeHighlightFromTowers() {
        towers.forEach(tower => {
            tower.classList.remove('valid-target');
        });
    }
    
    // Simple sound system
    function playSound(type) {
        // This is a placeholder for actual sound implementation
        // In a real implementation, you would create and play audio elements
        console.log(`Playing ${type} sound`);
    }
    
    function checkWin() {
        const tower2 = document.getElementById('tower-2');
        const tower3 = document.getElementById('tower-3');
        
        if (tower2.querySelectorAll('.disc').length === discsCount || tower3.querySelectorAll('.disc').length === discsCount) {
            // Game won!
            gameStarted = false;
            clearInterval(timerInterval);
            
            // Calculate final score
            const minMoves = Math.pow(2, discsCount) - 1; // Minimum possible moves
            const timeBonus = Math.max(0, 300 - timer); // Time bonus (max 300 seconds)
            const moveEfficiency = Math.max(0, minMoves / moves); // Move efficiency (1.0 is perfect)
            
            // Score formula: base points + time bonus + move efficiency bonus
            const basePoints = discsCount * 100;
            const timeBonusPoints = timeBonus * 2;
            const moveEfficiencyPoints = moveEfficiency * 100 * discsCount;
            
            score = Math.round(basePoints + timeBonusPoints + moveEfficiencyPoints);
            
            // Update UI one last time
            updateUI();
            
            // Add victory animation to the winning tower
            const winningTower = tower2.querySelectorAll('.disc').length === discsCount ? tower2 : tower3;
            winningTower.classList.add('victory-animation');
            
            // Add victory animation to each disc with staggered delay
            const discs = winningTower.querySelectorAll('.disc');
            discs.forEach((disc, index) => {
                setTimeout(() => {
                    disc.classList.add('victory-animation');
                    // Remove the animation class after it completes
                    setTimeout(() => disc.classList.remove('victory-animation'), 1000);
                }, index * 200);
            });
            
            // Play victory sound
            playSound('victory');
            
            // Show results screen after a short delay and animations
            setTimeout(showResults, 1500);
        }
    }
    
    function showResults() {
        // Hide game screen and show results screen
        gameScreen.classList.remove('active');
        resultsScreen.classList.add('active');
        
        // Update results screen
        resultDifficultyElement.textContent = difficultyText;
        resultTimeElement.textContent = formatTime(timer);
        resultMovesElement.textContent = moves;
        resultScoreElement.textContent = score;
        
        // Add animation to result items with staggered delay
        const resultItems = document.querySelectorAll('.result-item');
        resultItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animated');
            }, index * 200);
        });
    }
    
    function updateUI() {
        // Update timer
        timerElement.textContent = formatTime(timer);
        
        // Update moves
        movesElement.textContent = moves;
        
        // Update score
        scoreElement.textContent = score;
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    function resetGame() {
        selectedDisc = null;
        selectedTower = null;
        moves = 0;
        score = 0;
        timer = 0;
        gameStarted = false;
        clearInterval(timerInterval);
        updateUI();
        
        // Remove any animations or special classes
        document.querySelectorAll('.disc').forEach(disc => {
            disc.classList.remove('selected', 'moving', 'invalid-move', 'victory-animation');
        });
        
        document.querySelectorAll('.tower').forEach(tower => {
            tower.classList.remove('valid-target', 'victory-animation');
        });
    }
    
    // Initialize the game
    init();
});