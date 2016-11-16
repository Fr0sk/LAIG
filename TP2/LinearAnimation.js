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
    this.individualLengths = []; //TODO remove    
    this.setupLengths();
    
    this.timePerPoint = animTime / (controlPoints.length - 1);
    this.velocity = this.length / this.animTime;
    this.animTransfMat = node.getMat();
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.setupLengths = function () {
    for (var i = 1; i < this.controlPoints.length; i++) {
        var controlPointLength = {
            x: this.controlPoints[i-1].x - this.controlPoints[i].x,
            y: this.controlPoints[i-1].y - this.controlPoints[i].y,
            z: this.controlPoints[i-1].z - this.controlPoints[i].z
        };

        var length = Math.sqrt(Math.pow(controlPointLength.x, 2) + Math.pow(controlPointLength.y, 2) + Math.pow(controlPointLength.z, 2));
        this.individualLengths.push(length);
        this.length += length;
    }
}

LinearAnimation.prototype.getMatrix = function () {
    /*if (this.currDist > this.individualLengths[this.currControlPoint - 1]) {
        //this.currControlPoint++;
        this.currAnimTime = 0;
    }*/

    //this.currDist = this.velocity * this.currAnimTime * deltaTime;
    //console.info("currDist = " + currDist + ", velocity = " + this.velocity + ", currAnimTime = " + this.currAnimTime);

    var xDist = this.controlPoints[this.currControlPoint].x - this.controlPoints[this.currControlPoint - 1].x;
    var yDist = this.controlPoints[this.currControlPoint].y - this.controlPoints[this.currControlPoint - 1].y;
    var zDist = this.controlPoints[this.currControlPoint].z - this.controlPoints[this.currControlPoint - 1].z;
    var x = xDist * this.currAnimTime / this.timePerPoint * this.velocity;
    var y = yDist * this.currAnimTime / this.timePerPoint * this.velocity;
    var z = zDist * this.currAnimTime / this.timePerPoint * this.velocity;

    console.debug("DEBUG1:" + this.timePerPoint);
    console.debug("DEBUG2:" + this.currAnimTime);

    /*if (b) {
        b = false;
        console.info("currDist = " + this.currDist + ", velocity = " + this.velocity + ", currAnimTime = " + this.currAnimTime);
        console.info("X = " + x + ", Y = " + y + ", Z = " + z);
    }*/

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
    this.currAnimTime += deltaTime;
    this.totalAnimTime += deltaTime;
    if (this.totalAnimTime >= this.animTime || this.currControlPoint == this.controlPoints.length) {
        console.info("End of animation, animation took '" + this.currAnimTime + "' seconds!");
        //this.node.setMat(this.node.computeMatrix(this.animTransfMat, this.getMatrix()));
        this.node.activeAnimation++;
        return;
    } else if (this.currAnimTime >= this.timePerPoint) {
        this.currControlPoint++;
        this.currAnimTime = 0;
        this.animTransfMat = this.node.computeMatrix(this.animTransfMat, this.getMatrix());
        this.node.setMat(this.animTransfMat);
    } else {
        this.node.setMat(this.node.computeMatrix(this.animTransfMat, this.getMatrix()));
    }
};

