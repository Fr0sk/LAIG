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
    this.currAnimTime = 0;
    this.lengthOfFirstPoint;

    this.length = 0;
    for (var i = 0; i < this.controlPoints.length; i++)
        this.length += Math.sqrt(Math.pow(controlPoints[i].x, 2) + Math.pow(controlPoints[i].y, 2) + Math.pow(controlPoints[i].z, 2));

    this.speed = this.length / this.animTime;

    this.lengthOfFirstPoint = Math.sqrt(Math.pow(controlPoints[0].x, 2) + Math.pow(controlPoints[0].y) + Math.pow(controlPoints[0].z));
    this.velocity = 0.05;
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getMatrix = function (dist) {
    var x = this.controlPoints[0].x;
    var y = this.controlPoints[0].y;
    var z = this.controlPoints[0].z;

    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.translate(mat, mat, [x * dist, y * dist, z * dist]);

    return mat;
}

LinearAnimation.prototype.animate = function (deltaTime) {
    if (this.node.activeAnimation > 0)
        return;

    console.log("haha: " + deltaTime);
    console.log(this.animTime);

    if (this.currAnimTime >= this.animTime) {
        console.info("End of animation '" + this.node.activeAnimation + "'");
        this.node.activeAnimation++;

        return;
    } else {
        this.currAnimTime += deltaTime;
        var dist = this.currAnimTime * this.velocity;
        var matFinal = this.node.computeMatrix(this.node.mat, this.getMatrix(dist));
        this.node.setMat(matFinal);
    }
};