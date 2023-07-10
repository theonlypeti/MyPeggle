const classes = [Wall,Peg,KeyPeg,FloorPeg,MovingPeg,MultiBall,Bounce,SlimeWall]; //list of all wall classes to be included in the editor
let walls = [];
let GRAVITY = 0.07;
let editoroptions = new Map([["w",30],["h",20]]);
let editorhelp = new Map([["targets","wall indexes, use commas"],["color","#AABBCC"],["xo","movement phase offset"],["xd","movement distance delta"]])
const modal = document.getElementById("editormodal");
const helpmodal = document.getElementById("helpmodal");
const forbidden_attrs = ["x", "y","elem","origX","origY"]; //attrs that should not be set manually and therefore should not appear in the editor
let startpos = null; //event, for where the dragging has started
let paused = true;
const deselbtn = document.getElementById("desel");
const walltypesel = document.getElementById("walltype");
const deletebutton = document.getElementById("delete");
const gridsnapbutton = document.getElementById("gridsnap");
gridsnapbutton.style.backgroundColor = "#eeaaaa"
let gridsnap = false;
const editormodes = ["Build","Select","Move"]
let editormode = editormodes[0];
let selectedWalls = [];
let xspacing = 0;
let yspacing = 0;

const buildhelp = "-Click to place a block. Hold and drag to change shape.\n" +
    "-Hold shift to lock the dimensions to a 1:1 ratio.\n" +
    "-Hold alt to place multiple blocks in a line. By holding alt you pick a direction and spacing between your first and all consecutive blocks,\n"+
    "then by dragging you specify the amount of blocks to place.\n" +
    "-Use the Wall type dropdown to change the block type.\n" +
    "-Use the Options to change the placed block's attributes.\n" +
    "-Use the Pause/Unpause button to start/stop simulating the moving pegs' movement pattern.\n" +
    "-Use the Export button to save a level, Import to load it.\n" +
    "-The Clear button deletes all blocks.\n"

const selecthelp = "-Click and drag to select multiple blocks, " +
    "or just click on a block to select it.\n" +
    "-By holding Shift you can add to an existing selection.\n" +
    "-By holding Alt you can remove from an existing selection.\n" +
    "-By holding both Shift and Alt you can make a boolean intersection between the existing selection and the new selection.\n" +
    "-The Select all button selects all blocks, Deselect discards the selection.\n" +
    "-The Select all of type button selects all blocks of the same type as the block type selected in the dropdown menu.\n" +
    "-The Invert selection selects all blocks not currently in your selection.\n" +
    "-Shift and Alt modifiers work with these buttons as well.\n" +
    "-Use the Delete button to delete all selected blocks.\n" +
    "-Use the Options to change the selected blocks' attributes.\n" +
    "-If multiple blocks are selected, the options will only show attributes that are present in all the selected blocks.\n"

const movehelp = "-Click and drag to move all selected blocks.\n" +
    "-By holding alt, you can duplicate all selected blocks to the new location.\n" +
    "-Snap to grid option will snap any block's size and position to the grid.\n"

const help = new Map([["Build",buildhelp],["Select",selecthelp],["Move",movehelp]]);
const helpbtn = document.getElementById("openhelp");

helpbtn.onclick = function(){

    helpmodal.innerText = help.get(editormode);
    let buttonElement = document.createElement("button");
    buttonElement.innerText = "Close";
    buttonElement.onclick = function(){
        helpmodal.close();
    }
    helpmodal.appendChild(buttonElement);
    helpmodal.showModal();
}


window.onmousedown = function(event) {
    document.getElementById("tutorial").style.visibility = "hidden"
    if(modal.open || helpmodal.open){return}
    let wallobj;
    if (event.clientY > 60) {
        startpos = event

        const last = walls[walls.length-1];
        if(event.altKey && dragging===false && editormode==="Build"){
            if(last instanceof MovingPeg){
                xspacing = event.clientX - last.origX; //TODO think of a better way to save moving walls
                yspacing = event.clientY - last.origY;
            }
            else{
                xspacing = event.clientX - last.x;
                yspacing = event.clientY - last.y;
            }
            dragging = true;
            return  //this is to prevent the first wall from being placed

        }
        dragging = true;
        if (editormode==="Build" || (event.altKey && last instanceof BoundaryWall)) {

            let x = handleSnap(event.clientX);
            let y = handleSnap(event.clientY);

            const wt = walltypes.get(WALLTYPE);
            let w = editoroptions.get("w");
            let h = editoroptions.get("h");
            wallobj = new wt(x, y, w, h)

            for (const key of Object.keys(wallobj)) { //TODO extract to function

                if (forbidden_attrs.includes(key)) {
                    continue
                } else if(key === "targets"){
                    let opt = editoroptions.get(key)
                    if (opt != null){
                        opt = opt.split(",")
                        opt = opt.map(x => {
                            return walls[parseInt(x)];
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
        } else if(editormode==="Select") {
            const a = document.createElement("div");
            a.classList.add("ghostwall");
            document.body.insertBefore(a, anchor);
        }
    }
}

window.onmouseup = function(event) {
    if(!dragging){return}
    if(modal.open){return}
    if(event.clientY < 30){return}
    if(editormode==="Build"){
        if(event.altKey) {
            let last = walls[walls.length - 1];
            last.elem.classList.remove("selected")
            let wallstoplace = $(".ghostwall")
            for (const wall of wallstoplace) {

                let x = handleSnap(parseInt(wall.style.left));
                let y = handleSnap(parseInt(wall.style.top));

                const wt = walltypes.get(WALLTYPE);
                let w =  parseInt(wall.style.width);
                let h =  parseInt(wall.style.height);
                let wallobj = new wt(x, y, w, h)

                for (const key of Object.keys(wallobj)) {

                    if (forbidden_attrs.concat(["w","h"]).includes(key)) { //w and h are taken from the ghostwall
                        continue
                    } else if (key === "targets") {
                        let opt = editoroptions.get(key)
                        if (opt != null) {
                            opt = opt.split(",")
                            opt = opt.map(x => {
                                return walls[Number(x)];
                            })
                            wallobj[key] = opt;
                        }
                    } else {
                        let opt = editoroptions.get(key)
                        if (opt != null) {
                            wallobj[key] = opt;
                        }
                    }
                }
                walls.push(wallobj);
            }
        }
        if(walls.length>0){
            let last = walls[walls.length-1];
            if(last.w < 30 || last.h < 20){
                last.remove()
            }
        }
    }
    else if(editormode==="Select"){

        const gw = $(".ghostwall")[0]
        const x = parseInt(gw.style.left);
        const y = parseInt(gw.style.top)
        const xb = x + parseInt(gw.style.width)
        const yb = y + parseInt(gw.style.height)
        gw.remove();

        if(Math.abs(xb - x)<5 || Math.abs(yb - y) < 5 ){
            dragging = false;
            return
        }

        if([x,y,xb,yb].includes(NaN)){
            dragging = false;
            return
        }

        handleSelection(walls.filter(wall => {
            return wall.x >= x && wall.x + parseInt(wall.w) <= xb && wall.y >= y && wall.y + parseInt(wall.h) <= yb //when changing options, w and h can be strings
        }), event);
    }


    else if(editormode==="Move"){
        $(".ghostwall").remove();
        for (let wall of selectedWalls) {
            const xd = event.clientX - startpos.clientX;
            const yd = event.clientY - startpos.clientY;

            let newx;
            let newy;
            if(wall instanceof MovingPeg){
                newx = wall.origX + xd;
                newy = wall.origY + yd;
            }else{
                newx = wall.x + xd;
                newy = wall.y + yd;
            }

            if(event.altKey){ //duplication
                wall = eval("new " + (JSON.stringify(wall).replace(/['"]+/g, '')));
                walls.push(wall);
            }

            wall.x = handleSnap(newx);
            wall.y = handleSnap(newy)
            if(wall instanceof MovingPeg){
                wall.origX = handleSnap(newx);
                wall.origY = handleSnap(newy);
            }

        }
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

function handleSnap(number) {
    return Math.round(number / (gridsnap?10:1)) * (gridsnap?10:1);
}

window.onmousemove = function(event) {

    coords.innerText = "X: " + event.clientX + ", Y: "+ event.clientY
    let lastwall = walls[walls.length-1];
    if (dragging) {
        // lastwall.elem.classList.remove("selected")
        let xad = Math.abs(event.clientX - startpos.clientX)
        let yad = Math.abs(event.clientY - startpos.clientY);

        let x = Math.min(startpos.x, event.clientX);
        let y = Math.min(startpos.y, event.clientY);

        if(event.shiftKey && editormode==="Build" && !event.altKey){
            const maxad = Math.max(xad, yad);
            xad = maxad;
            yad = maxad;

            //kinda janky but works

            if (startpos.x > event.clientX) {
                x = startpos.x - maxad;
            }
            if (startpos.y > event.clientY) {
                y = startpos.y - maxad;
            }
        }

        x = handleSnap(x)
        y = handleSnap(y)
        xad = handleSnap(xad)
        yad = handleSnap(yad)

        if(editormode==="Build" && !event.altKey){
            if(xad > moveTreshold || yad > moveTreshold){
                if(walls.filter(x=>{return !(x instanceof BoundaryWall)}).length>0){
                    const wall = lastwall

                    wall.x = x;
                    wall.y = y;

                    wall.w = xad
                    wall.h = yad

                }
            }
        }
        else if(editormode==="Select"){
            let gw = $(".ghostwall")[0]
            gw.style.width = xad + "px";
            gw.style.height = yad + "px";
            gw.style.left = x + "px";
            gw.style.top = y + "px";
        }

        else if(editormode==="Move"){
            $(".ghostwall").remove();
            for (const selectedWall of selectedWalls) {

                let a = document.createElement("div")
                a.classList.add("ghostwall");
                a.style.width = handleSnap(selectedWall.w) + "px"
                a.style.height = handleSnap(selectedWall.h) + "px"
                const left = selectedWall.x + event.clientX - startpos.clientX;
                const top = selectedWall.y + event.clientY - startpos.clientY;
                a.style.left = handleSnap(left) + "px"
                a.style.top = handleSnap(top) + "px"
                document.body.insertBefore(a,anchor);
            }

        }
    }
    if(event.altKey && editormode==="Build" && !(lastwall instanceof BoundaryWall)){
            if(dragging){
                const xd = event.clientX - startpos.clientX;
                const yd = event.clientY - startpos.clientY;
                $(".ghostwall").remove();
                let x= 0;
                let y = 0;
                if(xspacing===0 || yspacing===0){ //if user pressed alt while dragging, and no walls are present
                    return;
                }
                while(Math.abs(x) < Math.abs(xd) && Math.abs(y) < Math.abs(yd)){
                    let a = document.createElement("div")
                    a.classList.add("ghostwall");
                    a.style.width = lastwall.w + "px"
                    a.style.height = lastwall.h + "px"
                    a.style.left = startpos.x + x + "px"
                    a.style.top = startpos.y + y + "px"
                    document.body.insertBefore(a,anchor);
                    x+= xspacing
                    y+= yspacing // MUST NOT BE 0
                }
            }
            else{
                $(".ghostwall").remove();
                let a = document.createElement("div")
                a.classList.add("ghostwall");
                a.style.width = lastwall.w + "px"
                a.style.height = lastwall.h + "px"
                a.style.left = handleSnap(event.clientX) + "px"
                a.style.top = handleSnap(event.clientY) + "px"
                document.body.insertBefore(a,anchor);
                lastwall.elem.classList.add("selected")
            }
        }
    else if(editormode==="Build"){
        if(lastwall!=null){
            lastwall.elem.classList.remove("selected")
        }
        $(".ghostwall").remove();
    }

}

function resetLevel() {
    Array.from(walls).map(wall=>{
        wall.remove();
    })
    handleSelection([]);
}
document.getElementById("reset").addEventListener("click", function(event) {
    walls.filter(wall=>{return !(wall instanceof BoundaryWall)}).map(wall=>{
        wall.remove();
    })  //remove all walls except boundary walls
    handleSelection([]);
})

function cycle(variable, collection) {
    return collection[(collection.indexOf(variable)+1) % collection.length]; //cycles through collection
}

document.getElementById("editormode").addEventListener("click",function(event){
    editormode = cycle(editormode, editormodes);
    document.getElementById("editormode").innerText = editormode;
    if (editormode === "Build"){
        handleSelection([]);
        document.getElementById("selall").disabled = true;
        document.getElementById("seltype").disabled = true;
        document.getElementById("invertsel").disabled = true;
        deselbtn.disabled = true;
    }else{
        deselbtn.disabled = false;
        document.getElementById("selall").disabled = false;
        document.getElementById("seltype").disabled = false;
        document.getElementById("invertsel").disabled = false;

    }

})


gridsnapbutton.addEventListener("click", function(event) {
    gridsnap = !gridsnap;
    gridsnapbutton.style.backgroundColor = gridsnap? "#aaeeaa":"#eeaaaa"
})

walltypesel.addEventListener("change", function(event) {
    WALLTYPE = event.target.value;
    if(WALLTYPE==="KeyPeg"){
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

deselbtn.onclick = function (event) {
    handleSelection([]); //deselect all walls
}

document.getElementById("invertsel").onclick = function (event) {
    handleSelection(walls.filter(x=>{
        return !(selectedWalls.includes(x)) && !(x instanceof BoundaryWall)
    }), event); //deselect all walls
}

document.getElementById("selall").onclick = function (event) {
    handleSelection(walls.filter(wall=>{return !(wall instanceof BoundaryWall)})); //select all walls
}

document.getElementById("seltype").onclick = function (event) {
    handleSelection(walls.filter(wall=>{return (wall.constructor.name === WALLTYPE)}), event); //select all walls of the selected type
}

document.getElementById("seltype").onmouseenter = function (event) {
    walltypesel.classList.add("selected");
}

document.getElementById("seltype").onmouseleave = function (event) {
    walltypesel.classList.remove("selected");
}

deletebutton.onclick = function (event) {
    for (const wall of selectedWalls) {
        wall.remove();
    }
    handleSelection([], event);
}

modal.onclose = function (event){
    for (const child of Array.from(modal.children)) {
        child.remove();
    }
}
document.getElementById("editoroptions").addEventListener("click", function (event){

    if(editormode === "Build"){
        let wt = walltypes.get(WALLTYPE)                                //get the class of the selected wall type
        const title = document.createElement("div"); //create a title for the modal
        title.innerHTML = "New " + WALLTYPE + "'s attributes";              //set the title
        modal.appendChild(title)                                            //add the title to the modal
        for (const attr of Object.keys(new wt())) {                 //for each attribute of the selected wall type
            if (forbidden_attrs.includes(attr)){                            //if the attribute is forbidden
                continue;                                                   //skip it
            }
            let elem = document.createElement("div") //create a div for the attribute
            elem.innerHTML = attr;                                          //set the innerHTML of the div to the attribute name
            modal.appendChild(elem)                                             //add the div to the modal
            let input = document.createElement("input"); //create an input for the attribute
            input.type = "text";                                                //set the input type to text
            input.value = editoroptions.get(attr) ?? ""                         //set the input value to the current value of the attribute
            input.placeholder = editorhelp.get(attr) ?? ""                      //set the input placeholder to the help text for the attribute
            input.onchange = function (event){                      //when the input changes
                editoroptions.set(attr, event.target.value)                     //set the attribute to the input value
            }
            modal.appendChild(input) //add the input to the modal
        }
    }else if(editormode === "Select"){
        if(selectedWalls.length>0){
            let wt = selectedWalls;
                                                        //get common attributes of all selected walls
            let common = Object.keys(wt[0]);
            for (const wall of wt) {
                common = common.filter(x => Object.keys(wall).includes(x));
            }

            for (const attr of common) { //for each common attribute
                if (forbidden_attrs.includes(attr)){
                    continue;
                }
                let elem = document.createElement("div");
                elem.innerHTML = attr;
                modal.appendChild(elem)
                let input = document.createElement("input");
                input.type = "text";
                const vals = new Set(wt.map(x=>x[attr]));               //get the set of all values of the attribute
                let value = vals.size === 1? vals.values().next().value : ""; //if all values are the same, set the input value to that value, otherwise set it to nothing
                value = value===undefined?"":value; //values().next() returns undefined if the set is empty
                if(attr === "targets" && value != null && value!==""){
                    value = value.map(x=>walls.indexOf(x)).filter(x=>{return x!==-1}).join(",")
                }
                input.value = value; //if all values are the same, set the input value to that value, otherwise set it to nothing
                input.placeholder = editorhelp.get(attr) ?? ""
                input.onchange = function (event){
                    let value = event.target.value;

                    if(attr === "targets"){
                        if (value != null){
                            value = value.split(",")
                            value = value.map(x => {
                                return walls[parseInt(x)];
                            })
                            if(value.includes(undefined)){
                                value = value.filter(x=>x!=null)
                            }
                        }
                    }

                    for (const wall of wt) {                        //for each selected wall
                        wall[attr] = value;                        //set the attribute to the input value
                        if(wall instanceof KeyPeg){
                            walls.push(walls.splice(walls.indexOf(wall),1)[0]) //move the wall to the end of the walls array
                            walls.map((x,i)=>{x.elem.innerHTML = i}) //update the wall numbers
                        }

                    }
                }
                modal.appendChild(input)
            }
        } else {
            const elem = document.createElement("div");
            elem.innerHTML = "No walls selected";
            modal.appendChild(elem)
        }

    }
    else if(editormode === "Move"){
        const elem = document.createElement("div");
        elem.innerHTML = "Moving has no options";
        modal.appendChild(elem)
    }



    let closebt = document.createElement("button")
    closebt.innerText = "OK";
    closebt.onclick = function (event){
        modal.close();
    }

    modal.appendChild(document.createElement("br"))
    modal.appendChild(closebt)
    modal.showModal();
})

addEventListener("selectstart", event => event.preventDefault());

const walltypes =  new Map(classes.map( item => [new item().constructor.name, item])); //map of wall class names to wall classes
walltypes.forEach((v,k)=>{ //why are k,v flipped?
    const opt = document.createElement("option");
    opt.value = k;
    opt.innerHTML = new v().constructor.name
    walltypesel.appendChild(opt); //add each wall type to the wall type selector
})
let WALLTYPE = walltypesel.value;
Array.from($(".wall")).map((elem,i  )=> { //removing the walls from the DOM, that were initialized when making the dropdown
    elem.remove();
})

function exportLevel(){
    let exportstring = JSON.stringify(walls)
    console.log(exportstring);
    localStorage.setItem("peggle.mylevel",exportstring);
    return exportstring;

}

function handleSelection(elems, event = null){
    for (const elem of selectedWalls) {
        elem.elem.classList.remove("selected")
    }

    if(event){
        if(event.shiftKey&& event.altKey){ //intersection
            selectedWalls = elems.filter(x=>selectedWalls.includes(x));
        }
        else if(event.shiftKey){ //union
            selectedWalls = selectedWalls.concat(elems);
        }
        else if(event.altKey){ //difference
            selectedWalls = selectedWalls.filter(x=>!elems.includes(x));
        }
        else{ //replace
            selectedWalls = elems;
        }
    }else{ //replace
        selectedWalls = elems;
    }

    if(selectedWalls.length>0) {
        for (const elem of selectedWalls) {
            elem.elem.classList.add("selected")
        }
        deselbtn.disabled = false;
        deletebutton.disabled = false;

    }
    else{
        deselbtn.disabled = true;
        deletebutton.disabled = true;
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
walls.push(new BoundaryWall(x=-100,y=0,w=102,h=window.innerHeight)); //left
walls.push(new BoundaryWall(window.innerWidth-2,0,100,window.innerHeight)); //right
walls.push(new BoundaryWall(0,-10,window.innerWidth,12)); //top

setInterval(main,5);

//DONE edit
//DONE move (same thing ig)
//DONE delete
//DONE show wall indeces on walls when KeyPeg is selected
//DONE selection options: select all
//DONE select all that are selected from dropdown, selection boolean operations
//DONE snapping to grid?
//TODO better keypeg target input - maybe use selected
//DONE duplicate button
//DONE repeat button: click and hold for size, next a ghost block would appear under mouse specifying the direction and distance, then click and hold to determine the number of blocks to repeat
//FIXED speedbuilding moving pegs only first moves
//FIXED BUG: dragging to make a peg and then pushing alt makes 2 pegs or crashes the page