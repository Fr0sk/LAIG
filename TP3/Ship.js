function Ship(scene, id, owner) {
    Node.call(this, id);
    this.scene = scene;
    this.patch = PatchBuilder.buildVehiclePatch(scene, id);
    this.owner = owner;
    this.id = id;
}

Ship.prototype = Object.create(Node.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function(deltaTime) {
    if (this.animations.length > 0) {
        if (this.animations[0].ended) 
            this.animations.pop(); 
        else
            this.animations[0].animate(deltaTime);
    }
}

Ship.prototype.display = function() {
    var mat = this.mat.slice();
    if (this.translate) mat4.translate(mat, mat, [this.translate.x, this.translate.y, this.translate.z]);
    if (this.rotate) { mat4.rotateX(mat, mat, this.rotate.x); mat4.rotateY(mat, mat, this.rotate.y); mat4.rotateZ(mat, mat, this.rotate.z); }
    if (this.scale) mat4.scale(mat, mat, [this.scale.x, this.scale.y, this.scale.z]);
    this.scene.pushMatrix();
        this.scene.multMatrix(mat)
        this.scene.pushMatrix();
            //this.scene.translate(0, 1, 0);
            this.patch.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            //this.scene.translate(0, 1, 0);
            this.scene.rotate(Math.PI, 1, 0, 0);
            this.patch.display();
        this.scene.popMatrix();
    this.scene.popMatrix();
}