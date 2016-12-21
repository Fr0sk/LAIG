var serverResponse = 0;
var prologBoard = 0;
var updatedPrologBoard = 0;
var aiShip = 0;
var connectionBoolean = false;
var playAllShips = 0;
var state = 'selecMovementState';

/* Game Modes:
0 --> H/H
1 --> H/M
2 --> M/M
*/

function Game(scene, gameMode) {
    this.scene = scene;
    this.board;
    this.gameMode = gameMode;
}

Game.prototype = Object.create(CGFobject.prototype);
Game.prototype.constructor = Game;

Game.prototype.startGame = function () {
    this.ships = []; // Gets initialized with board
    this.board = new Board(this.scene, this, "idBoard");
    this.player = 1;
    this.moveStack = [];
    prologBoard = this.board.toString();
}

Game.prototype.picking = function (obj, id) {
    if (state == 'selecMovementState' && (this.gameMode == 0 || this.gameMode == 1)) {
        if (!this.selectedShip) {
            for (var s = 0; s < this.ships.length; s++) {
                if (obj == this.ships[s] && obj.owner == this.player) {
                    this.selectedShip = obj;
                    this.selectedShip.translate.y += 0.25;
                    break;
                }
            }
        } else {
            for (var c = 0; c < this.board.cells.length; c++)
                if (obj == this.board.cells[c] && this.obj != this.selectedShip.cell) {
                    this.obj = obj;
                    this.play();
                }
        }
    }
}

Game.prototype.play = async function () {
    if (this.gameMode == 1 && state == 'selecMovementState')
        this.startUserPlay();
    else if (this.gameMode == 1 && state == 'selectBuildingState') {
        this.endUserPlay();
        await sleep(2000);
        this.aiPlay();
        await sleep(3000);
        this.checkEndGame();
        await sleep(4000);
    }
}

Game.prototype.startUserPlay = function () {
    this.getMovementDirection(this.selectedShip.cell.pickingId, this.obj.pickingId);
    this.prologRequestUser = 'playerTurn(' + prologBoard + ',' + this.player + ',' + this.selectedShip.id + ',' + this.direction + ',' + this.numCells + ',';
    state = 'selectBuildingState';
    console.info('\'t\' -> trade station, \'c\' -> colony');
}

Game.prototype.endUserPlay = async function () {
    //console.warn(this.prologRequestUser);
    this.callRequest(this.prologRequestUser, this.handleReplyBoard);
    await sleep(2000);
    updatedPrologBoard = serverResponse;
    if (updatedPrologBoard.substring(0, 3) != '[[[') {
        console.error("Prolog Error!");
        return;
    }
    this.doMove(this.obj);
}

Game.prototype.aiPlay = async function () {
    this.callRequest('aiTurnShipDecider', this.handleReplyShip);
    await sleep(1000);

    if (playAllShips == 0) {
        aiShip = 'shipW';
        playAllShips++;
    } else if (playAllShips == 1) {
        aiShip = 'shipX';
        playAllShips++;
    } else if (playAllShips == 2) {
        aiShip = 'shipY';
        playAllShips++;
    } else if (playAllShips == 3) {
        aiShip = 'shipZ';
        playAllShips++;
    }

    var prologRequestAI = 'aiTurn(' + updatedPrologBoard + ',' + aiShip + ')';
    //console.warn(prologRequestAI);
    this.callRequest(prologRequestAI, this.handleReplyBoard);
    await sleep(2000);

    console.warn(prologBoard);
    prologBoard = serverResponse;
    this.moveShipAI();
}

Game.prototype.checkEndGame = async function () {
    state = 'selecMovementState';

    var endGameRequest = 'endGame(' + prologBoard + ')';
    this.callRequest(endGameRequest, this.handleReplyBoard);
    await sleep(2000);
    if (serverResponse == 'Sucess') {
        console.error("END OF THE GAME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        state = "gameEnded";

        var player1ScoreRequest = 'calculateScore(player1,' + prologBoard + ')';
        this.callRequest(player1ScoreRequest, this.handleReplyBoard);
        await sleep(2000);
        this.player1Score = serverResponse;

        var player2ScoreRequest = 'calculateScore(player2,' + prologBoard + ')';
        this.callRequest(player2ScoreRequest, this.handleReplyBoard);
        await sleep(2000);
        this.player2Score = serverResponse;

        console.info(this.player1Score, this.player2Score);
    }

    this.selectedShip.translate.y -= 0.25;
    this.selectedShip = undefined;
}

Game.prototype.setBuilding = function (userBuilding) {
    if (state == 'selectBuildingState') {
        if (userBuilding == 0)
            this.prologRequestUser += 'tr)';
        else
            this.prologRequestUser += 'c)';
        this.play();
    }
}

Game.prototype.resetCurrentMove = function () {
    console.info('Reseting current move. You may start again!');
    state = 'selecMovementState';
    this.selectedShip.translate.y -= 0.25;
    this.selectedShip = undefined;
}

Game.prototype.undo = function () {
    //if there was played at least 1 turn
    if (this.moveStack.length >= 2) {
        this.moveShipWithUndo(this.moveStack.pop());
        this.moveShipWithUndo(this.moveStack.pop());
        if (playAllShips <= 3)
            playAllShips--;
    }
}

Game.prototype.moveShipWithUndo = function (move) {
    //console.info(move);
    move.from.moveShip(move.shipToMove, true);
    prologBoard = move.board;
    //console.info(move);
}

Game.prototype.setOriginCellId = function (userBoard) {
    var userSplit = userBoard.split(']],');

    for (var row = 0; row < userSplit.length; row++) {
        if (userSplit[row].indexOf(aiShip) != -1) {
            userSplitRow = userSplit[row].split('],[');
            for (var column = 0; column < userSplitRow.length; column++) {
                if (userSplitRow[column].indexOf(aiShip) != -1) {
                    return row * userSplitRow.length + column + 1;
                    break;
                }
            }
            break;
        }
    }

    return false;
}

Game.prototype.setDestinationCellId = function (userBoard, aiBoard) {
    var userSplit = userBoard.split(']],');
    var aiSplit = aiBoard.split(']],');

    var index;
    for (var row = 0; row < userSplit.length; row++) {
        if (aiSplit[row].indexOf(aiShip) != -1) {
            aiSplitRow = aiSplit[row].split('],[');
            for (var column = 0; column < aiSplitRow.length; column++) {
                if (aiSplitRow[column].indexOf(aiShip) != -1) {
                    return row * aiSplitRow.length + column + 1;
                    break;
                }
            }
            break;
        }
    }

    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Game.prototype.doMove = function (toCell) {
    var fromCell = this.selectedShip.cell;
    toCell.moveShip(this.selectedShip, true);
    this.moveStack.push({ from: fromCell, to: toCell, shipToMove: this.selectedShip, board: updatedPrologBoard });
    this.nextPlayer();
}

Game.prototype.moveShipAI = function () {
    var originCellId = this.setOriginCellId(updatedPrologBoard);
    var destinationCellId = this.setDestinationCellId(updatedPrologBoard, prologBoard);
    var originCell = this.board.getCellWithId(originCellId);
    var destinationCell = this.board.getCellWithId(destinationCellId);

    var ship;
    for (var i = 0; i < this.ships.length; i++) {
        if (this.ships[i].id == aiShip) {
            ship = this.ships[i];
            break;
        }
    }

    destinationCell.moveShip(ship, true);
    this.moveStack.push({ from: originCell, to: destinationCell, shipToMove: ship, board: prologBoard });
    this.nextPlayer();
}

Game.prototype.nextPlayer = function () {
    this.player = this.player == 1 ? 2 : 1;
    console.log("Player " + this.player + ", it's your turn!");
}

Game.prototype.update = function (deltaTime) {
    if (this.ships)
        for (var s = 0; s < this.ships.length; s++)
            this.ships[s].update(deltaTime);
}

Game.prototype.getMovementDirection = function (fromCellId, toCellId) {
    //Getting the row fromCell belongs
    var fromCellRow = this.getRow(fromCellId, this.board.rowLength, this.board.board.length * this.board.rowLength);
    var toCellRow = this.getRow(toCellId, this.board.rowLength, this.board.board.length * this.board.rowLength);
    var rowsDifference = Math.abs(fromCellRow - toCellRow);
    this.numCells = rowsDifference;

    //testar com a mesma row (E ou O)!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    var idRow;

    var resultSE = fromCellId;
    idRow = fromCellRow;
    for (var i = 0; i < rowsDifference; i++) {
        if (idRow % 2 == 0)
            resultSE = resultSE + this.board.rowLength + 1;
        else
            resultSE = resultSE + this.board.rowLength;
        idRow++;
    }

    var resultSW = fromCellId;
    idRow = fromCellRow;
    for (var i = 0; i < rowsDifference; i++) {
        if (idRow % 2 == 0)
            resultSW = resultSW + this.board.rowLength;
        else
            resultSW = resultSW + this.board.rowLength - 1;
        idRow++;
    }

    var resultNE = fromCellId;
    idRow = fromCellRow;
    for (var i = 0; i < rowsDifference; i++) {
        if (idRow % 2 == 0)
            resultNE = resultNE - this.board.rowLength + 1;
        else
            resultNE = resultNE - this.board.rowLength;
        idRow++;
    }

    var resultNW = fromCellId;
    idRow = fromCellRow;
    for (var i = 0; i < rowsDifference; i++) {
        if (idRow % 2 == 0)
            resultNW = resultNW - this.board.rowLength;
        else
            resultNW = resultNW - this.board.rowLength - 1;
        idRow++;
    }

    var resultN = fromCellId;
    resultN -= this.board.rowLength * rowsDifference;

    var resultS = fromCellId;
    resultS += this.board.rowLength * rowsDifference;

    switch (toCellId) {
        case resultSE: this.direction = 'se'; break;
        case resultSW: this.direction = 'sw'; break;
        case resultNE: this.direction = 'ne'; break;
        case resultNW: this.direction = 'nw'; break;
        case resultN: this.direction = 'n'; this.numCells /= 2; break;
        case resultS: this.direction = 's'; this.numCells /= 2; break;
        default: this.direction = 'no direction'; break;
    }

    //console.info("fromCellId = " + fromCellId + ", toCellId = " + toCellId + ", fromCellRow = " + fromCellRow + ", rowsDifference = " + rowsDifference + ", rowLength = " + this.board.rowLength + ", se = " + resultSE + ", sw = " + resultSW + ", ne = " + resultNE + ", nw = " + resultNW + ", n = " + resultN + ", s = " + resultS);
}

Game.prototype.getRow = function (id, rowLength, totalNumIds) {
    var idCellRow;
    var currRow = 0;

    for (var currId = rowLength; currId <= totalNumIds; currId += rowLength) {
        if (id <= currId)
            return currRow;
        currRow++;
    }

    return null;
}

Game.prototype.display = function () {
    this.board.display();
}

Game.prototype.callRequest = function (requestString, onSuccess, onError, port) {
    var requestPort = port || 8081;
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);

    request.onload = onSuccess || function (data) { console.log("Request successful."); };
    request.onerror = onError || function () { console.log("Error waiting for response"); };

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

Game.prototype.handleReplyBoard = function (data) {
    console.info("Response: " + data.target.response);
    serverResponse = data.target.response;
    connectionBoolean = true;
}

Game.prototype.handleReplyShip = function (data) {
    console.info("Response: " + data.target.response);
    aiShip = data.target.response;
    connectionBoolean = true;
}