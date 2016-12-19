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
        for (var s = 0; s < this.ships.length; s++) {
            if (obj == this.ships[s] && obj.owner == this.player) {
                selected = true;
                this.selectedShip = obj;
                this.selectedShip.translate.y += 0.25;
                break;
            }
        }
    } else {
        for (var c = 0; c < this.board.cells.length; c++) {
            if (obj == this.board.cells[c] && obj != this.selectedShip.cell) {
                //prolog here
                //var prologRequest = 'playerTurn(' + this.player + ',' + id + ',' + 
                var testRequest = 'playerTurn(' + this.board.toString() + ',1,a,n,1,tr)';
                this.callRequest(testRequest, this.handleReply);

                /*
                if(everything correct)
                */
                this.doMove(obj);
            }
        }

        this.selectedShip.translate.y -= 0.25;
        this.selectedShip = undefined;
    }
}

Game.prototype.doMove = function(toCell) {
    var fromCell = this.selectedShip.cell;
    toCell.moveShip(this.selectedShip, true);
    this.moveStack.push({ from: fromCell, to: toCell });
    this.nextPlayer();
}

Game.prototype.nextPlayer = function() {
    this.player = this.player == 1 ? 2 : 1;
    console.log("Player " + this.player + ", it's your turn!");
}

Game.prototype.update = function(deltaTime) {
    if (this.ships)
        for (var s  = 0; s < this.ships.length; s++) 
            this.ships[s].update(deltaTime);
}

Game.prototype.display = function() {
    this.board.display();
}

Game.prototype.callRequest = function(requestString, onSuccess, onError, port) {
    var requestPort = port || 8081;
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);

    request.onload = onSuccess || function(data){console.log("Request successful.");};
    request.onerror = onError || function(){console.log("Error waiting for response");};

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

Game.prototype.handleReply = function(data) {
    //console.info("Resposta: " + data.target.response);
    this.updatedBoard = data.target.response;
    console.info("Updated Board = " + this.updatedBoard);
}