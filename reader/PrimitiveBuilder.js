function PrimitiveBuilder() {
    // Empty block
}

// Builds a rectangle with the diagonal vertices
PrimitiveBuilder.buildRect = function(scene, x1, y1, x2, y2) {
    function Rect(scene, x1, y1, x2, y2) {
        this.scene = scene;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Rect.prototype = Object.create(CGFobject.prototype);
    Rect.prototype.constructor = Rect;

    Rect.prototype.initBuffers = function() {
        
        // Only draws triangles
        this.primitiveType = this.scene.gl.TRIANGLES;
        
        // Vertices
        this.vertices = [
            this.x1, this.y1, 0,
            this.x2, this.y1, 0,
            this.x2, this.y2, 0,
            this.x1, this.y2, 0
        ];

        // Indices
        this.indices = [
            0, 1, 2,
            2, 3, 0
        ];

        // Normals
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };

    var rect = new Rect(scene, x1, y1, x2, y2);
    return rect;  
}

// Builds a triangle with the given verices
PrimitiveBuilder.buildTri = function(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    function Tri(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        this.scene = scene;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Tri.prototype = Object.create(CGFobject.prototype);
    Tri.prototype.constructor = Tri;

    Tri.prototype.initBuffers = function() {
        
        // Only draws triangles
        this.primitiveType = this.scene.gl.TRIANGLES;
        
        // Vertices
        this.vertices = [
            this.x1, this.y1, this.z1,
            this.x2, this.y2, this.z2,
            this.x3, this.y3, this.z3
        ];

        console.log("TRIANGLE: " + this.x1 + " " + this.y1 + " " + this.z1 + " " + this.x2 + " " + this.y2 + " " + this.z2 + " " + this.x3 + " " + this.y3 + " " + this.z3);

        // Indices
        this.indices = [
            0, 1, 2
        ];

        // Perpendicular vector
        var xp = this.y1 * this.z2 - this.z1 * this.y2;
        var yp = this.z1 * this.x2 - this.x1 * this.z2;
        var zp = this.x1 * this.y2 - this.y1 * this.x2;

        // Normals
        this.normals = [
            xp, yp, zp,
            xp, yp, zp,
            xp, yp, zp,
        ];

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };
    
    var tri = new Tri(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
    return tri;
}

// Builds a cylinder with given params
PrimitiveBuilder.buildCylinder = function(base, top, height, slices, stacks) {
    var cylinder = {};
    // TODO Build cylinder
    return cylinder;
}

// Builds a sphere with given params
PrimitiveBuilder.buildSphere = function(radius, slices, stacks) {
    var sphere = {};
    // TODO Build sphere
    return sphere;
}

// Builds a torus with given params
PrimitiveBuilder.buildTorus = function(inner, outer, slices, loops) {
    var torus = {};
    // TODO Build torus
    return torus;
}