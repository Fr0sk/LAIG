function Board(scene, game, id) {
    this.scene = scene;
    this.game = game;
    this.board = sampleBoard();
    this.rowLength;
    this.textures = [];

    this.initBoard();
}

Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor = Board;

Board.prototype.initBoard = function () {
    this.textures.push(new CGFtexture(this.scene, './resources/blackhole.jpg'));
    this.textures.push(new CGFtexture(this.scene, './resources/wormhole.jpg'));
    this.textures.push(new CGFtexture(this.scene, './resources/nebula.jpg'));
    this.textures.push(new CGFtexture(this.scene, './resources/empty.jpg'));
    this.textures.push(new CGFtexture(this.scene, './resources/star_1.jpg'));
    this.textures.push(new CGFtexture(this.scene, './resources/star_2.jpg'));
    this.textures.push(new CGFtexture(this.scene, './resources/star_3.jpg'));

    this.cells = [];
    var pickingId = 1;
    var shipCount = 0;
    this.rowLength = this.board[0].length;

    for (var row = 0; row < this.board.length; row++) {
        for (var col = 0; col < this.board[row].length; col++) {
            var c = this.board[row][col];
            shipCount += c[2] ? c[2].length : 0;
            var cell = new Cell(this, row, col, pickingId++, c[0], c[1], c[2], c[3])
            this.cells.push(cell);
        }
    }

    var shipIds = [];
    var shipPickingIds = [];
    var player = [];
    for (var s = pickingId; s < pickingId + shipCount; s++) {
        shipIds.push(shipPickingIds.length);
        shipPickingIds.push(s);
        player.push(shipIds.length <= shipCount / 2 ? 1 : 2);
    }

    for (var c = 0; c < this.cells.length; c++)
        this.cells[c].init(player, shipIds, shipPickingIds);
}

Board.prototype.display = function () {
    for (var c = 0; c < this.cells.length; c++) {
        this.cells[c].display();
    }
}

Board.prototype.setBoard = function (newBoard) {
    this.board = newBoard;
}

Board.prototype.getCellWithId = function (cellId) {
    for (var i = 0; i < this.cells.length; i++) {
        if (this.cells[i].pickingId == cellId)
            return this.cells[i];
    }

    return false;
}

Board.prototype.toString = function boardToString() {
    var string;
    string = '[';

    for (var row = 0; row < this.board.length; row++) {
        string += '[';

        for (var column = 0; column < this.board[row].length; column++) {
            //wormhole or blackhole
            if (this.board[row][column].length == 1)
                string += '[' + this.board[row][column][0] + ']';
            else {
                string += '[' + this.board[row][column][0] + ',' + this.board[row][column][1] + ',' + '[';
                for (var shipIndex = 0; shipIndex < this.board[row][column][2].length; shipIndex++) {
                    string += this.board[row][column][2][shipIndex];
                    if (shipIndex != this.board[row][column][2].length - 1)
                        string += ',';
                }
                string += '],' + this.board[row][column][3] + ']';
            }

            if (column != this.board[row].length - 1)
                string += ',';
        }

        if (row != this.board.length - 1)
            string += '],';
        else
            string += ']';
    }

    string += ']';
    return string;
}

sampleBoard = function () {
    var board = [
        [['star2', 'free', [], 'none'], ['star2', 'free', [], 'none'], ['wormhole']],
        [['star1', 'free', [], 'none'], ['star2', 'free', [], 'none'], ['star2', 'free', [], 'none']],
        [['home', 'player1', ['shipA', 'shipB', 'shipC', 'shipD'], 'none'], ['blackhole'], ['emptyS', 'free', [], 'none']],
        [['star3', 'free', [], 'none'], ['nebula', 'free', [], 'none'], ['home', 'player2', ['shipW', 'shipX', 'shipY', 'shipZ'], 'none']],
        [['blackhole'], ['wormhole'], ['blackhole']],
        [['star3', 'free', [], 'none'], ['nebula', 'free', [], 'none'], ['star1', 'free', [], 'none']],
        [['star1', 'free', [], 'none'], ['star2', 'free', [], 'none'], ['star2', 'free', [], 'none']]
    ];
    return board;
}