// let classes = [Wall,Peg,KeyPeg,FloorPeg,MovingPeg,MultiBall]; //this needs to be populated with all the classes lower in the code
let walls = [];
let GRAVITY = 0.07;
let editoroptions = new Map([["w",30],["h",20]]);
let editorhelp = new Map([["targets","wall indexes, use commas"],["color","#AABBCC"],["xo","movement phase offset"],["xd","movement distance delta"]])
let modal = document.getElementById("editormodal");
let forbidden_attrs = ["x", "y","elem","origX","origY"]; //attrs that should not be set manually and therefore should not appear in the editor
let startpos = null; //event, for where the dragging has started
let paused = true;
let gridsnapbutton = document.getElementById("gridsnap");
gridsnapbutton.style.backgroundColor = "#eeaaaa"
let gridsnap = false;
const editormodes = ["Build","Select"]
let editormode = "Build"
let selectedWalls = [];
// let WALLTYPE = "wall";

window.onmousedown = function(event) {
    document.getElementById("tutorial").style.visibility = "hidden"
    if(modal.open){return}
    let wallobj;
    if (event.clientY > 60) {
        startpos = event
        dragging = true;
        if (editormode==="Build") {
            let x = event.clientX;
            let y = event.clientY;
            if(gridsnap){
                x = Math.round(x/10)*10;
                y = Math.round(y/10)*10;
            }
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
                    }
                }
            }
            // wallobj = new wt(x,y,0,0)
            walls.push(wallobj);
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
        }else{
            walls.filter(wall=>{return wall instanceof MovingPeg}).map(wall=>{
                wall.x = wall.origX;
                wall.y = wall.origY;
            })
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
        let xd = Math.abs(event.clientX - startpos.clientX)
        let yd = Math.abs(event.clientY - startpos.clientY);
        if(editormode==="Build"){
            if(xd > moveTreshold || yd > moveTreshold){
                if(walls.length>0){
                    const wall = walls[walls.length-1]

                    let x = Math.min(startpos.x, event.clientX);
                    let y = Math.min(startpos.y, event.clientY);

                    if(gridsnap){
                        x = Math.round(x/10)*10;
                        y = Math.round(y/10)*10;
                        xd = Math.round(xd/10)*10;
                        yd = Math.round(yd/10)*10;

                    }

                    wall.x = x;
                    wall.y = y;

                    wall.w = xd
                    wall.h = yd

                }
            }
        }
    }
    else{

    }

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

function cycle(variable, collection) {
    return collection[(collection.indexOf(variable)+1) % collection.length];
}

document.getElementById("editormode").addEventListener("click",function(event){
    editormode = cycle(editormode, editormodes);
    document.getElementById("editormode").innerText = editormode;
    if (editormode !== "edit"){
        handleSelection([]);
    }

})


gridsnapbutton.addEventListener("click", function(event) {
    gridsnap = !gridsnap;
    gridsnapbutton.style.backgroundColor = gridsnap? "#aaeeaa":"#eeaaaa"
})

document.getElementById("walltype").addEventListener("change", function(event) {
    WALLTYPE = event.target.value;
    if(WALLTYPE==="keypeg"){
        for (const wall of walls) {
            wall.elem.innerHTML = walls.indexOf(wall);
        }
    }
    else{
        for (const wall of walls) {
            wall.elem.innerHTML = "";
        }
    }
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

    if(editormode === "Build"){
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
            }
            modal.appendChild(input)
        }
    }else if(editormode === "Select"){
        if(selectedWalls.length>0){
            let wt = selectedWalls[0];
            for (const attr of Object.keys(wt)) { //TODO ponder about whether to include x,y ; cuz of movingpeg+ no just make a move mode
                if (forbidden_attrs.includes(attr)){
                    continue;
                }
                console.log(attr)
                let elem = document.createElement("div")
                elem.innerHTML = attr;
                modal.appendChild(elem)
                let input = document.createElement("input");
                input.type = "text";
                input.value = wt[attr] ?? ""
                input.placeholder = editorhelp.get(attr) ?? ""
                input.onchange = function (event){
                    wt[attr]=event.target.value
                }
                modal.appendChild(input)
            }
        }

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

let classes = [Wall,Peg,KeyPeg,FloorPeg,MovingPeg,MultiBall,Bounce,SlimeWall];
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

function handleSelection(elems){
    for (const elem of selectedWalls) {
        elem.elem.classList.remove("selected")
    }
    selectedWalls = elems;
    for (const elem of selectedWalls) {
        elem.elem.classList.add("selected")
    }
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

//DONE edit
//TODO move (same thing ig)
//TODO delete
//DONE show wall indeces on walls when KeyPeg is selected
//TODO selection options: select all, select all that are selected from dropdown, selection boolean operations
//DONE snapping to grid?
//TODO better keypeg target input - maybe use selected
