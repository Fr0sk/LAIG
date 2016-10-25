/**
 * Constructor
 */
var LinearAnimation = function() {
    Animation.apply(this, arguments);
    //LinearAnimation initialization
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.reply = function() {
    console.log("I am a LinearAnimation!");
};