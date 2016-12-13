function Ship(scene, id, owner) {
    Node.call(this, id);
    this.scene = scene;
    this.patch = PatchBuilder.buildVehiclePatch(scene, id);
    this.owner = owner;
    this.mat = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];
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
    this.scene.pushMatrix();
        this.scene.scale(5, 5, 5);
        this.scene.pushMatrix();
            this.scene.translate(0, 1, 0);
            this.patch.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(0, 1, 0);
            this.scene.rotate(Math.PI, 1, 0, 0);
            this.patch.display();
        this.scene.popMatrix();
    this.scene.popMatrix();
}