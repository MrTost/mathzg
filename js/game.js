const qtyRocks = 5; // number of rocks bouncing on the screen
const rocks = []; // array of rocks
const rockMinSize = 20;
const rockMaxSize = 20;
const clickGrace = 5;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let rockCount = 0;

// function to generate random number

function random(min,max) {
    var num = Math.floor(Math.random()*(max-min)) + min;
    // if min = 10 max = 15 random var = 0.1544465; it will return approzimately 10 because of math.floor
    return num;
}


function Ball() {
    this.id = ++rockCount;
    this.x = random(0, width);
    this.y = random(0, height);
    this.velX = random(-2, 2);
    this.velY = random(-2, 2);
    this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) +')';
    this.size = random(rockMinSize, rockMaxSize);
}
Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = "30px monospace";
    //ctx.fillText(this.id, (this.x + 2 - this.size) + (this.id < 10 ? 9 : 0), (this.y + (this.size /2)));

    //ctx.fillText(this.id + ': '+ this.x +' '+ this.y, this.x, this.y);
};

Ball.prototype.update = function() {
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
    this.x = 0;
    this.y = 0;
    this.size = 20;
}
Cursor.prototype.draw = function() {
    /*ctx.beginPath();
    ctx.fillStyle = "#FF6A6A";
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = "30px monospace";*/
    //ctx.fillText(this.x +' '+ this.y, this.x, this.y);
};

const cursor = new Cursor();

function loop() {

    // reset the background to not show the track of the rocks
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    cursor.draw();

    for (const rock of rocks) {
        rock.draw();
        rock.update();
    }

    requestAnimationFrame(loop);
}

// create the rocks with the random numbers
while (rocks.length < qtyRocks) {
    rocks.push(new Ball());
}

// start the game
loop();

canvas.addEventListener('click', click);
function click(event) {

    for (const [i, rock] of rocks.entries()) {

        const dX = Math.abs((rock.x - cursor.x));
        const dY = Math.abs((rock.y - cursor.y));
        const dL = (rock.size + clickGrace);

        if (dX <= dL && dY <= dL) {
            console.log('click rock: '+ rock.id);
            rocks.splice(i, 1);
            rocks.push(new Ball());
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

    for (const rock of rocks) {
        if (rock.x >= width) {
            rock.x = width;
        }
        if (rock.y >= height) {
            rock.y = height;
        }
    }
}
