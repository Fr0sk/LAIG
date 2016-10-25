/**
 * Constructor
 */
var CircularAnimation = function(center, radius, initAng, endAng, animTime) {
    Animation.apply(this, arguments);

    //CircularAnimation initialization
    this.center = center;
    this.radius = radius;
    this.initAng = initAng;
    this.endAng = endAng;
    this.animTime = animTime;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.reply = function() {
    console.log("I am a CircularAnimation!");
};