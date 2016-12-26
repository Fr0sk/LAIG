function Node(id) {
    this.id = id;
    this.indexActiveMaterial = 0;
    this.materials = [];
    this.texture = null;
    this.children = [];
    this.primitive = null;
    this.animations = [];
    this.activeAnimation = 0;
    this.activeShader = null;       //null to avoid shaders, int to select shader
    this.primitiveWithShaderInfo = null;
    this.hidden = false;
    this.pickingId = -1;

    this.mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];
    this.translate = {x: 0, y:0, z:0};
    this.rotate = {x: 0, y:0, z:0};
    this.scale = {x: 1, y:1, z:1};
};

Node.prototype.pushMaterial = function(material) {
    this.materials.push(material);
};

Node.prototype.setTexture = function(texture) {
    this.texture = texture;
    for (var i = 0; i < this.materials.length; i++)
        this.materials[i].setTexture(texture);
};

Node.prototype.setMat = function(mat) {
    this.mat = mat;
};

Node.prototype.getMat = function() {
    return this.mat;
}

Node.prototype.pushChild = function(child) {
    this.children.push(child);
};

Node.prototype.setPrimitive = function(primitive) {
    this.primitive = primitive;
};

Node.prototype.getMaterials = function() {
    return this.materials;
};

Node.prototype.getPrimitive = function() {
    return this.primitive;
};

Node.prototype.pushAnimation = function(animation) {
    this.animations.push(animation);
};

Node.prototype.setupShaders = function(scene) {
    scene.setActiveShader(scene.testShaders[this.activeShader]);
    this.texture.bind(this.activeShader);

    if (this.activeShader == 0) {
        scene.testShaders[0].setUniformsValues({ dimX: this.primitiveWithShaderInfo.partsX });
        scene.testShaders[0].setUniformsValues({ dimY: this.primitiveWithShaderInfo.partsY });
        scene.testShaders[0].setUniformsValues({ selectedU: this.primitiveWithShaderInfo.selectedU });
        scene.testShaders[0].setUniformsValues({ selectedV: this.primitiveWithShaderInfo.selectedV });

        scene.testShaders[0].setUniformsValues({ c1R: this.primitiveWithShaderInfo.c1R });
        scene.testShaders[0].setUniformsValues({ c1G: this.primitiveWithShaderInfo.c1G });
        scene.testShaders[0].setUniformsValues({ c1B: this.primitiveWithShaderInfo.c1B });
        scene.testShaders[0].setUniformsValues({ c1A: this.primitiveWithShaderInfo.c1A });

        scene.testShaders[0].setUniformsValues({ c2R: this.primitiveWithShaderInfo.c2R });
        scene.testShaders[0].setUniformsValues({ c2G: this.primitiveWithShaderInfo.c2G });
        scene.testShaders[0].setUniformsValues({ c2B: this.primitiveWithShaderInfo.c2B });
        scene.testShaders[0].setUniformsValues({ c2A: this.primitiveWithShaderInfo.c2A });

        scene.testShaders[0].setUniformsValues({ csR: this.primitiveWithShaderInfo.csR });
        scene.testShaders[0].setUniformsValues({ csG: this.primitiveWithShaderInfo.csG });
        scene.testShaders[0].setUniformsValues({ csB: this.primitiveWithShaderInfo.csB });
        scene.testShaders[0].setUniformsValues({ csA: this.primitiveWithShaderInfo.csA });
    }
};

Node.prototype.update = function(deltaTime) {
    if (this.animations.length > 0) {
        if (this.animations[0].ended) 
            this.animations.pop(); 
        else
            this.animations[0].animate(deltaTime);
    }
}

Node.prototype.display = function(scene) {
    var mat = this.mat.slice();
    //Apply transformation matrix
    if (this.translate) mat4.translate(mat, mat, [this.translate.x, this.translate.y, this.translate.z]);
    if (this.rotate) { mat4.rotateX(mat, mat, this.rotate.x); mat4.rotateY(mat, mat, this.rotate.y); mat4.rotateZ(mat, mat, this.rotate.z); }
    if (this.scale) mat4.scale(mat, mat, [this.scale.x, this.scale.y, this.scale.z]);
    scene.multMatrix(mat)

    if(this.primitive) {
        if(scene.pickMode && this.pickingId > -1) {
            scene.registerForPick(this.pickingId, this.getPrimitive());
            this.primitive.display();
            scene.clearPickRegistration();
        } else if (!scene.pickMode && !this.hidden)
            this.primitive.display();
    }
}