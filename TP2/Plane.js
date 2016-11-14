function Plane(scene) {
    this.scene = scene;

    var a =
        [	// U = 0
            [ // V = 0..1;
                [-2.0, -2.0, 0.0, 1],
                [-2.0, 2.0, 0.0, 1]

            ],
            // U = 1
            [ // V = 0..1
                [2.0, -2.0, 0.0, 1],
                [2.0, 2.0, 0.0, 1]
            ]
        ];

    this.makeSurface(1, 1, a);
    

    CGFnurbsObject.call(this,scene,SurfFunc,partsX,partsY);
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.makeSurface = function(degree1, degree2, controlVertexes) {
    var knotsU = this.getKnotsVector(degree1);
    var knotsV = this.getKnotsVector(degree2);

    var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knotsU, knotsV, controlVertexes);
    getSurfacePoint = function (u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    var obj = new CGFnurbsObject(this.scene, getSurfacePoint, 20, 20);
    return obj;
};

Plane.prototype.getKnotsVector = function (degree) {
    var v = new Array();

    for (var i = 0; i < degree; i++)
        v.push(0);

    for (var i = 0; i < degree; i++)
        v.push(1);

    return v;
};