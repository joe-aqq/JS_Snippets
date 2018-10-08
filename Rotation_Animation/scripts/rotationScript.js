"use strict";
(function() {

    let canvas, ctx;

    window.onload = init;

    function init() {
        canvas = document.querySelector("#canvas");
        ctx = canvas.getContext("2d");
        requestAnimationFrame(update);
    }

    let incr = 0;

    function update() {
        incr++;
        if(incr > 100000) incr = 0;

        clear_screen();
        ctx.save();

        let circles = 30 + (29 * Math.sin(incr / 60));
        let rotation_amount = (Math.PI * 2) / circles;

        ctx.translate(canvas.width/2,canvas.height/2);

        for(let i = 0; i < circles; i++) {
            ctx.save();
            let amt = Math.sin((incr + ((Math.PI * 4) * i)) / 30);
            ctx.translate(0, 150 * amt);
            ctx.fillStyle = "white";
            draw_circle((Math.abs(amt) * 8) + .5);
            ctx.fill();
            ctx.restore();
            ctx.rotate(rotation_amount);
        }

        ctx.restore();
        requestAnimationFrame(update);
    }

    function clear_screen() {
        ctx.fillStyle = "black";
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    function draw_circle(r) {
        ctx.beginPath();
        ctx.arc(0,0,r,0,Math.PI * 2,false);
        ctx.closePath();
    }

    function color(r,g,b,a) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }

})();