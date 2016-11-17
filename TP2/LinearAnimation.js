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

    this.currAnimTime = 0;
    this.totalAnimTime = 0;
    this.currDist = 0;
    this.currControlPoint = 1;
    this.type = "linear";

    this.length = 0;
    this.pointsLength = [0];
    this.pointsCoordLength = [{x:0, y:0, z:0}];
    this.setupLengths();

    this.pointsTime = [0];
    this.setupTimes();
    
    this.velocity = this.length / this.animTime;
    this.animTransfMat = node.getMat();
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.setupLengths = function () {
    for (var i = 1; i < this.controlPoints.length; i++) {
        var controlPointLength = {
            x: this.controlPoints[i].x - this.controlPoints[0].x,
            y: this.controlPoints[i].y - this.controlPoints[0].y,
            z: this.controlPoints[i].z - this.controlPoints[0].z
        };
        var length = Math.sqrt(Math.pow(controlPointLength.x, 2) + Math.pow(controlPointLength.y, 2) + Math.pow(controlPointLength.z, 2));
        this.pointsCoordLength.push(controlPointLength);
        this.pointsLength.push(length);
        this.length += length;
    }
}

LinearAnimation.prototype.setupTimes = function () {
    for (var i = 1; i < this.controlPoints.length; i++)
        this.pointsTime.push(this.animTime * (this.pointsLength[i] / this.length));
}   

LinearAnimation.prototype.getMatrix = function () {
    var delta = this.currAnimTime / this.pointsTime[this.currControlPoint];
    var x = this.pointsCoordLength[this.currControlPoint].x * delta;
    var y = this.pointsCoordLength[this.currControlPoint].y * delta;
    var z = this.pointsCoordLength[this.currControlPoint].z * delta;
    console.debug("DEBUG1: " + z);
    console.debug("DEBUG1: " + this.pointsCoordLength[this.currControlPoint].z);
    console.debug("DEBUG1: " + this.pointsCoordLength[this.currControlPoint].z);

    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.translate(mat, mat, [x, y, z]);
    return mat;
}

LinearAnimation.prototype.animate = function (deltaTime) {
    this.currAnimTime += deltaTime;
    this.totalAnimTime += deltaTime;
    if (this.totalAnimTime >= this.animTime || this.currControlPoint == this.controlPoints.length) {
        console.info("End of animation, animation took '" + this.currAnimTime + "' seconds!");
        this.node.activeAnimation++;
        return;
    } else if (this.currAnimTime >= this.pointsTime[this.currControlPoint]) {
        
        this.currAnimTime = this.pointsTime[this.currControlPoint];
        this.animTransfMat = this.node.computeMatrix(this.animTransfMat, this.getMatrix());
        this.currControlPoint++;
        this.currAnimTime = 0;
        this.node.setMat(this.animTransfMat);
    } else {
        this.node.setMat(this.node.computeMatrix(this.animTransfMat, this.getMatrix()));
    }
};

