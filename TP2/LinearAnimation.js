/**
 * Constructor
 */

var a = true;

var LinearAnimation = function (node, animTime, controlPoints) {
    Animation.apply(this, arguments);

    //LinearAnimation initialization
    this.node = node;
    this.animTime = animTime;
    this.controlPoints = controlPoints;

    this.defaultMat = node.getMat();
    this.type = "linear";

    this.currAnimTime = 0;
    this.currDist = 0;
    this.currControlPoint = 0;

    this.individualLengths = [];
    this.totalAnimTime = 0;
    this.totalLength = 0;
    this.calculateTotalLength();
    this.velocity = this.totalLength / this.animTime;
    console.info("Velocidade = " + this.velocity + ", length = " + this.totalLength + ", time = " + this.animTime);

    this.currControlPoint++;
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.calculateTotalLength = function () {
    for (var i = 1; i < this.controlPoints.length; i++) {
        var controlPointLength = {
            x: this.controlPoints[0].x - this.controlPoints[i].x,
            y: this.controlPoints[0].y - this.controlPoints[i].y,
            z: this.controlPoints[0].z - this.controlPoints[i].z
        };

        var length = Math.sqrt(Math.pow(controlPointLength.x, 2) + Math.pow(controlPointLength.y, 2) + Math.pow(controlPointLength.z, 2));
        this.totalLength += length;
        this.individualLengths.push(length);
    }
}

var b = true;
LinearAnimation.prototype.getMatrix = function () {
    if (this.currDist > this.individualLengths[this.currControlPoint - 1]) {
        //this.currControlPoint++;
        this.currAnimTime = 0;
    }

    this.currDist = this.velocity * this.currAnimTime;
    //console.info("currDist = " + currDist + ", velocity = " + this.velocity + ", currAnimTime = " + this.currAnimTime);

    var x = this.controlPoints[this.currControlPoint].x * this.currDist;
    var y = this.controlPoints[this.currControlPoint].y * this.currDist;
    var z = this.controlPoints[this.currControlPoint].z * this.currDist;

    if (b) {
        b = false;
        console.info("currDist = " + this.currDist + ", velocity = " + this.velocity + ", currAnimTime = " + this.currAnimTime);
        console.info("X = " + x + ", Y = " + y + ", Z = " + z);
    }

    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.translate(mat, mat, [x, y, z]);

    /*var u = Math.sqrt(Math.pow(this.controlPoints[this.currControlPoint].x, 2) + Math.pow(this.controlPoints[this.currControlPoint].y, 2) + Math.pow(this.controlPoints[this.currControlPoint].z, 2));
    var myCP = {
        x: this.controlPoints[this.currControlPoint].x * (1 / u),
        z: this.controlPoints[this.currControlPoint].z * (1 / u)
    };


    if (a) {
        mat4.rotate(mat, mat, -Math.atan2(this.controlPoints[this.currControlPoint].x, this.controlPoints[this.currControlPoint].z), [0, 1, 0]);
        a = false;
    }*/

    return mat;
}

LinearAnimation.prototype.animate = function (deltaTime) {
    if (this.totalAnimTime >= this.animTime) {
        console.info("End of animation, animation took '" + this.totalAnimTime + "' seconds!");
        this.node.setMat(this.node.computeMatrix(this.defaultMat, this.getMatrix()));
        this.node.activeAnimation++;
        return;
    } else
        this.currAnimTime += deltaTime;

    this.totalAnimTime += deltaTime;
    var matFinal = this.node.computeMatrix(this.defaultMat, this.getMatrix());
    this.node.setMat(matFinal);
};