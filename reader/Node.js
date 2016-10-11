function Node() {
    this.materials = null;
    this.texture = null;
    this.mat = null;        //transformation matrix
    this.children = [];
    this.primitive = null;
}

Node.prototype.setMaterials = function(materials) {
    this.materials = materials;
}

Node.prototype.setTexture = function(texture) {
    this.texture = texture;
}

Node.prototype.setMat = function(mat) {
    this.mat = mat;
}

Node.prototype.setChildren = function(children) {
    this.children = children;
}

Node.prototype.setPrimitive = function(primitive) {
    this.primitive = primitive;
}