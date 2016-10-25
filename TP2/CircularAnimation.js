/**
 * Constructor
 */
var CircularAnimation = function() {
    Animation.apply(this, arguments);
    //CircularAnimation initialization
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.reply = function() {
    console.log("I am a CircularAnimation!");
};