function Ship(scene, id, owner) {
    this.scene = scene;
    this.patch = PatchBuilder.buildVehiclePatch(scene, id);
    this.owner = owner;
}

Ship.prototype = Object.create(CGFobject.prototype);
Ship.prototype.constructor = Ship;

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