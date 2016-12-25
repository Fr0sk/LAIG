var Keyframe = function(translation, rotation, scale, time) {
    this.translation = translation ? translation : {x:0,y:0,z:0};
    this.rotation = rotation;
    this.scale = scale;
    this.time = time ? time : 1; //Time from previous to this
}

Keyframe.prototype.getToDifference = function(keyframe) {
    var t = {
        x: keyframe.translation.x - this.translation.x,
        y: keyframe.translation.z - this.translation.z,
        z: keyframe.translation.z - this.translation.z
    }
};

Keyframe.prototype = Object.create(CGFobject.prototype);
Keyframe.prototype.constructor = Keyframe;

Keyframe.prototype.setTranslation = function(x, y, z) {
    var t = {
        x: x,
        y: y,
        z: z
    }
}

Keyframe.prototype.setTime = function(time) {
    this.time = time;
}