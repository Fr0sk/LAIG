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

Node.prototype.pushChild = function(child) {
    this.children.push(child);
};

Node.prototype.setPrimitive = function(primitive) {
    this.primitive = primitive;
};

Node.prototype.getMaterials = function() {
    return this.materials;
};

Node.prototype.pushAnimation = function(animation) {
    this.animations.push(animation);
};