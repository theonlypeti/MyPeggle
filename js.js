let objs = [];
let walls = [];

let GRAVITY = 0.07;
let BOUNCINESS = 0.8;
let DRAG = 7;
let HDRAG = 0.001;
// let BALLTYPE = document.getElementById("balltype").value;
let BALLTYPE = "rubber";

let ballsused = 0;
let time = null;
let timer = document.getElementById("timer");
let milis = null;
let finalScore = 0;
let scoreElem = document.getElementById("score");


class Ball{
    constructor(elem,x=window.innerWidth/2,y=0){
        this.elem = elem;
        this.elem.style.left = x;
        this.elem.style.top = y;
        this.x = x
        this.y = y
        this.xv = 0;
        this.yv = 0;
        // this.bounciness = BOUNCINESS;
        this.drag = DRAG;
        // this.hdrag = HDRAG;
        this.elem.className = "ball"
        objs.push(this);
        document.body.insertBefore(this.elem, document.getElementById("anchor"));
    }

    update(){
        this.xv = Math.sign(this.xv) * Math.max(Math.abs(this.xv) - this.hdrag, 0); //horizontal drag
        this.yv = Math.min(this.yv + GRAVITY, this.drag); //gravity

        //speed limit
        this.xv = Math.min(this.xv,10)
        this.yv = Math.min(this.yv,10)

        //antistuck
        if(this.xv === 0){
            this.xv = (Math.random() - 1 )/ 5;
        }

        this.x += this.xv;
        this.y += this.yv;

        this.collision();
        // console.log("xv:" + this.xv +", yv:" + this.yv, this.y + this.elem.offsetHeight - floor.offsetTop)

        //if below screen, remove
        if (this.y > window.innerHeight){
            this.elem.remove();
            objs.splice(objs.indexOf(this), 1);
        }
    }

    draw(){
        this.elem.style.left = this.x + "px";
        this.elem.style.top = this.y + "px";
    }

    collision(){
        for (const wall of walls){
            if(wall.collision(this)){
                break;
            }

        }
    }
}

class Ice extends Ball{
    constructor(elem,x,y){
        super(elem,x,y);
        this.hdrag = 0.0005;
        this.bounciness = 0.3;
        this.color = "#60aaff";
        this.elem.style.backgroundColor = this.color;
    }
}

class Slime extends Ball{
    constructor(elem,x,y){
        super(elem,x,y);
        this.hdrag = 0.01;
        this.bounciness = 0.1;
        this.color = "#00ff00";
        this.elem.style.backgroundColor = this.color;
    }
}

class Rubber extends Ball{
    constructor(elem,x,y){
        super(elem,x,y);
        this.hdrag = 0.001;
        this.bounciness = 0.9;
        this.color = "#ccaa00";
        this.elem.style.backgroundColor = this.color;
    }
}

class Glass extends Ball{
    constructor(elem,x,y){
        super(elem,x,y);
        this.hdrag = 0.001;
        this.bounciness = 0.9;
        this.color = "#88aaff";
        this.elem.style.backgroundColor = this.color;
    }

    collision(){
        // if(this.y + this.elem.offsetHeight >= floor.offsetTop){
        if(true){
            this.elem.remove();
            objs.splice(objs.indexOf(this), 1);
            this.spawnshards();
        }
    }

    spawnshards(){
        for (let i = 0; i < 10; i++) {
            const shard = document.createElement("div")
            shard.className = "shard bounce"
            shard.style.left = this.x + (Math.random()-0.5) * 20 * Math.min(this.xv,2) * -Math.min(this.yv,2) + "px";
            shard.style.top = floor.offsetTop + (Math.random()-0.5)*5 - 10 + "px";
            shard.style.transform = "rotate(" + Math.random() * 360 + "deg)";
            document.body.insertBefore(shard, floor)
            var rot = Math.random() * 360;
            shard.style.setProperty('--rot', rot +'deg');
            $('.shard').fadeOut(5000, function() {
                $(this).remove();
            });
        }
    }
}

class Metal extends Ball{
    constructor(elem,x,y){
        super(elem,x,y);
        this.hdrag = 0.001;
        this.bounciness = 0.3;
        this.color = "#aaaaaa";
        this.elem.style.backgroundColor = this.color;
    }
}

function checkWin() {
    // console.log(walls.filter(obj => obj instanceof Peg))
    if (walls.filter(obj => obj instanceof Peg).length === 0){
        performance.clearMarks("start")
        setTimeout(function () {
        alert("You win! Score: " + finalScore);
        },500)
        time = null;
    }
}

class Wall{
    constructor(x,y,w,h,elem) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.elem = elem ?? document.createElement("div");
        this.elem.classList = ["wall"]
        document.body.insertBefore(this.elem, document.getElementById("anchor"));
    }

    remove(){
        this.elem.remove();
        walls.splice(walls.indexOf(this), 1);
    }

    update(){}
    draw(){
        this.elem.style.left = this.x + "px";
        this.elem.style.top = this.y + "px";
        this.elem.style.width = this.w + "px";
        this.elem.style.height = this.h + "px";
    }

    collision(ball){

        if(ball.y < this.y && ball.y + ball.elem.offsetHeight > this.y && ball.x < this.x + this.w && ball.x + ball.elem.offsetWidth > this.x){
            ball.yv *= -ball.bounciness;
            ball.y = this.y - ball.elem.offsetHeight;
            return true
        }
        if(ball.x < this.x && ball.x + ball.elem.offsetWidth > this.x && ball.y < this.y + this.h && ball.y + ball.elem.offsetHeight > this.y){
            ball.xv *= -ball.bounciness;
            ball.x = this.x - ball.elem.offsetWidth;
            return true
        }

        if(ball.x + ball.elem.offsetWidth > this.x + this.w && ball.x < this.x + this.w && ball.y < this.y + this.h && ball.y + ball.elem.offsetHeight > this.y){
            ball.xv *= -ball.bounciness;
            ball.x = this.x + this.w;
            return true
        }

        if(ball.y + ball.elem.offsetHeight > this.y + this.h && ball.y < this.y + this.h && ball.x < this.x + this.w && ball.x + ball.elem.offsetWidth > this.x){
            ball.yv *= -ball.bounciness;
            ball.y = this.y + this.h;
            return true
        }
        return false
    }

    break(){
        if (!this.elem.classList.contains("explode")) {
            const elem = this.elem; //dont remove xd
            elem.classList.add("explode");
            walls.splice(walls.indexOf(this), 1);

            $('.explode').fadeOut(250, function () {
                elem.remove();
            });
        }
        checkWin();
    }
    
    repr(){
        let mystr = this.constructor.name + "("
        for (const attr of Object.keys(this)) {
            if (this.hasOwnProperty(attr)) {
                if(attr === "elem"){
                    continue
                }
                mystr += attr + "=" + this[attr] + ","
            }
        }
        mystr = mystr.slice(0,mystr.length-1) + ")";
        mystr.replace('\"', '\\\\"') //escape strings
        return mystr;
    }

    toJSON(){
        return this.repr();
    }

}

class Bounce extends Wall{
    constructor(x, y, w, h, elem) {
        super(x,y,w,h,elem);
        this.elem.classList.add("bouncewall")
    }

    collision(ball){
        if(super.collision(ball))
        {
            ball.xv *= 1.4
            ball.yv *= 1.4
            this.elem.classList.remove("bouncingwall")
            void this.elem.offsetWidth
            this.elem.classList.add("bouncingwall")
            return true
        }
        return false
    }
}

class Peg extends Wall{
    constructor(x, y, w, h, score, elem) {
        super(x,y,w,h,elem);
        this.score = score ?? 100;
        this.elem.classList.add("peg")
        this.elem.style.width = this.w + "px";
        this.elem.style.height = this.h + "px";
    }

    collision(ball){
        if(super.collision(ball))
            {
                this.break();
                return true
            }
        return false
    }

    break(){
        const scoretext = document.createElement("div");
        scoretext.innerHTML = this.score;
        scoretext.classList.add("scoretext");
        scoretext.classList.add("float");

        scoretext.style.left = this.x + "px";
        scoretext.style.top = this.y - 50 + "px";
        document.body.insertBefore(scoretext, document.getElementById("balltype"));

        $('.scoretext').fadeOut(1000, function () {
            scoretext.remove();
        });

        finalScore += this.score;
        updateScore();
        super.break();
    }

}

function updateScore(){
    // score = Math.max(score, 0); //this encourages spamming the balls at the beginning, might need to implement some antispam
    scoreElem.innerHTML = String(finalScore).padStart(5, '0')
}

class MovingPeg extends Peg{
        constructor(x, y, w, h, score=200, xd=0, yd=0, xo=0,yo=0, elem=null) {
            super(x,y,w,h,score,elem);

            this.origX = x;
            this.origY = y;
            this.xd = xd;
            this.yd = yd;
            this.xo = xo;
            this.yo = yo;

            this.elem.classList.add("movingpeg")

        }

        update(){
            this.x = this.origX + Math.sin((performance.now() / 1000 + this.xo)) * this.xd;
            this.y = this.origY + Math.cos((performance.now() / 1000 + this.yo)) * this.yd;
        }

    repr(){
        let mystr = this.constructor.name + "(x=" + this.origX + ",y=" + this.origY + ","
        for (const attr of Object.keys(this)) {
            if (this.hasOwnProperty(attr)) {
                if(["elem","x","y","origX","origY"].includes(attr)){
                    continue
                }
                else{
                    mystr += attr + "=" + this[attr] + ","
                }
            }
        }
        mystr = mystr.slice(0,mystr.length-1) + ")";
        return mystr;
    }

    toJSON(){
        return this.repr();
    }

}

class FloorPeg extends Peg{
    constructor(x, y, w, h, score=500, saveTimeMs = 5000,elem) {
        super(x,y,w,h,score,elem);
        this.saveTimeMs = Math.max(saveTimeMs, 1000);
        this.elem.classList.add("floorpeg")
    }

    break() {
        super.break();
        let floor = new Wall(0, window.innerHeight-10, window.innerWidth, 10, document.createElement("div"));
        floor.elem.style.backgroundColor = "#ffdd00";
        walls.push(floor)

        setTimeout(() => {
            floor.elem.classList.add("blinking");
        }, this.saveTimeMs - 1000);

        setTimeout(() => {
            floor.elem.remove();
            walls.splice(walls.indexOf(floor), 1);
        }, this.saveTimeMs);
    }

}

class KeyPeg extends Peg{
    constructor(x, y, w, h, score=500, targets, color, elem) {
        super(x,y,w,h,score,elem);
        this.elem.classList.add("keypeg")
        this.targets = targets
        this.color = JSON.stringify(color)
        if(color !== null){
            if(targets == null){return}
            for (const target of this.targets) {
            this.elem.style.borderColor = color;
                target.elem.style.borderColor = color;
            }
        }
    }

    break(){
        for (const target of this.targets) {
            target.break();
        }
        super.break();
    }

    repr(){
        let mystr = this.constructor.name + "("
        for (const attr of Object.keys(this)) {
            if (this.hasOwnProperty(attr)) {
                if(["elem"].includes(attr)){
                    continue
                }
                else if(attr === "targets"){
                    mystr += attr + "= [";
                    if (this[attr] == null){
                        mystr += "]";
                    }
                    else{
                        for (const target of this.targets) {
                            mystr += "walls[" + walls.indexOf(target) + "],"
                        }
                    }
                    mystr = mystr.slice(0,mystr.length-1) + "],";
                }
                else{
                    mystr += attr + "=" + this[attr] + ","
                }
            }
        }
        mystr = mystr.slice(0,mystr.length-1) + ")";
        mystr.replace('\"', '\\\\"') //escape strings
        return mystr;
    }

    toJSON(){
        return this.repr();
    }
}

class MultiBall extends Peg{
    constructor(x, y, w, h, score=500, ballAmount=3, elem) {
        super(x,y,w,h,score,elem);
        this.ballAmount = ballAmount
        this.elem.classList = ["multiball"];
    }

    break(){
        for (let i = 0; i < this.ballAmount; i++) {
            const ball = document.createElement("div")
            const ballobj = new balltypes[BALLTYPE](ball,this.x,this.y)
            ballobj.xv = Math.random() * 6 - 5;
            ballobj.yv = Math.random() * 6 - 5;
        }
        super.break();
    }
}

const balltypes = {
    "ice": Ice,
    "slime": Slime,
    "rubber": Rubber,
    "glass": Glass,
    "metal": Metal,
    "wall": Wall
}


let startpos = 0;
window.onmousedown = function(event) {
    if(time==null){
        time = performance.mark("start");
    }
    document.getElementById("tutorial").style.display = "none";
    if(event.clientY > 20){
        startpos = event
        dragging = true;
        if(BALLTYPE === "wall"){
            const wall = document.createElement("div")
            wall.className = "wall"
            let x = event.clientX; let y = event.clientY
            wallobj = new balltypes[BALLTYPE](x,y,0,0,wall)
            walls.push(wallobj);
            document.body.insertBefore(wall, floor)
        }
        else{
            // startarrow(event)
        }
    }
}

window.onmouseup = function(event) {
    if(!dragging){return}
    if(BALLTYPE === "wall"){
    }
    else {
        const arrow = document.getElementById("arrow")
        const rot = parseInt(window.getComputedStyle(arrow).rotate)
        // console.log(rot)
        const anglerad = rot * Math.PI / 180;
        // console.log(anglerad)
        //velocities
        const xv = - Math.sin(anglerad);
        // const yv = Math.cos(anglerad) * 4;
        const v = 1;
        const yv = Math.sqrt(v * v - xv * xv);
        // console.log(xv, yv)
        //add the velocities together
        // const v = Math.sqrt(xv * xv + yv * yv);
        //make ball elem
        const ball = document.createElement("div");


        //make ball obj
        const ballobj = new balltypes[BALLTYPE](ball)

        const speed = 8
        ballobj.xv = xv * speed;
        ballobj.yv = yv * speed;
        // console.log(ballobj.xv, ballobj.yv)
        if (ballsused > 0) {
            finalScore -= 500;
            updateScore();
        }
        ballsused++;
        document.getElementById("ballcounter").innerHTML = ballsused;
    }
    dragging = false;

}
function startarrow(event){
    const arrow = document.createElement("div")
    arrow.id = "arrow"
    document.body.appendChild(arrow)
    //middle of the screen
    arrow.style.left = window.innerWidth/2 + "px";
    arrow.style.top = 0;
}

// ball = new Ball(document.getElementById("ball"))
// const ball = document.createElement("div")
// ball.className = "ball"
//
// objs.push(new Ball(ball))
function main(){
    if(time==null){
        milis ??= 0;
    }else{
        milis = performance.measure("timer", "start").duration;
    }
    const seconds = Math.floor(milis / 1000)
    const minutes = Math.floor(seconds / 60)
    timer.innerText = String(minutes).padStart(2, '0') + ":" + String(seconds%60).padStart(2, '0') + ":" + String(Math.round(milis)%1000).padStart(3, '0')
    for (const obj of walls){
        obj.update();
        obj.draw();
    }
    for (const obj of objs){
        obj.update();
        obj.draw();
    }
}

let dragging = false;
window.onmousemove = function(event) {

    if (dragging) {
        if(BALLTYPE === "wall"){
            const wall = walls[walls.length-1]
            wall.w = event.clientX - startpos.clientX
            wall.h = event.clientY - startpos.clientY
        }
    }
    else{
        const arrow = document.getElementById("arrow")
        facing(arrow, event.clientX, event.clientY, 90)
    }
}

function facing(elem,x=0,y=0,offset=0){
    const ex = parseInt(window.getComputedStyle(elem).left)
    const ey = parseInt(window.getComputedStyle(elem).top)
    // elem.style.height = Math.min(100,Math.sqrt(Math.pow(parseInt(elem.style.top)-y,2) + Math.pow(parseInt(elem.style.left) - x,2))) + "px";
    elem.style.height = "100px"
    elem.style.rotate = Math.atan2(ey - y, ex - x) * 180 / Math.PI + offset + "deg"
}
function resetLevel() {
    objs = [];
    const balls = document.getElementsByClassName("ball")
    let balls2 = Array.from(balls)
    for (const ball of balls2) {
        ball.remove()
    }

    walls.map(elem=>{
        elem.elem.remove();
    })
    walls = []
    time = null;
    milis = 0;
    finalScore = 0;
    ballsused = 0;
    updateScore();
    document.getElementById("ballcounter").innerText = "0";
}
document.getElementById("reset").addEventListener("click", function(event) {
    resetLevel();
})

// document.getElementById("balltype").addEventListener("change", function(event) {
//     BALLTYPE = event.target.value;
// })

addEventListener("selectstart", event => event.preventDefault());

startarrow()


function generatePegs(amount=15){
    let space = window.innerWidth/amount
    space -= space / 10
    for (let i = 0; i < amount; i++) {
        walls.push(new Peg(space + i*space,500,30,20));
        walls.push(new Bounce(i*space+space/2,400,30,20));
        walls.push(new Peg(space + i*space,300,30,20));
    }
    for (let i = 0; i < amount/2; i++) {
        walls.push(new MovingPeg(4*space + i * space, 200, 30, 20, undefined, 0,50,(360/(amount/2+1))*i,(180/(amount/2))*i));
    }
}

function exportLevel(){
    let exportstring = JSON.stringify(walls)
    localStorage.setItem("peggle.mylevel",exportstring);
    console.log(exportstring);
    return exportstring;

}

function importLevel(){

    // let level = exportLevel()
    let level;
    level = localStorage.getItem("peggle.mylevel");
    level ??= "[\"Peg(x=92.16,y=500,w=30,h=20,score=100)\",\"Bounce(x=46.08,y=400,w=30,h=20)\",\"Peg(x=92.16,y=300,w=30,h=20,score=100)\",\"Peg(x=184.32000000000002,y=500,w=30,h=20,score=100)\",\"Bounce(x=138.24,y=400,w=30,h=20)\",\"Peg(x=184.32000000000002,y=300,w=30,h=20,score=100)\",\"Peg(x=276.48,y=500,w=30,h=20,score=100)\",\"Bounce(x=230.40000000000003,y=400,w=30,h=20)\",\"Peg(x=276.48,y=300,w=30,h=20,score=100)\",\"Peg(x=368.64000000000004,y=500,w=30,h=20,score=100)\",\"Bounce(x=322.56,y=400,w=30,h=20)\",\"Peg(x=368.64000000000004,y=300,w=30,h=20,score=100)\",\"Peg(x=460.80000000000007,y=500,w=30,h=20,score=100)\",\"Bounce(x=414.72,y=400,w=30,h=20)\",\"Peg(x=460.80000000000007,y=300,w=30,h=20,score=100)\",\"Peg(x=552.96,y=500,w=30,h=20,score=100)\",\"Bounce(x=506.88000000000005,y=400,w=30,h=20)\",\"Peg(x=552.96,y=300,w=30,h=20,score=100)\",\"Peg(x=645.12,y=500,w=30,h=20,score=100)\",\"Bounce(x=599.0400000000001,y=400,w=30,h=20)\",\"Peg(x=645.12,y=300,w=30,h=20,score=100)\",\"Peg(x=737.2800000000001,y=500,w=30,h=20,score=100)\",\"Bounce(x=691.2000000000002,y=400,w=30,h=20)\",\"Peg(x=737.2800000000001,y=300,w=30,h=20,score=100)\",\"Peg(x=829.44,y=500,w=30,h=20,score=100)\",\"Bounce(x=783.3600000000001,y=400,w=30,h=20)\",\"Peg(x=829.44,y=300,w=30,h=20,score=100)\",\"Peg(x=921.6,y=500,w=30,h=20,score=100)\",\"Bounce(x=875.5200000000001,y=400,w=30,h=20)\",\"Peg(x=921.6,y=300,w=30,h=20,score=100)\",\"Peg(x=1013.7600000000001,y=500,w=30,h=20,score=100)\",\"Bounce(x=967.6800000000002,y=400,w=30,h=20)\",\"Peg(x=1013.7600000000001,y=300,w=30,h=20,score=100)\",\"Peg(x=1105.92,y=500,w=30,h=20,score=100)\",\"Bounce(x=1059.8400000000001,y=400,w=30,h=20)\",\"Peg(x=1105.92,y=300,w=30,h=20,score=100)\",\"Peg(x=1198.0800000000002,y=500,w=30,h=20,score=100)\",\"Bounce(x=1152,y=400,w=30,h=20)\",\"Peg(x=1198.0800000000002,y=300,w=30,h=20,score=100)\",\"Peg(x=1290.2400000000002,y=500,w=30,h=20,score=100)\",\"Bounce(x=1244.16,y=400,w=30,h=20)\",\"Peg(x=1290.2400000000002,y=300,w=30,h=20,score=100)\",\"Peg(x=1382.4000000000003,y=500,w=30,h=20,score=100)\",\"Bounce(x=1336.3200000000002,y=400,w=30,h=20)\",\"Peg(x=1382.4000000000003,y=300,w=30,h=20,score=100)\",\"MovingPeg(x=368.64000000000004,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=0,yo=0)\",\"MovingPeg(x=460.80000000000007,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=42.35294117647059,yo=24)\",\"MovingPeg(x=552.96,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=84.70588235294117,yo=48)\",\"MovingPeg(x=645.1200000000001,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=127.05882352941177,yo=72)\",\"MovingPeg(x=737.2800000000001,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=169.41176470588235,yo=96)\",\"MovingPeg(x=829.44,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=211.76470588235293,yo=120)\",\"MovingPeg(x=921.6000000000001,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=254.11764705882354,yo=144)\",\"MovingPeg(x=1013.7600000000002,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=296.4705882352941,yo=168)\",\"MultiBall(x=500,y=250,w=30,h=20,score=500)\",\"FloorPeg(x=500,y=100,w=30,h=20,score=500)\",\"Wall(x=1000,y=550,w=100,h=20)\",\"Wall(x=890,y=550,w=100,h=20)\",\"Wall(x=1110,y=550,w=100,h=20)\",\"Bounce(x=800,y=550,w=70,h=20)\",\"KeyPeg(x=1000,y=150,w=30,h=20,score=500,targets= [walls[55],walls[56],walls[57]],color=\\\"#40ff00\\\")\",\"FloorPeg(x=1040,y=580,w=30,h=20,score=500)\",\"Wall(x=-100,y=0,w=110,h=722)\",\"Wall(x=1526,y=0,w=100,h=722)\",\"Wall(x=0,y=-10,w=1536,h=15)\"]"
    resetLevel();
    level = JSON.parse(level);
    for (const levelElement of level) {
        let wall = eval("new " + levelElement);
        walls.push(wall);
    }
    console.log(walls)

}

generatePegs()
walls.push(new MultiBall(500,250,30,20));
walls.push(new FloorPeg(500,100,30,20));
key1wall = new Wall(1000,550,100,20)
key1wall2 = new Wall(890,550,100,20)
key1wall3 = new Wall(1110,550,100,20)
walls.push(key1wall);
walls.push(key1wall2);
walls.push(key1wall3);
walls.push(new Bounce(800,550,70,20))
// walls.push(new KeyPeg(1000,150,30,20,[key1wall,key1wall2,key1wall3]));
walls.push(new KeyPeg(1000,150,30,20,undefined,[key1wall,key1wall2,key1wall3],"#40ff00"));
walls.push(new FloorPeg(1040,580,30,20));

walls.push(new Wall(x=-100,y=0,w=102,h=window.innerHeight)); //left
walls.push(new Wall(window.innerWidth-2,0,100,window.innerHeight)); //right
// walls.push(new Wall(0,window.innerHeight-10,window.innerWidth,10)); //bottom
walls.push(new Wall(0,-10,window.innerWidth,12)); //top


console.log(walls);
updateScore();
setInterval(main,5);

//TODO ghost blocks to toggle?
//TODO slime block to reduce speed?
//TODO bomb ball?
//TODO glass blocks to shatter?
//TODO somehow limit num of balls that fits gameplay style
//TODO timer starts when clicking on buttons
//DONE breaking a keyblock as last block calls the checkwin twice