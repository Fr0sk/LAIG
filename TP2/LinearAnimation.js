/**
 * Constructor
 */
var LinearAnimation = function (node, animTime, controlPoints) {
    Animation.apply(this, arguments);

    //LinearAnimation initialization
    this.node = node;
    this.animTime = animTime;
    this.controlPoints = controlPoints;
    this.type = "linear";
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.reply = function () {
    console.log("I am a LinearAnimation!");
};

LinearAnimation.prototype.animate = function(deltaTime){
    console.log("LinearAnimation");
};