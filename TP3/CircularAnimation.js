/**
 * Constructor
 */

var CircularAnimation = function (node, center, radius, startAng, rotAng, animTime) {
    Animation.apply(this, arguments);

    //CircularAnimation initialization
    this.node = node;
    this.center = center;
    this.radius = radius;
    this.startAng = startAng * Math.PI / 180.0;
    this.rotAng = rotAng * Math.PI / 180.0;
    this.animTime = animTime;

    this.currAnimTime = 0;
    this.currDist = 0;
    this.totalDist = this.rotAng * this.radius;
    this.type = "circular"; // WHY IS THIS?
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.computeMatrix = function () {
    var ang = this.startAng + this.rotAng * this.currAnimTime / this.animTime;
    var x = this.center[0] + this.radius * Math.cos(ang);
    var y = this.center[1];
    var z = this.center[2] + this.radius * Math.sin(ang);
    
    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.translate(mat, mat, [x, y, z]);
    
    var forwardAng = Math.PI / 2 - ang;
    mat4.rotate(mat, mat, forwardAng, [0, 1, 0]);
    return mat;
}

CircularAnimation.prototype.animate = function (deltaTime) {
    this.currAnimTime += deltaTime;
    if (this.currAnimTime >= this.animTime) {
        console.info("End of animation");
        this.node.activeAnimation++;
        return;
    } else {
        this.node.setMat(this.computeMatrix());
    }
};