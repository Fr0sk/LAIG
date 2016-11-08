/**
 * Constructor
 */
var CircularAnimation = function (node, center, radius, initAng, endAng, animTime) {
    Animation.apply(this, arguments);

    //CircularAnimation initialization
    this.node = node;
    this.center = center;
    this.radius = radius;
    this.initAng = initAng;
    this.endAng = endAng;
    this.animTime = animTime;
    this.type = "circular";
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.reply = function () {
    console.log("I am a CircularAnimation!");
};

CircularAnimation.prototype.animate = function(deltaTime){
    console.log("CircularAnimation");
};