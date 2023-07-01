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
        // mystr.replace('\"', '\\\\"') //escape strings, unsure if i should keep this
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
                    if(this[attr]==true){
                        mystr += attr + "=" + this[attr] + ","
                    }
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
        this.color = color;
        if(color !== null){
            this.elem.style.borderColor = color;
            if(targets == null){return}
            for (const target of this.targets) {
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
                    if(this[attr]!==""){
                        if (attr === "color"){
                            mystr += attr + "='" + this[attr] + "',";
                        }
                        else{
                            mystr += attr + "=" + this[attr] + ",";
                        }
                    }
                }
            }
        }
        mystr = mystr.slice(0,mystr.length-1) + ")";
        // mystr.replace('\"', '\\\\"') //escape strings, unsure if i should keep this
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
            ballobj.xv = Math.random() * 6 - 3;
            ballobj.yv = Math.random() * 6 - 3;
        }
        super.break();
    }
}