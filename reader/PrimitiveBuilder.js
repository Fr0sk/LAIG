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

        var a = Math.sqrt((this.x1 - this.x3) * (this.x1 - this.x3) + (this.y1 - this.y3) * (this.y1 - this.y3) + (this.z1 - this.z3) * (this.z1 - this.z3));
        var b = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1) + (this.z2 - this.z1) * (this.z2 - this.z1));
        var c = Math.sqrt((this.x3 - this.x2) * (this.x3 - this.x2) + (this.y3 - this.y2) * (this.y3 - this.y2) + (this.z3 - this.z2) * (this.z3 - this.z2));

        var Y = (a * a + b * b - c * c) / (2 * a * b);
        var A = (-a * a + b * b + c * c) / (2 * b * c);
        var B = (a * a - b * b + c * c) / (2 * a * c);

        var sinB = Math.sqrt(((a * a) - (a * a) * (B * B)) / (a * a));

        this.texCoords = [
            0, 0,
            c, 0,
            c - a * B, a * sinB
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
                var phi = long * 2 * Math.PI / this.slices;

                var x = radius * Math.cos(phi);
                var y = radius * Math.sin(phi);
                var z = this.height * Math.cos(theta);

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

        console.info(this.vertices.length, this.indices.length);

        //Base top
        this.vertices.push(0, 0, this.height);
        for (var i = 0; i < this.slices; i++) {
            //this.vertices.push(this.vertices[i]);
            this.normals.push(0, 0, 1);
        }
        for (var i = 0; i < this.slices; i++)
            this.indices.push(0, i + 1, i + 2);

        /*for (var i = 0; i < tmpBaseVert.length / 3; i++) {

        }*/


        //MEU
        //this.vertices.push(0, 0, this.height)
        //Como os primeiros vertices sao os vertices que estao onde z = height, usamos esses vertices para os replicar
        /*for (var i = 0; i < this.slices; i++) {
            this.vertices.push(this.vertices[i]);
            if ()
            this.normals.push(0, 0, 1);
        }*/

        //E depois comecamos a fazer push aos indices, seguindo a regra da mao direita
        /*for (var i = 0; i < this.slices; i++)
            this.indices.push(0, i + 1, i + 2);*/

        /*var centerIndex = this.vertices.length;
        this.vertices.push(0, 0, 0);
        for (var i = 0; i < this.slices; i++) {
            var phi = i * 2 * Math.PI / slices;
            var x = Math.cos(phi);
            var y = Math.sin(phi);
            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, -1);
        }
        for (var i = 1; i < this.slices; i++)
            this.indices.push(this.vertices[centerIndex],
                this.vertices[centerIndex + i],
                this.vertices[centerIndex + (i + 1)]);*/











        // Faces
        /*var centerIndex = this.vertices.length;
        
        this.vertices.push(0, 0, 0);
        
        this.normals.push(0, 0, -1);
        for (var long = 0; long <= this.slices; long++) {
            var phi = long * 2 * Math.PI / this.slices;
            var x = radius * Math.cos(phi);
            var y = radius * Math.sin(phi);
            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, -1);
        }
        console.info("center index: " + centerIndex);
        console.info("vertices length: " + this.vertices.length);
        console.info("slices: " + this.slices);
        var i;
        for (i = 1; i < this.slices; i++) {
            this.indices.push(centerIndex, centerIndex + i , centerIndex + i + 1);
            console.log("RANGE: " + centerIndex + i + 1);
        }
        this.indices.push(centerIndex, centerIndex + i, centerIndex + 1);*/


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

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        var indexData = [];

        for (var latNumber = 0; latNumber <= this.slices; latNumber++) {
            var theta = latNumber * 2 * Math.PI / this.slices;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= this.loops; longNumber++) {
                var phi = longNumber * 2 * Math.PI / this.loops;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = (1 + radius * Math.cos(phi)) * Math.cos(theta);
                var y = (1 + radius * Math.cos(phi)) * Math.sin(theta);
                var z = radius * Math.sin(phi);
                var u = 1 - (longNumber / this.loops);
                var v = 1 - (latNumber / this.slices);

                this.normals.push(x);
                this.normals.push(y);
                this.normals.push(z);
                this.texCoords.push(u);
                this.texCoords.push(v);
                this.vertices.push(this.inner * x);
                this.vertices.push(this.inner * y);
                this.vertices.push(this.inner * z)
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