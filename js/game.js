const gamePopup = document.getElementById('game-popup');
const start = document.getElementById('start');
const rules = document.getElementById('rules');
const credits = document.getElementById('credits');
const playerSelect = document.getElementById('player-select');

const nextLevel = document.getElementById('next-level');
const nextLevelCounter = document.getElementById('next-level-counter');
const gameOver = document.getElementById('game-over');
const gameEnd = document.getElementById('game-end');
const paused = document.getElementById('paused');

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Images
const background = new Image();
background.src = "img/background.png";

const earth = new Image();
earth.src = "img/earth.png";

const mars = new Image();
mars.src = "img/mars.png";

// Audio
const audioBackground = new Audio('mp3/background.mp3'); // https://freesound.org/people/LittleRobotSoundFactory/sounds/323956/
const audioRight = new Audio('mp3/right.mp3'); // https://freesound.org/people/kafokafo/sounds/128349/
const audioWrong = new Audio('mp3/wrong.mp3'); // https://freesound.org/people/TheBuilder15/sounds/415764/
audioBackground.loop = true;

// Functions -----------------------------------------------------------------------------------------------------------

function random(min, max, dec = 0) {
    const power = Math.pow(10, dec);
    return Math.floor((Math.random() * (max - min) + min) * power) / power;
}

/**
 * Time manager of the game
 */
function timeManager() {
    //console.log('This is the timer: ', this.paused);

    if (game.status === game.PLAYING || game.status === game.NEXTLEVEL) {
        game.time--;

        if (game.time === 0) {
            if (game.level >= game.maxLevels) {
                game.navigate(game.GAMEEND);
            } else {
                game.navigate(game.NEXTLEVEL);
            }
        }

        if (game.status === game.NEXTLEVEL) {
            nextLevelCounter.innerHTML = (5 + game.time);

            if (game.time <= -5) {
                game.navigate(game.PLAYING);
            }
        }
    }

}

function Game() {

    // constants
    this.PLAYAGAIN  = -6;
    this.TRYAGAIN   = -5;
    this.GAMEEND    = -4; // no rocks - when the player finishes the game alive
    this.GAMEOVER   = -3; // no rocks - when the player exceeds the misses
    this.NEXTLEVEL  = -2; // no rocks
    this.PAUSED     = -1; // no rocks
    this.PLAYING    =  0;
    this.GAMESTART  =  1;
    this.PLAYERNAME =  2; // form
    this.RULES      =  3;
    this.CREDITS    =  4;

    this.status = this.GAMESTART;

    this.player = {
        name: null,
        age: null,
        playMusic: false,
        playFX: true,
        history: []
    };

    this.maxLevels = 3;

    this.time = 0;
    this.timer = null;

    this.score = 0;  // Score of all levels combined
    this.stats = []; // hits and miss for each level, also controls the chain of levels

    this.maxPuzzles = 9; // number of rocks bouncing on the screen
    this.puzzle = null; // index of the right answer
    this.puzzles = [];  // all possible answers

    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    this.cursor = new Cursor(); // load the game cursor if supported
    this.toleance = 5;
}

/**
 * Reset the game
 */
Game.prototype.reset = function() {
    this.puzzles.length = 0; // clear the array of puzzles
    this.time = 0;
    this.timer = null;
};

/**
 * Game navigation system
 * @param status pages to display [0-4]
 */
Game.prototype.navigate = function (status) {

    let loadLevel = true;
    if (this.status === this.PAUSED) loadLevel = false;

    if (status === this.PLAYAGAIN) {
        this.status = this.PLAYING;
        this.reset();
        this.level = 1;
    } else if (status === this.TRYAGAIN) {
        this.status = this.PLAYING;
        this.reset();
    } else {
        this.status = status;
    }

    if (this.status === this.GAMEEND) {
        console.log('GAME END');

        clearInterval(this.timer);

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        gamePopup.style.zIndex = '0';
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.remove('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else if (this.status === this.GAMEOVER) {
        console.log('GAME OVER');

        clearInterval(this.timer);

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        gamePopup.style.zIndex = '0';
        nextLevel.classList.add('d-none');
        gameOver.classList.remove('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else if (this.status === this.NEXTLEVEL) {
        console.log('NEXT LEVEL');

        this.level++;

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        gamePopup.style.zIndex = '0';
        nextLevel.classList.remove('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else if (this.status === this.PAUSED) {
        console.log('PAUSED');

        btPause.classList.add("fa-play");
        btPause.classList.remove("fa-pause");

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        gamePopup.style.zIndex = '0';
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.remove('d-none');

        btPause.classList.remove('d-none');
        btSave.classList.remove('d-none');

    } else if (this.status === this.PLAYING) {
        console.log('PLAYING');

        if (loadLevel) clearInterval(this.timer);

        gamePopup.classList.add('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        gamePopup.style.zIndex = '-1';
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add("fa-pause");
        btPause.classList.remove("fa-play", "d-none");
        btSave.classList.remove('d-none');

        if (loadLevel) this.loadLevel(this.level);

    } else if (this.status === this.GAMESTART) {
        console.log('GAME START');

        gamePopup.classList.remove('d-none');
        start.classList.remove('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else if (this.status === this.PLAYERNAME) {
        console.log('PLAYER NAME');

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.remove('d-none');
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else if (this.status === this.RULES) {
        console.log('RULES');

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.remove('d-none');
        credits.classList.add('d-none');
        playerSelect.classList.add('d-none');
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else if (this.status === this.CREDITS) {
        console.log('go to credits');

        gamePopup.classList.remove('d-none');
        start.classList.add('d-none');
        rules.classList.add('d-none');
        credits.classList.remove('d-none');
        playerSelect.classList.add('d-none');
        nextLevel.classList.add('d-none');
        gameOver.classList.add('d-none');
        gameEnd.classList.add('d-none');
        paused.classList.add('d-none');

        btPause.classList.add('d-none');
        btSave.classList.add('d-none');

    } else {
        console.error('STATUS NOT FOUND');
    }

};

/**
 * Draw the whole game into the canvas
 */
Game.prototype.draw = function() {
    // reset the background to not show the track of the rocks
    ctx.drawImage(background,0,0, this.width, this.height);
    ctx.drawImage(earth,canvas.width/1.6,canvas.height/10, 100, 100);
    ctx.drawImage(mars,canvas.width/6,canvas.height/2, 50, 50);

    if (this.status >= this.PLAYING) {
        for (const puzzle of this.puzzles) {
            puzzle.rock.draw();
            puzzle.rock.update(this.width, this.height);
        }
    }

    if (this.status === this.PLAYING) {
        this.drawStats();
        this.cursor.draw();
    }

    //requestAnimationFrame(this.draw.bind(this));
    requestAnimationFrame( function () {
        game.draw();
    });
};

/**
 * Drawn the stats of the game into the canvas
 */
Game.prototype.drawStats = function() {
    ctx.fillStyle = 'white';
    ctx.font = "bold 30px arial";

    if (this.puzzle >= 0 && this.puzzles && this.puzzles.length) {
        const pz = this.puzzles[this.puzzle];
        ctx.fillText(`${pz.a} ${pz.sign} ${pz.b} = ?`, 10, 35+40);
    } else {
        console.error('Puzzle or Puzzles are missing');
    }

    ctx.font = "1rem monospace";
    ctx.fillText(`Player: ${this.player.name}`, 10, 60+40);
    ctx.fillText(`Score : ${this.score}`, 10, 80+40);

    if (this.level && this.stats && this.stats.length) {
        ctx.fillText(`Hits  : ${this.stats[this.level-1].hits}`, 10, 100+40);
        ctx.fillText(`Miss  : ${this.stats[this.level-1].miss}`, 10, 120+40);
    } else {
        console.error('Level or Stats are missing');
    }

    ctx.fillText(`Time  : ${ (this.time > 0 ? this.time : 0) }`, 10, 140+40);
};

/**
 * Draw paused on user request
 */
/*Game.prototype.drawPaused = function() {
    ctx.fillStyle = 'white';
    ctx.font = "5rem monospace";
    ctx.fillText('Paused', (this.width/2) - 145, this.height/2);
};*/

/**
 * Draw the transitions between levels and game over
 */
/*Game.prototype.drawTrans = function() {

    ctx.fillStyle = 'white';
    ctx.font = "3rem monospace";

    if (this.gameover) {
        ctx.fillText('GAME OVER', (this.width/2)-130, this.height/2);

        if (this.time < -1) {
            ctx.font = "2rem monospace";
            ctx.fillText('click to retry', (this.width/2)-135, (this.height/2) + 40);
        }

    } else {
        this.navigate(5);
        nextLevelCounter.innerHTML = (5 + this.time);

        /!*if (this.time === 0) {
            ctx.fillText('TIMES UP!', (this.width/2)-130, this.height/2);
        } else if (this.time === -1) {
            ctx.fillText('GET READY', (this.width/2)-130, this.height/2);
        } else {
            ctx.fillText(`${5 + this.time}`, (this.width/2)-15, this.height/2);
        }*!/
    }

};*/

/**
 * Load the level of the game
 * @param level number of the level 1 to 3
 */
Game.prototype.loadLevel = function (level) {

    clearInterval(this.timer);
    this.reset();
    this.level = level;

    if (this.level === 1) {
        this.score = 0;
        this.stats.length = 0;
    }

    this.stats[this.level-1] = {hits: 0, miss: 0};

    for (let i = 0; i < this.maxPuzzles; i++) {
        this.addPuzzle();
    }

    if (this.status === this.PLAYING) {
        this.time = 10; //60 + (30 * this.level);
        this.timer = setInterval(timeManager, 1000);
    }

};

/**
 * Add a new puzzle to the array and set the new right answer
 */
Game.prototype.addPuzzle = function() {

    let pz;
    let isUnique;

    do {
        isUnique = true;

        if (this.level === 1) {
            pz = new Puzzle(this.level, 1, 25, 1, 9);
        } else if (this.level === 2) {
            pz = new Puzzle(this.level, 1, 25, 1, 9);
        } else if (this.level === 3) {
            pz = new Puzzle(this.level, 1, 25, 2, 9);
        }

        for (const p of this.puzzles) {
            if (p.r === pz.r) {
                isUnique = false;
                break;
            }
        }

    } while (!isUnique); // FIXME: implement break of max try (infinite loop for finite puzzles)

    this.puzzles.push(pz);
    this.puzzle = random(0, this.puzzles.length - 1); // set the new right answer

};

/**
 * Evaluate the user answer
 * @param rocks the rocks could be overlapping each other while the user click
 * it is better for the game play to evaluate all
 */
Game.prototype.evaluate = function(rocks) {

    if (rocks && rocks.length) {
        let wrong = true;

        for (const rock of rocks) {
            if (rock.result === this.puzzles[this.puzzle].r) {
                if (this.player.playFX) audioRight.play().then(function (r) {});
                this.stats[this.level-1].hits++;
                this.score++;
                this.puzzles.splice(this.puzzle, 1); // remove from the array
                this.addPuzzle();
                wrong = false;
                break;
            }
        }

        if (wrong) {
            if (this.player.playFX) audioWrong.play().then(function (r) {});
            this.score -= (this.score - 1 < 0 ? 0 : 1);
            this.stats[this.level-1].miss++;

            if (this.stats[this.level-1].miss >= 6) {
                this.navigate(this.GAMEOVER);
                //this.gameover = true;
                //this.time = 0; // game over
            } else {
                // change the direction and spinning of the rock affected by the click
                const decision = random(0, 2);

                rocks[0].velR = -(rocks[0].velR);

                if (decision === 0) {
                    rocks[0].velX = -(rocks[0].velX);
                } else if (decision === 1) {
                    rocks[0].velY = -(rocks[0].velY);
                } else {
                    rocks[0].velX = -(rocks[0].velX);
                    rocks[0].velY = -(rocks[0].velY);
                }

                rocks[0].loadVel(); // change velocity for the ones with zero
            }

        }
    }

};

/**
 * This function generates a new puzzle
 * @param level used to pick the math operation for the equation A and B
 * @param aMin lowest number that A can be
 * @param aMax highest number that A can be
 * @param bMin lowest number that B can be
 * @param bMax highest number that B can be
 * @constructor
 */
function Puzzle(level, aMin, aMax, bMin, bMax) {
    this.level = level;
    this.a = random(aMin, aMax);
    this.b = random(bMin, bMax);

    if (this.a < this.b) {
        const aTemp = this.a;
        this.a = this.b;
        this.b = aTemp;
    }

    switch(this.level) {
        case 1:
            this.r = this.a + this.b;
            this.sign = '+';
            break;
        case 2:
            this.r = this.a - this.b;
            this.sign = '-';
            break;
        case 3:
            this.a -= this.a % this.b;
            this.r = this.a / this.b;
            this.sign = '/';
            break;
        default:
            this.r = 0;
    }

    this.rock = new Rock(this.r);
}

/**
 * Game cursor
 * @constructor
 */
function Cursor() {
    this.x = 0;
    this.y = 0;
    this.size = 5;
    this.support = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Draw cursor into the game area if supported
 */
Cursor.prototype.draw = function() {

    if (this.support) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = "30px monospace";

        const pz = game.puzzles[game.puzzle];
        ctx.fillText(`${pz.a} ${pz.sign} ${pz.b} = ?`, this.x+10, this.y+30);
    }
};

function Rock(result) {

    const rockMinSize = 30;
    const rockMaxSize = 40;

    this.result = result;

    this.r = 0;
    this.x = random(0, game.width);
    this.y = random(0, game.height);
    this.size = random(rockMinSize, rockMaxSize);
    this.image = new Image(this.size, this.size);
    this.image.src = `img/rock${random(2, 5)}.png`;

    this.loadVel();
    this.bound();
}

Rock.prototype.bound = function(flip = false) {

    if (flip) {
        // noinspection JSSuspiciousNameCombination
        const x = this.x;
        // noinspection JSSuspiciousNameCombination
        this.x = this.y;
        // noinspection JSSuspiciousNameCombination
        this.y = x;
    }

    // keeping the full rock inside the canvas
    this.x += (this.x <= this.size ? this.size : 0);
    this.y += (this.y <= this.size ? this.size : 0);
    this.x -= (this.x + this.size >= game.width ? this.size : 0);
    this.y -= (this.y + this.size >= game.height ? this.size : 0);
};

/**
 * Load the velocities of X, Y and Rotation
 */
Rock.prototype.loadVel = function() {
    if (!this.velX || this.velX === 0) {
        this.velX = random(-2, 2,1);
        this.velX += this.velFix(this.velX);
    }

    if (!this.velY || this.velY === 0) {
        this.velY = random(-2, 2,1);
        this.velY += this.velFix(this.velY);
    }

    if (!this.velR || this.velR === 0) {
        this.velR = random(-5, 5);
        this.velR += this.velFix(this.velR);
    }
};

/**
 * Adjusts the velocity to ensure movement into the object
 * @param vel value of the velocity to fix
 * @returns {number} velocity fixed
 */
Rock.prototype.velFix = function(vel) {
    return (Math.abs(vel) < 0.5 ? 0.5 * Math.sign(vel) : 0);
};

/**
 * Update the position of the rock using its velocities and reversing on boundaries collision
 * @param w width of the game area
 * @param h height of the game area
 */
Rock.prototype.update = function(w, h) {
    if ((this.x + this.size) >= w) {
        this.velX = -(this.velX);
    }

    if ((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
    }

    if ((this.y + this.size) >= h) {
        this.velY = -(this.velY);
    }

    if ((this.y - this.size) <= 0) {
        this.velY = -(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
    this.r += this.velR;

    if (this.r < 0) {
        this.r = 360;
    } else if (this.r > 360) {
        this.r = 0;
    }
};

/**
 * Draw the rock into the canvas
 */
Rock.prototype.draw = function() {

    // create a new canvas to rotate the image before placing it on the game stream
    const canvasAux = document.createElement('canvas');
    canvasAux.width = this.size*2;
    canvasAux.height = this.size*2;
    const ctxAux = canvasAux.getContext('2d');

    ctxAux.translate(this.size,this.size); // move to the center of the canvas
    ctxAux.rotate(this.r * Math.PI / 180); // rotate the canvas to the specified degrees
    ctxAux.drawImage(this.image,-this.size,-this.size, this.size*2, this.size*2); // draw the image

    ctx.beginPath();
    ctx.drawImage(canvasAux, this.x - this.size,this.y - this.size, this.size*2, this.size*2);
    ctx.fillStyle = 'white';
    ctx.font = "bold 30px monospace";
    const x = this.x - (this.size/4) - (this.result > 9 ? 10 : 0);
    const y = this.y + (this.size/4);
    ctx.fillText(this.result, x, y);

};

// Main ----------------------------------------------------------------------------------------------------------------
const game = new Game();
game.loadLevel(1);
game.draw();

// Events --------------------------------------------------------------------------------------------------------------

canvas.addEventListener('click', click);
function click() {

    if (game.status === game.PLAYING) {
        const hits = [];

        for (const puzzle of game.puzzles) {

            const dX = Math.abs((puzzle.rock.x - game.cursor.x));
            const dY = Math.abs((puzzle.rock.y - game.cursor.y));
            const dL = (puzzle.rock.size + game.toleance);

            if (dX <= dL && dY <= dL) {
                hits.push(puzzle.rock); // save all possible answers
            }
        }

        game.evaluate(hits); // evaluate all possible answers
    }

}

canvas.addEventListener("mousemove", updateCursor);
function updateCursor(e) {
    //console.log(e);
    const rect = canvas.getBoundingClientRect();

    const scaleX = (game.width / rect.width);
    const scaleY = (game.height / rect.height);

    game.cursor.x = e.clientX * scaleX;
    game.cursor.y = e.clientY * scaleY;
}

// Save controller
const btSave = document.getElementById('btSave');

// Pause controller
const btPause = document.getElementById('btPause');
btPause.addEventListener('click', togglePause);
function togglePause() {

    if (game.status === game.PLAYING) {
        game.navigate(game.PAUSED);
    } else {
        game.navigate(game.PLAYING);
    }

}

// Sound effects controller

const btAudioFX = document.getElementById('btAudioFX');
btAudioFX.addEventListener('click', toggleFX);
function toggleFX() {

    game.player.playFX = !game.player.playFX;

    if (game.player.playFX) {
        btAudioFX.classList.add("fa-volume-up");
        btAudioFX.classList.remove("fa-volume-mute");
    } else {
        btAudioFX.classList.add("fa-volume-mute");
        btAudioFX.classList.remove("fa-volume-up");
    }
}

// Music controller

const btAudioMusicMuter = document.getElementById('btAudioMusicMuter');
const btAudioMusic = document.getElementById('btAudioMusic');
btAudioMusic.addEventListener('click', toggleMusic);
function toggleMusic() {

    game.player.playMusic = !game.player.playMusic;

    if (game.player.playMusic) {
        btAudioMusicMuter.style.display="none";
        audioBackground.play().then(function (r) {});
    } else {
        btAudioMusicMuter.style.display="unset";
        audioBackground.pause();
    }
}

// Resize or flip

//window.addEventListener('onorientationchange', onResizeOrOnOrientationChange, false);
window.addEventListener('resize', onResizeOrOnOrientationChange, false);
function onResizeOrOnOrientationChange() {

    const oldW = game.width;
    const oldH = game.height;

    game.width = canvas.width = window.innerWidth;
    game.height = canvas.height = window.innerHeight;

    for (const puzzle of game.puzzles) {
        puzzle.rock.bound( (oldW === game.height && oldH === game.width) );
        puzzle.rock.update();
    }
}
