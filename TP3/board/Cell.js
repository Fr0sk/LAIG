function Cell(board, row, col, pickingId, type, occupation, ships, structure, height) {
    this.board = board;
    this.scene = board.scene;
    this.row = row;
    this.col = col;
    this.pickingId = pickingId;
    this.type = type;
    this.occupation = occupation;
    this.ships = ships ? ships : [];
    this.structure = structure;
    
    this.building;
    this.material;
}

Cell.prototype = Object.create(CGFobject.prototype);
Cell.prototype.constructor = Cell;

Cell.prototype.init = function(owners, shipIds, shipPickingIds) {
    this.initHex();
    this.initShip(owners, shipIds, shipPickingIds);
}

Cell.prototype.initHex = function() {
    var radius = 1;                                    // Hexagon radius
    var offset = this.row % 2 ? 0 : radius + radius/2; // Offset for even rows
    var distance = Math.sin(Math.PI/3);                // Distance between hexagons
    this.hexagon = new Hexagon(this.scene, this.board.height);
    
    this.hexagon.translate = {
        x: offset + 3 * radius * this.col,
        y: 0,
        z: distance * this.row
    }

    this.material = new CGFappearance(this.scene);
    switch(this.type) {
        case 'blackhole': this.material.setTexture(this.board.textures[0]); break;
        case 'wormhole': this.material.setTexture(this.board.textures[1]); break;
        case 'nebula': this.material.setTexture(this.board.textures[2]); break;
        case 'empty': this.material.setTexture(this.board.textures[3]); break;
        case 'star_1': this.material.setTexture(this.board.textures[4]); break;
        case 'star_2': this.material.setTexture(this.board.textures[5]); break;
        case 'star_3': this.material.setTexture(this.board.textures[6]); break;
        default: this.material.setTexture(this.board.textures[3]); break;
    }
}

Cell.prototype.initShip = function(owners, shipIds, shipPickingIds) {
    var height = 0;
    var heightScale = 0.25; // Each 4 ships will be this higher from the before

    if (this.ships.length > 0) {
        var ships = [];

        for (var s = 0; s < this.ships.length; s++) {
            var shipNum = shipIds.shift();
            var shipLetter;
            switch(shipNum) {
                case 0: shipLetter = 'A'; break;
                case 1: shipLetter = 'B'; break;
                case 2: shipLetter = 'C'; break;
                case 3: shipLetter = 'D'; break;
                case 4: shipLetter = 'W'; break;
                case 5: shipLetter = 'X'; break;
                case 6: shipLetter = 'Y'; break;
                case 7: shipLetter = 'Z'; break;
                default: break;
            }

            var ship = new Ship(this.scene, 'ship' + shipLetter, owners.shift());
            ship.pickingId = shipPickingIds.shift();
            ship.cell = this;
            if (s%4 == 0) height++;

            // Setting up ship scale
            ship.scale = {
                x: 0.1,
                y: 0.1,
                z: 0.1
            }
            
            // Setting up ship translation
            ship.translate = {
                x: s%2 == 0 ? -0.60 : 0.20,
                y: height * heightScale,
                z: s%3 == 0  ? 0.25 : -0.25
            }

            var t = this.hexagon.translate;
            ship.translate.x += t.x;
            ship.translate.y += t.y;
            ship.translate.z += t.z;

            ships.push(ship);
            this.board.game.ships.push(ship);
        }

        this.ships = ships;
    }
}

Cell.prototype.moveShip = function(ship, animated, offset) {
    if (animated) {
        var kf0 = new Keyframe();
        var kf1 = new Keyframe();
        var kf2 = new Keyframe();
        var kf3 = new Keyframe();

        var fromT = ship.translate;
        var toT = this.hexagon.translate;
        kf0.setTranslation(fromT.x, fromT.y, fromT.z);
        
        kf1.setTranslation(fromT.x, fromT.y+0.5, fromT.z);

        kf2.setTranslation(toT.x, fromT.y+0.5, toT.z);
        kf2.setRotation(0, 0, Math.PI*2);

        kf3.setTranslation(toT.x, fromT.y-(offset?offset:0), toT.z);

        var kfanimation = new KeyframeAnimation(ship, [kf0, kf1, kf2, kf3]);
        ship.pushAnimation(kfanimation);
    } 
    
    if (ship.cell == this)
        return;
    ship.cell.removeShip(ship);
    this.addShip(ship);
    this.addBuilding(this.board.game.userBuilding); // TODO Maybe refactor

    //ADICIONAR O BUILDING CORRESPONDENTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

Cell.prototype.removeShip = function(ship) {
    var index = this.ships.indexOf(ship);
    if (index > -1) this.ships.splice(index, 1);
}

Cell.prototype.addShip = function(ship) {
    this.ships.push(ship);
    ship.cell = this;
}

Cell.prototype.addBuilding = function(code) {
    if (code == 0) {
        this.structure = PrimitiveBuilder.buildTradingStation(this.scene);
    }
}

Cell.prototype.display = function() {
    this.scene.pushMatrix();
        this.scene.translate(this.hexagon.translate.x, this.hexagon.translate.y, this.hexagon.translate.z);
        this.scene.registerForPick(this.pickingId, this);
        this.material.apply();
        this.hexagon.display();
        if (this.structure && this.structure != "none") {
            this.structure.display();
        }
    this.scene.popMatrix();

    for (var i = 0; i < this.ships.length; i++) {
        var ship = this.ships[i];
        this.scene.pushMatrix();
            this.scene.registerForPick(ship.pickingId, ship);
            ship.display();
        this.scene.popMatrix();
    }

    
}