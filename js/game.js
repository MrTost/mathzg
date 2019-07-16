const area = document.getElementById('area');
const rock1 = document.getElementById('rock1');


/*const moveRock = function() {

    rock1.style.left = (rock1.style.left + 1) + 'px';
    //console.log('move!');


};

setInterval( moveRock, 1000 );*/

function addBall() {
    const stage = document.getElementById('stage');

    const traveler = document.createElement("div");
    traveler.classList.add('traveler');

    const bouncer = document.createElement("div");
    bouncer.classList.add('bouncer');

    traveler.appendChild(bouncer);

    stage.appendChild(traveler);

    console.log('add a ball');
}
