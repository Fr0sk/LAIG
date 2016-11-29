%%% Case example: [<type>, <owner>, [<listOfShips], <building>]

/* TYPES OF CASE 
h - home system
b - blackhole
w - wormhole
l1 - level one system (1 point)
l2 - level two system (2 points)
l3 - level three system (3 points)
n - nebula (5 points)
*/

/* OWNER
1 - player one
2 - player two
f - free
*/

/* LIST OF SHIPS
Player one: ABCD or abcd (damaged)
Player two: WXYZ or wxyz (damaged)
*/

/* BUILDING
t - trade station
c - colony
n - none
*/

%% Spaces translations

translate(s10, '          ').
translate(s8, '        ').
translate(s7, '       ').
translate(s6, '      ').
translate(s5, '     ').
translate(s3, '   ').
translate(s2, '  ').
translate(s1, ' ').
translate(s0, '').
translate(t1, '_').
translate(t2, '__').
translate(t3, '___').
translate(ub, '/').
translate(db, '\\').
translate(nl, '\n').
translate(c, '1').
translate(x, '').

%% Logic translations

translate(home, 'h').
translate(emptyS, '0').
translate(star1, '1').
translate(star2, '2').
translate(star3, '3').
translate(nebula, 'n').

translate(player1, 'P1').
translate(player2, 'P2').
translate(free, '  ').

translate(shipA, 'a').
translate(shipB, 'b').
translate(shipC, 'c').
translate(shipD, 'd').
translate(shipW, 'w').
translate(shipX, 'x').
translate(shipY, 'y').
translate(shipZ, 'z').

translate(colony, '(C)').
translate(trade, '[T]').
translate(none, '___').


/* GET GAME PIECE FUNCTIONS */ 

getLine(X, [X|_], 0).

getLine(X, [_|L], LineToSend):-
    getLine(X, L, K1), LineToSend is K1 + 1.

/*** BEGIN OF DISPLAY OF BOARD PIECES ***/

%% Systems and nebula displays

display_piece_line_1([Type, Owner, Ships, Building]):-
    translate(Type, T),
    translate(s1, S),
    write(S),
    write(T),
    write(S).

display_piece_line_2([Type, Owner, Ships, Building]):-
    translate(Owner, O),
    translate(s1, S1),
    translate(s2, S2),
    write(S1),
    write(O), 
    write(S2).

display_ships([]).

display_ships([S1|Ss]):-
    translate(S1, S),
    write(S),
    display_ships(Ss).

display_piece_line_3([Type, Owner, Ships, Building]):-
    length(Ships, L),
    L1 is 5-L,
    display_ships(Ships),
    generate_empty_space(s1, L1).

display_piece_line_4([Type, Owner, Ships, Building]):-
    translate(Building, B),
    write(B).

%% Wormhole displays

display_piece_line_1([wormhole]):-
    write(@@@).

display_piece_line_2([wormhole]):-
    write(@),
    translate(s3, S),
    write(S),
    write(@).

display_piece_line_3([wormhole]):-
    display_piece_line_2([wormhole]).

display_piece_line_4([wormhole]):-
    display_piece_line_1([wormhole]).

display_test([wormhole]):-
    display_piece_line_1([wormhole]), nl,
    display_piece_line_2([wormhole]), nl,
    display_piece_line_3([wormhole]), nl,
    display_piece_line_4([wormhole]).

%% Black hole displays

display_piece_line_1([blackhole]):-
    write(###).

display_piece_line_2([blackhole]):-
    write(#####).

display_piece_line_3([blackhole]):-
    display_piece_line_2([blackhole]).

display_piece_line_4([blackhole]):-
    display_piece_line_1([blackhole]).

display_test([blackhole]):-
    display_piece_line_1([blackhole]), nl,
    display_piece_line_2([blackhole]), nl,
    display_piece_line_3([blackhole]), nl,
    display_piece_line_4([blackhole]).

/*** END OF DISPLAY OF BOARD PIECES ***/

/*** BEGIN OF DISPLAY OF BOARD HEXAGONS ***/

generate_empty_space(Spaces, NumberOfTimes):-
    NumberOfTimes = 0,
    write('').

generate_empty_space(Spaces, NumberOfTimes):-
    N1 is NumberOfTimes - 1,
    translate(Spaces, EmptySpace),
    write(EmptySpace),
    generate_empty_space(Spaces, N1).

display_line_1_aux(NumberHexagons):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons - 1,
        translate(t3, A),
        translate(s7, SpaceBetweenHex),
        write(A),
        write(SpaceBetweenHex),
        display_line_1_aux(N1);
    NumberHexagons == 0 -> nl.

display_line_1(NumberEmptySpaces, NumberHexagons):-
    generate_empty_space(s7, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    display_line_1_aux(NumberHexagons).

getCurrentPiece([X|Xs], X, Xs).

display_line_2_aux(NumberHexagons, FirstRow):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons-1,
        getCurrentPiece(FirstRow, CurrentPiece, RemainingPieces),
        translate(ub, OpenHex),
        translate(s3, SpaceInsideHex),
        translate(db, CloseHex),
        translate(s5, SpaceBetweenHex),
        write(OpenHex),
        display_piece_line_1(CurrentPiece),
        write(CloseHex),
        write(SpaceBetweenHex),
        display_line_2_aux(N1, RemainingPieces);
    NumberHexagons == 0 -> nl.

display_line_2(NumberEmptySpaces, NumberHexagons, FirstRow):-
    generate_empty_space(s6, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    display_line_2_aux(NumberHexagons, FirstRow).

display_line_3_aux(NumberHexagons, FirstRow):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons-1,
        getCurrentPiece(FirstRow, CurrentPiece, RemainingPieces),
        translate(t3, A),
        translate(ub, OpenHex),
        translate(s5, SpaceInsideHex),
        translate(db, CloseHex),
        write(A),
        write(OpenHex),
        display_piece_line_2(CurrentPiece),
        write(CloseHex),
        display_line_3_aux(N1, RemainingPieces);
    NumberHexagons == 0 -> nl.

display_line_3(NumberEmptySpaces, NumberHexagons, FirstRow):-
    generate_empty_space(s2, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    display_line_3_aux(NumberHexagons, FirstRow).

display_line_4_aux(NumberHexagons, UpperMatrixLine, MiddleMatrixLine):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons - 1,
        getCurrentPiece(UpperMatrixLine, CurrentUpperPiece, RemainingUpperPieces),
        getCurrentPiece(MiddleMatrixLine, CurrentMiddlePiece, RemainingMiddlePieces),
        translate(ub, OpenHex),
        translate(s3, SpaceInsideHex),
        translate(db, CloseHex),
        translate(s5, SpaceInsideHex2),
        display_piece_line_1(CurrentMiddlePiece),
        write(CloseHex),
        display_piece_line_3(CurrentUpperPiece),
        write(OpenHex),
        display_line_4_aux(N1, RemainingUpperPieces, RemainingMiddlePieces);
    NumberHexagons == 0 -> nl.

display_line_4(NumberEmptySpaces, NumberHexagons, UpperMatrixLine, MiddleMatrixLine):-
    generate_empty_space(s1, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    translate(ub, OpenHex),
    translate(s3, SpaceInsideHex),
    translate(db, CloseHex),
    write(OpenHex),
    display_line_4_aux(NumberHexagons, UpperMatrixLine, MiddleMatrixLine).

display_line_5_aux(NumberHexagons, UpperMatrixLine, MiddleMatrixLine):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons - 1,
        getCurrentPiece(UpperMatrixLine, CurrentUpperPiece, RemainingUpperPieces),
        getCurrentPiece(MiddleMatrixLine, CurrentMiddlePiece, RemainingMiddlePieces),
        translate(ub, OpenHex),
        translate(s5, SpaceInsideHex),
        translate(db, CloseHex),
        display_piece_line_2(CurrentMiddlePiece),
        write(CloseHex),
        display_piece_line_4(CurrentUpperPiece),
        write(OpenHex),
        display_line_5_aux(N1, RemainingUpperPieces, RemainingMiddlePieces);
    NumberHexagons == 0 -> nl.

display_line_5(NumberEmptySpaces, NumberHexagons, UpperMatrixLine, MiddleMatrixLine):-
    generate_empty_space(s0, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    translate(ub, OpenHex),
    translate(s5, SpaceInsideHex),
    translate(db, CloseHex),
    write(OpenHex),
    display_line_5_aux(NumberHexagons, UpperMatrixLine, MiddleMatrixLine).

display_line_6_aux(NumberHexagons, MiddleMatrixLine, LowerMatrixLine):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons - 1,
        getCurrentPiece(MiddleMatrixLine, CurrentMiddlePiece, RemainingMiddlePieces),
        getCurrentPiece(LowerMatrixLine, CurrentLowerPiece, RemainingLowerPiece),        
        translate(ub, OpenHex),
        translate(s3, SpaceInsideHex),
        translate(db, CloseHex),
        translate(s5, SpaceInsideHex2),
        display_piece_line_3(CurrentMiddlePiece),
        write(OpenHex),
        display_piece_line_1(CurrentLowerPiece),
        write(CloseHex),
        display_line_6_aux(N1, RemainingMiddlePieces, RemainingLowerPiece);
    NumberHexagons == 0 -> nl.

display_line_6(NumberEmptySpaces, NumberHexagons, MiddleMatrixLine, LowerMatrixLine):-
    generate_empty_space(s0, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    translate(ub, OpenHex),
    translate(s5, SpaceInsideHex),
    translate(db, CloseHex),
    translate(s5, SpaceInsideHex2),
    write(CloseHex),
    display_line_6_aux(NumberHexagons, MiddleMatrixLine, LowerMatrixLine).

display_line_7_aux(NumberHexagons, MiddleMatrixLine, LowerMatrixLine):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons - 1,
        getCurrentPiece(MiddleMatrixLine, CurrentMiddlePiece, RemainingMiddlePieces),
        getCurrentPiece(LowerMatrixLine, CurrentLowerPiece, RemainingLowerPiece),
        translate(ub, OpenHex),
        translate(s5, SpaceInsideHex),
        translate(db, CloseHex),
        display_piece_line_4(CurrentMiddlePiece),
        write(OpenHex),
        display_piece_line_2(CurrentLowerPiece),
        write(CloseHex),
        display_line_7_aux(N1, RemainingMiddlePieces, RemainingLowerPiece);
    NumberHexagons == 0 -> nl.

display_line_7(NumberEmptySpaces, NumberHexagons, MiddleMatrixLine, LowerMatrixLine):-
    generate_empty_space(s1, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    translate(db, CloseHex),
    write(CloseHex),
    display_line_7_aux(NumberHexagons, MiddleMatrixLine, LowerMatrixLine).

display_line_8_aux(NumberHexagons, LastRow):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons-1,
        getCurrentPiece(LastRow, CurrentPiece, RemainingPieces),
        translate(ub, OpenHex),
        translate(s5, SpaceInsideHex),
        translate(db, CloseHex),
        translate(s3, SpaceInsideHex2),
        write(CloseHex),
        display_piece_line_3(CurrentPiece),
        write(OpenHex),
        write(SpaceInsideHex2),
        display_line_8_aux(N1, RemainingPieces);
    NumberHexagons == 0 -> nl.

display_line_8(NumberEmptySpaces, NumberHexagons, LastRow):-
    generate_empty_space(s5, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    display_line_8_aux(NumberHexagons, LastRow).

display_line_9_aux(NumberHexagons, LastRow):-
    NumberHexagons > 0 ->
        N1 is NumberHexagons-1,
        getCurrentPiece(LastRow, CurrentPiece, RemainingPieces),
        translate(ub, OpenHex),
        translate(db, CloseHex),
        translate(s5, SpaceBetweenHex),
        write(CloseHex),
        display_piece_line_4(CurrentPiece),
        write(OpenHex),
        write(SpaceBetweenHex),
        display_line_9_aux(N1, RemainingPieces);
    NumberHexagons == 0 -> nl.

display_line_9(NumberEmptySpaces, NumberHexagons, LastRow):-
    generate_empty_space(s6, 1),
    generate_empty_space(s10, NumberEmptySpaces),
    display_line_9_aux(NumberHexagons, LastRow).

display_num_linhas(NumLinhasAdicionais, NumOfCols, MatrixLineToStart, Board):-
    NumLinhasAdicionais > 0 ->
        N1 is NumLinhasAdicionais - 1,
        HexMiddleLine is MatrixLineToStart+1,
        HexLowerLine is MatrixLineToStart+2,
        getLine(UpperMatrixLine, Board, MatrixLineToStart),
        getLine(MiddleMatrixLine, Board, HexMiddleLine),
        getLine(LowerMatrixLine, Board, HexLowerLine),
        display_line_4(0, NumOfCols, UpperMatrixLine, MiddleMatrixLine),
        display_line_5(0, NumOfCols, UpperMatrixLine, MiddleMatrixLine),
        display_line_6(0, NumOfCols, MiddleMatrixLine, LowerMatrixLine),
        display_line_7(0, NumOfCols, MiddleMatrixLine, LowerMatrixLine),
        display_num_linhas(N1, NumOfCols, HexLowerLine, Board);
    NumLinhasAdicionais == 0.

display_start_lines(NumOfCols, FirstRow):-
    display_line_1(0, NumOfCols),
    display_line_2(0, NumOfCols, FirstRow),
    display_line_3(0, NumOfCols, FirstRow).

display_end_lines(NumOfCols, LastRow):-
    display_line_8(0, NumOfCols, LastRow),
    display_line_9(0, NumOfCols, LastRow).

display_board(Board):-
    length(Board, NumOfRows),

    1 is mod(NumOfRows, 2), /**** Until we can work with even rows ****/

    first(FirstRow, Board),
    length(FirstRow, NumOfElementsFirstRow),

    myLast(LastRow, Board),
    length(LastRow, NumOfElementsLastRow),

    display_start_lines(NumOfElementsFirstRow, FirstRow),
    display_num_linhas(NumOfRows//2 , NumOfElementsFirstRow, 0, Board),
    display_end_lines(NumOfElementsLastRow, LastRow).

/*** END OF DISPLAY OF BOARD HEXAGONS ***/