:- use_module(library(lists)).
:- use_module(library(aggregate)).
:- use_module(library(random)).
:- use_module(library(system)).
:- include('board.pl').
:- include('utils.pl').

/*** LOGICAL ARRAY KEYWORDS ***/

/*** TYPES OF SYSTEMS 
home - Homeworld system 
starX - Star system with X planets
nebula - Nebula system 
emptyS - Empty system 
wormhole - Wormhole system 
blackhole - Blackhole system 
*/

/*** OWNER
player1 - player one
player2 - player two
free - free system
*/

/*** LIST OF SHIPS
Player one: 
    -shipA, shipB, shipC, shipD

Player two:
    -shipW, shipX, shipY, shipZ
*/

/*** BUILDING
trade - trade station
colony - colony
none - none
*/

/* Element example: [<type of system>, <owner>, <list of ships>, <constructions>] */

initial_logic_board([
    [[star2, free, [], none], [star2, free, [], none], [wormhole]],
    [[star1, free, [], none], [star2, free, [], none], [star2, free, [], none]],
    [[home, player1, [shipA, shipB, shipC, shipD], none], [blackhole], [emptyS, free, [], none]],
    [[star3, free, [], none], [nebula, free, [], none], [home, player2, [shipW, shipX, shipY, shipZ], none]],
    [[blackhole], [wormhole], [blackhole]],
    [[star3, free, [], none], [nebula, free, [], none], [star1, free, [], none]],
    [[star1, free, [], none], [star2, free, [], none], [star2, free, [], none]]
    ]
    ).

min_board([
[[star1, free, [], none], [star2, free, [], none], [star2, free, [], none]],
[[home, player1, [shipA, shipB, shipC, shipD], none], [star1, free, [], none], [emptyS, free, [], none]],
[[star3, free, [], none], [nebula, free, [], none], [home, player2, [shipW, shipX, shipY, shipZ], none]]
]
).

test_board([
    [[star2, player2, [], colony], [star2, free, [], none], [wormhole]],
    [[home, player1, [shipA, shipB], colony], [star2, player2, [], colony], [star2, free, [], none]],
    [[star1, player1, [], colony], [blackhole], [emptyS, free, [], none]],
    [[star3, player2, [], colony], [nebula, free, [], none], [home, player2, [shipW, shipX, shipY, shipZ], none]],
    [[blackhole], [wormhole], [blackhole]],
    [[star3, free, [], none], [nebula, free, [], none], [star1, free, [], none]],
    [[star1, free, [], none], [star2, free, [], none], [star2, free, [], none]]
    
    ]).

/*** GET INFORMATION FROM CELLS ***/

canFlyOver(OpponentPlayer, Board, X, Y):-
    getPiece(Y, X, Board, Piece),
    (isBlackhole(Piece); systemBelongsToPlayer(OpponentPlayer, Piece)).

takeWormholesOut(_, [], [], TempX, TempY, ListX, ListY):-
    ListX = TempX,
    ListY = TempY.
takeWormholesOut(Board, [X|Xs], [Y|Ys], TempX, TempY, ListX, ListY):-
    getPiece(Y, X, Board, Piece),
    (isWormhole(Piece); systemBelongsToPlayer(player1, Piece); systemBelongsToPlayer(player2, Piece)),
    takeWormholesOut(Board, Xs, Ys, TempX, TempY, ListX, ListY).
takeWormholesOut(Board, [X|Xs], [Y|Ys], TempX, TempY, ListX, ListY):-
    takeWormholesOut(Board, Xs, Ys, [X|TempX], [Y|TempY], ListX, ListY).


%% Get cell type

isStarSystem1([star1, _ , _, _]).
isStarSystem2([star2, _ , _, _]).
isStarSystem3([star3, _ , _, _]).
isStarSystemEmpty([emptyS, _ , _, _]).

isStarSystem(X):-
    isStarSystem1(X);
    isStarSystem2(X);
    isStarSystem3(X);
    isStarSystemEmpty(X).

isEmptySystem([emptyS, _ , _, _]).

isNebulaSystem([nebula, _ , _, _]).

isBlackhole([blackhole]). 

isWormhole([wormhole]). 

%% Get owner

isSystemFree([_, free, _, _]).

systemBelongsToPlayer(Player, [_, Player, _, _]).

systemHasShip(Ship, [_, _, Ships, _]):-
    member(Ship, Ships).

isSystemOwned(System):-
    systemBelongsToPlayer(player1, System);
    systemBelongsToPlayer(player2, System).

%% Get ships

ship(shipA).
ship(shipB).
ship(shipC).
ship(shipD).

ship(shipW).
ship(shipX).
ship(shipY).
ship(shipZ).

player1Ship(shipA).
player1Ship(shipB).
player1Ship(shipC).
player1Ship(shipD).

shipBelongsToPlayer1(X):-
    player1Ship(X).

player2Ship(shipW).
player2Ship(shipX).
player2Ship(shipY).
player2Ship(shipZ).

shipBelongsToPlayer2(X):-
    player2Ship(X).

%% Get buildings

isSystemNotColonized([_, _, _, none]).

hasSystemColony([_, _, _, colony]).
hasSystemTradeStation([_, _, _, trade]).

isSystemColonized(X):-
    hasSystemColony(X);
    hasSystemTradeStation(X).

%% Directions of movement

north(n).
south(s).
northwest(nw).
southwest(sw).
northeast(ne).
southeast(se).

/** BOARD CELL FUNCTIONS **/

% Auxiliar functions for getting adjacent cells

getAdjacentEvenRow(Xin, Yin, Xout, Yout):-
    (Xout is Xin, (Yout is Yin -2; Yout is Yin -1; Yout is Yin +1; Yout is Yin +2))
    ;
    (Xout is Xin +1, (Yout is Yin +1; Yout is Yin -1)).

getAdjacentOddRow(Xin, Yin, Xout, Yout):-
    (Xout is Xin, (Yout is Yin -2; Yout is Yin -1; Yout is Yin +1; Yout is Yin +2))
    ;
    (Xout is Xin -1, (Yout is Yin +1; Yout is Yin -1)).

getAdjacent(Xin, Yin, Xout, Yout):-
    (1 =:= mod(Yin, 2), getAdjacentOddRow(Xin, Yin, Xout, Yout))
    ;
    (0 =:= mod(Yin, 2), getAdjacentEvenRow(Xin, Yin, Xout, Yout)).

% Auxiliar functions for verifying adjacent cells

adjacentEvenRow(X, Y, AdjX, AdjY):-
    (AdjX =:= X, AdjY \= Y, abs(AdjY - Y) =< 2);
    (AdjX =:= X+1, abs(AdjY - Y) =:= 1).

adjacentOddRow(X, Y, AdjX, AdjY):-
    (AdjX =:= X, AdjY \= Y, abs(AdjY - Y) =< 2);
    (AdjX =:= X-1, abs(AdjY - Y) =:= 1).

% Returns adjacent cell coordinates to cell with (X, Y) coordinates 
adjacent(X, Y, AdjX, AdjY):-
    (1 =:= mod(Y, 2), adjacentOddRow(X, Y, AdjX, AdjY))
    ;
    (0 =:= mod(Y, 2), adjacentEvenRow(X, Y, AdjX, AdjY)).

% Returns all adjacent cells to cell(Column, Row) and saves them in List
getAdjacentList(X, Y, ListX, ListY):-
    findall((AdjX), getAdjacent(X, Y, AdjX, AdjY), ListX),
    findall((AdjY), getAdjacent(X, Y, AdjX, AdjY), ListY).

% Auxiliar function to get all the cell to be played
getOddCell(OpponentPlayer, Board, X, Y, Xs, Ys, ListX, ListY, MovType):-
    (X < 0; Y < 0),
        ListX = Xs,
        ListY = Ys;
    length(Board, NumOfRows),
    Y > NumOfRows - 1,
        ListX = Xs,
        ListY = Ys;
    getColumnLength(Board, Y, NumOfColumns),
    X > NumOfColumns - 1,
        ListX = Xs,
        ListY = Ys;
    canFlyOver(OpponentPlayer, Board, X, Y),
        ListX = Xs,
        ListY = Ys;
    MovType == topLeft,
        NewX is X - 1,
        NewY is Y - 1,
        getEvenCell(OpponentPlayer, Board, NewX, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == topRight,
        NewY is Y - 1,
        getEvenCell(OpponentPlayer, Board, X, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == bottomLeft,
        NewX is X - 1,
        NewY is Y + 1,
        getEvenCell(OpponentPlayer, Board, NewX, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == bottomRight,
        NewY is Y + 1,
        getEvenCell(OpponentPlayer, Board, X, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType).

% Auxiliar function to get all the cell to be played
getEvenCell(OpponentPlayer, Board, X, Y, Xs, Ys, ListX, ListY, MovType):-
    (X < 0; Y < 0),
        ListX = Xs,
        ListY = Ys;
    length(Board, NumOfRows),
    Y > NumOfRows - 1,
        ListX = Xs,
        ListY = Ys;
    getColumnLength(Board, Y, NumOfColumns),
    X > NumOfColumns - 1,
        ListX = Xs,
        ListY = Ys;
    canFlyOver(OpponentPlayer, Board, X, Y),
        ListX = Xs,
        ListY = Ys;
    MovType == topLeft,
        NewY is Y - 1,
        getOddCell(OpponentPlayer, Board, X, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == topRight,
        NewX is X + 1,
        NewY is Y - 1,
        getOddCell(OpponentPlayer, Board, NewX, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == above,
        NewY is Y - 2,
        getEvenCell(OpponentPlayer, Board, X, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == below,
        NewY is Y + 2,
        getEvenCell(OpponentPlayer, Board, X, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == bottomLeft,
        NewY is Y + 1,
        getOddCell(OpponentPlayer, Board, X, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType);
    MovType == bottomRight,
        NewX is X + 1,
        NewY is Y + 1,
        getOddCell(OpponentPlayer, Board, NewX, NewY, [X|Xs], [Y|Ys], ListX, ListY, MovType).

% Returns all the top left cells that can be played given a specific X and Y
getTopLeft(OpponentPlayer, Board, X, Y, ListX, ListY):-
    1 =:= mod(Y, 2),
        NewX is X - 1,
        NewY is Y - 1,
        getEvenCell(OpponentPlayer, Board, NewX, NewY, [], [], ListX, ListY, topLeft);
    0 =:= mod(Y, 2),
        NewY is Y - 1,
        getOddCell(OpponentPlayer, Board, X, NewY, [], [], ListX, ListY, topLeft).

% Returns all the top right cells that can be played given a specific X and Y
getTopRight(OpponentPlayer, Board, X, Y, ListX, ListY):-
    1 =:= mod(Y, 2),
        NewY is Y - 1,
        getEvenCell(OpponentPlayer, Board, X, NewY, [], [], ListX, ListY, topRight);
    0 =:= mod(Y, 2),
        NewX is X + 1,
        NewY is Y - 1,
        getOddCell(OpponentPlayer, Board, NewX, NewY, [], [], ListX, ListY, topRight).

% Returns all the above cells that can be played given a specific X and Y
getAbove(OpponentPlayer, Board, X, Y, ListX, ListY):-
    NewY is Y - 2,
    getEvenCell(OpponentPlayer, Board, X, NewY, [], [], ListX, ListY, above).

% Returns all the below cells that can be played given a specific X and Y
getBelow(OpponentPlayer, Board, X, Y, ListX, ListY):-
    NewY is Y + 2,
    getEvenCell(OpponentPlayer, Board, X, NewY, [], [], ListX, ListY, below).

% Returns all the bottom left cells that can be played given a specific X and Y
getBottomLeft(OpponentPlayer, Board, X, Y, ListX, ListY):-
    1 =:= mod(Y, 2),
        NewX is X - 1,
        NewY is Y + 1,
        getEvenCell(OpponentPlayer, Board, NewX, NewY, [], [], ListX, ListY, bottomLeft);
    0 =:= mod(Y, 2),
        NewY is Y + 1,
        getOddCell(OpponentPlayer, Board, X, NewY, [], [], ListX, ListY, bottomLeft).

% Returns all the bottom right cells that can be played given a specific X and Y
getBottomRight(OpponentPlayer, Board, X, Y, ListX, ListY):-
    1 =:= mod(Y, 2),
        NewY is Y + 1,
        getEvenCell(OpponentPlayer, Board, X, NewY, [], [], ListX, ListY, bottomRight);
    0 =:= mod(Y, 2),
        NewX is X + 1,
        NewY is Y + 1,
        getOddCell(OpponentPlayer, Board, NewX, NewY, [], [], ListX, ListY, bottomRight).

% Returns the X on the ListX and the Y on the ListY of all the cells that can be playeed given a specific X and Y
getAllPossibleCellsToMove(OpponentPlayer, Board, X, Y, ListX, ListY):-
    getTopLeft(OpponentPlayer, Board, X, Y, TopLeftX, TopLeftY),
    getTopRight(OpponentPlayer, Board, X, Y, TopRightX, TopRightY),
    getAbove(OpponentPlayer, Board, X, Y, AboveX, AboveY),
    getBelow(OpponentPlayer, Board, X, Y, BelowX, BelowY),
    getBottomLeft(OpponentPlayer, Board, X, Y, BottomLeftX, BottomLeftY),
    getBottomRight(OpponentPlayer, Board, X, Y, BottomRightX, BottomRightY),

    append(TopLeftX, TopRightX, X1),
    append(X1, AboveX, X2),
    append(X2, BelowX, X3),
    append(X3, BottomLeftX, X4),
    append(X4, BottomRightX, X5),

    append(TopLeftY, TopRightY, Y1),
    append(Y1, AboveY, Y2),
    append(Y2, BelowY, Y3),
    append(Y3, BottomLeftY, Y4),
    append(Y4, BottomRightY, Y5),

    takeWormholesOut(Board, X5, Y5, [], [], ListX, ListY).

% Returns Piece on Row and Column
getPiece(Row, Column, Board, Piece):-
    nth0(Row, Board, MyRow),
    nth0(Column, MyRow, Piece).

% Replaces element O to R on Board only one time
replaceElement(_, _, _, [], []).
replaceElement(O, R, 0, [O|Xs], [R|Ys]):-
    replaceElement(O, R, 20, Xs, Ys).
replaceElement(O, R, Column, [X|Xs], [X|Ys]):-
    NewColumn is Column - 1,
    replaceElement(O, R, NewColumn, Xs, Ys).

replace(_, _, _, _, [], []).
replace(OldPiece, NewPiece, 0, Column, [X|Xs], [Y|Ys]):-
    replaceElement(OldPiece, NewPiece, Column, X, Y),
    replace(OldPiece, NewPiece, 20, Column, Xs, Ys).
replace(OldPiece, NewPiece, Row, Column, [X|Xs], [X|Ys]):-
    NewRow is Row - 1,
    replace(OldPiece, NewPiece, NewRow, Column, Xs, Ys).

% Makes NewPiece as the final piece to display in the board
apply0([A, _, _, _], A).
apply1([_, A, _, _], A).
apply2([_, _, [A], _], A).
apply3([_, _, _, A], A).

setPieceToMove([X|Xs], [Y|Ys], Ship, Building, NewPiece, 3):-
    apply3(NewPiece, Building).
setPieceToMove([X|Xs], [Y|Ys], Ship, Building, NewPiece, 2):-
    apply2(NewPiece, Ship),
    setPieceToMove(Xs, Ys, Ship, Building, NewPiece, 3).
setPieceToMove([X|Xs], [Y|Ys], Ship, Building, NewPiece, 1):-
    apply1(NewPiece, X),
    setPieceToMove(Xs, Ys, Ship, Building, NewPiece, 2).
setPieceToMove([X|Xs], [Y|Ys], Ship, Building, NewPiece, 0):-
    apply0(NewPiece, Y),
    setPieceToMove(Xs, Ys, Ship, Building, NewPiece, 1).

% Removes ship on the old piece
removeShipFromPiece([Type, Owner, Ships, Building], Ship, [Type, Owner, NewShips, Building]):-
    delete(Ships, Ship, NewShips).

% Assigns ship based on user input
assignShip(a, shipA).
assignShip(b, shipB).
assignShip(c, shipC).
assignShip(d, shipD).
assignShip(w, shipW).
assignShip(x, shipX).
assignShip(y, shipY).
assignShip(z, shipZ).

% Assigns building based on user input
assignBuilding(t, trade).
assignBuilding(c, colony).

% Writes N newlines
clearScreen(0).
clearScreen(N):-
    N1 is N - 1,
    nl,
    clearScreen(N1).

getShip([_,_,Ship,_], Ship).

/**** CALCULATE SCORE FUNCTIONS ****/

getRowPieces(Board, NumOfRow, Piece):-
    getPiece(NumOfRow, _, Board, Piece).

%% GETS ALL BOARD PIECES
% Regardless of coordinates
getBoardPieces(Board, Piece):-
    getRowPieces(Board, _, Piece).

% With coordinates
getBoardPiece(Board, Piece, X, Y):-
    getPiece(Y, X, Board, Piece).

%% Get score from star system cells
starSystemScore(StarSystem, Score):-
    (isStarSystem1(StarSystem), Score is 1);
    (isStarSystem2(StarSystem), Score is 2);
    (isStarSystem3(StarSystem), Score is 3);
    (isStarSystemEmpty(StarSystem), Score is 0).

getScoreFromStarSystemPiece(Piece, Score):-
    isStarSystem(Piece), starSystemScore(Piece, Score).

%% Get score from nebula system cells
getPlayerNebulaScore(Player, NumOfOwnedNebulas, NebulaScore):-
    (NumOfOwnedNebulas =:= 0, NebulaScore is 0);
    (NumOfOwnedNebulas =:= 1, NebulaScore is 2);
    (NumOfOwnedNebulas =:= 2, NebulaScore is 5);
    (NumOfOwnedNebulas =:= 3, NebulaScore is 8).

getNumOfOwnedNebulas(Player, Board, NumOfOwnedNebulas):-
    findall(Piece, (getBoardPieces(Board, Piece), systemBelongsToPlayer(Player, Piece), isNebulaSystem(Piece)), ListOfNebulasOwned),
    length(ListOfNebulasOwned, NumOfOwnedNebulas).


getScoreOfPlayerStarSystemPiece(Player, Board, Piece, Score):-
    getBoardPieces(Board, Piece),
    systemBelongsToPlayer(Player, Piece),
    (getScoreFromStarSystemPiece(Piece, Score)) .

%% Get score from adjacent cells belonging to player
getCoordsOfTradeStationsAdjacents(Player, Board, ListOfCoords):-
    getBoardPiece(Board, Piece, X, Y),
    systemBelongsToPlayer(Player, Piece),
    hasSystemTradeStation(Piece),

    getAdjacent(X, Y, Xadj, Yadj),
    getBoardPiece(Board, AdjPiece, Xadj, Yadj),
    isSystemOwned(AdjPiece),
    (\+(systemBelongsToPlayer(Player, AdjPiece))),
    ListOfCoords = [Xadj, Yadj].

getScoreFromAdjacentsToTradeStations(Player, Board, ScoreFromAdjacents):-
    findall(ListOfCoords, getCoordsOfTradeStationsAdjacents(Player, Board, ListOfCoords), ListOfAdjacents),

    length(ListOfAdjacents, ScoreFromAdjacents).

%% [AI] Get possible score of case because of adjacent cells

getCoordsOfEnemyCellAdjacents(Player, Board, X, Y, ListOfCoords):-

    getAdjacent(X, Y, Xadj, Yadj),
    getBoardPiece(Board, AdjPiece, Xadj, Yadj),
    isSystemOwned(AdjPiece),
    (\+(systemBelongsToPlayer(Player, AdjPiece))),
    ListOfCoords = [Xadj, Yadj].

getScoreFromAdjacentsToCell(Player, Board, X, Y, ScoreFromAdjacents):-
    findall(ListOfCoords, getCoordsOfEnemyCellAdjacents(Player, Board, X, Y, ListOfCoords), ListOfAdjacents),

    length(ListOfAdjacents, ScoreFromAdjacents).


%% Get player total score

getTotalScoreOfPlayer(Player, Board, TotalScore):-
    %star systems
    %% findall(<o que quero procurar>, <que condição tem que obedecer>, <onde guardar soluções>).
    findall(Score, getScoreOfPlayerStarSystemPiece(Player, Board, Piece, Score), StarSystemList), 

    ((length(StarSystemList, 0), TotalStarSystemsScore is 0)
    ;
    list_sum(StarSystemList, TotalStarSystemsScore)),
    
    %nebulas systems
    getNumOfOwnedNebulas(Player, Board, NumOfOwnedNebulas),
    getPlayerNebulaScore(Player, NumOfOwnedNebulas, NebulaScore),
    
    %adjacent systems
    getScoreFromAdjacentsToTradeStations(Player, Board, ScoreFromAdjacents),

    %total 
    TotalScore is (TotalStarSystemsScore+NebulaScore+ScoreFromAdjacents).

/******************VALID MOVE FUNCTIONS******************/

% Checks if ship to move belongs to the player who is playing
canPlayerMoveSelectedShip(1, Ship):-
    (Ship == shipA; Ship == shipB; Ship == shipC; Ship == shipD);
    !,
    write('***** You entered a ship that is not yours to command! *****'), nl,
    fail.
canPlayerMoveSelectedShip(2, Ship):-
    (Ship == shipW; Ship == shipX; Ship == shipY; Ship == shipZ);
    !,
    write('***** You entered a ship that is not yours to command! *****'), nl,
    fail.

% Checks if the row inserted by the player is in the board
checkRowLimits(Board, DestinationRow):-
    length(Board, NumOfRows),

    (DestinationRow > NumOfRows,
    !,
    format('***** The board only has ~d rows, cant go to row ~d*****~n', [NumOfRows, DestinationRow]),
    fail)
    ;
    (DestinationRow < 0,
    !,
    write('***** There are no negative coordinates. ******'), nl, 
    fail).
checkRowLimits(Board, DestinationRow).

% Checks if the column inserted by the player is in the board
checkColumnLimits([X|Xs], 0, DestinationColumn):-
    length(X, NumOfColumns),
    
    (DestinationColumn > NumOfColumns,
    !,
    format('***** The board only has ~d columns, cant go to column ~d*****~n', [NumOfColumns, DestinationColumn]),
    fail)
    ;
    (DestinationColumn < 0,
    !,
    write('***** There are no negative coordinates. ******'), nl, 
    fail).
checkColumnLimits([X|Xs], 0, DestinationColumn).
checkColumnLimits([X|Xs], DestinationRow, DestinationColumn):-
    NewRow is DestinationRow - 1,
    checkColumnLimits(Xs, NewRow, DestinationColumn).

% Checks if the building typed by the player is either a colony ir a trade station
checkValidBuilding(Building):-
    (Building == trade; Building == colony);
    !,
    write('***** Invalid input, please only type t or c for the building!*****'), nl,
    fail.

/**** MOVE WITH DIRECTIONS ****/

moveNCellsInDirectionOddRow(Xi, Yi, Direction, NumberOfCells, Xf, Yf):-

    ((northwest(Direction), Yf is(Yi - NumberOfCells), Xf is(Xi - ((NumberOfCells + 1) // 2)))
    ;
    (southwest(Direction), Yf is(Yi + NumberOfCells), Xf is(Xi - ((NumberOfCells + 1) // 2)))
    ;
    (northeast(Direction), Yf is(Yi - NumberOfCells), Xf is(Xi + (NumberOfCells // 2)))
    ;
    (southeast(Direction), Yf is(Yi + NumberOfCells), Xf is(Xi + (NumberOfCells // 2)))),

    verifyValidGeometricDirection(Xi, Yi, Xf, Yf).

moveNCellsInDirectionEvenRow(Xi, Yi, Direction, NumberOfCells, Xf, Yf):-

    ((northwest(Direction), Yf is(Yi - NumberOfCells), Xf is(Xi - (NumberOfCells // 2)))
    ;
    (southwest(Direction), Yf is(Yi + NumberOfCells), Xf is(Xi - (NumberOfCells // 2)))
    ;
    (northeast(Direction), Yf is(Yi - NumberOfCells), Xf is(Xi + ((NumberOfCells + 1) // 2)))
    ;
    (southeast(Direction), Yf is(Yi + NumberOfCells), Xf is(Xi + ((NumberOfCells + 1) // 2)))),

    verifyValidGeometricDirection(Xi, Yi, Xf, Yf).

moveNCellsInDirection(Xi, Yi, Direction, NumberOfCells, Xf, Yf):-
    NumberOfCells \= 0,
    
    %north
    ((north(Direction), Yf is (Yi - (NumberOfCells*2)), Xf is Xi, verifyValidGeometricDirection(Xi, Yi, Xf, Yf))
    ;
    %south
    (south(Direction), Yf is (Yi + (NumberOfCells*2)), Xf is Xi, verifyValidGeometricDirection(Xi, Yi, Xf, Yf))
    ;
    %other Directions
    ((1 =:= mod(Yi, 2), moveNCellsInDirectionOddRow(Xi, Yi, Direction, NumberOfCells, Xf, Yf)))
    ;
    ((0 =:= mod(Yi, 2), moveNCellsInDirectionEvenRow(Xi, Yi, Direction, NumberOfCells, Xf, Yf)))).
    
/**** VERIFY MOVE ****/

verifyValidDirectionOddRow(Xi, Yi, Xf, Yf):- 
    DifY is (Yf - Yi), DifX is(Xf-Xi),

    ((DifX >= 0, abs(DifX) =:= (abs(DifY//2)))
    ;
    (DifX =< 0, abs(DifX) =:= ((abs(DifY) + 1)//2))).

verifyValidDirectionEvenRow(Xi, Yi, Xf, Yf):- 
    DifY is (Yf - Yi), DifX is(Xf-Xi),

    ((DifX =< 0, abs(DifX) =:= (abs(DifY//2)))
    ;
    (DifX >= 0, abs(DifX) =:= ((abs(DifY) + 1)//2))).

% Verify is PATH is unobstructed (does NOT include final destination -> checked in checkValidLandingCell)

unobstructedPath(Board, Player, Xi, Yi, Direction, 1).

unobstructedPath(Board, Player, Xi, Yi, Direction, NumberOfCells):-
    N is NumberOfCells - 1,
    moveNCellsInDirection(Xi, Yi, Direction, N, Xf, Yf),
    getPiece(Yf, Xf, Board, DestinationPiece),
    (checkValidLandingCell(DestinationPiece) ; systemBelongsToPlayer(Player, DestinationPiece) ; isWormhole(DestinationPiece)),
    unobstructedPath(Board, Player, Xi, Yi, Direction, N).



/**** VERIFY END OF THE GAME ****/

endGame(Board):-
    
    % verify player 1 ships
    \+((((player1Ship(Ship1),
    getBoardPieces(Board, PieceWithShip1),
    systemHasShip(Ship1, PieceWithShip1),
    getPiece(Y1, X1, Board, PieceWithShip1),

    % if he can fly over adjacent houses
    unobstructedPath(Board, player1, X1, Y1, Direction1, 2),
    moveNCellsInDirection(X1, Y1, Direction1, 2, Xf1, Yf1),
    getPiece(Yf1, Xf1, Board, AdjPiece1),
    checkValidLandingCell(AdjPiece1))
    
  ;
    
    % verify player 2 ships
    (player2Ship(Ship2), 
    getBoardPieces(Board, PieceWithShip2),
    systemHasShip(Ship2, PieceWithShip2),
    getPiece(Y2, X2, Board, PieceWithShip2),

    unobstructedPath(Board, player2, X2, Y2, Direction2, 2),
    moveNCellsInDirection(X2, Y2, Direction2, 2, Xf2, Yf2),
    getPiece(Yf2, Xf2, Board, AdjPiece2),
    checkValidLandingCell(AdjPiece2)))
    
    ,!,
    
    % verify counters of buildings of both players 
    (
        (numOfBuildings(player1, Building1, N1), N1 > 0) ;
        (numOfBuildings(player2, Building2, N2), N2 > 0)
    ))).



/**** USE THIS FUNCTION TO VERIFY THE MOVEMENT OF A SHIP ****/
verifyValidGeometricDirection(Xi, Yi, Xf, Yf):-
    ((Xi =:= Xf), (mod(Yi, 2) =:= mod(Yf,2)), Yf \= Yi);
    ((1 =:= mod(Yi, 2), verifyValidDirectionOddRow(Xi, Yi, Xf, Yf)));
    ((0 =:= mod(Yi, 2), verifyValidDirectionEvenRow(Xi, Yi, Xf, Yf))).

% Checks if the landing cell is valid
checkValidLandingCell([_, free, _, _]).
checkValidLandingCell([wormhole]):-
    %write('You cant land in a wormhole!'), nl,
    fail.
checkValidLandingCell([blackhole]):-
    %write('You cant land in a blackhole!'), nl,
    fail.
checkValidLandingCell(Cell):-
    isSystemOwned(Cell),
    %write('You cant land in an occupied cell!'), nl,
    fail.

myDebug(ShipToMove, PieceToMove, DestinationPiece, NewPiece, OldPiece):-
    write('This is the selected ship: '),
    write(ShipToMove), nl,
    write('This is the piece to move: '),
    write(PieceToMove), nl,
    write('This is the destination piece: '),
    write(DestinationPiece), nl,
    write('This is the new piece: '),
    write(NewPiece), nl,
    write('This is the old piece: '),
    write(OldPiece), nl.

% Reads player input
readPlayerInput(Board, WhoIsPlaying, OldPiece, NewPiece, PieceToMove, PieceToMoveRow, PieceToMoveColumn, DestinationPiece, DestinationRow, DestinationColumn):-
    !,
    repeat,
    write('Select ship'), nl,
    read(UserShipToMove), nl,
    assignShip(UserShipToMove, ShipToMove),
    canPlayerMoveSelectedShip(WhoIsPlaying, ShipToMove),

    getBoardPieces(Board, PieceToMove),
    systemHasShip(ShipToMove, PieceToMove),
    getPiece(PieceToMoveRow, PieceToMoveColumn, Board, PieceToMove),

    /*!,
    repeat,*/
    
    write('Select direction to travel (n, s, nw, ne, sw, se)'), nl,
    read(Direction), nl,

    write('Select number of cells to travel'), nl,
    read(NumOfCells), nl,
    
    (moveNCellsInDirection(PieceToMoveColumn, PieceToMoveRow, Direction, NumOfCells, DestinationColumn, DestinationRow) ;
    (write('Cannot move cell to the chosen destiny.'), nl, fail)),

    (getPiece(DestinationRow, DestinationColumn, Board, DestinationPiece)
    ;
    (write('There is no cell in those coordinates.'), nl, fail)),

    % check if the destination cell is a valid one
    (checkValidLandingCell(DestinationPiece)
    ;
    (((isBlackhole(DestinationPiece), write('You cant land in a blackhole!'));
    (isWormhole(DestinationPiece), write('You cant land in a wormhole!'));
    (isSystemOwned(DestinationPiece)), write('You cant land in an occupied cell!')),
    nl, fail)),

    % Convert WhoIsPlaying to player1 or player2 atoms
    ((WhoIsPlaying =:= 1, MyPlayer = player1) ; (WhoIsPlaying =:= 2, MyPlayer = player2)),

    % check if path is uninterrupted
    (unobstructedPath(Board, MyPlayer, PieceToMoveColumn, PieceToMoveRow, Direction, NumOfCells)
    ;
    (write('This path you shall not take, for great dangers reside in it.'), nl, write(PieceToMoveColumn), nl, write(PieceToMoveRow), nl, write(Direction), nl, write(NumOfCells), nl, write(DestinationColumn), nl, write(DestinationRow), fail)),

    !,
    repeat,
    format('Player ~p, what building would you like to construct?~n   t --> Trade Station~n   c --> Colony~n', [WhoIsPlaying]),
    read(UserBuilding),
    assignBuilding(UserBuilding, Building),
    checkValidBuilding(Building),

    ((numOfBuildings(MyPlayer, Building, Num), Num > 0) ;
    (write('You are out of buildings of that type.'), nl, fail)),

    setPieceToMove(PieceToMove, DestinationPiece, ShipToMove, Building, NewPiece, 0),
    removeShipFromPiece(PieceToMove, ShipToMove, OldPiece),

    %% decrease counter
    numOfBuildings(MyPlayer, Building, NumOfBuildings),
    UpdateNumOfBuildings is NumOfBuildings-1,
    assert(numOfBuildings(MyPlayer, Building, UpdateNumOfBuildings)),
    retract(numOfBuildings(MyPlayer, Building, NumOfBuildings)).

% Updates board
updateBoard(Board, OldPiece, NewPiece, PieceToMove, PieceToMoveRow, PieceToMoveColumn, DestinationPiece, DestinationRow, DestinationColumn, UpdatedBoard):-
    replace(PieceToMove, OldPiece, PieceToMoveRow, PieceToMoveColumn, Board, BoardChange1),
    replace(DestinationPiece, NewPiece, DestinationRow, DestinationColumn, BoardChange1, UpdatedBoard).

% Returns only the valid adjacent cells. The X list is D, and the Y list is C
restrictValidCells(_, _, [], [], A, B, A, B).
restrictValidCells(Board, NumOfRows, [Y|Ys], [X|Xs], A, B, C, D):-
    X >= 0,
    Y >= 0,
    getColumnLength(Board, X, NumOfColumns),
    X < NumOfColumns,
    Y < NumOfRows,
    restrictValidCells(Board, NumOfRows, Ys, Xs, [Y|A], [X|B], C, D);
    restrictValidCells(Board, NumOfRows, Ys, Xs, A, B, C, D).


getBestCellToMoveTo(Board):-
    getAdjacentList(2, 0, AdjacentListX, AdjacentListY),

    length(Board, NumOfRows),
    restrictValidCells(Board, NumOfRows, AdjacentListY, AdjacentListX, [], [], ValidListY, ValidListX).

% Returns the X and Y of the cell that gives more score to the AI
searchMaxScore(Board, [], [], _, Building, CellToPlayX, CellToPlayY, OriginCellX, OriginCellY, UpdatedBoard):-        
    getPiece(OriginCellY, OriginCellX, Board, PieceToMove),
    getPiece(CellToPlayY, CellToPlayX, Board, DestinationPiece),

    getShip(PieceToMove, Ships),
    getShipAux(Ships, IndividualShip),

    setPieceToMove(PieceToMove, DestinationPiece, IndividualShip, Building, NewPiece, 0),
    removeShipFromPiece(PieceToMove, IndividualShip, OldPiece),

    updateBoard(Board, OldPiece, NewPiece, PieceToMove, OriginCellY, OriginCellX, DestinationPiece, CellToPlayY, CellToPlayX, UpdatedBoard),
    format('AI moved ship from X = ~d, Y = ~d to X = ~d, Y = ~d~n', [OriginCellX, OriginCellY, CellToPlayX, CellToPlayY]),
    nl, write('*************** AI turn End ***************'), nl, nl.

searchMaxScore(Board, [X|Xs], [Y|Ys], CurrentMaxScore, Building, CellToPlayX, CellToPlayY, OriginCellX, OriginCellY, UpdatedBoard):-
    getScoreFromAdjacentsToCell(player2, Board, X, Y, AdjacentScore),
    getPiece(Y, X, Board, Piece),
    getScoreFromStarSystemPiece(Piece, CellScore),
    TotalScore is AdjacentScore + CellScore,
    TotalScore > CurrentMaxScore,
        searchMaxScore(Board, Xs, Ys, TotalScore, trade, X, Y, OriginCellX, OriginCellY, UpdatedBoard);
    searchMaxScore(Board, Xs, Ys, CurrentMaxScore, Building, CellToPlayX, CellToPlayY, OriginCellX, OriginCellY, UpdatedBoard).

getAIShips(Board, X, Y):-
    player2Ship(Ship),
    getBoardPieces(Board, PieceWithShip),
    systemHasShip(Ship, PieceWithShip),
    getPiece(Y, X, Board, PieceWithShip).
getAI2Ships(Board, X, Y):-
    player1Ship(Ship),
    getBoardPieces(Board, PieceWithShip),
    systemHasShip(Ship, PieceWithShip),
    getPiece(Y, X, Board, PieceWithShip).

chooseShipToMove(0, [X|Xs], [Y|Ys], X, Y).
chooseShipToMove(PieceDecider, [X|Xs], [Y|Ys], OriginCellX, OriginCellY):-
    NewPieceDecider is PieceDecider - 1,
    chooseShipToMove(NewPieceDecider, Xs, Ys, OriginCellX, OriginCellY).

getShipAux([X|Xs], X).

% Does AI turn
playerTurn(Board, ai, UpdatedBoard):-
    write('*************** AI turn ***************'), nl, nl,
    display_board(Board),

    findall(X, getAIShips(Board, X, Y), PiecesWithShipPositionX),
    findall(Y, getAIShips(Board, X, Y), PiecesWithShipPositionY),

    !,
    repeat,
   
    random(0, 4, PieceDecider),
    chooseShipToMove(PieceDecider, PiecesWithShipPositionX, PiecesWithShipPositionY, OriginCellX, OriginCellY),

    getAllPossibleCellsToMove(player1, Board, OriginCellX, OriginCellY, ListX, ListY),

    length(ListX, NumOfCellsCanMove),
    NumOfCellsCanMove > 0,
        first(FirstX, ListX),
        first(FirstY, ListY),
        searchMaxScore(Board, ListX, ListY, 0, colony, FirstX, FirstY, OriginCellX, OriginCellY, UpdatedBoard);
    write('Failed, trying again'), nl,
    fail.

% Does AI turn
playerTurn(Board, ai2, UpdatedBoard):-
    write('*************** AI turn ***************'), nl, nl,
    display_board(Board),

    findall(X, getAI2Ships(Board, X, Y), PiecesWithShipPositionX),
    findall(Y, getAI2Ships(Board, X, Y), PiecesWithShipPositionY),

    !,
    repeat,
   
    random(0, 4, PieceDecider),
    chooseShipToMove(PieceDecider, PiecesWithShipPositionX, PiecesWithShipPositionY, OriginCellX, OriginCellY),

    getAllPossibleCellsToMove(player2, Board, OriginCellX, OriginCellY, ListX, ListY),

    length(ListX, NumOfCellsCanMove),
    NumOfCellsCanMove > 0,
        first(FirstX, ListX),
        first(FirstY, ListY),
        searchMaxScore(Board, ListX, ListY, 0, colony, FirstX, FirstY, OriginCellX, OriginCellY, UpdatedBoard);
    write('Failed, trying again'), nl,
    fail.

% Does player turn
playerTurn(Board, WhoIsPlaying, UpdatedBoard):-
    format('*************** Player ~d turn *************** ~n~n', [WhoIsPlaying]),
    display_board(Board), nl, nl,

    ((WhoIsPlaying =:= 1, Player = player1) ; (WhoIsPlaying =:= 2, Player = player2)),

    numOfBuildings(Player, trade, NumOfTrade),
    numOfBuildings(Player, colony, NumOfColonies),

    !,

    ((NumOfTrade =< 0, NumOfColonies =< 0, write('You have no more buildings, so you cant colonize. Passing your turn.'), nl, sleep(2), append(Board, [], UpdatedBoard))

    ;

    (format('You have: ~d trade station(s) and ~d colony(ies)~n~n', [NumOfTrade, NumOfColonies]),

    readPlayerInput(Board, WhoIsPlaying, OldPiece, NewPiece, PieceToMove, PieceToMoveRow, PieceToMoveColumn, DestinationPiece, DestinationRow, DestinationColumn),
    updateBoard(Board, OldPiece, NewPiece, PieceToMove, PieceToMoveRow, PieceToMoveColumn, DestinationPiece, DestinationRow, DestinationColumn, UpdatedBoard))),
   
    clearScreen(60).