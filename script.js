var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

const stickLength = 50;
const legLength = 30;
const pi180 = Math.PI / 180;

let StickMans = []
let Objects = []
let keysDown = []

function checkIfLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
    }
    return false;
}

class Object {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.size = [width, height];
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size[0], this.size[1]);
    }
}

class StickMan {
    constructor(color, x, y) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.limbs = [30, 330, 330, 30]; // prawa ręka,  lewa ręka, prawa noga, lewa noga
        this.speed = [0, 1] // speedX, speedY
        this.rotateCooldown = 0;
    }

    draw() {
        // head

        let headPosition = [Math.sin((this.limbs[2] + this.limbs[3]) / 2 * pi180) * -10, Math.cos((this.limbs[2] + this.limbs[3]) / 2 * pi180) * 10]

        ctx.beginPath();
        ctx.arc(this.x + headPosition[0], this.y + headPosition[1], 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();

        // avarage point of legs and head
        let bodyEnd = [Math.sin((this.limbs[2] + this.limbs[3]) / 2 * pi180) * stickLength, Math.cos((this.limbs[2] + this.limbs[3]) / 2 * pi180) * -stickLength];

        // body
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + bodyEnd[0], this.y + bodyEnd[1]);
        ctx.stroke();

        // legs
        ctx.beginPath();
        ctx.moveTo(this.x + bodyEnd[0], this.y + bodyEnd[1]);
        ctx.lineTo(this.x + bodyEnd[0] + Math.sin(this.limbs[2] * pi180) * legLength, this.y + bodyEnd[1] + Math.cos(this.limbs[2] * pi180) * legLength);
        ctx.stroke();
     
        ctx.beginPath();
        ctx.moveTo(this.x + bodyEnd[0], this.y + bodyEnd[1]);
        ctx.lineTo(this.x + bodyEnd[0] + Math.sin(this.limbs[3] * pi180) * legLength, this.y + bodyEnd[1] + Math.cos(this.limbs[3] * pi180) * legLength);
        ctx.stroke();

        // arms
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.sin(this.limbs[0] * pi180) * legLength, this.y + Math.cos(this.limbs[0] * pi180) * legLength);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.sin(this.limbs[1] * pi180) * legLength, this.y + Math.cos(this.limbs[1] * pi180) * legLength);
        ctx.stroke();
    }


    checkCollision() {

        let collisions = []

        let bodyEnd = [Math.sin((this.limbs[2] + this.limbs[3]) / 2 * pi180) * stickLength, Math.cos((this.limbs[2] + this.limbs[3]) / 2 * pi180) * -stickLength];

        for (let i = 0; i < Objects.length; i++) {
            // head collistion
            let headPosition = [this.x + (Math.sin((this.limbs[2] + this.limbs[3]) / 2 * pi180) * -10), this.y + (Math.cos((this.limbs[2] + this.limbs[3]) / 2 * pi180) * 10)]
            // check top of object
            for (let j=0; j<Objects[i].size[0]; j++){
                let distanceToHead = Math.sqrt(Math.pow(headPosition[0] - (Objects[i].x + j), 2) + Math.pow(headPosition[1] - Objects[i].y, 2));
                if (distanceToHead < 10){
                    collisions.push(["head", Objects[i]]);
                }
                distanceToHead = Math.sqrt(Math.pow(headPosition[0] - (Objects[i].x + j), 2) + Math.pow(headPosition[1] - Objects[i].y - Objects[i].size[1], 2));
                if (distanceToHead < 10){
                    collisions.push(["head", Objects[i]]);
                }

                distanceToHead = Math.sqrt(Math.pow(headPosition[0] - Objects[i].x, 2) + Math.pow(headPosition[1] - Objects[i].y - j, 2));
                if (distanceToHead < 10){
                    collisions.push(["head", Objects[i]]);
                }
                distanceToHead = Math.sqrt(Math.pow(headPosition[0] - Objects[i].x - Objects[i].size[0], 2) + Math.pow(headPosition[1] - Objects[i].y - j, 2));
                if (distanceToHead < 10){
                    collisions.push(["head", Objects[i]]);
                }
            }

            // check arms
            for (let j=0; j<2; j++){


                if (checkIfLinesIntersect(this.x, this.y, this.x + Math.sin(this.limbs[j] * pi180) * legLength, this.y + Math.cos(this.limbs[j] * pi180) * legLength, Objects[i].x, Objects[i].y, Objects[i].x + Objects[i].size[0], Objects[i].y)) {
                    collisions.push([j, Objects[i]]);
                }

                else if (checkIfLinesIntersect(this.x, this.y, this.x + Math.sin(this.limbs[j] * pi180) * legLength, this.y + Math.cos(this.limbs[j] * pi180) * legLength, Objects[i].x, Objects[i].y, Objects[i].x, Objects[i].y + Objects[i].size[1])) {
                    collisions.push([j, Objects[i]]);
                }

                else if (checkIfLinesIntersect(this.x, this.y, this.x + Math.sin(this.limbs[j] * pi180) * legLength, this.y + Math.cos(this.limbs[j] * pi180) * legLength, Objects[i].x + Objects[i].size[0], Objects[i].y, Objects[i].x + Objects[i].size[0], Objects[i].y + Objects[i].size[1])) {
                    collisions.push([j, Objects[i]]);
                }

                else if (checkIfLinesIntersect(this.x, this.y, this.x + Math.sin(this.limbs[j] * pi180) * legLength, this.y + Math.cos(this.limbs[j] * pi180) * legLength, Objects[i].x, Objects[i].y + Objects[i].size[1], Objects[i].x + Objects[i].size[0], Objects[i].y + Objects[i].size[1])) {
                    collisions.push([j, Objects[i]]);
                }
            }

            for (let j=0; j<2; j++){


                if (checkIfLinesIntersect(this.x + bodyEnd[0], this.y + bodyEnd[1], this.x + bodyEnd[0] + Math.sin(this.limbs[j + 2] * pi180) * legLength, this.y + Math.cos(this.limbs[j + 2] * pi180) * legLength + bodyEnd[1], Objects[i].x, Objects[i].y, Objects[i].x + Objects[i].size[0], Objects[i].y)) {
                    collisions.push([j + 2, Objects[i]]);
                }

                else if (checkIfLinesIntersect(this.x + bodyEnd[0], this.y + bodyEnd[1], this.x + bodyEnd[0] + Math.sin(this.limbs[j + 2] * pi180) * legLength, this.y + Math.cos(this.limbs[j + 2] * pi180) * legLength + bodyEnd[1], Objects[i].x, Objects[i].y, Objects[i].x, Objects[i].y + Objects[i].size[1])) {
                    collisions.push([j + 2, Objects[i]]);
                }

                else if (checkIfLinesIntersect(this.x + bodyEnd[0], this.y + bodyEnd[1], this.x + bodyEnd[0] + Math.sin(this.limbs[j + 2] * pi180) * legLength, this.y + Math.cos(this.limbs[j + 2] * pi180) * legLength + bodyEnd[1], Objects[i].x + Objects[i].size[0], Objects[i].y, Objects[i].x + Objects[i].size[0], Objects[i].y + Objects[i].size[1])) {
                    collisions.push([ j+ 2, Objects[i]]);
                }

                else if (checkIfLinesIntersect(this.x + bodyEnd[0], this.y + bodyEnd[1], this.x + bodyEnd[0] + Math.sin(this.limbs[j + 2] * pi180) * legLength, this.y + Math.cos(this.limbs[j + 2] * pi180) * legLength + bodyEnd[1], Objects[i].x, Objects[i].y + Objects[i].size[1], Objects[i].x + Objects[i].size[0], Objects[i].y + Objects[i].size[1])) {
                    collisions.push([j + 2, Objects[i]]);
                }
            }
        }
        return collisions;
    }

    rotateLegs() {
        if (this.limbs[2] > 330) {
            this.limbs[2] -= 1;
        }
        if (this.limbs[2] < 330) {
            this.limbs[2] += 1;
        }

        if (this.limbs[3] > 30) {
            this.limbs[3] -= 1;
        }
        if (this.limbs[3] < 30) {
            this.limbs[3] += 1;
        }
    }

    update() {
        let collisions = this.checkCollision();
        console.log(this.rotateCooldown)
        this.y += this.speed[1];
        this.x += this.speed[0];
        if (collisions.length === 0) {
            this.speed[1] += 0.01;
            this.rotateCooldown += 1;
        }
        else {
            StickMans[0].speed[0] = 0;
            if (collisions.length > 1){
                this.speed[1] = 0;
                this.rotateCooldown += 1;
            }
            else {
                if (collisions[0][0] === "head"){
                    this.speed[1] = 0;
                    this.rotateCooldown += 1;
                } else {
                    if (this.limbs[collisions[0][0]] > 180){
                        this.limbs[collisions[0][0]] -= 3;
                        this.speed[1] = 0;
                        this.rotateCooldown = 0;
                    } else {
                        this.limbs[collisions[0][0]] += 3;
                        this.speed[1] = 0;
                        this.rotateCooldown = 0;
                    }
                }
            }
        }
        if (this.rotateCooldown > 100){
            this.rotateLegs()
        }
    }

}

let stick = new StickMan("red", 100, 100);
StickMans.push(stick);

let object = new Object(100, 500, 550, 50, "blue");
Objects.push(object);
object = new Object(210, 85, 50, 50, "blue");
Objects.push(object);

function handleStickMovement() {
    if (keysDown.includes("a")) {
        StickMans[0].speed[0] = -1;
    }
    if (keysDown.includes("d")) {
        StickMans[0].speed[0] = 1;
    }
    if (keysDown.includes("w")) {
        StickMans[0].speed[1] = -1;
    }
    if (keysDown.includes("s")) {
        StickMans[0].speed[1] = 1;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, c.width, c.height);

    for (let i = 0; i < StickMans.length; i++) {
        StickMans[i].draw();
        StickMans[i].update();
    }

    for (let i = 0; i < Objects.length; i++) {
        Objects[i].draw();
    }
    handleStickMovement()
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(event) {
    if(!keysDown.includes(event.key)){
        keysDown.push(event.key);
    }
});

document.addEventListener('keyup', function(event) {
    for (let i=0; i<keysDown.length; i++){
        if (keysDown[i] === event.key){
            keysDown.splice(i, 1);
        }
    }
});

gameLoop();
