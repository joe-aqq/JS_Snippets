"use strict";
function println(s) {
    console.debug("_DEBUG: " + s);
}

function lerp(v1, v2, t) {
    return (1 - t) * v1 + t * v2;
}

function distance(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt(a*a + b*b);
}

function keyUp(key) {
    return key.keyCode === 87 || key.keyCode === 38;
}

function keyDown(key) {
    return key.keyCode === 83 || key.keyCode === 40;
}

function keyLeft(key) {
    return key.keyCode === 65 || key.keyCode === 37;
}

function keyRight(key) {
    return key.keyCode === 68 || key.keyCode === 39;
}

function keyAccept(key) {
    return key.keyCode === 90 || key.keyCode === 13;
}

function keyBack(key) {
    return key.keyCode === 88 || key.keyCode === 16;
}