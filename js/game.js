const qtyRocks = 9; // number of rocks bouncing on the screen
const rockMinSize = 30;
const rockMaxSize = 40;
const clickGrace = 5;
const maxLevels = 3;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let rockCount = 0;
let paused = false;

function random(min, max, dec = 0) {
    const power = Math.pow(10, dec);
    return Math.floor((Math.random() * (max - min) + min) * power) / power;
}

function Rock(result) {
    this.id = ++rockCount;
    this.result = result;

    this.r = 0;
    this.x = random(0, width);
    this.y = random(0, height);
    this.size = random(rockMinSize, rockMaxSize);
    this.image = new Image(this.size, this.size);
    this.image.src = `img/rock${random(2, 5)}.png`;

    this.loadVel();
    this.bound();
}
Rock.prototype.bound = function(flip = false) {

    if (flip) {
        const saveX = this.x;
        const saveY = this.y;
        this.x = saveY;
        this.y = saveX;
    }

    // keeping the full rock inside the canvas
    this.x += (this.x <= this.size ? this.size : 0);
    this.y += (this.y <= this.size ? this.size : 0);
    this.x -= (this.x + this.size >= width ? this.size : 0);
    this.y -= (this.y + this.size >= height ? this.size : 0);
};
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
Rock.prototype.velFix = function(vel) {
    // keeping minimum velocity
    return (Math.abs(vel) < 0.5 ? 0.5 * Math.sign(vel) : 0);
};
Rock.prototype.draw = function() {

    const canvasAux = document.createElement('canvas');
    canvasAux.width = this.size*2;
    canvasAux.height = this.size*2;
    const ctxAux = canvasAux.getContext('2d');

    // move to the center of the canvas
    ctxAux.translate(this.size,this.size);

    // rotate the canvas to the specified degrees
    ctxAux.rotate(this.r * Math.PI / 180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    ctxAux.drawImage(this.image,-this.size,-this.size, this.size*2, this.size*2);


    ctx.beginPath();
    //ctx.fillStyle = this.color;
    //ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    //ctx.fill();

    ctx.drawImage(canvasAux, this.x - this.size,this.y - this.size, this.size*2, this.size*2);
    ctx.fillStyle = 'white';
    ctx.font = "bold 30px monospace";
    const x = this.x - (this.size/4) - (this.result > 9 ? 10 : 0);
    const y = this.y + (this.size/4);
    ctx.fillText(this.result, x, y);
};

Rock.prototype.update = function() {
    if ((this.x + this.size) >= width) {
        this.velX = -(this.velX);
    }

    if ((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
    }

    if ((this.y + this.size) >= height) {
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

/*Ball.prototype.collisionDetect = function() {
    for (j = 0; j < rocks.length; j++) {
        if ( (!(this.x === rocks[j].x && this.y === rocks[j].y && this.velX === rocks[j].velX && this.velY === rocks[j].velY)) ) {
            var dx = this.x - rocks[j].x;
            var dy = this.y - rocks[j].y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size + rocks[j].size) {
                rocks[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) +')';
            }
        }
    }
};*/

function Cursor() {
    this.x = (width/2) - 90;
    this.y = height - 40;
    this.size = 5;
    this.support = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

Cursor.prototype.draw = function() {

    if (this.support) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = "30px monospace";

        const pz = player.puzzles[player.puzzle];
        ctx.fillText(`${pz.a} ${pz.sign} ${pz.b} = ?`, this.x+10, this.y+30);
    }
};

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

function Player() {
    this.name = 'John';
    this.age = '12';

    this.score = 0;
    this.stats = []; // hits and miss for each level
    this.puzzles = [];

    // preferences
    this.playMusic = false;
    this.playFX = true;

    this.reset();
}

Player.prototype.reset = function() {

    this.puzzles.length = 0;
    this.gameover = false;
    this.time = 0;
    this.timer = null;
    this.timesup = false;

};

Player.prototype.draw = function() {
    ctx.fillStyle = 'white';
    ctx.font = "bold 30px arial";

    const pz = this.puzzles[this.puzzle];
    ctx.fillText(`${pz.a} ${pz.sign} ${pz.b} = ?`, 10, 35);

    ctx.font = "1rem monospace";
    ctx.fillText(`Player: ${this.name}`, 10, 60);
    ctx.fillText(`Score : ${this.score}`, 10, 80);
    ctx.fillText(`Hits  : ${this.stats[this.level-1].hits}`, 10, 100);
    ctx.fillText(`Miss  : ${this.stats[this.level-1].miss}`, 10, 120);
    ctx.fillText(`Time  : ${ (this.time > 0 ? this.time : 0) }`, 10, 140);


};
Player.prototype.drawPaused = function() {
    ctx.fillStyle = 'white';
    ctx.font = "5rem monospace";
    ctx.fillText('Paused', (width/2) - 145, height/2);
};
Player.prototype.drawTrans = function() {

    ctx.fillStyle = 'white';
    ctx.font = "3rem monospace";

    if (player.gameover) {
        ctx.fillText('GAME OVER', (width/2)-130, height/2);

        if (player.time < -1) {
            ctx.font = "2rem monospace";
            ctx.fillText('click to retry', (width/2)-135, (height/2) + 40);
        }

    } else {
        if (player.time === 0) {
            ctx.fillText('TIMES UP!', (width/2)-130, height/2);
        } else if (player.time === -1) {
            ctx.fillText('GET READY', (width/2)-130, height/2);
        } else {
            ctx.fillText(`${5 + player.time}`, (width/2)-15, height/2);
        }
    }

};

Player.prototype.evaluate = function(rocks) {

    if (rocks && rocks.length) {
        let wrong = true;

        for (const rock of rocks) {
            if (rock.result === this.puzzles[this.puzzle].r) {
                if (this.playFX) audioRight.play();
                this.stats[this.level-1].hits++;
                this.score++;
                this.puzzles.splice(this.puzzle, 1); // remove from the array
                player.addPuzzle();
                wrong = false;
                break;
            }
        }

        if (wrong) {
            if (this.playFX) audioWrong.play();
            this.score -= (this.score - 1 < 0 ? 0 : 1);
            this.stats[this.level-1].miss++;

            if (this.stats[this.level-1].miss >= 6) {
                this.gameover = true;
                this.time = 0; // game over
            } else {
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

Player.prototype.addPuzzle = function() {

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
    this.puzzle = random(0, this.puzzles.length - 1);

};

Player.prototype.loadLevel = function (level) {

    clearInterval(player.timer);
    this.reset();
    this.level = level;

    if (this.level === 1) {
        this.score = 0;
        this.stats.length = 0;
    }

    this.stats.push({hits: 0, miss: 0});

    for (let i = 0; i < qtyRocks; i++) {
        this.addPuzzle();
    }

    this.time = 60 + (30 * this.level); // FIXME - use the commented version
    this.timer = setInterval(timeManager, 1000);

};

const timeManager = function() {

    if (!paused) player.time--;

    if (player.time <= 0) {
        player.timesup = true;

        if (!player.gameover && player.level >= maxLevels) {
            player.gameover = true;
        }
    }

    if (player.time <= -5) {
        if (!player.gameover) player.loadLevel(player.level+1);
    }
};


// Main --------------------------------------------

const cursor = new Cursor();
const player = new Player();

const background = new Image();
const earth = new Image();
const mars = new Image();

background.src = "img/background.png";
earth.src = "img/earth.png";
mars.src = "img/mars.png";

const audioBackground = new Audio('mp3/background.mp3');
const audioRight = new Audio('mp3/right.mp3');
const audioWrong = new Audio('mp3/wrong.mp3');
audioBackground.loop = true;

function loop() {

    // reset the background to not show the track of the rocks
    ctx.drawImage(background,0,0, width, height);
    ctx.drawImage(earth,canvas.width/1.6,canvas.height/10, 100, 100);
    ctx.drawImage(mars,canvas.width/6,canvas.height/2, 50, 50);

    if (!paused && !player.timesup && !player.gameover) {
        for (const puzzle of player.puzzles) {
            puzzle.rock.draw();
            puzzle.rock.update();
        }
    }

    player.draw();

    if (!paused && !player.timesup && !player.gameover) cursor.draw();

    if (!paused && (player.timesup || player.gameover)) player.drawTrans();

    if (!paused) {
        requestAnimationFrame(loop);
    } else {
        player.drawPaused();
    }

}

// start the game
player.loadLevel(1);
loop();

canvas.addEventListener('click', click);
function click(event) {

    if (player.gameover) {
        if (player.time < -1) player.loadLevel(1);
    } else if (!player.timesup) {
        const hits = [];

        for (const puzzle of player.puzzles) {

            const dX = Math.abs((puzzle.rock.x - cursor.x));
            const dY = Math.abs((puzzle.rock.y - cursor.y));
            const dL = (puzzle.rock.size + clickGrace);

            if (dX <= dL && dY <= dL) {
                //console.log('click rock: '+ puzzle.rock.id);
                hits.push(puzzle.rock);
            }
        }

        player.evaluate(hits);
    }

}

canvas.addEventListener("mousemove", updateCursor);
function updateCursor(e) {
    //console.log(e);
    const rect = canvas.getBoundingClientRect();

    const scaleX = (width / rect.width);
    const scaleY = (height / rect.height);

    cursor.x = e.clientX * scaleX;
    cursor.y = e.clientY * scaleY;
}

// Pause controller

const btPause = document.getElementById('btPause');
btPause.addEventListener('click', togglePause);
function togglePause() {

    paused = !paused;

    if (paused) {
        btPause.classList.add("fa-play");
        btPause.classList.remove("fa-pause");
    } else {
        btPause.classList.add("fa-pause");
        btPause.classList.remove("fa-play");
        requestAnimationFrame(loop);
    }
}

// Sound effects controller

const btAudioFX = document.getElementById('btAudioFX');
btAudioFX.addEventListener('click', toggleFX);
function toggleFX() {

    player.playFX = !player.playFX;

    if (player.playFX) {
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

    player.playMusic = !player.playMusic;

    if (player.playMusic) {
        btAudioMusicMuter.style.display="none";
        audioBackground.play();
    } else {
        btAudioMusicMuter.style.display="unset";
        audioBackground.pause();
    }
}

// Resize or orientation change

// Detect whether device supports orientationchange event
/*const supportsOrientationChange = "onorientationchange" in window;

if (supportsOrientationChange === 'onorientationchange') {
    window.addEventListener('onorientationchange', function() {
        console.log('orientation change');
    }, false);
}*/

window.addEventListener('resize', onResizeOrOnOrientationChange, false);
window.addEventListener('onorientationchange', onResizeOrOnOrientationChange, false);

function onResizeOrOnOrientationChange() {

    const oldW = width;
    const oldH = height;

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    for (const puzzle of player.puzzles) {
        puzzle.rock.bound( (oldW === height && oldH === width) );
        puzzle.rock.update();
    }
}


