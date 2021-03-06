var serverResponse = 0;
var prologBoard = 0;
var updatedPrologBoard = 0;
var aiShip = 0;
var connectionBoolean = false;
var playAllShips = 0;
var playAllShips2 = 0;
var state;
var turnTime = 20;
var currTime = turnTime;
var totalTime = 0;
var moveTime = true;

/* Game Modes:
0 --> H/H
1 --> H/M
2 --> M/M
*/

function Game(scene, gameMode, gameDifficulty) {
    this.scene = scene;
    this.board;
    this.gameMode = gameMode;
    this.currPlayer1Score = 0;
    this.currPlayer2Score = 0;
    this.onGame = false;
    this.animatedCam = undefined;
    this.levels = ["SpaceScene.dsx", "CityScene.dsx"];
    this.Level = 0;
    this.lastLvl = -1;

    this.ships = []; // Gets initialized with board
    this.board = new Board(this.scene, this, "idBoard");

    //Interface related
    var mode;
    var difficulty;
    switch (gameMode) {
        case 0: mode = 'Player VS Player'; break;
        case 1: mode = 'Player VS AI'; break;
        case 2: mode = 'AI VS AI'; break;
        default: mode = 'Player VS AI'; break;
    }
    switch (gameDifficulty) {
        case 0: difficulty = 'Easy'; break;
        case 1: difficulty = 'Medium'; break;
        case 2: difficulty = 'Hard'; break;
        default: difficulty = 'Medium'; break;
    }

    this.matchInfo = [mode, difficulty];
    this.gameInfo = [totalTime, currTime, this.currPlayer1Score, this.currPlayer2Score, this.scene.player1WinRounds, this.scene.player2WinRounds];
}

Game.prototype = Object.create(CGFobject.prototype);
Game.prototype.constructor = Game;

Game.prototype.startInterface = function () {
    if (!this.scene.interface.alreadyAdded) {
        this.scene.interface.addMatchInfo();
        this.scene.interface.addGameInfo();
    } else {
        this.scene.interface.setPlayer1Score(0);
        this.scene.interface.setPlayer2Score(0);
        this.scene.interface.setGameMode(this.matchInfo[0]);
        this.scene.interface.setGameMode(this.matchInfo[1]);
    }
}

Game.prototype.startGame = function () {
    this.startInterface();
    this.player = 1;
    //console.error("Stack antes do [] = ");
    //console.info(this.scene.moveStack);
    this.moveStack = [];
    //console.error("Stack depois do [] = ");
    //console.info(this.scene.moveStack);
    this.auxBoard1 = new AuxBoard(this.scene, 1, 5, 10);
    this.auxBoard2 = new AuxBoard(this.scene, 2, 5, 10);
    prologBoard = this.board.toString();
    currTime = turnTime;

    if (this.gameMode == 2) {
        state = 'aiVSai';
        updatedPrologBoard = prologBoard;
        moveTime = false;
        this.play();
    } else
        state = 'selectMovementState';

    this.onGame = true;
    var gameScene = "SpaceScene.dsx"; // Define game scene
}

Game.prototype.picking = function (obj, id) {
    if (state == 'selectMovementState' && (this.gameMode == 0 || this.gameMode == 1)) {
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
    if (this.gameMode == 0 && state == 'selectMovementState')
        this.startUserPlay();
    else if (this.gameMode == 0 && state == 'selectBuildingState') {
        this.endUserPlay()
        moveTime = false;
        await sleep(2000);
        this.checkEndGame();
        await sleep(2000);
        this.getPlayersScores();
        await sleep(4000);
        moveTime = true;
        currTime = turnTime;
    } else if (this.gameMode == 1 && state == 'selectMovementState')
        this.startUserPlay();
    else if (this.gameMode == 1 && state == 'selectBuildingState') {
        this.endUserPlay();
        moveTime = false;
        await sleep(2000);
        this.aiPlay();
        await sleep(3000);
        this.checkEndGame();
        await sleep(2000);
        this.getPlayersScores();
        await sleep(4000);
        moveTime = true;
        currTime = turnTime;
    } else if (this.gameMode == 2) {
        do {
            this.aiPlay();
            await sleep(3000);
            this.checkEndGame();
            await sleep(2000);
            this.getPlayersScores();
            await sleep(4000);
        } while (state != 'gameEnded')
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
    if (updatedPrologBoard.substring(0, 3) != '[[[')
        console.error("Prolog Error!");
    else
        this.doMove(this.obj);
}

Game.prototype.aiPlay = async function () {
    //console.error("Request ship");
    this.callRequest('aiTurnShipDecider', this.handleReplyShip);
    await sleep(1000);

    if (this.gameMode == 2 && this.player == 1) {
        if (playAllShips2 == 0) {
            aiShip = 'shipA';
            playAllShips2++;
        } else if (playAllShips2 == 1) {
            aiShip = 'shipB';
            playAllShips2++;
        } else if (playAllShips2 == 2) {
            aiShip = 'shipC';
            playAllShips2++;
        } else if (playAllShips2 == 3) {
            aiShip = 'shipD';
            playAllShips2++;
        }
    } else {
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
    }

    //console.error(aiShip);

    var prologRequestAI;
    if (this.gameMode == 2) {
        var oppositePlayer;
        if (this.player == 1)
            oppositePlayer = 2;
        else
            oppositePlayer = 1;
        prologRequestAI = 'aiTurn(' + prologBoard + ',' + aiShip + ',' + oppositePlayer + ')';
    } else
        prologRequestAI = 'aiTurn(' + updatedPrologBoard + ',' + aiShip + ',' + this.player + ')';
    console.error(prologRequestAI);
    this.callRequest(prologRequestAI, this.handleReplyBoard);
    await sleep(2000);

    //console.warn(prologBoard);
    prologBoard = serverResponse;
    this.moveShipAI();
}

Game.prototype.getPlayersScores = async function () {
    var player1ScoreRequest = 'calculateScore(player1,' + prologBoard + ')';
    //console.error(player1ScoreRequest);
    this.callRequest(player1ScoreRequest, this.handleReplyBoard);
    await sleep(2000);
    this.currPlayer1Score = serverResponse;
    this.scene.interface.setPlayer1Score(this.currPlayer1Score);

    var player2ScoreRequest = 'calculateScore(player2,' + prologBoard + ')';
    //console.error(player2ScoreRequest);
    this.callRequest(player2ScoreRequest, this.handleReplyBoard);
    await sleep(2000);
    this.currPlayer2Score = serverResponse;
    this.scene.interface.setPlayer2Score(this.currPlayer2Score);
    //console.info("Estes sao os scores: " + this.currPlayer1Score + " e " + this.currPlayer2Score);
}

Game.prototype.checkEndGame = async function () {
    state = 'selectMovementState';

    var endGameRequest = 'endGame(' + prologBoard + ')';
    this.callRequest(endGameRequest, this.handleReplyBoard);
    await sleep(2000);
    if (serverResponse == 'Sucess') {
        console.error("END OF THE GAME!");
        state = "gameEnded";

        if (this.currPlayer1Score > this.currPlayer2Score)
            this.gameEnded(1);
        else if (this.currPlayer1Score < this.currPlayer2Score)
            this.gameEnded(2);
        else
            this.gameEnded(0);
    }

    this.selectedShip = undefined;
}

Game.prototype.gameEnded = function (player) {
    console.log("Game ended:" + player);
    if (player == 1)
        this.scene.player1WinRounds++;
    else if (player == 2)
        this.scene.player2WinRounds++;
    else {
        this.scene.player1WinRounds++;
        this.scene.player2WinRounds++;
    }


    console.error("Stack no game.gameEnded antes do sliced e que pertence a class = ");
    console.info(this.moveStack);
    console.error("Stack no game.gameEnded antes do sliced = ");
    console.info(this.scene.moveStack);
    this.scene.moveStack = this.moveStack;//.slice();
    console.error("Stack no game.gameEnded depois do sliced = ");
    console.info(this.scene.moveStack);

    this.scene.interface.setPlayer1WinRounds(this.scene.player1WinRounds);
    this.scene.interface.setPlayer2WinRounds(this.scene.player2WinRounds);
    this.onGame = false;
    this.scene.mainMenu = new MainMenu(this.scene);
}

Game.prototype.setBuilding = function (userBuilding) {
    if (state == 'selectBuildingState') {
        if (userBuilding == 0)
            this.prologRequestUser += 'tr)';
        else
            this.prologRequestUser += 'c)';
        this.userBuilding = userBuilding;
        this.play();
    }
}

Game.prototype.resetCurrentMove = function () {
    console.info('Reseting current move. You may start again!');
    state = 'selectMovementState';
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
        /*console.error("Este e o antigo bosrd: ");
        console.info(prologBoard);*/
    }
}

Game.prototype.moveShipWithUndo = function (move) {
    //console.info(move);
    move.from.undoShip(move.shipToMove, true);
    move.to.removeBuilding(move.shipToMove.owner);
    prologBoard = move.board;
    console.info(move);
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
                    this.userBuilding = (aiSplitRow[column].indexOf('trade') != -1) ? 0 : 1;
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
    toCell.moveShip(this.selectedShip, true, 0.25);
    this.moveStack.push({ from: fromCell, to: toCell, shipToMove: this.selectedShip, board: prologBoard, userBuilding: this.userBuilding });
    prologBoard = updatedPrologBoard;
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
    this.moveStack.push({ from: originCell, to: destinationCell, shipToMove: ship, board: prologBoard, userBuilding: this.userBuilding });
    this.nextPlayer();
}

Game.prototype.nextPlayer = function () {
    this.player = this.player == 1 ? 2 : 1;

    // Triggers the camera animation
    animatedCamTime = 0;
    this.animatingCam = true;
    console.log("Player " + this.player + ", it's your turn!");
}

Game.prototype.update = function (deltaTime) {
    if (this.onGame) {
        if (currTime <= 0) {
            console.error('Player \'' + this.player + '\' lost the game due to time!');
            if (this.player == 1) this.gameEnded(2);
            else this.gameEnded(1);
        } else if (moveTime) {
            currTime -= deltaTime;
            totalTime += deltaTime;
            this.gameInfo[0] = totalTime;
            this.gameInfo[1] = currTime;
        }

    }
    if (this.ships)
        for (var s = 0; s < this.ships.length; s++)
            this.ships[s].update(deltaTime);

    this.camAnimation(deltaTime);
    this.auxBoard1.update(deltaTime);
    this.auxBoard2.update(deltaTime);
}

Game.prototype.getMovementDirection = function (fromCellId, toCellId) {
    //Getting the row fromCell belongs
    var fromCellRow = this.getRow(fromCellId, this.board.rowLength, this.board.board.length * this.board.rowLength);
    var toCellRow = this.getRow(toCellId, this.board.rowLength, this.board.board.length * this.board.rowLength);
    var rowsDifference = Math.abs(fromCellRow - toCellRow);
    this.numCells = rowsDifference;

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
    if (this.onGame || this.onMovie) {
        if (this.lastLvl != this.Level) {
            this.lastLvl = this.Level;
            new MySceneGraph(this.levels[this.Level], this.scene);
        }
        this.auxBoard1.display();
        this.auxBoard2.display();
        this.board.display();
        //console.log("Display GAME");
    }
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

var animatedCamTime = 0;
Game.prototype.camAnimation = function (deltaTime) {
    var sleep = 3; // Waits for movement animations to end
    var length = 2; // Number of seconds the animation lasts

    var p1 = [-20, 25, 2.5];
    var p2 = [20, 25, 2.5];
    var target = [5, 0, 2.5];

    if (this.animatingCam && this.gameMode != 1) {
        animatedCamTime += deltaTime;
        if (animatedCamTime > sleep) {
            delta = Math.min((animatedCamTime - sleep) / length, 1);
            if (this.player == 1) {
                var px = p2[0] + (p1[0] - p2[0]) * delta;
                var py = p2[1] + (p1[1] - p2[1]) * delta;
                var pz = p2[2] + (p1[2] - p2[2]) * delta;
                this.animatedCam.setPosition([px, py, pz]);
                this.animatedCam.setTarget(target);
            } else if (this.player == 2) {
                var px = p1[0] + (p2[0] - p1[0]) * delta;
                var py = p1[1] + (p2[1] - p1[1]) * delta;
                var pz = p1[2] + (p2[2] - p1[2]) * delta;
                this.animatedCam.setPosition([px, py, pz]);
                this.animatedCam.setTarget(target);
            }

            if (animatedCamTime > sleep + length) {
                // Stops animation
                this.animatingCam = false
                animatedCamTime = 0;
                if (this.player == 1) this.animatedCam.setPosition(p1);
                else if (this.player == 2) this.animatedCam.setPosition(p2);
            }
        }
    }
}

Game.prototype.showMovie = async function (stack) {
    if (stack && stack.length > 0) {
        this.scene.mainMenu.close();
        this.auxBoard1 = new AuxBoard(this.scene, 1, 5, 10);
        this.auxBoard2 = new AuxBoard(this.scene, 2, 5, 10);
        prologBoard = this.board.toString();
        this.onGame = false;
        this.onMovie = true;

        console.error("Stack no game.showMovie");
        console.info(stack);

        for (var i = 0; i < stack.length; i++) {
            var move = stack[i];
            this.userBuilding = move.userBuilding;
            move.to.moveShip(move.shipToMove, true);
            console.info("Moved ship with move = ");
            console.log(move);
        }

        await sleep(15000);
        this.onMovie = false;
    }
}