"use strict";

//Made by Joe Aquiare!
//Audio visualizer project for IGME 330

(function(){
    window.onload = init;

    //Main DOM variables
    let canvas, ctx;
    let MAX_SAMPLES = 256;

    //Songs
    let SONG_1 = "media/Hello Goodbye.mp3";
    let SONG_2 = "media/Behoimi.mp3";
    let SONG_3 = "media/Bomb Sniffing Pomeranian.mp3";
    let SONG_4 = "media/Aeronaut.mp3";
    let SONG_5 = "media/Hells Entrance World";

    //Incrementing variables
    let incr = 0;
    let lerp_amt = .2;

    //Spiral variables 
    let draw_spiral_c = true;
    let outside_rotation = 50;
    let inside_rotation = 1;
    let zoom = 6;
    let outside_rotation_t = 0;
    let inside_rotation_t = 0;
    let zoom_t = 0;
    let spin_speed = 300;
    let node_size = 2;
    let dance = false;
    let pulsate = false;
    let grayscale = false;
    let ultrabright = false;

    //Other variables
    let draw_curves_c = false;
    let node_size_t = 0;
    let blur = 50;

    //Audio node variables
    let audio_element;
    let analyser_node;
    let delay_node;
    let delay_amount = 0.0;


    //Initialize the audio visualizer
    function init() {
        canvas = document.querySelector("#canvas");
        ctx = canvas.getContext('2d');

        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        audio_element = document.querySelector("#track");
        analyser_node = create_audio_context(audio_element);
        
        //Setup the DOM elements and hook them up to variables
        setup_select();
        setup_sliders();
        setup_checkboxes();

        //Play the song through the audio element
        play_stream(audio_element, SONG_1);

        update();
    }

    //Setup the song select element
    function setup_select() {
        let track_select = document.querySelector("#track_selector");
        track_select.value = document.querySelectorAll("option")[0].value;
        track_select.onchange = function(e) {
            play_stream(audio_element, e.target.value);
        }
    }

    //Sets up the sliders and hooks them up to their respective variables
    function setup_sliders() {

        //LERP
        let smoothing_slider = document.querySelector("#smoothing_slider");
        smoothing_slider.value = 50;
        smoothing_slider.oninput = function(e) {
            lerp_amt = 1 / e.target.value;
        }

        //Outside rotation
        let o_rotation_slider = document.querySelector("#o_rotation_slider");
        o_rotation_slider.value = outside_rotation;
        o_rotation_slider.oninput = function(e) {
            outside_rotation = e.target.value;
        }

        //Inside rotation
        let i_rotation_slider = document.querySelector("#i_rotation_slider");
        i_rotation_slider.value = inside_rotation;
        i_rotation_slider.oninput = function(e) {
            inside_rotation = e.target.value;
        }

        //Zoom
        let zoom_slider = document.querySelector("#zoom_slider");
        zoom_slider.value = zoom;
        zoom_slider.oninput = function(e) {
            zoom = e.target.value;
        }

        //Spin speed
        let speed_slider = document.querySelector("#speed_slider");
        speed_slider.value = spin_speed;
        speed_slider.oninput = function(e) {
            spin_speed = e.target.value;
        }

        //Node size
        let node_size_slider = document.querySelector("#node_size_slider");
        node_size_slider.value = node_size;
        node_size_slider.oninput = function(e) {
            node_size = e.target.value;
        }

        //Blur
        let blur_slider = document.querySelector("#blur_slider");
        blur_slider.value = blur;
        blur_slider.oninput = function(e) {
            blur = e.target.value;
        }

        //Delay
        let delay_slider = document.querySelector("#delay_slider");
        delay_slider.value = delay_amount;
        delay_slider.oninput = function(e) {
            delay_node.delayTime.value = 1 - (1 / e.target.value);
        }
    }

    //Sets up the checkboxes and hooks them up to their respective variables
    function setup_checkboxes() {

        //Draw the spiral
        let checkbox_1 = document.querySelector("#checkbox1");
        checkbox_1.checked = true;
        checkbox_1.onchange = function(e) {
            draw_spiral_c = e.target.checked;
        }

        //Draws the curves
        let checkbox_2 = document.querySelector("#checkbox2");
        checkbox_2.checked = false;
        checkbox_2.onchange = function(e) {
            draw_curves_c = e.target.checked;
        }

        //Dance
        let dance_checkbox = document.querySelector("#dance_checkbox");
        dance_checkbox.checked = false;
        dance_checkbox.onchange = function(e) {
            dance = e.target.checked;
        }

        //Pulsate
        let pulsate_checkbox = document.querySelector("#pulsate_checkbox");
        pulsate_checkbox.checked = false;
        pulsate_checkbox.onchange = function(e) {
            pulsate = e.target.checked;
        }

        //Grayscale
        let grayscale_checkbox = document.querySelector("#grayscale_checkbox");
        grayscale_checkbox.checked = false;
        grayscale_checkbox.onchange = function(e) {
            grayscale = e.target.checked;
        }

        //Ultrabright
        let ultrabright_checkbox = document.querySelector("#ultrabright_checkbox");
        ultrabright_checkbox.checked = false;
        ultrabright_checkbox.onchange = function(e) {
            ultrabright = e.target.checked;
        }
    }

    //Sets up the audio context and sends it to the audio context
    function create_audio_context(a) {
        let a_ctx, a_node, s_node;
        a_ctx = new (window.AudioContext || window.webkitAudioContext);

        a_node = a_ctx.createAnalyser();
        a_node.fftSize = MAX_SAMPLES;
        s_node = a_ctx.createMediaElementSource(a);
        
        //Add the delay filter, and connect the filter through the nodepath
        let delay_filter = a_ctx.createBiquadFilter();
        s_node.connect(delay_filter);
        s_node.connect(a_ctx.destination);
        delay_node = a_ctx.createDelay();
        delay_node.delayTime.value = delay_amount;
        s_node.connect(delay_node);
        delay_node.connect(a_node);
        s_node.connect(a_node);
        
        a_node.connect(a_ctx.destination);
        return a_node;
    }

    //Plays the audio stream, autoplay
    function play_stream(a, path) {
        a.src = path;
        a.play();
        a.volume = 1.0;
    }

    //HELPER FUNCTIONS

    //Returns a color string for fill and stroke styles
    function color(r, g, b, a) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }

    //Returns how many times a variable can fit into another
    function fit(a, b) {
        let i;
        for(i = 0; i < b; i += a) {}
        return i;
    }

    //Draws a circle at 0,0 with a certain radius
    function circle(r) {
        ctx.beginPath();
        ctx.arc(0,0,r,0,Math.PI*2,false);
        ctx.fill();
        ctx.closePath();
    }

    //Centers the translation 
    function center() {
        ctx.translate(canvas.width/2,canvas.height/2);
    }

    //Linear interpolation function
    function lerp(v1, v2, t) {
        return v1*(1-t)+v2*t
    }

    //UPDATING FUNCTIONS

    //Main update function
    function update() {
        incr++;
        if(incr > 1000000) {
            incr = 0;
        }

        let data = new Uint8Array(MAX_SAMPLES/2);
        analyser_node.getByteFrequencyData(data);

        //Interpolate between slider values
        outside_rotation_t = lerp(outside_rotation_t, outside_rotation, lerp_amt);
        inside_rotation_t = lerp(inside_rotation_t, inside_rotation, lerp_amt);
        zoom_t = lerp(zoom_t, zoom, lerp_amt);
        node_size_t = lerp(node_size_t, node_size, lerp_amt);

        //Center and clear the canvas
        ctx.save();
        center();
        clear(data[1]);
        ctx.restore();

        if(draw_curves_c) {
            draw_curves(data);
        }
        
        if(draw_spiral_c) {
            draw_spiral(data);
        }
        
        center();
        ctx.rotate(Math.PI / (500 - spin_speed));
        ctx.translate(-canvas.width/2,-canvas.height/2);

        filter_pixels();

        //Request updates at 60fps
        requestAnimationFrame(update);
    }

    //Filters through the RGBA values of the canvas and re-applies it
    function filter_pixels() {
        let image_data = ctx.getImageData(0,0,canvas.width,canvas.height);
        let data = image_data.data;
        let length = data.length;
        let width = image_data.width;

        for(let i = 0; i < length; i+=4) {
            if(grayscale) {
                data[i+1] = data[i];
                data[i+2] = data[i];
            }

            if(ultrabright) {
                data[i] *= 2;
                data[i+1] *= 2;
                data[i+2] *= 2;
            }
        }

        ctx.putImageData(image_data, 0, 0);
    }

    //clears the center of the screen with a large circle
    function clear(v) {
        let value = v / 20;
        ctx.fillStyle = color(value, value, value, 1.0 - (blur / 100));
        circle(5000);
    }

    //Draws a spiral pattern 
    function draw_spiral(data) {
        ctx.save();

        let boxes_amt = 40;

        center();

        for(let i = 0; i < data.length; i+= 2) {
            ctx.save();
            let use_data = data[i] / 3;

            for(let j = 0; j < fit(node_size_t, (use_data/2)); j++) {
                let mult = (i / 6);
                //Individual RGBA values for each node being drawn
                let r = (use_data * Math.sin(j * (incr / 100)) * mult) % 255;
                let g = r;
                let b = r;
                let a = 1.0;

                //Saves resources if grayscale mode is on - less calculations
                if(!grayscale) {
                    g = (use_data * Math.cos(j / (incr / 300)) * mult) % 255;
                    b = (use_data * Math.sin(j * (incr / 200)) * mult) % 255;
                }

                ctx.fillStyle = color(r,g,b,a);
                let temp_dist = (j * zoom_t);
                
                if(dance) {
                    temp_dist += Math.pow(data[i], 2) * .002;
                }

                let x_pos = j;
                if(pulsate) {
                    x_pos = j + (40 * Math.sin(incr / 50));
                }

                ctx.beginPath();
                ctx.arc(x_pos,temp_dist,node_size_t,0,Math.PI*2,false);
                ctx.fill();
                ctx.closePath();
                //ctx.fillRect(j,temp_dist,node_size_t,node_size_t);
                ctx.rotate(Math.PI / inside_rotation_t);
            }
            ctx.restore();
            ctx.rotate(Math.PI / outside_rotation_t);
        }
        ctx.restore();
    }

    //Draws a circular visualizer-pattern with quadratic curves
    function draw_curves(data) {
        ctx.save();
        center();

        let w_dist = 15;
        let points = 40;
        let rotate_incr = (Math.PI * 2) / points;

        ctx.strokeStyle = color(data[0] * 10, data[1] * 5, data[2] * 15, .03);
        ctx.lineWidth = 1;

        ctx.beginPath();
        for(let i = 0; i < points; i++) {
            ctx.save();
            let h_dist = zoom_t;
            ctx.moveTo(0,h_dist);
            ctx.quadraticCurveTo(w_dist / 2,h_dist + (data[i] * data[i]) / 300,w_dist,h_dist);
            ctx.restore();
            ctx.rotate(rotate_incr);
            ctx.stroke();
        }
        ctx.restore();
    }
})();