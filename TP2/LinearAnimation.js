/**
 * Constructor
 */
var LinearAnimation = function (node, animTime, controlPoints) {
    Animation.apply(this, arguments);

    //LinearAnimation initialization
    this.node = node;
    this.defaultMat = node.getMat();
    this.animTime = animTime;
    this.controlPoints = controlPoints;
    this.type = "linear";
    this.currAnimTime = 0;
    this.totalAnimTime = 0;
    this.currControlPoint = 0;

    this.totalLength = 0;
    this.calculateTotalLength();
    this.velocity = 0.02;//this.totalLength / this.animTime;
    console.info("Total length = " + this.totalLength + ", velocity = " + this.velocity);
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.calculateTotalLength = function () {
    for (var i = 0; i < this.controlPoints.length; i++) {
        if (i == 0)
            this.totalLength += Math.sqrt(Math.pow(this.controlPoints[i].x, 2) + Math.pow(this.controlPoints[i].y, 2) + Math.pow(this.controlPoints[i].z, 2));
        else {
            var controlPointLength = {
                x: this.controlPoints[i].x - this.controlPoints[i - 1].x,
                y: this.controlPoints[i].y - this.controlPoints[i - 1].y,
                z: this.controlPoints[i].z - this.controlPoints[i - 1].z
            };

            this.totalLength += Math.sqrt(Math.pow(controlPointLength.x, 2) + Math.pow(controlPointLength.y, 2) + Math.pow(controlPointLength.z, 2));
        }
    }
}

LinearAnimation.prototype.getMatrix = function (dist) {
    var x = this.controlPoints[this.currControlPoint].x;
    var y = this.controlPoints[this.currControlPoint].y;
    var z = this.controlPoints[this.currControlPoint].z;

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
    if (this.totalAnimTime >= this.animTime) {
        console.info("End of animation");
        this.node.activeAnimation++;
        this.node.setMat(this.defaultMat);
        return;
    } else if (this.currAnimTime >= this.animTime / this.controlPoints.length) {
        this.currAnimTime = 0;
        this.currControlPoint++;
    } else
        this.currAnimTime += deltaTime;

    this.totalAnimTime += deltaTime;
    var dist = this.currAnimTime * this.velocity;
    var matFinal = this.node.computeMatrix(this.node.getMat(), this.getMatrix(dist));
    this.node.setMat(matFinal);
};