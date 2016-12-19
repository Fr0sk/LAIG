var prologBoard = 0;

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
    prologBoard = this.board.toString();
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
                this.getMovementDirection(this.selectedShip.cell.pickingId, this.board.cells[c].pickingId, this.direction, this.numCells);

                var prologRequest = 'playerTurn(' + prologBoard + ',' + this.player + ',' + this.selectedShip.id + ',' + this.direction + ',' + this.numCells + ',tr)';
                console.warn("Request = " + prologRequest); 
                this.callRequest(prologRequest, this.handleReply);

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

Game.prototype.getMovementDirection = function(fromCellId, toCellId) {
    //Getting the row fromCell belongs
    var fromCellRow = this.getRow(fromCellId, this.board.rowLength, this.board.board.length * this.board.rowLength);
    var toCellRow = this.getRow(toCellId, this.board.rowLength, this.board.board.length * this.board.rowLength);
    var rowsDifference = Math.abs(fromCellRow - toCellRow);
    this.numCells = rowsDifference;

    //testar com a mesma row (E ou O)!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    var id;
    var idRow;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id += this.board.rowLength;
        else
            id += this.board.rowLength + 1;
        idRow++;
    }
    var resultSE = id;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id += this.board.rowLength - 1;
        else
            id += this.board.rowLength;
        idRow++;
    }
    var resultSW = id;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id -= this.board.rowLength;
        else
            id -= this.board.rowLength - 1;
        idRow++;
    }
    var resultNE = id;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id -= this.board.rowLength + 1;
        else
            id -= this.board.rowLength;
        idRow++;
    }
    var resultNW = id;

    id = fromCellId;
    id -= this.board.rowLength * rowsDifference;
    var resultN = id;

    id = fromCellId;
    id += this.board.rowLength * rowsDifference;
    var resultS = id;

    switch(toCellId) {
        case resultSE: this.direction = 'se'; break;
        case resultSW: this.direction = 'sw'; break;
        case resultNE: this.direction = 'ne'; break;
        case resultNW: this.direction = 'nw'; break;
        case resultN: this.direction = 'n'; this.numCells /= 2; break;
        case resultS: this.direction = 's'; this.numCells /= 2; break;
        default: direction = null; break;
    }
}

Game.prototype.getRow = function(id, rowLength, totalNumIds) {
    var idCellRow;
    var currRow = 0;

    for(var currId = rowLength; currId <= totalNumIds; currId += rowLength) {
        if(id <= currId)
            return currRow;
        currRow++;
    }

    return null;
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
    console.info("Response: " + data.target.response);
    prologBoard = data.target.response;
}