# Autopatzer websocket API

Connect with websocket to http://localhost:3001/ws

All messages are asynchronous.

Game state is stored in the mojo daemon, we probably don't need the JS part
to store game state. If we reach a point where we want JS to store game state
we should consider whether it might just be easier to move host parts into
mojolicious and add some websocket message types.

Notably missing from this specification so far is any way for the JS part (and
therefore the user) to request some information about what the current board position
should be, so if they accidentally kick all the pieces over they better either remember
what squares they go on, or manually replay the entire game by following the
moves which should be displayed on the interface (like "1. e4 e5 2. Nf3 Nf6" etc.).

All messages are JSON hashes (dictionaries? objects?). Messages which are not a hash (e.g.
arrays or scalars) are illegal.
Message types are identified by the "op" field, which is present in all messages.
Upon receipt of a message we need to switch on "op" and then handle it accordingly.
Messages which do not contain "op" are illegal.

## Messages from web page to mojolicious

### Play move

    {"op":"play","move":"Ne5"}

When lichess reports that the other player has made a move, immediately send it onwards
to Mojolicious so that the board state can be updated & the move can be made on the physical
board using the stepper motors.

When the player has made a move (which he confirms by hitting the clock button, see below),
then also use this function to send the move to Mojo.

Mojo won't know or care whether the local player is black or white, it's up to the JS app
to just tell Mojo which moves to commit to, for both players.

## Messages from mojolicious to web page

### Report changes made on board

    {"op":"board","move":"","lost":["f3"],"gained":[]}
    {"op":"board","move":"Ne5","lost":["f3"],"gained":["e5"]}

In response to this the JS app should display some box showing the detected move. If
no detected move is given, it should instead show which squares changed (e.g. write in
red "- f3" and write in green "+ e5"). There can be arbitrarily many squares
changed, because the user can just pick the pieces up and move them around, but unless
there is a legal move, there's nothing to do apart from tell them which squares have
changed. If there *is* a legal move, then the JS app should store it so that if the
user then hits the clock button, the JS app can tell the Mojo app to commit to the
move. Also, if the move is a pawn promotion, the JS app should default to promoting
to Queen, but should have some way for the user to select between Knight/Bishop/Rook/Queen.

If it is not currently the user's turn (i.e. we're waiting on the remote lichess player)
but the board reports the board position changed anyway, then probably just show the same
stuff anyway so that the user has a chance to put the pieces back.

### Report clock button hit

    {"op":"button"}

This means the button next to the screen has been pressed, which means the user wants to
commit to a move. If it is the user's turn, then now is the time to send an "op":"play" message with
the latest reported move. If it is not the user's turn then probably either do nothing or
show "Not your turn". Do nothing is probably fine and easier.

### Error

    {"op":"error","error":"Illegal move: Ne5"}

If the JS app is working correctly I can't think of anything that could trigger an
error message, so probably if it receives one it should pop it up on the screen so
we know what needs debugging.
