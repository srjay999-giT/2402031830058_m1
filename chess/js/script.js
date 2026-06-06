// ==========================================
// 1. AUTHENTICATION & DATA BINDING LOGIC
// ==========================================

function renderAuthUI() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    const isLoggedIn = localStorage.getItem('zenLoggedIn') === 'true';
    const savedUser = localStorage.getItem('storedUser') || 'Player';
    const userInitial = savedUser.charAt(0).toUpperCase();
    
    if (isLoggedIn) {
        authSection.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="text-end d-none d-sm-block">
                    <a href="dashboard.html" class="text-decoration-none">
                        <div class="text-light fw-bold fs-6" style="line-height: 1;">${savedUser}</div>
                        <div class="text-success small opacity-75" style="font-size: 0.7rem;">● Online</div>
                    </a>
                </div>
                <a href="dashboard.html" class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold shadow text-decoration-none" style="width: 40px; height: 40px; transition: 0.3s;">
                    ${userInitial}
                </a>
            </div>
        `;
        
        if (document.getElementById('dash-username')) {
            document.getElementById('dash-username').innerText = savedUser;
            document.getElementById('dash-avatar').innerText = userInitial;
        }
    } else {
        authSection.innerHTML = `<a href="login.html" class="btn btn-outline-light btn-sm fw-bold px-4">SIGN IN</a>`;
    }
}
renderAuthUI();

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const pass = document.getElementById('reg-pass').value;
        localStorage.setItem('storedUser', name);
        localStorage.setItem('storedPass', pass);
        localStorage.setItem('zenLoggedIn', 'true');
        window.location.href = "dashboard.html";
    });
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userInput = document.getElementById('login-user').value;
        const passInput = document.getElementById('login-pass').value;
        const savedUser = localStorage.getItem('storedUser');
        const savedPass = localStorage.getItem('storedPass');

        if (userInput === savedUser && passInput === savedPass) {
            localStorage.setItem('zenLoggedIn', 'true');
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid Username or Password.");
        }
    });
}

function handleLogout() {
    localStorage.setItem('zenLoggedIn', 'false');
    window.location.href = "index.html";
}


// ==========================================
// 2. CHESS ENGINE & MINIMAX AI
// ==========================================

if (document.getElementById('myBoard')) {
    const game = new Chess();
    let moveCounter = 1;
    let board; // Declare board globally

    // --- AI Brain ---
    const pieceValues = { 'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900 };

    function evaluateBoard() {
        let total = 0;
        game.board().forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    const val = pieceValues[piece.type];
                    total += piece.color === 'w' ? val : -val;
                }
            });
        });
        return total;
    }

    function minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0 || game.game_over()) return evaluateBoard();
        const moves = game.moves();
        
        if (isMaximizing) {
            let bestVal = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                game.move(moves[i]);
                bestVal = Math.max(bestVal, minimax(depth - 1, alpha, beta, false));
                game.undo();
                alpha = Math.max(alpha, bestVal);
                if (beta <= alpha) break;
            }
            return bestVal;
        } else {
            let bestVal = Infinity;
            for (let i = 0; i < moves.length; i++) {
                game.move(moves[i]);
                bestVal = Math.min(bestVal, minimax(depth - 1, alpha, beta, true));
                game.undo();
                beta = Math.min(beta, bestVal);
                if (beta <= alpha) break;
            }
            return bestVal;
        }
    }

    function getBestMove(depth) {
        const moves = game.moves();
        let bestMove = null;
        let bestValue = Infinity; 

        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            let boardValue = minimax(depth - 1, -Infinity, Infinity, true);
            game.undo();
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = moves[i];
            }
        }
        return bestMove || moves[Math.floor(Math.random() * moves.length)];
    }

    function makeAIMove() {
        if (game.game_over()) return;

        const speedVal = parseInt(document.getElementById('ai-speed').value);
        let chosenMove;

        // Depth routing based on dropdown selection
        if (speedVal === 500) {
            const moves = game.moves();
            chosenMove = moves[Math.floor(Math.random() * moves.length)];
        } else if (speedVal === 1500) {
            chosenMove = getBestMove(1); 
        } else {
            chosenMove = getBestMove(2); 
        }

        game.move(chosenMove);
        board.position(game.fen());
        updateMoveLog(game.history({verbose: true}).pop(), 'b');
        checkGameState(); 
    }

    // --- Game State & UI Updates ---
    function checkGameState() {
        $('.square-55d63').removeClass('in-check');

        if (game.in_check()) {
            const turn = game.turn();
            const boardData = game.board();
            const files = ['a','b','c','d','e','f','g','h'];
            
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = boardData[r][c];
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        const square = files[c] + (8 - r);
                        $('.square-' + square).addClass('in-check');
                    }
                }
            }
        }

        if (game.game_over()) {
            setTimeout(() => {
                if (game.in_checkmate()) {
                    alert(`CHECKMATE! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
                } else if (game.in_draw() || game.in_stalemate()) {
                    alert("Game Over: It's a Draw!");
                } else {
                    alert("Game Over!");
                }
            }, 300);
        }
    }

    function updateMoveLog(move, color) {
        const log = document.getElementById('move-history');
        if (color === 'w') {
            const row = document.createElement('div');
            row.id = `row-${moveCounter}`;
            row.innerHTML = `<span class="me-3">${moveCounter}.</span><span class="text-white">${move.san}</span> <span id="b-${moveCounter}">...</span>`;
            if (moveCounter === 1) log.innerHTML = '';
            log.appendChild(row);
        } else {
            document.getElementById(`b-${moveCounter}`).innerText = move.san;
            moveCounter++;
        }
        log.scrollTop = log.scrollHeight;
    }

    // --- Board Configuration ---
    const config = {
        draggable: true, position: 'start',
        pieceTheme: 'https://lichess1.org/assets/piece/cburnett/{piece}.svg',
        onDragStart: (s, p) => !game.game_over() && p.search(/^w/) !== -1,
        onDrop: (s, t) => {
            const move = game.move({ from: s, to: t, promotion: 'q' });
            if (!move) return 'snapback';
            
            updateMoveLog(move, 'w');
            checkGameState();
            
            if (!game.game_over()) {
                setTimeout(makeAIMove, 100); 
            }
        },
        onSnapEnd: () => board.position(game.fen())
    };
    
    board = Chessboard('myBoard', config); // Initialize board

    // --- Controls ---
    document.getElementById('resetBtn').onclick = () => { 
        game.reset(); 
        board.start(); 
        moveCounter = 1; 
        document.getElementById('move-history').innerHTML = 'Game starting...'; 
        $('.square-55d63').removeClass('in-check');
    };

    document.getElementById('undoBtn').onclick = () => {
        game.undo(); // Undo AI move
        game.undo(); // Undo Player move
        board.position(game.fen());
        moveCounter = Math.max(1, moveCounter - 1);
        checkGameState();
        
        // Brute force rewrite the move log for simplicity on undo
        const log = document.getElementById('move-history');
        log.innerHTML = '';
        const history = game.history({verbose: true});
        if(history.length === 0) {
            log.innerHTML = 'Game starting...';
            moveCounter = 1;
            return;
        }
        
        let tempCounter = 1;
        for(let i = 0; i < history.length; i+=2) {
            const row = document.createElement('div');
            const wMove = history[i].san;
            const bMove = history[i+1] ? history[i+1].san : '...';
            row.innerHTML = `<span class="me-3">${tempCounter}.</span><span class="text-white">${wMove}</span> <span>${bMove}</span>`;
            log.appendChild(row);
            tempCounter++;
        }
        log.scrollTop = log.scrollHeight;
    };
}

// ==========================================
// 3. VISION DRILL LOGIC
// ==========================================

if (document.getElementById('visionBoard')) {
    const vBoard = Chessboard('visionBoard', { draggable: false, position: 'empty' });
    let vScore = 0, vTime = 30, vTarget = '', vPlaying = false, vInterval;
    const squares = [];
    ['a','b','c','d','e','f','g','h'].forEach(f => ['1','2','3','4','5','6','7','8'].forEach(r => squares.push(f+r)));

    document.getElementById('startVisionBtn').onclick = () => {
        vScore = 0; vTime = 30; vPlaying = true;
        document.getElementById('startVisionBtn').disabled = true;
        nextTarget();
        vInterval = setInterval(() => {
            vTime--;
            document.getElementById('vision-timer').innerText = vTime + 's';
            if (vTime <= 0) {
                clearInterval(vInterval); vPlaying = false;
                let rank = vScore < 5 ? "NOVICE" : vScore < 10 ? "CLUB PLAYER" : vScore < 15 ? "SHARPSHOOTER" : "GRANDMASTER";
                document.getElementById('vision-target').innerHTML = `<div class="fs-5 opacity-50">FINAL: ${vScore}</div><div class="text-info">${rank}</div>`;
                document.getElementById('startVisionBtn').disabled = false;
                document.getElementById('startVisionBtn').innerText = "PLAY AGAIN";
            }
        }, 1000);
    };
    function nextTarget() {
        vTarget = squares[Math.floor(Math.random() * squares.length)];
        document.getElementById('vision-target').innerText = vTarget.toUpperCase();
        document.getElementById('vision-score').innerText = vScore;
    }
    $('#visionBoard').on('click', '.square-55d63', function() {
        if (!vPlaying) return;
        const clicked = $(this).attr('data-square');
        if (clicked === vTarget) {
            vScore++; $(this).addClass('vision-correct'); setTimeout(() => $(this).removeClass('vision-correct'), 200); nextTarget();
        } else {
            $(this).addClass('vision-wrong'); setTimeout(() => $(this).removeClass('vision-wrong'), 200);
        }
    });
}