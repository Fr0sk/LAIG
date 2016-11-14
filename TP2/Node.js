function Node(id) {
    this.id = id;
    this.indexActiveMaterial = 0;
    this.materials = [];
    this.texture = null;
    this.mat = null;        //transformation matrix
    this.children = [];
    this.primitive = null;
    this.animations = [];
    this.activeAnimation = 0;
};

Node.prototype.pushMaterial = function (material) {
    this.materials.push(material);
};

Node.prototype.setTexture = function (texture) {
    this.texture = texture;
    for (var i = 0; i < this.materials.length; i++)
        this.materials[i].setTexture(texture);
};

Node.prototype.setMat = function (mat) {
    this.mat = mat;
};

Node.prototype.getMat = function (mat) {
    var mat = this.mat;
    if (this.animations.length > 0)
        mat = computeMatrix(mat, this.animations[this.activeAnimation].getMatrix());

    return mat;
}

Node.prototype.pushChild = function (child) {
    this.children.push(child);
};

Node.prototype.setPrimitive = function (primitive) {
    this.primitive = primitive;
};

Node.prototype.getMaterials = function () {
    return this.materials;
};

Node.prototype.pushAnimation = function (animation) {
    this.animations.push(animation);
};

Node.prototype.computeMatrix = function (mat1, mat2) {
    if (mat1.length != 16 || mat2.length != 16) return;
    var mult = [];

    for (var i = 0; i < mat1.length / 4; i++) {
        for (var j = 0; j < mat2.length / 4; j++) {
            var sum = 0;
            for (var offset = 0; offset < 4; offset++)
                sum += mat1[4 * i + offset] * mat2[j + 4 * offset];

            mult.push(sum);
        }
    }

    return mult;
}