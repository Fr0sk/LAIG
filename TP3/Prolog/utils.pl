getNthCell(Row, Column, Board, Cell):-
    nth0(Row, Board, MyRow),
    nth0(Column, MyRow, Cell).

myInit:- board(B), getNthCell(0, 1, B, Cell), write(Cell).

/*** LIST UTILS ***/

sufix(Xs, Xs).
sufix(Xs, [Y|Ys]):- suffix(Xs, Ys).

sublist(Xs, Ys):- prefix(Xs, Ys).
sublist(Xs, [Y|Ys]):- sublist(Xs,Ys).

length([],0);
length([X|Xs], s(N)):- length(Xs, N).

first(X, [X|_]).

myLast(X, [X]).
myLast(X, [_|Z]) :- myLast(X, Z).

display_list([]).

display_list([E1|Es]):-
    write(E1),
    display_list(Es).

list_sum([Item], Item).
list_sum([Item1,Item2 | Tail], Total) :-
    list_sum([Item1+Item2|Tail], Total).

% Writes the whole list
writeList([], _):-
    write('End of list'),
    nl, nl.
writeList([X|Xs], N):-
    write('Element num '), write(N), write(': '),
    write(X), nl,
    %format('Element num ~d: ~d~n', [N, X]),
    N1 is N + 1,
    writeList(Xs, N1).

writeXY([], []):-
    write('End of lists'),
    nl, nl.
writeXY([X|Xs], [Y|Ys]):-
    format('X = ~d, Y = ~d~n', [X, Y]),
    writeXY(Xs, Ys).

% Gets the length of the selected row
getColumnLength([X|Xs], 0, Length):-
    length(X, Length).
getColumnLength([X|Xs], Row, Length):-
    NewRow is Row - 1,
    getColumnLength(Xs, NewRow, Length).

/*** END OF LIST UTILS ***/