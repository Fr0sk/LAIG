/**
 * Constructor
 */
var CircularAnimation = function (node, center, radius, starting, rotang, animTime) {
    Animation.apply(this, arguments);

    //CircularAnimation initialization
    this.node = node;
    this.center = center;
    this.centerX = 5;
    this.centerY = 0;
    this.centerZ = 5;
    this.radius = radius;
    this.starting = 0;
    this.rotang = 45;
    this.animTime = animTime;

    this.defaultMat = node.getMat();
    this.type = "circular";

    this.totalAnimTime = 0;

    console.info(this.center, this.radius, this.initAng, this.endAng, this.animTime);

    this.totalLength = this.getTotalLength();
    console.info("Perimetro a considerar: " + this.totalLength);
    this.velocity = 0.02;//this.totalLength / this.animTime;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getTotalLength = function (deltaTime) {
    var angInit = Math.PI / 180.0 * this.starting;
    var angEnd = Math.PI / 180.0 * this.rotang;

    return 2 * Math.PI * this.radius * ((this.rotang - this.starting) / 360);
}

CircularAnimation.prototype.getMatrix = function (dist) {
    var mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    mat4.rotate(mat, mat, (this.rotang - this.starting) * (Math.PI / 180.0) * dist, [1, 0, 0]);

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
    var dist = this.velocity * this.totalAnimTime;
    this.node.setMat(this.node.computeMatrix(this.node.getMat(), this.getMatrix(dist)));
};