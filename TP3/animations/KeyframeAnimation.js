var KeyframeAnimation = function (node, keyframes) {
    this.node = node;
    this.keyframes = [];
    this.keyframes.push(keyframes);
}

KeyframeAnimation.prototype = Object.create(Animation.prototype);
KeyframeAnimation.prototype.constructor = KeyframeAnimation;

Keyframe.prototype.computeMatrix = function () {
    /*var delta = this.currAnimTime / this.pointsTime[this.currControlPoint];
    var opposite = this.controlPointsLength[this.currControlPoint].x;
    var adjacent = this.controlPointsLength[this.currControlPoint].z;
    var x = opposite * delta + this.controlPoints[this.currControlPoint - 1].x;
    var y = this.controlPointsLength[this.currControlPoint].y * delta + this.controlPoints[this.currControlPoint - 1].y;
    var z = adjacent * delta + this.controlPoints[this.currControlPoint - 1].z;
    
    var mat = []; 

    if (this.relative)
        mat = this.beginMat.slice();
    else
        mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.translate(mat, mat, [x, y, z]);
    var hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2));
    var angle = Math.acos(adjacent / hypotenuse) + Math.PI / 2;
    if (opposite < 0) angle += Math.PI;
    mat4.rotate(mat, mat, angle, [0, 1, 0]);
    return mat;*/

    
}

KeyframeAnimation.prototype.addKeyframe = function(keyframe) {
    this.keyframes.push(keyframe);
}

KeyframeAnimation.prototype.animate = function(deltaTime) {
    console.log(deltaTime);
}