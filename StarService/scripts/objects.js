"use strict";
//Shell of "PIXI.Sprite", which makes it easier for me to do cool little animations with the objects
class PIXIObject extends PIXI.Sprite{
    constructor(url="", _startX=-1, _startY=-1, _startWidth=-1, _startHeight=-1) {
        super(PIXI.loader.resources[url].texture);
        this.x = this.realX = _startX;
        this.y = this.realY = _startY;
        this.anchor.x = .5;
        this.anchor.y = .5;
        if(_startWidth != -1) {
            this.width = this.realWidth = _startWidth;
            this.height = this.realHeight = _startHeight;
        }
        this.rotation = this.realRotation = 0;
        this.lerp = this.xlerp = this.ylerp = .3;
        this.taken = false;
        this.array_pos = 0;
    }


    //All methods just set shelled variables of the sprites ACTUAL variables...
    move(x, y) {
        this.realX += x;
        this.realY += y;
    }

    moveTo(x, y) {
        this.realX = x;
        this.realY = y;
    }

    resize(width, height) {
        this.realWidth = width;
        this.realHeight = height;
    }

    stretch(x, y) {
        this.realWidth += x;
        this.realHeight += y;
    }

    rotate(r) {
        this.rotation += r;
    }

    setAnchor(x, y) {
        this.anchor.x = x;
        this.anchor.y = y;
    }

    setLerp(l) {
        this.xlerp = l;
        this.ylerp = l;
    }

    setInteractive(b) {
        this.interactive = b;
        this.buttonMode = b;
    }

    //And I interpolate them in the update method here for cool animations
    update() {
        this.x = lerp(this.x, this.realX, this.xlerp);
        this.y = lerp(this.y, this.realY, this.ylerp);
        this.rotation = lerp(this.rotation, this.realRotation, this.lerp);
        this.width = lerp(this.width, this.realWidth, this.lerp);
        this.height = lerp(this.height, this.realHeight, this.lerp);
        if(this.taken) {
            this.alpha -= .02;
        }
    }
}

class Ingredient extends PIXIObject {
    constructor(url="", potion_type, _startX=-1, _startY=-1, _startWidth=-1, _startHeight=-1) {
        super(url,_startX,_startY,_startWidth,_startHeight);
        this.potion_type = potion_type;
    }
}

class Requester{
    constructor(gameLevel = 0) {
        this.x = 0;
        this.y = 0;

        let type;
        switch(Math.floor(Math.random() * 8)) {
            case 0: type = potionTypes.alien; break;
            case 1: type = potionTypes.atom; break;
            case 2: type = potionTypes.bubbles; break;
            case 3: type = potionTypes.diamond; break;
            case 4: type = potionTypes.jar; break;
            case 5: type = potionTypes.spaceship; break;
            case 6: type = potionTypes.star; break;
            case 7: type = potionTypes.tentacle; break;
            case 8: type = potionTypes.ufo; break;
        }
        
        this.nametext = new PIXI.Text(this.name, textStyle);
        this.nametext.x = 0;
        this.nametext.y = 1000;
        let face;
        switch(Math.floor(Math.random() * 5)) {
            case 0: face = spaceman_url; this.nametext.text = "Spaceman"; break;
            case 1: face = scream_url; this.nametext.text = "Scram"; break;
            case 2: face = beanie_url; this.nametext.text = "Bowler"; break;
            case 3: face = dog_url; this.nametext.text = "DOG"; break;
            case 4: face = eyes_url; this.nametext.text = "Quong"; break;
            default: face = spaceman_url; this.nametext.text = "Spaceman"; break;
        }

        this.potionType = type;
        this.requestprice = Math.floor(Math.random() * 300 * (gameLevel + 1)) + (gameLevel + 1) * 100;
        this.reward = Math.floor(this.requestprice * 2.2);
        this.name = "Customer";
        
        app.functions.spawn(this.nametext);
        this.portrait = new PIXIObject(face,this.x,this.y,96,96);
        app.functions.spawn(this.portrait);
        this.textbox = new PIXIObject(textbox_url,this.x,this.y,140,116);
        this.textbox.anchor.x = 0.0;
        this.textbox.anchor.y = 1.0;
        this.textbox.width = 20;
        this.textbox.height = 20;
        this.textbox.rotation = Math.PI;
        this.textbox.lerp = .1;
        this.textbox.alpha = .2;
        app.functions.spawn(this.textbox);
        this.buyicon = null;
        let buyuicon_url = "";

        switch(this.potionType) {
            case(potionTypes.alien): buyuicon_url = alien_url; break;
            case(potionTypes.atom): buyuicon_url = atom_url; break;
            case(potionTypes.bubbles): buyuicon_url = bubbles_url; break;
            case(potionTypes.diamond): buyuicon_url = diamond_url; break;
            case(potionTypes.jar): buyuicon_url = jar_url; break;
            case(potionTypes.spaceship): buyuicon_url = spaceship_url; break;
            case(potionTypes.star): buyuicon_url = star_url; break;
            case(potionTypes.tentacle): buyuicon_url = tentacle_url; break;
            case(potionTypes.ufo): buyuicon_url = ufo_url; break;
        }

        this.buyicon = new PIXIObject(buyuicon_url,0,0,40,40);
        this.buyicon.alpha = 0.0;
        this.buyicon.realWidth = this.buyicon.realHeight = 80;
        this.buyicon.lerp = .1;
        app.functions.spawn(this.buyicon);

        this.request = 
        "I'd like a " + this.potionType + 
        "\nrepair worth at \nleast $" + this.requestprice + " please." + 
        "\nREWARD: $" + this.reward;

        this.requesttext = new PIXI.Text(this.request, textStyle);
        this.requesttext.alpha = 0.0;
        app.functions.spawn(this.requesttext);
        this.barwidth = 96;
        this.time = Math.random() * 200 + 100;
        this.originaltime = this.time;
        this.bar = new PIXIObject(timebar_url,this.x,this.y,this.barwidth,20);
        this.barshadow = new PIXIObject(timebar_url,this.x,this.y,this.barwidth,20);
        this.barshadow.alpha = .5;
        app.functions.spawn(this.bar);
        app.functions.spawn(this.barshadow);
        this.bar.anchor.x = 
        this.bar.anchor.y = 
        this.barshadow.anchor.x = 
        this.barshadow.anchor.y = 0;
        this.bar.x = 0;
        this.bar.y = 1000;
        this.barshadow.x = 0;
        this.barshadow.y = 1000;
        this.dissapearRate = .04;
    }

    complete() {
        this.time = 0.0;
        return this.reward;
    }

    //Destroys all the elements for the requester on the stage once they're gone
    destructor() {
        canvas.stage.removeChild(this.portrait);
        canvas.stage.removeChild(this.bar);
        canvas.stage.removeChild(this.barshadow);
        canvas.stage.removeChild(this.textbox);
        canvas.stage.removeChild(this.nametext);
        canvas.stage.removeChild(this.requesttext);
        canvas.stage.removeChild(this.buyicon);
        requester = null;
    }

    //Updates all the objects that are encapsulated within the requester
    update() {
        let p = 0.0;
        if(this.time >= .1) {
            this.time -= .1;
            p = this.time / this.originaltime;

            if(Math.round(this.barwidth * p) % 5 == 0) {
                this.bar.realWidth = this.barwidth * p;
            }
            
        } else {
            this.portrait.alpha -= this.dissapearRate;
            this.bar.alpha -= this.dissapearRate;
            this.barshadow.alpha -= this.dissapearRate;
            this.textbox.alpha -= this.dissapearRate;
            this.nametext.alpha -= this.dissapearRate;
            this.requesttext.alpha -= this.dissapearRate;
            this.buyicon.alpha -= this.dissapearRate;
            this.requesttext.x -= 2;
            if(this.portrait.alpha <= 0) {
                this.destructor();
            }
        }

        //Update requester objects
        this.bar.update();
        this.barshadow.update();
        this.portrait.update();
        this.textbox.update();

        //Correct requester object positions
        this.barshadow.x = this.bar.x;
        this.barshadow.y = this.bar.y;
        this.textbox.x =  this.portrait.x + 50;
        this.textbox.y = this.portrait.y;
        this.nametext.x = this.portrait.x - 50;
        this.nametext.y = this.portrait.y - 70;
        this.textbox.rotation += Math.sin(this.time / 5) * .007;
        this.requesttext.x = this.portrait.x - 50;
        this.requesttext.y = this.portrait.y + 80;

        if(this.buyicon.alpha < 1.0) {
            this.buyicon.alpha += .01;
        }

        if(this.requesttext.alpha < 1.0) {
            this.requesttext.alpha += .01;
        }

        this.buyicon.x = this.textbox.x + 70;
        this.buyicon.y = this.textbox.y - 65;
        this.buyicon.y += Math.sin(this.time / 5) * 3;
        this.buyicon.x += Math.sin(this.time / 5) * 3;
        this.buyicon.rotation += Math.sin(this.time / 5) * .006;
    }
}