// let classes = [Wall,Peg,KeyPeg,FloorPeg,MovingPeg,MultiBall]; //this needs to be populated with all the classes lower in the code
let walls = [];
let GRAVITY = 0.07;
let editoroptions = new Map([["w",30],["h",20]]);
let editorhelp = new Map([["targets","wall indexes, use commas"],["color","#AABBCC"],["xo","movement phase offset"],["xd","movement distance delta"]])
let modal = document.getElementById("editormodal");
let forbidden_attrs = ["x", "y","elem","origX","origY"]; //attrs that should not be set manually and therefore should not appear in the editor
let startpos = null; //event, for where the dragging has started
let paused = true;
// let WALLTYPE = "wall";


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


class Wall{
    constructor(x,y,w,h,elem) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.elem = elem ?? document.createElement("div");
        document.body.insertBefore(this.elem, document.getElementById("anchor"));
        this.elem.classList = ["wall"]
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

    remove(){
        this.elem.remove();
        walls.splice(walls.indexOf(this), 1);
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

class Peg extends Wall {
    constructor(x, y, w, h, score, elem) {
        super(x, y, w, h, elem);
        // if(score == null){
        //     this.score = 100;
        // }
        // else{
        //     this.score = score
        // }

        this.score = score ?? 100;
        this.elem.classList.add("peg")
        this.elem.style.width = this.w + "px";
        this.elem.style.height = this.h + "px";
    }

    collision(ball) {
        if (super.collision(ball)) {
            this.break();
            return true
        }
        return false
    }

    break() {
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

class MovingPeg extends Peg{
    constructor(x, y, w, h, score=200, xd=0, yd=0, xo=0,yo=0, elem=null) {
        console.log(x,y,xd,yd)
        super(x,y,w,h,score,elem);
        console.log(this.x,this.y)

        // this.x = x;
        // this.y = y;
        this.origX = x;
        this.origY = y;
        this.xd = xd;
        this.yd = yd;
        this.xo = xo;
        this.yo = yo;
        console.log(this)

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
        super.break();
        for (const target of this.targets) {
            target.break();
        }
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

window.onmousedown = function(event) {
    document.getElementById("tutorial").style.visibility = "hidden"
    if(modal.open){return}
    let wallobj;
    if (event.clientY > 60) {
        startpos = event
        dragging = true;
        if (true) {
            let x = event.clientX;
            let y = event.clientY
            const wt = walltypes.get(WALLTYPE);
            let w = editoroptions.get("w");
            let h = editoroptions.get("h");
            wallobj = new wt(x, y, w, h)

            for (const key of Object.keys(wallobj)) {

                if (forbidden_attrs.includes(key)) {
                    continue
                } else if(key === "targets"){
                    let opt = editoroptions.get(key)
                    if (opt != null){
                        opt = opt.split(",")
                        opt = opt.map(x => {
                            return walls[Number(x)];
                        })
                        wallobj[key] = opt;
                    }
                }
                else {
                    let opt = editoroptions.get(key)
                    if (opt != null){
                        wallobj[key] = opt;
                        console.log("setting", key)
                    }
                }
            }
            // wallobj = new wt(x,y,0,0)
            walls.push(wallobj);
            console.log(walls)
        } else {
            // startarrow(event)
        }
    }
}

window.onmouseup = function(event) {
    if(!dragging){return}
    if(modal.open){return}
    if(walls.length>0){
        let last = walls[walls.length-1];
        if(last.w < 30 || last.h < 20){
            last.remove()

        }
    }
    if(event.clientY < 30){
        return
    }

    dragging = false;

}

function main(){
    for (const obj of walls){
        if(!paused){
            obj.update();
        }
        obj.draw();
    }
}

let dragging = false;
const moveTreshold = 15;
const coords = document.getElementById("coords")
coords.style.color = "#EEEEEE"
window.onmousemove = function(event) {

    coords.innerText = "X: " + event.clientX + ", Y: "+ event.clientY
    if (dragging) {
        const xd = Math.abs(event.clientX - startpos.clientX)
        const yd = Math.abs(event.clientY - startpos.clientY);
        if(xd > moveTreshold || yd > moveTreshold){
            if(walls.length>0){
                const wall = walls[walls.length-1]

                wall.x = Math.min(startpos.x, event.clientX);
                wall.y = Math.min(startpos.y, event.clientY);

                wall.w = xd
                wall.h = yd

            }
        }
    }
    else{

    }

}

function checkWin(){

}

function facing(elem,x=0,y=0,offset=0){
    const ex = parseInt(window.getComputedStyle(elem).left)
    const ey = parseInt(window.getComputedStyle(elem).top)
    // elem.style.height = Math.min(100,Math.sqrt(Math.pow(parseInt(elem.style.top)-y,2) + Math.pow(parseInt(elem.style.left) - x,2))) + "px";
    elem.style.height = "100px"
    elem.style.rotate = Math.atan2(ey - y, ex - x) * 180 / Math.PI + offset + "deg"
}
function resetLevel() {
    walls.map(elem=>{
        elem.elem.remove();
    })
    walls = []

}
document.getElementById("reset").addEventListener("click", function(event) {
    resetLevel();
})

document.getElementById("walltype").addEventListener("change", function(event) {
    WALLTYPE = event.target.value;
})

document.getElementById("pause").onclick = function (event) {
    paused = !paused;
    document.getElementById("pause").innerText = paused?"Unpause":"Pause  "

}

modal.onclose = function (event){
    for (const child of Array.from(modal.children)) {
        child.remove();
    }
}
document.getElementById("editoroptions").addEventListener("click", function (event){

    let wt = walltypes.get(WALLTYPE)
    for (const attr of Object.keys(new wt())) {
        if (forbidden_attrs.includes(attr)){
            continue;
        }
        let elem = document.createElement("div")
        elem.innerHTML = attr;
        modal.appendChild(elem)
        let input = document.createElement("input");
        input.type = "text";
        input.value = editoroptions.get(attr) ?? ""
        input.placeholder = editorhelp.get(attr) ?? ""
        input.onchange = function (event){
            editoroptions.set(attr, event.target.value)
            console.log(editoroptions)
        }
        modal.appendChild(input)

    }
    let closebt = document.createElement("button")
    closebt.innerText = "OK";
    closebt.onclick = function (event){
        modal.close();
    }

    modal.appendChild(document.createElement("br"))
    modal.appendChild(closebt)
    modal.showModal();

    // modal.close();

})

addEventListener("selectstart", event => event.preventDefault());

let classes = [Wall,Peg,KeyPeg,FloorPeg,MovingPeg,MultiBall,Bounce];
let wt = document.getElementById("walltype")
const walltypes =  new Map(classes.map( item => [new item().constructor.name.toLowerCase(), item]));
// walls = [];
walltypes.forEach((v,k)=>{ //why are k,v flipped?
    const opt = document.createElement("option");
    opt.value = k;
    opt.innerHTML = new v().constructor.name
    wt.appendChild(opt);
})
let WALLTYPE = document.getElementById("walltype").value;

function exportLevel(){
    let exportstring = JSON.stringify(walls)
    console.log(exportstring);
    localStorage.setItem("peggle.mylevel",exportstring);
    return exportstring;

}

function importLevel(){

    // let level = exportLevel()
    // let level = "[\"Peg(x=92.16,y=500,w=30,h=20,score=100)\",\"Bounce(x=46.08,y=400,w=30,h=20)\",\"Peg(x=92.16,y=300,w=30,h=20,score=100)\",\"Peg(x=184.32000000000002,y=500,w=30,h=20,score=100)\",\"Bounce(x=138.24,y=400,w=30,h=20)\",\"Peg(x=184.32000000000002,y=300,w=30,h=20,score=100)\",\"Peg(x=276.48,y=500,w=30,h=20,score=100)\",\"Bounce(x=230.40000000000003,y=400,w=30,h=20)\",\"Peg(x=276.48,y=300,w=30,h=20,score=100)\",\"Peg(x=368.64000000000004,y=500,w=30,h=20,score=100)\",\"Bounce(x=322.56,y=400,w=30,h=20)\",\"Peg(x=368.64000000000004,y=300,w=30,h=20,score=100)\",\"Peg(x=460.80000000000007,y=500,w=30,h=20,score=100)\",\"Bounce(x=414.72,y=400,w=30,h=20)\",\"Peg(x=460.80000000000007,y=300,w=30,h=20,score=100)\",\"Peg(x=552.96,y=500,w=30,h=20,score=100)\",\"Bounce(x=506.88000000000005,y=400,w=30,h=20)\",\"Peg(x=552.96,y=300,w=30,h=20,score=100)\",\"Peg(x=645.12,y=500,w=30,h=20,score=100)\",\"Bounce(x=599.0400000000001,y=400,w=30,h=20)\",\"Peg(x=645.12,y=300,w=30,h=20,score=100)\",\"Peg(x=737.2800000000001,y=500,w=30,h=20,score=100)\",\"Bounce(x=691.2000000000002,y=400,w=30,h=20)\",\"Peg(x=737.2800000000001,y=300,w=30,h=20,score=100)\",\"Peg(x=829.44,y=500,w=30,h=20,score=100)\",\"Bounce(x=783.3600000000001,y=400,w=30,h=20)\",\"Peg(x=829.44,y=300,w=30,h=20,score=100)\",\"Peg(x=921.6,y=500,w=30,h=20,score=100)\",\"Bounce(x=875.5200000000001,y=400,w=30,h=20)\",\"Peg(x=921.6,y=300,w=30,h=20,score=100)\",\"Peg(x=1013.7600000000001,y=500,w=30,h=20,score=100)\",\"Bounce(x=967.6800000000002,y=400,w=30,h=20)\",\"Peg(x=1013.7600000000001,y=300,w=30,h=20,score=100)\",\"Peg(x=1105.92,y=500,w=30,h=20,score=100)\",\"Bounce(x=1059.8400000000001,y=400,w=30,h=20)\",\"Peg(x=1105.92,y=300,w=30,h=20,score=100)\",\"Peg(x=1198.0800000000002,y=500,w=30,h=20,score=100)\",\"Bounce(x=1152,y=400,w=30,h=20)\",\"Peg(x=1198.0800000000002,y=300,w=30,h=20,score=100)\",\"Peg(x=1290.2400000000002,y=500,w=30,h=20,score=100)\",\"Bounce(x=1244.16,y=400,w=30,h=20)\",\"Peg(x=1290.2400000000002,y=300,w=30,h=20,score=100)\",\"Peg(x=1382.4000000000003,y=500,w=30,h=20,score=100)\",\"Bounce(x=1336.3200000000002,y=400,w=30,h=20)\",\"Peg(x=1382.4000000000003,y=300,w=30,h=20,score=100)\",\"MovingPeg(x=368.64000000000004,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=0,yo=0)\",\"MovingPeg(x=460.80000000000007,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=42.35294117647059,yo=24)\",\"MovingPeg(x=552.96,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=84.70588235294117,yo=48)\",\"MovingPeg(x=645.1200000000001,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=127.05882352941177,yo=72)\",\"MovingPeg(x=737.2800000000001,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=169.41176470588235,yo=96)\",\"MovingPeg(x=829.44,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=211.76470588235293,yo=120)\",\"MovingPeg(x=921.6000000000001,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=254.11764705882354,yo=144)\",\"MovingPeg(x=1013.7600000000002,y=200,w=30,h=20,score=200,xd=0,yd=50,xo=296.4705882352941,yo=168)\",\"MultiBall(x=500,y=250,w=30,h=20,score=500)\",\"FloorPeg(x=500,y=100,w=30,h=20,score=500)\",\"Wall(x=1000,y=550,w=100,h=20)\",\"Wall(x=890,y=550,w=100,h=20)\",\"Wall(x=1110,y=550,w=100,h=20)\",\"Bounce(x=800,y=550,w=70,h=20)\",\"KeyPeg(x=1000,y=150,w=30,h=20,score=500,targets= [walls[55],walls[56],walls[57]],color=\\\"#40ff00\\\")\",\"FloorPeg(x=1040,y=580,w=30,h=20,score=500)\",\"Wall(x=-100,y=0,w=110,h=722)\",\"Wall(x=1526,y=0,w=100,h=722)\",\"Wall(x=0,y=-10,w=1536,h=15)\"]"
    let level = localStorage.getItem("peggle.mylevel");
    resetLevel();
    level = JSON.parse(level);
    for (const levelElement of level) {
        let wall = eval("new " + levelElement);
        walls.push(wall);
    }
    console.log(walls)

}
walls.push(new Wall(x=-100,y=0,w=102,h=window.innerHeight)); //left
walls.push(new Wall(window.innerWidth-2,0,100,window.innerHeight)); //right
walls.push(new Wall(0,-10,window.innerWidth,12)); //top

console.log(walls);
setInterval(main,5);

//TODO edit
//TODO move (same thing ig)
//TODO delete
