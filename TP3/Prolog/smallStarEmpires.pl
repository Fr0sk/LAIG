:- use_module(library(random)).
:- include('logic.pl').

/**** Trade station and Colony counter ****/

:- dynamic numOfBuildings/3.

numOfBuildings(player1, trade, 5).
numOfBuildings(player2, trade, 5).

numOfBuildings(player1, colony, 10).
numOfBuildings(player2, colony, 10).

setBuildingsForEachPlayer(NumOfTrades, NumOfColonies):-

        numOfBuildings(player1, trade, OldNumOfTrades1),
        assert(numOfBuildings(player1, trade, NumOfTrades)),
        retract(numOfBuildings(player1, trade, OldNumOfTrades1)),

        numOfBuildings(player2, trade, OldNumOfTrades2),
        assert(numOfBuildings(player2, trade, NumOfTrades)),
        retract(numOfBuildings(player2, trade, OldNumOfTrades2)),

        numOfBuildings(player1, colony, OldNumOfColonies1),
        assert(numOfBuildings(player1, colony, NumOfColonies)),
        retract(numOfBuildings(player1, colony, OldNumOfColonies1)),
        
        numOfBuildings(player2, colony, OldNumOfColonies2),
        assert(numOfBuildings(player2, colony, NumOfColonies)),
        retract(numOfBuildings(player2, colony, OldNumOfColonies2)).

       
        

assignGameMode(1, playerVSplayer).
assignGameMode(2, playerVSai).
assignGameMode(3, aiVSai).

displayMenu(GameMode):-
        nl, nl,
        write('**************************************************************************************'), nl,
        write('********************************* SMALL STAR EMPIRES *********************************'), nl,
        write('**************************************************************************************'), nl,
        nl, nl,

        write('***** Main Menu *****'), nl, nl,
        write('Player VS Player --> Type 1'), nl,
        write('Player VS AI --> Type 2'), nl,
        write('AI VS AI --> Type 3'), nl, nl,
        write('Select Game Mode'), nl,
        read(UserGameMode), nl,
        assignGameMode(UserGameMode, GameMode).

askForYoungestPlayer(YoungestPlayer):-
        write('Who is the youngest player?'), nl,
        write('Player 1 --> 1'), nl,
        write('Player 2 --> 2'), nl,
        read(YoungestPlayer), nl, nl.

startGame:- 
        setBuildingsForEachPlayer(5, 10),
        displayMenu(GameMode),
        playGameMode(GameMode).

playGameMode(playerVSplayer):-
        askForYoungestPlayer(YoungestPlayer),
        write('********************* THE BATTLE IS ON! *********************'), nl, nl,
        initial_logic_board(Board),
        \+(playPlayerPlayer(Board, YoungestPlayer))
        .

playGameMode(playerVSai):-
        write('********************* THE BATTLE IS ON! *********************'), nl, nl,
        initial_logic_board(Board),
        \+(playPlayerAI(Board, ai)).

playGameMode(aiVSai):-
        write('********************* THE BATTLE IS ON! *********************'), nl, nl,
        initial_logic_board(Board),
        \+(playAIAI(Board, ai)).

playPlayerPlayer(Board, WhoIsPlaying):-
        (\+endGame(Board) ;

        display_board(Board), nl,

        (getTotalScoreOfPlayer(player1, Board, TotalScore1),
         format('Player 1 has a score of ~d points.~n', [TotalScore1]),
        
        getTotalScoreOfPlayer(player2, Board, TotalScore2),
        format('Player 2 has a score of ~d points.~n', [TotalScore2]), nl, nl,

        ((TotalScore1 > TotalScore2,
        write('***** WINNER: player1 *****'));

        (TotalScore1 < TotalScore2,
        write('***** WINNER: player2 *****'));

        (TotalScore1 =:= TotalScore2,
        write('***** DRAW *****'))),
        
        !, fail)),

        (WhoIsPlaying == 1,
        playerTurn(Board, 1, UpdatedBoard),
        !,
        playPlayerPlayer(UpdatedBoard, 2);
        
        playerTurn(Board, 2, UpdatedBoard),
        !,
        playPlayerPlayer(UpdatedBoard, 1)).

playPlayerAI(Board, WhoIsPlaying):-
        (\+endGame(Board) ;

        display_board(Board), nl,

        (getTotalScoreOfPlayer(player1, Board, TotalScore1),
         format('Player 1 has a score of ~d points.~n', [TotalScore1]),
        
        getTotalScoreOfPlayer(player2, Board, TotalScore2),
        format('AI has a score of ~d points.~n', [TotalScore2]),
        
        ((TotalScore1 > TotalScore2,
        write('***** WINNER: player1 *****'));

        (TotalScore1 < TotalScore2,
        write('***** WINNER: player2 *****'));

        (TotalScore1 =:= TotalScore2,
        write('***** DRAW *****'))),

        !, fail)),
        
        (WhoIsPlaying == 1,
        playerTurn(Board, 1, UpdatedBoard),
        !,
        playPlayerAI(UpdatedBoard, ai);
        
        playerTurn(Board, ai, UpdatedBoard),
        !,
        playPlayerAI(UpdatedBoard, 1)).

playAIAI(Board, WhoIsPlaying):-
        (\+endGame(Board) ;

        display_board(Board), nl,

        (getTotalScoreOfPlayer(player1, Board, TotalScore1),
         format('Player 1 has a score of ~d points.~n', [TotalScore1]),
        
        getTotalScoreOfPlayer(player2, Board, TotalScore2),
        format('Player 2 has a score of ~d points.~n', [TotalScore2]),
        
        ((TotalScore1 > TotalScore2,
        write('***** WINNER: player1 *****'));

        (TotalScore1 < TotalScore2,
        write('***** WINNER: player2 *****'));

        (TotalScore1 =:= TotalScore2,
        write('***** DRAW *****'))),

        !, fail)),

        (WhoIsPlaying == ai,
        playerTurn(Board, ai, UpdatedBoard),
        !,
        playAIAI(UpdatedBoard, ai2);

        playerTurn(Board, ai2, UpdatedBoard),
        !,
        playAIAI(UpdatedBoard, ai)).