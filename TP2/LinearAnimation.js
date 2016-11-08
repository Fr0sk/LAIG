/**
 * Constructor
 */
var LinearAnimation = function (animTime, controlPoints) {
    Animation.apply(this, arguments);

    //LinearAnimation initialization
    this.animTime = animTime;
    this.controlPoints = controlPoints;
    this.type = "linear";
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.reply = function () {
    console.log("I am a LinearAnimation!");
};