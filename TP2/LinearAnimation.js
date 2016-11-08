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

LinearAnimation.prototype.animate = function(deltaTime){
    if (this.currAnimTime >= this.animTime) {
        console.info("End of animation '" + node.activeAnimation + "'");
        this.node.activeAnimation++;
        return;
    }
};