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
    this.controlPointsLength = [{x:0, y:0, z:0}];
    this.setupLengths();

    this.pointsTime = [0];
    this.setupTimes();
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.setupLengths = function () {
    for (var i = 1; i < this.controlPoints.length; i++) {
        var controlPointLength = {
            x: this.controlPoints[i].x - this.controlPoints[i-1].x,
            y: this.controlPoints[i].y - this.controlPoints[i-1].y,
            z: this.controlPoints[i].z - this.controlPoints[i-1].z,
            length: 0
        };
        controlPointLength.length = Math.sqrt(Math.pow(controlPointLength.x, 2) + Math.pow(controlPointLength.y, 2) + Math.pow(controlPointLength.z, 2));
        this.controlPointsLength.push(controlPointLength);
        this.length += controlPointLength.length;
    }
}

LinearAnimation.prototype.setupTimes = function () {
    for (var i = 1; i < this.controlPoints.length; i++)
        this.pointsTime.push(this.animTime * (this.controlPointsLength[i].length / this.length));
}   

LinearAnimation.prototype.computeMatrix = function () {
    var delta = this.currAnimTime / this.pointsTime[this.currControlPoint];
    var opposite = this.controlPointsLength[this.currControlPoint].x;
    var adjacent = this.controlPointsLength[this.currControlPoint].z;
    var x = opposite * delta + this.controlPoints[this.currControlPoint - 1].x;
    var y = this.controlPointsLength[this.currControlPoint].y * delta + this.controlPoints[this.currControlPoint - 1].y;
    var z = adjacent * delta + this.controlPoints[this.currControlPoint - 1].z;
    
    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.translate(mat, mat, [x, y, z]);
    
    var hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2));
    var angle = Math.acos(adjacent / hypotenuse);
    if (opposite < 0) angle = -angle;
    mat4.rotate(mat, mat, angle, [0, 1, 0]);
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
        this.node.setMat(this.computeMatrix());
        this.currControlPoint++;
        this.currAnimTime = 0;
    } else {
        this.node.setMat(this.computeMatrix());
    }
};

