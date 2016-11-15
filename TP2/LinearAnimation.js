/**
 * Constructor
 */

var a = true;

var LinearAnimation = function(node, animTime, controlPoints) {
    Animation.apply(this, arguments);

    //LinearAnimation initialization
    this.node = node;
    this.animTime = animTime;
    this.controlPoints = controlPoints;

    this.defaultMat = node.getMat();
    this.type = "linear";

    this.currAnimTime = 0;
    this.totalAnimTime = 0;
    this.currControlPoint = 0;

    this.totalLength = 0;
    this.calculateTotalLength();
    console.info("Length a percorrer: " + this.totalLength);
    this.velocity = this.totalLength / (this.animTime * 1000);
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.calculateTotalLength = function() {
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

LinearAnimation.prototype.getMatrix = function(dist) {
    var currDist = this.velocity * this.currAnimTime;

    var x = this.controlPoints[this.currControlPoint].x * currDist;
    var y = this.controlPoints[this.currControlPoint].y * currDist;
    var z = this.controlPoints[this.currControlPoint].z * currDist;

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

LinearAnimation.prototype.animate = function(deltaTime) {
    if (this.totalAnimTime >= this.animTime) {
        console.info("End of animation, animation took '" + this.totalAnimTime + "' seconds!");
        this.node.activeAnimation++;
        //this.node.setMat(this.defaultMat);
        return;
    } else if (this.currAnimTime >= this.animTime / this.controlPoints.length) {
        this.currAnimTime = 0;
        this.currControlPoint++;
        a = true;
    } else
        this.currAnimTime += deltaTime;

    this.totalAnimTime += deltaTime;
    var matFinal = this.node.computeMatrix(this.node.getMat(), this.getMatrix());
    this.node.setMat(matFinal);
};