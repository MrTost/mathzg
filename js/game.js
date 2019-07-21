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
    this.velX = random(-2, 2,1);
    this.velY = random(-2, 2,1);
    this.velR = random(-5, 5);
    this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) +')';
    this.size = random(rockMinSize, rockMaxSize);
    this.image = new Image(this.size, this.size);
    this.image.src = "img/earth.png"; // TODO: make it dynamic

    this.bound();

    // keeping minimum velocity
    this.velX += this.velFix(this.velX);
    this.velY += this.velFix(this.velY);
}
Rock.prototype.bound = function() {
    // keeping the full rock inside the canvas
    this.x += (this.x <= this.size ? this.size : 0);
    this.y += (this.y <= this.size ? this.size : 0);
    this.x -= (this.x + this.size >= width ? this.size : 0);
    this.y -= (this.y + this.size >= height ? this.size : 0);
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
    ctx.font = "30px monospace";
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
    this.x = -10; // init outside canvas
    this.y = -10;
    this.size = 5;
}
Cursor.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = "30px monospace";

    const pz = player.puzzles[player.puzzle];
    ctx.fillText(`${pz.a} ${pz.sign} ${pz.b} = ?`, this.x+10, this.y+30);
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
    this.hits = 0;
    this.miss = 0;
    this.playMusic = false;
    this.playFX = true;
}
Player.prototype.draw = function() {
    ctx.fillStyle = 'white';
    ctx.font = "1rem monospace";

    ctx.fillText(`Player: ${this.name}`, 10, 20);
    ctx.fillText(`Score : ${this.score}`, 10, (20 * 2));
    ctx.fillText(`Hits  : ${this.hits}`, 10, (20 * 3));
    ctx.fillText(`Miss  : ${this.miss}`, 10, (20 * 4));
    ctx.fillText(`Time  : ${this.time}`, 10, (20 * 5));

    const pz = this.puzzles[this.puzzle];
    ctx.fillText(`Puzzle: ${pz.a} ${pz.sign} ${pz.b}`, 10, (20 * 6));
};
Player.prototype.evaluate = function(rock) {
    if (rock.result === this.puzzles[this.puzzle].r) {
        if (this.playFX) audioRight.play();
        player.hits++;
        this.puzzles.splice(this.puzzle, 1); // remove from the array
        player.addPuzzle();
    } else {
        if (this.playFX) audioWrong.play();
        player.miss--;
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

    } while (!isUnique);

    this.puzzles.push(pz);
    this.puzzle = random(0, this.puzzles.length - 1);
};
Player.prototype.loadLevel = function (level) {
    this.level = level;
    this.puzzles = [];

    for (let i = 0; i < qtyRocks; i++) {
        this.addPuzzle();
    }

    this.time = 60 + (30 * this.level);
    this.timer = setInterval(timeManager, 1000);
};

const timeManager = function() {
    player.time--;

    if (player.time <= 0) {
        clearInterval(player.timer);

        if (player.level < maxLevels) {
            // TODO - implement screen of level change
            player.loadLevel(player.level+1);
        }
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

    for (const puzzle of player.puzzles) {
        puzzle.rock.draw();
        puzzle.rock.update();
    }

    player.draw();
    cursor.draw();

    requestAnimationFrame(loop);
}

// start the game
player.loadLevel(1);
loop();


canvas.addEventListener('click', click);
function click(event) {
    for (const puzzle of player.puzzles) {

        const dX = Math.abs((puzzle.rock.x - cursor.x));
        const dY = Math.abs((puzzle.rock.y - cursor.y));
        const dL = (puzzle.rock.size + clickGrace);

        if (dX <= dL && dY <= dL) {
            console.log('click rock: '+ puzzle.rock.id);
            player.evaluate(puzzle.rock);
            break;
        }
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

function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    for (const puzzle of player.puzzles) {
        puzzle.rock.bound();
        puzzle.rock.update();
    }
}

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
