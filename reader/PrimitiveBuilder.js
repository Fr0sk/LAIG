function PrimitiveBuilder() {
    // Empty block
}

// Builds a rectangle with the diagonal vertices
PrimitiveBuilder.buildRect = function (scene, x1, y1, x2, y2, length_s, length_t) {
    function Rect(scene, x1, y1, x2, y2, length_s, length_t) {
        this.scene = scene;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.length_s = length_s;
        this.length_t = length_t;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Rect.prototype = Object.create(CGFobject.prototype);
    Rect.prototype.constructor = Rect;

    Rect.prototype.initBuffers = function () {

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

        this.texCoords = [
            0, 0,
            this.length_s, 0,
            this.length_s, this.length_t,
            0, this.length_t
        ];

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };

    var rect = new Rect(scene, x1, y1, x2, y2, length_s, length_t);
    return rect;
}

// Builds a triangle with the given verices
PrimitiveBuilder.buildTri = function (scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, length_s, length_t) {
    function Tri(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, length_s, length_t) {
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
        this.length_s = length_s;
        this.length_t = length_t;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Tri.prototype = Object.create(CGFobject.prototype);
    Tri.prototype.constructor = Tri;

    Tri.prototype.initBuffers = function () {

        // Only draws triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        // Vertices
        this.vertices = [
            this.x1, this.y1, this.z1,
            this.x2, this.y2, this.z2,
            this.x3, this.y3, this.z3
        ];

        //console.log("TRIANGLE: " + this.x1 + " " + this.y1 + " " + this.z1 + " " + this.x2 + " " + this.y2 + " " + this.z2 + " " + this.x3 + " " + this.y3 + " " + this.z3);

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

        this.texCoords = [
            0, 0,
            1, 0,
            1, 1
        ];

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };

    var tri = new Tri(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, length_s, length_t);
    return tri;
}

// Builds a cylinder with given params
PrimitiveBuilder.buildCylinder = function (scene, base, top, height, slices, stacks, length_s, length_t) {
    function Cylinder(scene, base, top, height, slices, stacks, length_s, length_t) {
        this.scene = scene;
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.length_s = length_s;
        this.length_t = length_t;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Cylinder.prototype = Object.create(CGFobject.prototype);
    Cylinder.prototype.constructor = Cylinder;

    Cylinder.prototype.initBuffers = function () {

        this.primitiveType = this.scene.gl.TRIANGLES;

        var ang = (2 * Math.PI) / this.slices;
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var transition = (this.base - this.top) / this.stacks;

        for (var lat = 0; lat <= this.stacks; lat++) {
            var theta = lat * (Math.PI / 2) / this.stacks;
            var radius = top + transition * lat;

            for (var long = 0; long <= this.slices; long++) {
                var phi = -1 * long * 2 * Math.PI / this.slices;

                var x = radius * Math.cos(phi);
                var y = this.height * Math.cos(theta);
                var z = radius * Math.sin(phi);

                this.vertices.push(x, y, z);
                this.texCoords.push(lat / this.stacks, long / this.slices);
            }
        }
        this.normals = this.vertices;

        for (var lat = 0; lat < this.stacks; lat++) {
            for (var long = 0; long < this.slices; long++) {
                var first = (lat * (this.slices + 1)) + long;
                var second = first + this.slices + 1;
                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }

        this.initGLBuffers();
    };

    var cylinder = new Cylinder(scene, base, top, height, slices, stacks, length_s, length_t);
    return cylinder;
}

// Builds a sphere with given params
PrimitiveBuilder.buildSphere = function (scene, radius, slices, stacks, length_s, length_t) {
    function Sphere(scene, radius, slices, stacks, length_s, length_t) {
        this.scene = scene;
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.length_s = length_s;
        this.length_t = length_t;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Sphere.prototype = Object.create(CGFobject.prototype);
    Sphere.prototype.constructor = Sphere;

    Sphere.prototype.initBuffers = function () {

        // Only draws triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        for (var lat = 0; lat <= this.stacks; lat++) {
            var theta = lat * Math.PI / this.stacks;

            for (var long = 0; long <= this.slices; long++) {
                var phi = long * 2 * Math.PI / this.slices;

                var x = this.radius * Math.cos(phi) * Math.sin(theta);
                var y = this.radius * Math.sin(phi) * Math.sin(theta);
                var z = this.radius * Math.cos(theta);

                this.vertices.push(x, y, z);
                this.texCoords.push(long / this.slices, lat / this.stacks);
            }
        }
        this.normals = this.vertices;

        for (var lat = 0; lat < this.stacks; lat++) {
            for (var long = 0; long < this.slices; long++) {
                var first = (lat * (this.slices + 1)) + long;
                var second = first + this.slices + 1;
                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };

    var sphere = new Sphere(scene, radius, slices, stacks, length_s, length_t);
    return sphere;
}

// Builds a torus with given params
PrimitiveBuilder.buildTorus = function (scene, inner, outer, slices, loops, length_s, length_t) {
    var torus = {};
    // TODO Build torus
    return torus;
}