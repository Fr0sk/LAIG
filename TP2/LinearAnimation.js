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

    this.totalLength = 0;
    this.calculateTotalLength();
    this.velocity = this.totalLength / this.animTime;
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

    if (this.currAnimTime >= this.animTime) {
        console.info("End of animation");
        this.node.activeAnimation++;
        return;
    } else {
        this.currAnimTime += deltaTime;
        var dist = this.currAnimTime * this.velocity;
        var matFinal = this.node.computeMatrix(this.node.mat, this.getMatrix(dist));
        this.node.setMat(matFinal);
    }
};