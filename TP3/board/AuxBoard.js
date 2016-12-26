function AuxBoard(scene, owner, trading, colony) {
    this.scene = scene;
    this.owner = owner;
    this.trading = [];
    this.colony = [];

    this.initBuildings(trading, colony)
    this.init();
}

AuxBoard.prototype = Object.create(CGFobject.prototype);
AuxBoard.prototype.constructor = AuxBoard;

AuxBoard.prototype.initBuildings = function(trading, colony) {
    for(var i = 0; i < trading; i++) {
        this.trading.push(PrimitiveBuilder.buildTradingStation(this.scene, this.owner));
        if (this.owner == 2) this.trading[i].translate = {x:0.5+6/trading*i, y:-0.3, z:-2}
        else this.trading[i].translate = {x:3.5+6/trading*i, y:-0.3, z:6.3}
    }

    for(var i = 0; i < colony; i++) {
        this.colony.push(PrimitiveBuilder.buildColony(this.scene, this.owner));
        if (this.owner == 2) this.colony[i].translate = {x:0.2+6/colony*i, y:0, z:-2}
        else this.colony[i].translate = {x:3.2+6/colony*i, y:0, z:8.7}
    }
}

AuxBoard.prototype.init = function() {
    this.appearance = new CGFappearance(this.scene);
    this.appearance.setAmbient(1, 1, 1, 1);
    this.appearance.loadTexture('./resources/space_metal.jpg');

    this.board = PrimitiveBuilder.buildRect(this.scene, 0, 0, 6, 2, 1, 1);
}

AuxBoard.prototype.display = function() {
    this.scene.pushMatrix();
        if (this.owner == 1) this.scene.translate(0, 0, -1);
        else if (this.owner == 2) this.scene.translate(3, 0, 8.5);
        this.appearance.apply();
        this.scene.rotate(Math.PI/2, -1, 0, 0);
        this.board.display();
    this.scene.popMatrix();
    
    for(var i = 0; i < this.trading.length; i++) {
        this.scene.pushMatrix();
            var mat = [
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ];
            var t = this.trading[i].translate;
            var r = this.trading[i].rotate;
            var s = this.trading[i].scale;
            if (t) mat4.translate(mat, mat, [t.x, t.y, t.z]);
            if (r) { mat4.rotateX(mat, mat, r.x); mat4.rotateY(mat, mat, r.y); mat4.rotateZ(mat, mat, r.z); }
            if (s) mat4.scale(mat, mat, [s.x, s.y, s.z]);
            this.scene.multMatrix(mat)
            this.trading[i].display();
        this.scene.popMatrix();
    }

    for(var i = 0; i < this.colony.length; i++) {
        this.scene.pushMatrix();
            var mat = [
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ];
            var t = this.colony[i].translate;
            var r = this.colony[i].rotate;
            var s = this.colony[i].scale;
            if (t) mat4.translate(mat, mat, [t.x, t.y, t.z]);
            if (r) { mat4.rotateX(mat, mat, r.x); mat4.rotateY(mat, mat, r.y); mat4.rotateZ(mat, mat, r.z); }
            if (s) mat4.scale(mat, mat, [s.x, s.y, s.z]);
            this.scene.multMatrix(mat)
            this.colony[i].display();
        this.scene.popMatrix();
    }
}