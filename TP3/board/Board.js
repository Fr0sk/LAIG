function Board(scene, game, id, board) {
    this.scene = scene;
    this.game = game;
    this.board = board ? board : sampleBoard();

    this.initBoard();
}

Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor = Board;

Board.prototype.initBoard = function(){
    this.cells = [];
    var pickingId = 1;
    var shipCount = 0;

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
        player.push(shipIds.length <= shipCount /2 ? 1 : 2);
    }

    for (var c = 0; c < this.cells.length; c++)
        this.cells[c].init(player, shipIds, shipPickingIds);
}

Board.prototype.display = function() {
    for (var c = 0; c < this.cells.length; c++) {
        this.cells[c].display();
    }
}

sampleBoard = function() {
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