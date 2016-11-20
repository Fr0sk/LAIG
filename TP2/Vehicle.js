function Vehicle(scene, id) {
    this.scene = scene;
    this.patch = PatchBuilder.buildVehiclePatch(scene, id);
}

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor = Vehicle;

Vehicle.prototype.display = function() {
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