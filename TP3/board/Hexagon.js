function Hexagon(scene, height, frontAppearance, sideAppearance) {
    this.scene = scene;
    this.sideAppearance = sideAppearance;
    this.height = height ? height : 0.2;
    
    this.side = new HexagonSide(this.scene, this.height);

    this.initBuffers();
}

Hexagon.prototype = Object.create(CGFobject.prototype);
Hexagon.prototype.constructor = Hexagon;

Hexagon.prototype.initBuffers = function() {
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    this.vertices.push(0, this.height, 0);
    this.normals.push(0, 1, 0);
    this.texCoords.push(0.5, 0.5)
    for (var i = 1; i <= 6; i++) {
        var ang = 2 * Math.PI / 6;
        var x = Math.cos(ang * i);
        var z = Math.sin(ang * i);
        this.vertices.push(x, this.height, z);
        this.normals.push(0, 1, 0);
        this.texCoords.push((x + 1) / 2, (z + 1) / 2); 
    }
    
    for (var i = 1; i < 6; i++) {
        this.indices.push(0, i+1, i);
    }
    this.indices.push(0, 1, 6);

    this.initGLBuffers();
}

Hexagon.prototype.display = function() {
    CGFobject.prototype.display.call(this);
    if (!this.scene.pickMode) {
        if (this.sideAppearance) this.sideAppearance.apply();
        this.side.display();
    }
}

function HexagonSide(scene, height) {
    this.scene = scene;
    this.angle = Math.PI/3;
    this.translateZ = Math.sin(this.angle);
    var side =  Math.cos(this.angle);
    this.rect = PrimitiveBuilder.buildRect(scene, -side, 0, side, height, 1, 4);
}

HexagonSide.prototype = Object.create(CGFobject.prototype);
HexagonSide.prototype.constructor = HexagonSide;

HexagonSide.prototype.display = function() {
    for(var i = 0; i < 6; i++) {
        this.scene.pushMatrix();
            this.scene.rotate(this.angle * i, 0, 1, 0);
            this.scene.translate(0, 0, this.translateZ);
            this.rect.display();
        this.scene.popMatrix();
    }
}