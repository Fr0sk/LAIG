function Plane(scene, xLength, yLength, numDivsU, numDivsY) {
    this.scene = scene;
    this.xLength = xLength;
    this.yLength = yLength;
    this.numDivsU = numDivsU;
    this.numDivsY = numDivsY;

    return this.makeSurface(1, 1,
        [	// U = 0
            [ // V = 0..1;
                [-this.xLength, -this.yLength, 0.0, 1],
                [-this.xLength, this.yLength, 0.0, 1]

            ],
            // U = 1
            [ // V = 0..1
                [this.xLength, -this.yLength, 0.0, 1],
                [this.xLength, this.yLength, 0.0, 1]
            ]
        ]);
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.makeSurface = function (degree1, degree2, controlVertexes) {
    var knots1 = this.getKnotsVector(degree1);
    var knots2 = this.getKnotsVector(degree2);

    var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, controlVertexes);
    getSurfacePoint = function (u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    var obj = new CGFnurbsObject(this.scene, getSurfacePoint, this.numDivsU, this.numDivsY);
    return obj;
};

Plane.prototype.getKnotsVector = function (degree) {
    var v = new Array();

    for (var i = 0; i <= degree; i++)
        v.push(0);

    for (var i = 0; i <= degree; i++)
        v.push(1);

    return v;
};