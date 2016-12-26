function PrimitiveBuilder() {
    // Empty block
}

// Builds a rectangle with the diagonal vertices
PrimitiveBuilder.buildRect = function(scene, x1, y1, x2, y2, length_s, length_t) {
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

        this.texCoords = [
            0, 0,
            1 / this.length_s, 0,
            1 / this.length_s, 1 / this.length_t,
            0, 1 / this.length_t
        ];

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };

    var rect = new Rect(scene, x1, y1, x2, y2, length_s, length_t);
    return rect;
}

// Builds a triangle with the given verices
PrimitiveBuilder.buildTri = function(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, length_s, length_t) {
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

    Tri.prototype.initBuffers = function() {

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

        this.a = Math.sqrt((this.x3 - this.x2) * (this.x3 - this.x2) + (this.y3 - this.y2) * (this.y3 - this.y2) + (this.z3 - this.z2) * (this.z3 - this.z2));
        this.b = Math.sqrt((this.x1 - this.x3) * (this.x1 - this.x3) + (this.y1 - this.y3) * (this.y1 - this.y3) + (this.z1 - this.z3) * (this.z1 - this.z3));
        this.c = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1) + (this.z2 - this.z1) * (this.z2 - this.z1));

        this.beta = Math.acos(((this.a * this.a) - (this.b * this.b) + (this.c * this.c)) / (2 * this.a * this.c));

        this.texCoords = [
            0.0, 0.0,
            this.c * this.length_s, 0.0,
            (this.c - this.a * Math.cos(this.beta)) * this.length_s, -(this.a * Math.sin(this.beta)) * this.length_t
        ];

        // Takes the data in vertices, indices and normals and puts in buffers to be used by WebGl.
        this.initGLBuffers();
    };

    var tri = new Tri(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, length_s, length_t);
    return tri;
}

// Builds a cylinder with given params
PrimitiveBuilder.buildCylinder = function(scene, base, top, height, slices, stacks) {
    function Cylinder(scene, base, top, height, slices, stacks) {
        this.scene = scene;
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Cylinder.prototype = Object.create(CGFobject.prototype);
    Cylinder.prototype.constructor = Cylinder;

    Cylinder.prototype.initBuffers = function() {

        this.primitiveType = this.scene.gl.TRIANGLES;


        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var index = 0;

        for (var j = 0; j <= this.stacks; j++) {
            for (var i = 0; i <= this.slices; i++) {
                var r = this.base + (this.top - this.base) * j / this.stacks;
                var x = r * Math.cos(i / this.slices * Math.PI * 2);
                var y = r * Math.sin(i / this.slices * Math.PI * 2);
                var z = this.height * j / this.stacks;
                this.vertices.push(x, y, z);
                this.normals.push(x, y, 0);
                this.texCoords.push(i / this.slices, j / this.stacks);

                if (i < this.slices && j < this.stacks) {
                    var first = (j * (this.slices + 1)) + i;
                    var second = first + this.slices + 1;
                    this.indices.push(first + 1, second + 1, second);
                    this.indices.push(first + 1, second, first);
                }
                index++;
            }
        }

        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, -1);
        this.texCoords.push(0, 0);
        var centerIndex = index;
        index++;
        for (var i = 0; i <= this.slices; i++) {
            var x = this.base * Math.cos(i / this.slices * Math.PI * 2);
            var y = this.base * Math.sin(i / this.slices * Math.PI * 2);;
            var z = 0;
            this.vertices.push(x, y, z);
            if (i < this.slices) {
                this.indices.push(centerIndex, index + 1, index);
            }
            this.normals.push(0, 0, -1);
            this.texCoords.push(0, 0);
            index++;
        }

        this.vertices.push(0, 0, height);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0, 0);
        var centerIndex = index;
        index++;
        for (var i = 0; i <= this.slices; i++) {
            var x = this.top * Math.cos(i / this.slices * Math.PI * 2);
            var y = this.top * Math.sin(i / this.slices * Math.PI * 2);
            var z = height;
            this.vertices.push(x, y, z);
            if (i < this.slices) {
                this.indices.push(centerIndex, index, index + 1);
            }
            this.normals.push(0, 0, 1);
            this.texCoords.push(1, 1);
            index++;
        }

        this.initGLBuffers();
    };

    var cylinder = new Cylinder(scene, base, top, height, slices, stacks);
    return cylinder;
}

// Builds a sphere with given params
PrimitiveBuilder.buildSphere = function(scene, radius, slices, stacks) {
    function Sphere(scene, radius, slices, stacks) {
        this.scene = scene;
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        CGFobject.call(this, scene);
        this.initBuffers();
    };

    Sphere.prototype = Object.create(CGFobject.prototype);
    Sphere.prototype.constructor = Sphere;

    Sphere.prototype.initBuffers = function() {

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

    var sphere = new Sphere(scene, radius, slices, stacks);
    return sphere;
}

// Builds a torus with given params
PrimitiveBuilder.buildTorus = function(scene, inner, outer, slices, loops) {
    function Torus(scene, inner, outer, slices, loops) {
        this.scene = scene;
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        CGFobject.call(this, scene);
        this.initBuffers();
    }

    Torus.prototype = Object.create(CGFobject.prototype);
    Torus.prototype.constructor = Torus;

    Torus.prototype.initBuffers = function() {

        this.primitiveType = this.scene.gl.TRIANGLES;

        var radius = (this.outer - this.inner) / 2;
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        for (var latNumber = 0; latNumber <= this.slices; latNumber++) {
            var theta = latNumber * 2 * Math.PI / this.slices;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= this.loops; longNumber++) {
                var phi = longNumber * 2 * Math.PI / this.loops;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = (this.inner + radius + radius * Math.cos(phi)) * Math.cos(theta);
                var y = (this.inner + radius + radius * Math.cos(phi)) * Math.sin(theta);
                var z = radius * Math.sin(phi);
                var u = 1 - (longNumber / this.loops);
                var v = 1 - (latNumber / this.slices);

                this.normals.push(x);
                this.normals.push(y);
                this.normals.push(z);
                this.texCoords.push(u);
                this.texCoords.push(v);
                this.vertices.push(x);
                this.vertices.push(y);
                this.vertices.push(z);
            }
        }

        for (var latNumber = 0; latNumber < this.slices; latNumber++) {
            for (var longNumber = 0; longNumber < this.loops; longNumber++) {
                var first = (latNumber * (this.loops + 1)) + longNumber;
                var second = first + this.loops + 1;
                this.indices.push(first);
                this.indices.push(second);
                this.indices.push(first + 1);
                this.indices.push(second);
                this.indices.push(second + 1);
                this.indices.push(first + 1);
            }
        }

        this.initGLBuffers();
    }

    var torus = new Torus(scene, inner, outer, slices, loops);
    return torus;
}

PrimitiveBuilder.buildTradingStation = function(scene) {
    function TradingStation(scene) {
        this.scene = scene;
        this.cyl1 = PrimitiveBuilder.buildCylinder(scene, 1, 1, 0.1, 32, 1);
        this.cyl2 = PrimitiveBuilder.buildCylinder(scene, 0.1, 0.1, 0.8, 10, 4);
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(1, 1, 1, 1);
        this.appearance.loadTexture('./resources/space_metal.jpg');
        CGFobject.call(this, scene);
    };

    TradingStation.prototype = Object.create(CGFobject.prototype);
    TradingStation.prototype.constructor = TradingStation;

    TradingStation.prototype.display = function() {
        this.scene.pushMatrix();
            this.appearance.apply();
            this.scene.rotate(Math.PI/2, -1, 0, 0);
            this.cyl1.display();
            this.scene.translate(0, 0, -0.3);
            this.cyl2.display();
        this.scene.popMatrix();
    };

    var tradingStation = new TradingStation(scene);
    return tradingStation;
}
