/*
 *   Prolog board specification and initialization
 *
 *   initial_logic_board([
 *   [[star2, free, [], none], [star2, free, [], none], [wormhole]],
 *   [[star1, free, [], none], [star2, free, [], none], [star2, free, [], none]],
 *   [[home, player1, [shipA, shipB, shipC, shipD], none], [blackhole], [emptyS, free, [], none]],
 *   [[star3, free, [], none], [nebula, free, [], none], [home, player2, [shipW, shipX, shipY, shipZ], none]],
 *   [[blackhole], [wormhole], [blackhole]],
 *   [[star3, free, [], none], [nebula, free, [], none], [star1, free, [], none]],
 *   [[star1, free, [], none], [star2, free, [], none], [star2, free, [], none]]
 *   ]
 *   ).
 * 
 *   translate(home, 'h').
 *   translate(emptyS, '0').
 *   translate(star1, '1').
 *   translate(star2, '2').
 *   translate(star3, '3').
 *   translate(nebula, 'n').
 *
 *   translate(player1, 'P1').
 *   translate(player2, 'P2').
 *   translate(free, '  ').
 *
 *   translate(shipA, 'a').
 *   translate(shipB, 'b').
 *   translate(shipC, 'c').
 *   translate(shipD, 'd').
 *   translate(shipW, 'w').
 *   translate(shipX, 'x').
 *   translate(shipY, 'y').
 *   translate(shipZ, 'z').
 *
 *   translate(colony, '(C)').
 *   translate(trade, '[T]').
 *   translate(none, '___').
*/

function Board(scene, id, rows, columns) {
    this.scene = scene;
    this.rows = rows;
    this.columns = columns
    
    this.radius = Math.sin(Math.PI/3);
    this.distance = 3;
    this.piece = new Hexagon(scene);
}

Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor = Board;

Board.prototype.display = function() {
    for (var row = 0; row < this.rows; row++) {
        this.scene.pushMatrix();
            var offset = row % 2 ? this.distance/2 : 0;
            this.scene.translate(offset, 0, this.radius * row);
            for (var col = 0; col < this.columns; col++) {
                this.scene.registerForPick(col + row * this.columns + 1, this);
                this.piece.display();
                this.scene.translate(this.distance, 0, 0);
            }
        this.scene.popMatrix();
    }
}