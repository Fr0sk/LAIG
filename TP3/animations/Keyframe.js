var Keyframe = function(time) {
    this.time = time ? time : 1; //Time from previous to this
    this.elapsedTime = 0;
    //this.setDefaults();
}

Keyframe.prototype = Object.create(CGFobject.prototype);
Keyframe.prototype.constructor = Keyframe;

Keyframe.prototype.setTranslation = function(x, y, z) {
    this.translation = {
        x: x,
        y: y,
        z: z
    }
}

Keyframe.prototype.setRotation = function(x, y, z) {
    this.rotation = {
        x: x,
        y: y,
        z: z
    };
}

Keyframe.prototype.setScale = function(x, y, z) {
    this.scale = {
        x: x,
        y: y,
        z: z
    };
}

Keyframe.prototype.setTime = function(time) {
    this.time = time;
}

Keyframe.prototype.setDefaults = function() {
    this.setTranslation(0, 0, 0);
    this.setRotation(0, 0, 0);
    this.setScale(0, 0, 0);
    this.setTime(1);
    this.elapsedTime = 0;
}