function Node() {
    this.material = null;
    this.texture = null;
    this.mat = null;        //transformation matrix
    this.children = [];
    this.primitive = null;
}

Node.prototype.push = function(nodeName) {
    this.children.push(nodeName);
}

Node.prototype.getSize = function() {
    return this.children.length;
}