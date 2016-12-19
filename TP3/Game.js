function Game(scene) {
    this.scene = scene;
    this.board;
    this.prologBoard;
}

Game.prototype = Object.create(CGFobject.prototype);
Game.prototype.constructor = Game;

Game.prototype.startGame = function() {
    this.ships = []; // Gets initialized with board
    this.board = new Board(this.scene, this, "idBoard");
    this.player = 1;
    this.moveStack = [];
    this.prologBoard = this.board.toString();
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

                var direction = this.getMovementDirection(this.selectedShip.cell.pickingId, this.board.cells[c].pickingId);

                var prologRequest = 'playerTurn(' + this.player + ',' + this.selectedShip.id + ',' + direction;
                console.warn("Request = " + prologRequest); 


                //var testRequest = 'playerTurn(' + this.prologBoard + ',1,a,n,4,tr)';
                //this.callRequest(testRequest, this.handleReply);

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
    }
    var resultSE = id;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id += this.board.rowLength - 1;
        else
            id += this.board.rowLength;
    }
    var resultSW = id;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id -= this.board.rowLength;
        else
            id -= this.board.rowLength - 1;
    }
    var resultNE = id;

    id = fromCellId;
    idRow = fromCellRow;
    for(var i = 0; i < rowsDifference; i++) {
        if(idRow % 2 == 0)
            id -= this.board.rowLength + 1;
        else
            id -= this.board.rowLength;
    }
    var resultNW = id;

    id = fromCellId;
    id -= this.board.rowLength * rowsDifference;
    var resultN = id;

    id = fromCellId;
    id += this.board.rowLength * rowsDifference;
    var resultS = id;

    console.info(resultN, resultS, resultNW, resultSW);

    switch(toCellId) {
        case resultSE: return 'se'; break;
        case resultSW: return 'sw'; break;
        case resultNE: return 'ne'; break;
        case resultNW: return 'nw'; break;
        case resultN: return 'n'; break;
        case resultS: return 's'; break;
        default: return null; break;
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
    /*if(data.target.response == "Error")
        return;*/
    this.prologBoard = data.target.response;
}