/**
 * Constructor
 */
var LinearAnimation = function(controlPoints, animTime) {
    Animation.apply(this, arguments);

    //LinearAnimation initialization
    this.controlPoints = controlPoints;
    this.animTime = animTime;
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.reply = function() {
    console.log("I am a LinearAnimation!");
};

LinearAnimation.prototype.animate = function(deltaTime){
    console.log("LinearAnimation");
};