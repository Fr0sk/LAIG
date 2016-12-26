var KeyframeAnimation = function (node, keyframes) {
    this.node = node;
    this.keyframes = [];
    this.started = false;
    this.started = false;

    if (keyframes)
        this.addKeyframes(keyframes);
    console.log(keyframes);
}

KeyframeAnimation.prototype = Object.create(Animation.prototype);
KeyframeAnimation.prototype.constructor = KeyframeAnimation;

KeyframeAnimation.prototype.computeMatrix = function (deltaTime) {
    var kf0 = this.keyframes[0];
    var kf1 = this.keyframes[1];
    var delta = Math.min(kf1.elapsedTime / kf1.time, 1);
    var d = deltaTime/kf1.time;
    kf1.elapsedTime += deltaTime;

    if (kf1.translation) {
        var tx = (kf1.translation.x - kf0.translation.x) * d;
        var ty = (kf1.translation.y - kf0.translation.y) * d;
        var tz = (kf1.translation.z - kf0.translation.z) * d;

        var t = this.node.translate;
        t.x += tx;
        t.y += ty;
        t.z += tz;
    }

    if (kf1.rotation) {
        var rx = (kf1.rotation.x - kf0.rotation.x) * d
        var ry = (kf1.rotation.y - kf0.rotation.y) * d
        var rz = (kf1.rotation.z - kf0.rotation.z) * d

        var r = this.node.rotate;
        r.x += rx;
        r.y += ry;
        r.z += rz;
    }

    if (kf1.scale) {
        var sx = (kf1.scale.x - kf0.scale.x) * d
        var sy = (kf1.scale.y - kf0.scale.y) * d
        var sz = (kf1.scale.z - kf0.scale.z) * d

        var s = this.node.scale;
        s.x += sx;
        s.y += sy;
        s.z += sz;
    }
    
}

KeyframeAnimation.prototype.addKeyframes = function(keyframes) {
    if (Array.isArray(keyframes)) {
        for (var i = 0; i< keyframes.length; i++) {
            this.keyframes.push(keyframes[i]);
        }
    } else {
        this.keyframes.push(keyframes);
    }
}

KeyframeAnimation.prototype.startAnimation = function() {
    var kf0 = this.keyframes[0];

    var t = this.node.translate;
    if (!kf0.translation)
        kf0.setTranslation(t.x, t.y, t.z);
    else {
        t.x = kf0.translation.x;
        t.y = kf0.translation.y;
        t.z = kf0.translation.z;
    }

    var r = this.node.rotate;
    if (!kf0.rotation)
        kf0.setRotation(r.x, r.y, r.z);
    else {
        r.x = kf0.rotation.x;
        r.y = kf0.rotation.y;
        r.z = kf0.rotation.z;
    }

    var s = this.node.scale;
    if (!kf0.scale)
        kf0.setScale(s.x, s.y, s.z);
    else {
        s.x = kf0.scale.x;
        s.y = kf0.scale.y;
        s.z = kf0.scale.z;
    }
}

KeyframeAnimation.prototype.animate = function(deltaTime) {
    if (this.keyframes.length > 1) {
        if (!this.started) {
            this.startAnimation();
            this.started = true;
        }

        if (this.keyframes[1].elapsedTime >= this.keyframes[1].time) {
            var kf0 = this.keyframes[0];
            var kf1 = this.keyframes[1];
            if (!kf1.translation) kf1.translation = kf0.translation;
            if (!kf1.rotation) kf1.rotation = kf0.rotation;
            if (!kf1.scale) kf1.scale = kf0.scale;

            this.keyframes.shift();
            this.animate(deltaTime);
            return;
        }
        this.computeMatrix(deltaTime);
    } else {
        this.ended = true;
        console.info("End of animation keyframe animation!");
    }
}