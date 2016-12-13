function Game(scene) {
    this.scene = scene;
    this.board;
}

Game.prototype = Object.create(CGFobject.prototype);
Game.prototype.constructor = Game;

Game.prototype.startGame = function() {
    this.ships = []; // Gets initialized with board
    this.board = new Board(this.scene, this, "idBoard");
    this.player = 1;
    this.moveStack = [];
}

Game.prototype.picking = function(obj, id) {
    var selected = false;
    if (!this.selectedShip) {
        for (var s  = 0; s < this.ships.length; s++) {
            if (obj == this.ships[s] && obj.owner == this.player) {
                selected = true;
                this.selectedShip = obj;
                this.selectedShip.translate.y += 0.25;
                break;
            }
        }
    } else {
        for (var c = 0; c < this.board.cells.length; c++) {
            if (obj == this.board.cells[c]) {
                if (obj != this.selectedShip.cell) {
                    obj.moveShip(this.selectedShip);
                    this.nextPlayer();
                }
            }
        }

        this.selectedShip.translate.y -= 0.25;
        this.selectedShip = undefined;
    }
}

Game.prototype.nextPlayer = function() {
    this.player = this.player == 1 ? 2 : 1;
}

Game.prototype.display = function() {
    this.board.display();
    console.log(this.player);
}
