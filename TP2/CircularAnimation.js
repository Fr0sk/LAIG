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
    this.currAnimTime = 0;
    this.animTime = animTime;
    this.type = "circular";
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.animate = function (deltaTime) {
    if (this.currAnimTime >= this.animTime) {
        console.info("End of animation '" + node.activeAnimation + "'");
        this.node.activeAnimation++;
        return;
    }

    this.currAnimTime += deltaTime;
};