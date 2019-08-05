const regexNumbers = /[0-9]|\./;

const btResume = document.getElementById('btResume');
const btSave = document.getElementById('btSave');
const btPause = document.getElementById('btPause');
const btAudioFX = document.getElementById('btAudioFX');
const btAudioMusicMuter = document.getElementById('btAudioMusicMuter');
const btAudioMusic = document.getElementById('btAudioMusic');

const gamePopup = document.getElementById('game-popup');
const start = document.getElementById('start');
const rules = document.getElementById('rules');
const credits = document.getElementById('credits');
const playerSelect = document.getElementById('player-select');

const inName = document.getElementById('inName');
const inAge = document.getElementById('inAge');

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
    return Math.floor((Math.random() * (max - min + 1) + min) * power) / power;
}

/**
 * Time manager of the game
 */
function timeManager() {
    //console.log('This is the timer: ', this.paused);

    if (game.status === game.PLAYING || game.status === game.NEXTLEVEL) {
        game.player.time--;

        if (game.player.time === 0) {
            if (game.level >= game.maxLevels) {
                game.navigate(game.GAMEEND);
            } else {
                game.navigate(game.NEXTLEVEL);
            }
        }

        if (game.status === game.NEXTLEVEL) {
            nextLevelCounter.innerHTML = (5 + game.player.time);

            if (game.player.time <= -5) {
                game.navigate(game.PLAYING);
            }
        }
    }

}

function isStorageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
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
        name: 'Me',
        age: null,
        playMusic: false,
        playFX: true,
        time: 0,
        score: 0,
        stats: []
    };

    this.maxLevels = 3;

    this.timer = null;

    //this.stats = []; // hits and miss for each level, also controls the chain of levels

    this.maxPuzzles = 9; // number of rocks bouncing on the screen
    this.puzzle = null; // index of the right answer
    this.puzzles = [];  // all possible answers

    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    this.cursor = new Cursor(); // load the game cursor if supported
    this.toleance = 5;
}

Game.prototype.killTimer = function() {
    clearInterval(this.timer); // remove timer
    this.timer = null;
};

/**
 * Reset the game
 */
Game.prototype.reset = function(resume = false) {

    this.killTimer();
    this.puzzles.length = 0; // clear the array of puzzles
    if (!resume) this.player.time = 0;

};

/**
 * Game navigation system
 * @param status pages to display [0-4]
 * @param resume
 */
Game.prototype.navigate = function (status, resume = false) {

    if (this.status === this.PLAYERNAME) {
        if (inName.value) {
            this.player.name = inName.value;
        }

        if (inAge.value) {
            this.player.age = parseInt(inAge.value);
        }
    }

    if (status === this.PLAYAGAIN || status === this.TRYAGAIN) {
        this.status = this.PLAYING;
        this.reset();
        if (status === this.PLAYAGAIN) this.level = 1;
    } else {
        this.status = status;
    }

    if (this.status !== this.PLAYING) {
        if (this.status !== this.NEXTLEVEL) this.killTimer();
        gamePopup.classList.remove('d-none');
        gamePopup.style.zIndex = '0';
    }

    start.classList.add('d-none');
    rules.classList.add('d-none');
    credits.classList.add('d-none');
    playerSelect.classList.add('d-none');
    nextLevel.classList.add('d-none');
    gameOver.classList.add('d-none');
    gameEnd.classList.add('d-none');
    paused.classList.add('d-none');
    btPause.classList.add('d-none');
    btSave.classList.add('d-none');
    btResume.classList.add('d-none');

    if (this.status === this.GAMEEND) {
        //console.log('GAME END');
        const score = document.getElementById('score');
        score.innerText = this.player.score;

        gameEnd.classList.remove('d-none');

    } else if (this.status === this.GAMEOVER) {
        //console.log('GAME OVER');
        gameOver.classList.remove('d-none');

    } else if (this.status === this.NEXTLEVEL) {
        //console.log('NEXT LEVEL');

        this.level++;
        nextLevel.classList.remove('d-none');

    } else if (this.status === this.PAUSED) {
        //console.log('PAUSED');

        btPause.classList.add("fa-play");
        btPause.classList.remove("fa-pause");

        paused.classList.remove('d-none');

        btPause.classList.remove('d-none');
        btSave.classList.remove('d-none');

    } else if (this.status === this.PLAYING) {
        //console.log('PLAYING');

        gamePopup.classList.add('d-none');
        gamePopup.style.zIndex = '-1';

        btPause.classList.add("fa-pause");
        btPause.classList.remove("fa-play", "d-none");
        btSave.classList.remove('d-none');

        this.loadLevel(this.level, resume);

    } else if (this.status === this.GAMESTART) {
        //console.log('GAME START');

        start.classList.remove('d-none');

    } else if (this.status === this.PLAYERNAME) {
        //console.log('PLAYER NAME');

        if (this.hasSave()) {
            btResume.classList.remove('d-none');
        }
        playerSelect.classList.remove('d-none');

    } else if (this.status === this.RULES) {
        //console.log('RULES');

        rules.classList.remove('d-none');

    } else if (this.status === this.CREDITS) {
        //console.log('go to credits');

        credits.classList.remove('d-none');

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
    ctx.fillText(`Score : ${(this.player.score < 0 ? 0 : this.player.score)}`, 10, 80+40);

    if (this.level && this.player.stats && this.player.stats.length) {
        ctx.fillText(`Hits  : ${this.player.stats[this.level-1].hits}`, 10, 100+40);
        ctx.fillText(`Miss  : ${this.player.stats[this.level-1].miss}`, 10, 120+40);
    } else {
        console.error('Level or Stats are missing');
    }

    ctx.fillText(`Time  : ${ (this.player.time > 0 ? this.player.time : 0) }`, 10, 140+40);
};

/**
 * Load the level of the game
 * @param level number of the level 1 to 3
 * @param resume
 */
Game.prototype.loadLevel = function (level, resume = false) {

    this.reset(resume);

    this.level = level;

    if (!resume) {
        if (this.level === 1) this.player.stats.length = 0;
        this.player.stats[this.level-1] = {hits: 0, miss: 0};
    }

    for (let i = 0; i < this.maxPuzzles; i++) {
        this.addPuzzle();
    }

    if (this.status === this.PLAYING) {
        if (!resume) this.player.time = 60 + (30 * this.level);
        this.timer = setInterval(timeManager, 1000);
    }

};

/**
 * Add a new puzzle to the array and set the new right answer
 */
Game.prototype.addPuzzle = function() {

    let pz;
    let isUnique;
    let i = 0;

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

        i++;

    } while (!isUnique && i < 50); // limit of attempts to get a unique result (avoid infinite loop)

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
                this.player.score++;
                this.player.stats[this.level-1].hits++;
                this.puzzles.splice(this.puzzle, 1); // remove from the array
                this.addPuzzle();
                wrong = false;
                break;
            }
        }

        if (wrong) {
            if (this.player.playFX) audioWrong.play().then(function (r) {});
            this.player.score -= (this.player.score -1 < 0 ? 0 : 1);
            this.player.stats[this.level-1].miss++;

            if (this.player.stats[this.level-1].miss >= 6) {
                this.navigate(this.GAMEOVER);
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

Game.prototype.save = function () {

    btSave.classList.add('btn-saving');

    if (isStorageAvailable('localStorage')) {
        localStorage.setItem('save', JSON.stringify(this.player));
    }

    window.setTimeout(function () {
        btSave.classList.remove('btn-saving');
    }, 1000); // same time as the transition
};

Game.prototype.hasSave = function() {
    return (isStorageAvailable('localStorage') && localStorage.getItem('save'));
};

Game.prototype.resume = function () {
    if (this.hasSave()) {
        this.player = JSON.parse(localStorage.getItem('save'));
        this.level = this.player.stats.length;
        this.navigate(this.PLAYING, true);
        toggleFX(false);
        toggleMusic(false);
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
    this.image.src = `img/stone-${random(1, 2)}-${random(1, 5)}.png`;

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
        this.velX = random(-1, 1,1);
        this.velX += this.velFix(this.velX);
    }

    if (!this.velY || this.velY === 0) {
        this.velY = random(-1, 1,1);
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

inAge.addEventListener('keydown', onlyNumbers);
function onlyNumbers(event) {

    let key = event.key || event.keyCode; // backwards compatibility

    if (key === 'Backspace'  || key === 'BS'     || key === 8  ||
        key === 'Tab'        || key === 'Tab'    || key === 9  ||
        key === 'Enter'      || key === 'Return' || key === 13 ||
        key === 'Escape'     || key === 'Esc'    || key === 27 ||
        key === 'End'        || key === 'Del'    || key === 35 ||
        key === 'Home'       || key === 'Del'    || key === 36 ||
        key === 'ArrowLeft'  || key === 'Left'   || key === 37 ||
        key === 'ArrowUp'    || key === 'Up'     || key === 38 ||
        key === 'ArrowRight' || key === 'Right'  || key === 39 ||
        key === 'ArrowDown'  || key === 'Down'   || key === 40 ||
        key === 'Delete'     || key === 'Del'    || key === 46) {
        // do nothing
    } else {
        if (!regexNumbers.test(key)) {
            event.returnValue = false;
            if(event.preventDefault) event.preventDefault();
        }
    }
}

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

    const rect = canvas.getBoundingClientRect();

    const scaleX = (game.width / rect.width);
    const scaleY = (game.height / rect.height);

    game.cursor.x = e.clientX * scaleX;
    game.cursor.y = e.clientY * scaleY;
}

// Pause controller
btPause.addEventListener('click', togglePause);
function togglePause() {

    if (game.status === game.PLAYING) {
        game.navigate(game.PAUSED);
    } else if (game.status === game.PAUSED) {
        game.navigate(game.PLAYING, true);
    } else {
        console.error('NOT SUPPORTED');
    }

}

// Sound effects controller
btAudioFX.addEventListener('click', toggleFX);
function toggleFX(toggle = true) {

    if (toggle) game.player.playFX = !game.player.playFX;

    if (game.player.playFX) {
        btAudioFX.classList.add("fa-volume-up");
        btAudioFX.classList.remove("fa-volume-mute");
    } else {
        btAudioFX.classList.add("fa-volume-mute");
        btAudioFX.classList.remove("fa-volume-up");
    }
}

// Music controller
btAudioMusic.addEventListener('click', toggleMusic);
function toggleMusic(toggle = true) {

    if (toggle) game.player.playMusic = !game.player.playMusic;

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
