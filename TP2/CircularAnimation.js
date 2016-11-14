/**
 * Constructor
 */
var CircularAnimation = function (node, center, radius, starting, rotang, animTime) {
    Animation.apply(this, arguments);

    //CircularAnimation initialization
    this.node = node;
    this.center = center;
    this.radius = radius;
    this.starting = starting * Math.PI / 180.0;
    this.rotang = (starting + rotang) * Math.PI / 180.0;
    this.animTime = animTime;

    this.defaultMat = node.getMat();
    this.type = "circular";

    this.totalAnimTime = 0;

    this.currDist = 0;
    this.totalDist = this.getTotalLength();
    this.velocity = 0.02;//this.totalDist / this.animTime;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getTotalLength = function (deltaTime) {
    return this.rotang * this.radius;
}

CircularAnimation.prototype.getLerpedMatrix = function () {
    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    var currAng = this.starting + (this.rotang - this.starting) * (this.currDist / this.totalDist);

    mat4.translate(mat, mat, [this.center[0], this.center[1], this.center[2]]);
    mat4.rotate(mat, mat, currAng, [0, 1, 0]);
    mat4.translate(mat, mat, [-this.center[0], -this.center[1], -this.center[2]]);

    return mat;
}

CircularAnimation.prototype.animate = function (deltaTime) {
    if (this.totalAnimTime >= this.animTime) {
        console.info("End of animation");
        this.node.activeAnimation++;
        //this.node.setMat(this.defaultMat);
        return;
    }

    this.totalAnimTime += deltaTime;
    this.node.setMat(this.node.computeMatrix(this.node.getMat(), this.getLerpedMatrix()));
    this.currDist = this.totalAnimTime * this.velocity;
};