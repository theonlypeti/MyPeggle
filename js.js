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



function updateScore(){
    // score = Math.max(score, 0); //this encourages spamming the balls at the beginning, might need to implement some antispam
    // scoreElem.innerHTML = String(finalScore).padStart(5, '0')

    const res = finalScore.toLocaleString('en', {minimumIntegerDigits:5,useGrouping:false});
    scoreElem.innerHTML = res
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
    document.getElementById("tutorial").style.display = "none";
    if(event.clientY > 30){
        if(time==null){
            time = performance.mark("start");
        }
        startpos = event
        dragging = true;
        if(BALLTYPE === "wall"){
            const wall = document.createElement("div")
            wall.className = "wall"
            let x = event.clientX; let y = event.clientY
            wallobj = new balltypes[BALLTYPE](x,y,0,0,wall)
            walls.push(wallobj);
            document.body.insertBefore(wall,  document.getElementById("anchor"))
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
        walls.push(new Bounce(space + i*space,500,30,20));
        walls.push(new Peg(i*space+space/2,400,30,20));
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
//DONE timer starts when clicking on buttons
//DONE breaking a keyblock as last block calls the checkwin twice
//TODO multiple level loading and saving
//TODO chunking
//DONE move classes out of this file lol
//DONE breaking pegs, then breaking the same ones with keypegs as targets activates them a second time (gives score, multi spawns balls)