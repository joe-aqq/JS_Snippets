"use strict";
var app = app || {};

const _GAME_TAG =  "game";
const _WINDOW_HEIGHT = 500;
const _WINDOW_WIDTH = 800;
let _GLOBAL_TIME = 0.0;
let _TICKS = 0;

let canvas;
let doneLoading = false;

//------------------VALUES-------------------
let game_level = 2;
let items = 0;
const level_freqs = [
    60,
    40,
    30,
    12,
    9,
    5
];
//-----------------END VALUES----------------

//------------------OBJECTS------------------
let items_onscreen = [];
let item_spawn_pos = {
    x: 70,
    y: 100
};

let item_delete_pos = {
    x: _WINDOW_WIDTH - 80,
    y: 100
};

let item_bucket_pos = {
    x: 500,
    y: 260
}

let item_add_pos = {
    x: item_bucket_pos.x - 10,
    y: item_bucket_pos.y + 15
}

let items_in_bucket_count = 0;

let item_bucket;
let bracket_left;
let bracket_right;
let item_bucket_potiontype;
let bubbles = [];
let requester = null;
let requester_freq = 1500;
let current_money_prefix = "Value: $";
let current_money;
let sell_button;
let sell_button_text;
let total_money = 0;
let total_money_text;
let total_money_prefix = "Money: $";

let potion_stats = {
    aliens: 0,
    atoms: 0,
    bubbles: 0,
    diamonds: 0,
    jars: 0,
    spaceships: 0,
    stars: 0,
    tentacles: 0,
    ufos: 0
};

let stats_bars = [];
let stats_bars_text = [];
let stats_bars_max_height = 150;
let stats_bars_min_height = 10;
let stats_bars_pos = {
    x: 635,
    y: 405
}

let click_sound = new Howl({src: ['sounds/click.wav']});
let absorb_sound = new Howl({src: ['sounds/absorb.wav']});
let talk_sound = new Howl({src: ['sounds/talk.wav']});
let can_sell_sound = new Howl({src: ['sounds/can.wav']});
let cant_sell_sound = new Howl({src: ['sounds/cannot.wav']});
let bg_music = new Howl({src: ['sounds/music.wav'], loop: true});

let type_string;

let background;

//----------------END OBJECTS----------------

//-------------------URLS--------------------
let background_url = "images/static/background.png";

let apple_url = "images/ingredients/apple.png";
let melon_url = "images/ingredients/melon.png";
let grape_url = "images/ingredients/grape.png";
let cherry_url = "images/ingredients/cherry.png";
let bucket_url = "images/static/bucket.png";
let bracket_url = "images/static/bracket.png";
let bubble_url = "images/static/bubble.png";
let knight_url = "images/people/knight.png";
let timebar_url = "images/static/bar.png";
let textbox_url = "images/static/textbox.png";
let statsbar_url = "images/static/statsbar.png";

let alien_url = "images/ingredients/alien.png";
let atom_url = "images/ingredients/atom.png";
let bubbles_url = "images/ingredients/bubbles.png";
let diamond_url = "images/ingredients/diamond.png";
let jar_url = "images/ingredients/jar.png";
let spaceship_url = "images/ingredients/spaceship.png";
let star_url = "images/ingredients/star.png";
let tentacle_url = "images/ingredients/tentacle.png";
let ufo_url = "images/ingredients/ufo.png";

let spaceman_url = "images/people/spaceman.png";
let scream_url = "images/people/scream.png";
let eyes_url = "images/people/eyes.png";
let dog_url = "images/people/dog.png";
let beanie_url = "images/people/beanie.png";

const urls = [
    background_url,
    apple_url,
    melon_url,
    grape_url,
    cherry_url,
    bucket_url,
    bracket_url,
    bubble_url,
    knight_url,
    timebar_url,
    textbox_url,
    statsbar_url,
    alien_url,
    atom_url,
    bubbles_url,
    diamond_url,
    jar_url,
    spaceship_url,
    star_url,
    tentacle_url,
    ufo_url,
    spaceman_url,
    scream_url,
    eyes_url,
    dog_url,
    beanie_url
];
//------------------END URLS-----------------

let potionTypes = Object.freeze({
    alien: "Alien",
    atom: "Atom",
    bubbles: "Bubbles",
    diamond: "Diamond",
    jar: "Jar",
    spaceship: "Spaceship",
    star: "Star",
    tentacle: "Tentacle",
    ufo: "UFO"
});

let textStyle = new PIXI.TextStyle({
    fontFamily: 'pixel_operator_mono_8regular',
    fontSize: 16,
    fill: '#ffffff',
    lineHeight: 20
})

let current_price = 0;
let price_text;

app.functions = (function() { //Main function call for the encapsulated service
    function init() {
        bg_music.play();
        PIXI.utils.sayHello("WebGL");
        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
        canvas = new PIXI.Application({ //Create new PIXI JS Application
            width: _WINDOW_WIDTH,
            height: _WINDOW_HEIGHT,
            backgroundColor: 0x000000,
            antialias: false
        });
        canvas.view.id = _GAME_TAG;
        document.querySelector("#game_container").appendChild(canvas.view); //Append it to the game div
        PIXI.loader.add(urls).load(initObjects);
    }

    function initObjects() { //Initialize PIXI objects, and spawn them in the scene
        background = new PIXIObject(background_url,400,250,800,400);
        spawn(background);

        item_bucket = new PIXIObject(bucket_url,item_bucket_pos.x-10,item_bucket_pos.y+80,200,128);
        item_bucket.lerp = .1;

        bracket_left = new PIXIObject(bracket_url,0,35,32,128);
        bracket_left.setAnchor(0,0);

        bracket_right = new PIXIObject(bracket_url,800,128 + 35,32,128);
        bracket_right.rotation = bracket_right.realRotation = Math.PI;
        bracket_right.setAnchor(0,0);

        spawn(item_bucket);
        spawn(bracket_left);
        spawn(bracket_right);

        price_text = new PIXI.Text(current_money_prefix + current_price, textStyle);
        price_text.x = item_bucket_pos.x;
        price_text.y = item_bucket_pos.y + 170;
        price_text.anchor.x = .5;
        price_text.anchor.y = .5;
        spawn(price_text);

        sell_button = new PIXIObject(timebar_url,0,0,200,30);
        sell_button.anchor.x = .5;
        sell_button.anchor.y = .5;
        sell_button.x = sell_button.realX = item_bucket_pos.x;
        sell_button.y = sell_button.realY = item_bucket_pos.y + 210;
        sell_button.setInteractive(true);
        sell_button.on('pointerdown', sellPotion);
        spawn(sell_button);

        let buttonTextStyle = new PIXI.TextStyle({
            fontFamily: 'pixel_operator_mono_8regular',
            fontSize: 16,
            fill: '#000000',
            lineHeight: 20
        })
        sell_button_text = new PIXI.Text("Sell", buttonTextStyle);
        sell_button_text.anchor.x = .5;
        sell_button_text.anchor.y = .5;
        sell_button_text.x = sell_button.x;
        sell_button_text.y = sell_button.y + 2;
        spawn(sell_button_text);

        //Create the bar chart on the lower-right side of the screen
        for(let i = 0; i < 8; i++) {
            let obj = new PIXIObject(statsbar_url,stats_bars_pos.x + (i * 20), stats_bars_pos.y, 16, 5);
            obj.lerp = .1;
            obj.anchor.y = 1.0;
            obj.height = stats_bars_min_height;
            let s;
            switch(i) {
                case 0: s = "A"; break;
                case 1: s = "a"; break;
                case 2: s = "B"; break;
                case 3: s = "D"; break;
                case 4: s = "J"; break;
                case 5: s = "S"; break;
                case 6: s = "s"; break;
                case 7: s = "T"; break;
                case 8: s = "U"; break;
            }
            let text_obj = new PIXI.Text(s, textStyle);
            text_obj.x = obj.x - 6;
            text_obj.y = obj.y + 15;
            spawn(obj);
            spawn(text_obj);
            stats_bars.push(obj);
            stats_bars_text.push(text_obj);
        }

        type_string = new PIXI.Text("...", textStyle);
        type_string.anchor.x = 0.5;
        type_string.x = stats_bars_pos.x + 73;
        type_string.y = stats_bars_pos.y + 50;
        spawn(type_string);

        total_money_text = new PIXI.Text(total_money_prefix + total_money, textStyle);
        total_money_text.anchor.x = 1.0;
        total_money_text.x = 802;
        total_money_text.y = 180;
        spawn(total_money_text);

        //Call the update ticker when done
        update();
    }

    //Updates the scene
    function update() { canvas.ticker.add(function(delta) { //Adds a ticker to PIXI to tell it to run this function over and over
        //Increase global time and tick counter
        _GLOBAL_TIME += delta;
        _TICKS++;

        for(let i = 0; i < stats_bars.length; i++) {
            stats_bars[i].update(); //Update the item stats bars
        }

        background.realWidth += Math.sin(_TICKS / 100) * .2; //Move the background, stretch and squeeze
        background.realHeight += Math.cos(_TICKS / 100) * .2;
        background.update();

        if(requester == null) { //If a requester is null...
            sell_button_text.text = "Sell";
            if(_TICKS % requester_freq == 0) { //And the ticks land on the time it takes to call a requester...
                sell_button_text.text = "Trade";
                talk_sound.play();
                requester = new Requester(game_level); //Make a new requester
                requester.portrait.x = requester.portrait.realX = 48;
                requester.portrait.y = 650;
                requester.portrait.realY = 340;
                requester.portrait.ylerp = .1;
                requester.bar.x = requester.portrait.x;
                requester.bar.y = requester.portrait.y + 150;
                requester.bar.ylerp = .1;
                requester.bar.realY = 392;
            }
        } else {
            requester.update();
        }

        //Update the brackets and item objects
        bracket_left.update();
        bracket_right.update();
        item_bucket.update();
        sell_button.update();


        let new_freq; //If an item has not yet been selected, slow down the reel
        if(current_price == 0) {
            new_freq = level_freqs[0];
        } else {
            new_freq = level_freqs[game_level];
        }

        //If the ticks mod the time for a new item...
        if(_TICKS % new_freq == 0) {
            let ran = Math.floor(Math.random() * 8);
            let url, type;
            switch(ran) {
                case(0): url = alien_url; type = potionTypes.alien; break;
                case(1): url = atom_url; type = potionTypes.atom; break;
                case(2): url = bubbles_url; type = potionTypes.bubble; break;
                case(3): url = diamond_url; type = potionTypes.diamond; break;
                case(4): url = jar_url; type = potionTypes.jar; break;
                case(5): url = spaceship_url; type = potionTypes.spaceship; break;
                case(6): url = star_url; type = potionTypes.star; break;
                case(7): url = tentacle_url; type = potionTypes.tentacle; break;
                case(8): url = ufo_url; type = potionTypes.ufo; break;
                default: url = alien_url; type = potionTypes.alien; break;
            }
            let obj = new Ingredient(url,type,item_spawn_pos.x,item_spawn_pos.y,80,80); //Create a new item
            obj.setLerp(.1);
            obj.on('pointerdown', itemClick);
            obj.setInteractive(true);
            bracket_left.x -= 10;
            spawn(obj); //Spawn the item
            obj.array_pos = items_onscreen.length;
            items_onscreen.push(obj); //Add it to the item list
        }

        //Go through the items on the screen
        for(let i = 0; i < items_onscreen.length; i++) {
            let item = items_onscreen[i];
            if(!item.taken) { //If an item hasn't been taken...
                item.move(2,0);
                item.y += Math.sin(_GLOBAL_TIME * .08) * 2.5; //Increase its rotation values
                item.rotation += Math.sin(_GLOBAL_TIME * .04) * .1;
                if(item.x > item_delete_pos.x) { //If it heads towards the bucket...
                    canvas.stage.removeChild(item); //Delete the item when it gets there
                    items_onscreen.splice(i,1);
                    bracket_right.x += 10;
                }
            } else { //Delete off the screen items
                if(distance(item.x,item.y,item_add_pos.x,item_add_pos.y) < 10) {
                    itemDispose(item, i);
                    createBubbles();
                }
            }
            //Update remaining items
            item.update();
        }

        //Update the bubbles coming out of the pot when items added
        for(let i = 0; i < bubbles.length; i++) {
            bubbles[i].update();
            bubbles[i].move((Math.random() * 2) - 1, -2);
            bubbles[i].alpha -= .02;
            bubbles[i].width *= 1.0 + Math.random() * .2;
            bubbles[i].height *= 1.0 + Math.random() * .2;
            if(bubbles[i].alpha <= 0.0) {
                bubbles.splice(i,1);
            }
        }
    });}

    //Clears the stage of any items
    function clearStage(stage=canvas.stage) {
        let children = stage.children.length;
        for(let i = 0; i < children; i++) {
            stage.removeChild(stage.children[0]);
        }
    }

    //Spawns an item to the PIXI stage
    function spawn(obj=undefined, stage=canvas.stage) {
        return stage.addChild(obj);
    }

    //Function for when items are clicked
    function itemClick(e) {
        if(!e.target.taken) {
            click_sound.play();
            e.target.setLerp(.07);
            e.target.xlerp *= 2;
            e.target.taken = true;
            e.target.moveTo(item_add_pos.x, item_add_pos.y); //Make them head for the bucket
            e.target.realRotation = 0;
            e.target.height = e.target.width = 160;
            e.target.realWidth = e.target.realHeight = 40; 
        }
    }

    //Function for selling the repairs
    function sellPotion() {
        if(requester != null) { //If there is a requester on the screen...
            if(current_price >= requester.requestprice && type_string.text == requester.potionType) { //And you meet his standards...
                current_price -= requester.requestprice;
                total_money += requester.complete(); //Sell the potion, and add money to your total count
                can_sell_sound.play();
                sell_button.y += 10;
                resetPotionStats();
            } else { //else, you cannot sell it to them
                sell_button.rotation = Math.PI / 20;
                cant_sell_sound.play();
            }
        } else {
            //If there is no requester, sell the item into thin air for small profit
            can_sell_sound.play();
            total_money += current_price;
            current_price = 0;
            sell_button.y += 10;
            resetPotionStats();
        }
        price_text.text = current_money_prefix + current_price;
        total_money_text.text = total_money_prefix + total_money;
    }

    //Function for when the item reaches the pot
    function itemDispose(item, index) {
        absorb_sound.play();
        canvas.stage.removeChild(item);
        items_onscreen.splice(index,1);
        item_bucket.height *= .9;
        item_bucket.width *= 1.2;
        item_bucket.y += 8;
        switch(item.potion_type) { //Set the stats for the items that are currently in the pot
            case(potionTypes.alien): current_price += 10; potion_stats.aliens++; break;
            case(potionTypes.atom): current_price += 12; potion_stats.atoms++; break;
            case(potionTypes.bubbles): current_price += 15; potion_stats.bubbles++; break;
            case(potionTypes.diamond): current_price += 20; potion_stats.diamonds++; break; //<--- Probably a better way to do this!
            case(potionTypes.jar): current_price += 20; potion_stats.jars++; break;
            case(potionTypes.spaceship): current_price += 20; potion_stats.spaceships++; break;
            case(potionTypes.star): current_price += 20; potion_stats.stars++; break;
            case(potionTypes.tentacle): current_price += 20; potion_stats.tentacles++; break;
            case(potionTypes.ufo): current_price += 20; potion_stats.ufo++; break;
        }
        price_text.text = current_money_prefix + current_price;
        
        items_in_bucket_count++;
        setBarHeights();
    }

    //Resets all the stats for items
    function resetPotionStats() {
        items_in_bucket_count = 0;
        potion_stats.aliens = 0;
        potion_stats.atoms = 0;
        potion_stats.bubbles = 0;
        potion_stats.diamonds = 0;
        potion_stats.jars = 0;
        potion_stats.spaceships = 0;
        potion_stats.stars = 0;
        potion_stats.tentacles = 0;
        potion_stats.ufo = 0;
        setBarHeights();
    }

    //Sets and iterpolates the heights of the stats bar on the lower right side of the screen
    function setBarHeights() {
        for(let i = 0; i < stats_bars.length; i++) {
            let p = 0.0;
            if(items_in_bucket_count > 0) {
                switch(i) {
                    case 0: p = potion_stats.aliens / items_in_bucket_count; break;
                    case 1: p = potion_stats.atoms / items_in_bucket_count; break;
                    case 2: p = potion_stats.bubbles / items_in_bucket_count; break;
                    case 3: p = potion_stats.diamonds / items_in_bucket_count; break;
                    case 4: p = potion_stats.jars / items_in_bucket_count; break;
                    case 5: p = potion_stats.spaceships / items_in_bucket_count; break;
                    case 6: p = potion_stats.stars / items_in_bucket_count; break;
                    case 7: p = potion_stats.tentacles / items_in_bucket_count; break;
                    case 8: p = potion_stats.ufo / items_in_bucket_count; break;
                    default: p = 1;
                }
            }
            stats_bars[i].realHeight = stats_bars_min_height + (stats_bars_max_height * p);
        }

        let max = -1;
        for(let i = 0; i < stats_bars.length; i++) {
            if(stats_bars[i].realHeight >= max) {
                max = stats_bars[i].realHeight;
            }
        }
        
        //Set the alpha of the greatest item and also set the text to the item that has the highest amount
        let string = "";
        for(let i = 0; i < stats_bars.length; i++) {
            if(stats_bars[i].realHeight >= max) {
                if(string.length <= 0) {
                    switch(i) {
                        case 0: string += "Alien"; break;
                        case 1: string += "Atom"; break;
                        case 2: string += "Bubble"; break;
                        case 3: string += "Diamond"; break;
                        case 4: string += "Jar"; break;
                        case 5: string += "Spaceship"; break;
                        case 6: string += "Star"; break;
                        case 7: string += "Tentacle"; break;
                        case 8: string += "UFO"; break;
                        default: string += "";
                    }
                }
                stats_bars[i].alpha = 1.0;
                stats_bars_text[i].alpha = 1.0;
            } else {
                stats_bars[i].alpha = 0.2;
                stats_bars_text[i].alpha = 0.2;
            }
        }
        type_string.text = string;
    }

    //Create bubbles when an item is added to the pot
    function createBubbles() {
        let ran = Math.floor(Math.random() * 4) + 2;
        for(let j = 0; j < ran; j++) {
            let s = Math.random() * 10 + 6;
            let b = new PIXIObject(
                bubble_url,
                (item_bucket_pos.x + Math.random() * 30) - 15,
                item_bucket_pos.y + Math.random() * 5,
                s,
                s
            );
            b.lerp = .2;
            b.width *= Math.random();
            b.height *= .9;
            bubbles.push(b);
            spawn(b);
        }
    }

    //Return certain functions so objects can use them
    return {
        init: init,
        clearStage: clearStage,
        spawn: spawn
    }

})();

//Run the init once the page loads
window.onload = app.functions.init;
