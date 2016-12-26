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
        this.trading.push(new Node("ts" + this.owner + "-" + i));
        this.trading[i].used = false;
        this.trading[i].setPrimitive(PrimitiveBuilder.buildTradingStation(this.scene, this.owner));
        if (this.owner == 1) this.trading[i].translate = {x:0.5+6/trading*i, y:-0.3, z:-2}
        else this.trading[i].translate = {x:3.5+6/trading*i, y:-0.3, z:6.3}
    }
    console.log(this.trading);

    for(var i = 0; i < colony; i++) {
        this.colony.push(new Node("c" + this.owner + "-" + i));
        this.colony[i].used = false;
        this.colony[i].setPrimitive(PrimitiveBuilder.buildColony(this.scene, this.owner));
        if (this.owner == 1) this.colony[i].translate = {x:0.2+6/colony*i, y:0, z:-2}
        else this.colony[i].translate = {x:3.2+6/colony*i, y:0, z:8.7}
    }
}

AuxBoard.prototype.init = function() {
    this.appearance = new CGFappearance(this.scene);
    this.appearance.setAmbient(1, 1, 1, 1);
    this.appearance.loadTexture('./resources/space_metal.jpg');

    this.board = PrimitiveBuilder.buildRect(this.scene, 0, 0, 6, 2, 1, 1);
}

AuxBoard.prototype.update = function(deltaTime) {
    for(var i = 0; i < this.trading.length; i++) {
        //if (this.trading[i].animations)
    }
}

AuxBoard.prototype.display = function() {
    this.scene.pushMatrix();
        if (this.owner == 1) this.scene.translate(0, 0.1, -1);
        else if (this.owner == 2) this.scene.translate(3, 0.1, 8.5);
        this.appearance.apply();
        this.scene.rotate(Math.PI/2, -1, 0, 0);
        this.board.display();
    this.scene.popMatrix();
    
    for(var i = 0; i < this.trading.length; i++) {
        this.scene.pushMatrix();
        this.trading[i].display(this.scene);
        this.scene.popMatrix();
    }

    for(var i = 0; i < this.colony.length; i++) {
        this.scene.pushMatrix();
        this.colony[i].display(this.scene);
        this.scene.popMatrix();
    }
}