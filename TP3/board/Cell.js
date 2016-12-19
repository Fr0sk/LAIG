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
}

Cell.prototype = Object.create(CGFobject.prototype);
Cell.prototype.constructor = Cell;

Cell.prototype.init = function(owners, shipIds, shipPickingIds) {
    this.initHex();
    this.initShip(owners, shipIds, shipPickingIds);
}

Cell.prototype.initHex = function() {
    var radius = 1;                                    // Hexagon radius
    var offset = this.row % 2 ? radius + radius/2 : 0; // Offset for odd rows
    var distance = Math.sin(Math.PI/3);                // Distance between hexagons
    this.hexagon = new Hexagon(this.scene, this.board.height);
    
    this.hexagon.translate = {
        x: offset + 3 * radius * this.col,
        y: 0,
        z: distance * this.row
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
                x: 0.025,
                y: 0.025,
                z: 0.025
            }
            
            // Setting up ship translation
            ship.translate = {
                x: s%2 == 0 ? -0.60 : 0.20,
                y: height * heightScale,
                z: s%3 == 0  ? 0.25 : -0.25
            }

            t = this.hexagon.translate;
            mat4.translate(ship.mat, ship.mat, [t.x, t.y, t.z]);

            ships.push(ship);
            this.board.game.ships.push(ship);
        }

        this.ships = ships;
    }
}

Cell.prototype.moveShip = function(ship, animated) {
    if (animated) {
        fromVec = ship.cell.hexagon.translate;
        toVec = this.hexagon.translate;
        var cp = [];

        cp.push({x: 0, y: 0, z: 0});
        cp.push({x: toVec.x - fromVec.x, y: 0, z:toVec.z - fromVec.z});

        var anim = new LinearAnimation(ship, 2, cp, true);
        ship.pushAnimation(anim);
    }
    
    if (ship.cell == this)
        return;
    ship.cell.removeShip(ship);
    this.addShip(ship);
}

Cell.prototype.removeShip = function(ship) {
    var index = this.ships.indexOf(ship);
    if (index > -1) this.ships.splice(index, 1);
}

Cell.prototype.addShip = function(ship) {
    this.ships.push(ship);
    ship.cell = this;
    ship.translate.x = 0;
    ship.translate.z = 0;
}

Cell.prototype.display = function() {
    this.scene.pushMatrix();
        this.scene.translate(this.hexagon.translate.x, this.hexagon.translate.y, this.hexagon.translate.z);
        this.scene.registerForPick(this.pickingId, this);
        this.hexagon.display();
    this.scene.popMatrix();

    for (var i = 0; i < this.ships.length; i++) {
        var ship = this.ships[i];
        this.scene.pushMatrix();
            this.scene.multMatrix(ship.mat);
            this.scene.translate(ship.translate.x, ship.translate.y, ship.translate.z);
            this.scene.scale(ship.scale.x, ship.scale.y, ship.scale.z);
            this.scene.registerForPick(ship.pickingId, ship);
            ship.display();
        this.scene.popMatrix();
    }
}