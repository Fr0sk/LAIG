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

Cell.prototype.init = function(shipIds, shipPickingIds) {
    this.initHex();
    this.initShip(shipIds, shipPickingIds);
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

Cell.prototype.initShip = function(shipIds, shipPickingIds) {
    if (this.ships.length > 0) {
        var ships = [];

        for (var s = 0; s < this.ships.length; s++) {
            var ship = new Vehicle(this.scene, 'ship' + shipIds.shift());
            ship.pickingId = shipPickingIds.shift();
            ship.scale = {
                x: 0.025,
                y: 0.025,
                z: 0.025
            }

            ships.push(ship);
        }

        this.ships = ships;
    }
}

Cell.prototype.display = function() {
    this.scene.pushMatrix();
        this.scene.translate(this.hexagon.translate.x, this.hexagon.translate.y, this.hexagon.translate.z);
        this.scene.registerForPick(this.pickingId, this.hexagon);
        this.hexagon.display();
        if (this.ships.length > 0) {
            var ship = this.ships[0];
            this.scene.pushMatrix();
                this.scene.scale(ship.scale.x, ship.scale.y, ship.scale.z);
                ship.display();
            this.scene.popMatrix();
        }
    this.scene.popMatrix();
}