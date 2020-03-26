package Autopatzer;

use strict;
use warnings;

use Chess::Rep;
use IO::Select;
use List::PriorityQueue;

sub new {
    my ($pkg, %opts) = @_;

    my $self = bless \%opts, $pkg;

    die "Autopatzer->new() missing argument: device\n" if !$self->{device};

    # configure serial port
    # no idea what the hex numbers mean, I got them from "stty -g" after getting the port into a workable state using Arduino serial monitor
    system("stty -F \Q$self->{device}\E 4:0:8bd:a30:3:1c:7f:15:4:0:1:0:11:13:1a:0:12:f:17:16:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0");

    open( $self->{fh}, '+<', $self->{device} )
        or die "can't open $self->{device}: $!\n";

    $self->{game} = Chess::Rep->new;
    $self->{ready} = 0;
    $self->{buf} = '';
    $self->{occupied} = {};

    # we don't actually know motor positions yet, but it's only going to be used for shortest path computation anyway,
    # so the worst case is we have a single suboptimal path
    $self->{motorx} = 0;
    $self->{motory} = 0;

    # consume & discard any pending data
    1 while $self->read(0);

    die "reset the pieces: " . join(' ', sort keys %{ $self->{occupied} }) . "\n" unless $self->boardIsReset;

    $self->{ready} = 1;

    return $self;
}

sub read {
    my ($self, $timeout) = @_;

    my $s = IO::Select->new;
    $s->add($self->{fh});

    my @ready = IO::Select->new($self->{fh})->can_read($timeout);
    return 0 unless @ready;

    sysread($self->{fh}, $self->{buf}, 1024, length($self->{buf}));

    while ($self->{buf} =~ s/^(.*?\n)//m) {
        my $line = $1;
        $line =~ s/[\r\n]//gm;
        print "[[$line]]\n";

        warn "error from board: $line\n" if $line =~ /error/;

        delete $self->{look_for} if $self->{look_for} && $line =~ /$self->{look_for}/;

        if ($line =~ /^piece(up|down) (..)/) {
            my $up = $1 eq 'up' ? 1 : 0;
            my $sqr = $2;
            print "Piece $up on $sqr\n";
            if ($up) {
                delete $self->{occupied}{$sqr};
            } else {
                $self->{occupied}{$sqr} = 1;
            }

            # remember which piece belonging to the non-moving player was last lifted, so
            # that we have a chance of guessing which square a capture was made on
            my $remember_white = !($self->{game}->to_move);
            my $is_white = !!($self->{game}->get_piece_at($sqr) & 0x80);
            if ($up && ($remember_white == $is_white)) {
                $self->{last_lifted} = $sqr;
            }
        }

        if ($line =~ /^occupied: (.*)$/) {
            my @squares = split / /, $1;
            $self->{occupied} = +{ map { $_ => 1 } @squares };
        }

        $self->{cb}->($self) if $self->{cb} && $self->{ready};
    }

    return 1;
}

sub blockUntil {
    my ($self, $keyword) = @_;

    $self->{ready} = 0;
    $self->{look_for} = $keyword;
    $self->read while $self->{look_for};
    $self->{ready} = 1;
    $self->{cb}->($self) if $self->{cb};
}

sub scan {
    my ($self, $block) = @_;
    my $fh = $self->{fh};

    print $fh "scan\n";

    $self->blockUntil("occupied") if $block;
}

sub boardIsReset {
    my ($self) = @_;

    $self->scan(1);

    my $sqrs = join(' ', sort keys %{ $self->{occupied} });
    return $sqrs eq 'a1 a2 a7 a8 b1 b2 b7 b8 c1 c2 c7 c8 d1 d2 d7 d8 e1 e2 e7 e8 f1 f2 f7 f8 g1 g2 g7 g8 h1 h2 h7 h8';
}

sub moveWithoutMotors {
    my ($self, $move) = @_;

    $self->{game}->go_move($move);
    $self->{last_lifted} = undef;
}

sub moveWithMotors {
    my ($self, $move) = @_;

    my $m = $self->{game}->go_move($move);
    $self->{last_lifted} = undef;

    my $fromx = $m->{from_row}+1;
    my $fromy = $m->{from_col}+1;
    my $tox = $m->{to_row}+1;
    my $toy = $m->{to_col}+1;

    # captured a piece: drag it off the board
    if ($m->{san} =~ /x/) {
        # TODO: if it was an en passant capture, move the correct square
        $self->movePiece(lc $m->{to}, 'xx');
        delete $self->{occupied}{lc $m->{to}};
    }

    $self->movePiece(lc $m->{from}, lc $m->{to});

    # TODO: if they castled, now move the rook

    # TODO: if it was a pawn promotion, ask for the right piece to be placed on the square
}

# figure out the best route to move a piece from $from to $to without knocking over any others, and move it
# set $to to 'xx' to remove the piece from the board in any direction
sub movePiece {
    my ($self, $from, $to) = @_;

    my ($fromx,$fromy) = square2XY($from);
    my ($tox,$toy) = (-1, -1);
    ($tox,$toy) = square2XY($to) if $to ne 'xx';

    my @xdir = (-1, -1, 0, 1, 1, 1, 0, -1);
    my @ydir = (0, -1, -1, -1, 0, 1, 1, 1);

    # find the shortest (in time) sequence of commands that gets the board position to an acceptable state
    # (dijkstra's algorithm)
    # possible state transitions:
    #  - [release magnet, move to the piece, grab magnet, ]move the piece in a straight/diagonal line to the centre of an unoccupied square;
    #  - [release magnet, ]move to a different piece, grab piece, move it to one of the 4 corners of its square, release magnet
    #  - [release magnet, ]move to a displaced piece, grab it, move it to the centre of its square, release magnet
    my $q = List::PriorityQueue->new();
    my %visited;

    # functions to hash boards & dijkstra states
    my $strboard = sub {
        my ($b) = @_;
        return join (';', sort keys %$b);
    };
    my $hash = sub {
        my ($s) = @_;
        my $strcmds = join(':', map { join(',', @$_) } @{ $s->{cmds} });
        return join('.', $s->{x}, $s->{y}, $s->{piecex}, $s->{piecey}, $s->{magnet}, $s->{len}, $strcmds, $strboard->($s->{board}));
    };

    # current state:
    my $occupied_board = {};
    for my $sqr (keys %{ $self->{occupied} }) {
        $occupied_board->{join(',', square2XY($sqr))} = 1;
    }
    # target state:
    my $wanted_board = { %$occupied_board };
    delete $wanted_board->{"$fromx,$fromy"};
    $wanted_board->{"$tox,$toy"} = 1 if $to ne 'xx';
    my $wanted_strboard = $strboard->($wanted_board);

    print "want: $wanted_strboard\n";

    $q->insert({
        # position of the electromagnet
        x => $self->{motorx},
        y => $self->{motory},

        # position of the piece that we're trying to move
        piecex => $fromx,
        piecey => $fromy,

        magnet => 0, # magnet state
        len => 0, # total path cost so far
        cmds => [], # steps to carry out at the end
        board => $occupied_board, # board representation

        # XXX: if adding new fields, make sure to consider them in $hash->() as well!
    }, 0);
    my $cmds;
    while (my $node = $q->pop) {
        $visited{$hash->($node)} = 1;

        # we've found the solution if the board matches what we want and there are no pieces displaced to the corner of their square
        if ($strboard->($node->{board}) eq $wanted_strboard) {
            $cmds = $node->{cmds};
            last;
        }

        #  - [release magnet, move to the piece, grab magnet, ]move the piece in a straight/diagonal line to the centre of an unoccupied square;
        for my $dir (0..7) {
            my $dx = $xdir[$dir];
            my $dy = $ydir[$dir];

            my ($x,$y) = ($node->{piecex},$node->{piecey});

            while (1) {
                $x += $dx;
                $y += $dy;

                # don't move off the board (note: the (0,9) exception is because the electromagnet will get caught in the wires in that corner!)
                last if $x < 0 || $x > 9 || $y < 0 || $y > 9 || ($x == 0 && $y == 9);

                my $newcmds = [@{ $node->{cmds} }];
                my $newlen = $node->{len};

                # if we're not already at the piece we want to move:
                #     if the magnet is on, turn it off
                #     move to the correct piece, then turn the magnet on
                # else:
                #     if the magnet is off, turn it on
                if ($node->{x} != $node->{piecex} || $node->{y} != $node->{piecey}) {
                    push @$newcmds, ['release'] if $node->{magnet};
                    push @$newcmds, ['goto',$node->{piecex},$node->{piecey}], ['grab'];
                    $newlen += $self->movementCost($node->{x}, $node->{y}, $node->{piecex}, $node->{piecey}); # TODO: movement is faster while not grabbed
                } else {
                    push @$newcmds, ['grab'] if !$node->{magnet};
                }

                push @$newcmds, ['goto',$x,$y];
                $newlen += $self->movementCost($node->{piecex},$node->{piecey},$x,$y);

                # don't pass through other pieces
                my ($halfx,$halfy) = ($x-$dx/2, $y-$dy/2); # this is the corner that we would have just passed through to get to ($x,$y) - halfway between ($x,$y) and ($x-$dx,$y-$dy)
                last if $node->{board}{"$x,$y"} || $node->{board}{"$halfx,$halfy"};

                my $newboard = { %{ $node->{board} } };
                $newboard->{"$x,$y"} = 1 if $x > 0 && $x < 9 && $y > 0 && $y < 9;
                delete $newboard->{"$node->{piecex},$node->{piecey}"};

                my $newnode = {
                    x => $x,
                    y => $y,
                    piecex => $x,
                    piecey => $y,
                    magnet => 1,
                    len => $newlen,
                    cmds => $newcmds,
                    board => $newboard,
                };

                if (!$visited{$hash->($newnode)}) {
                    $q->insert($newnode, $newlen);
                }
            }
        }

        #  - [release magnet, ]move to a different piece, grab piece, move it to one of the 4 corners of its square, release magnet
        # TODO: for each piece that is on a whole-numbered coordinate
        # try moving it to each of its corners, unless corner is already occupied

        #  - [release magnet, ]move to a displaced piece, grab it, move it to the centre of its square, release magnet
        # TODO: for each piece that is on a fractional coordinate
        # try moving it back to where it came from
    }

    die "no route found???" if !$cmds;

    for my $cmd (@$cmds) {
        my ($cmd, $arg1, $arg2) = @$cmd;
        die "unknown cmd: $cmd" if $cmd !~ /^(goto|grab|release)$/;
        if ($cmd eq 'goto') {
            $self->moveMotors($arg1,$arg2,1);
        } elsif ($cmd eq 'grab') {
            $self->grabMagnet();
        } elsif ($cmd eq 'release') {
            $self->releaseMagnet();
        }
    }
    $self->releaseMagnet();
}

# return a hash mapping (x,y) to 1 if there's a piece on that square
# TODO: this isn't actually what a mailbox is
sub mailboxBoard {
    my ($self) = @_;

    my $m = {};

    for my $y (1..8) {
        for my $x (1..8) {
            my ($piece, $index) = $self->{game}->get_piece_at(XY2square($x,$y));
            $m->{"$x,$y"} = 1 if $piece;
        }
    }

    return $m;
}

sub movementCost {
    my ($self, $fromx,$fromy, $tox,$toy) = @_;

    my $dx = abs($tox-$fromx);
    my $dy = abs($toy-$fromy);

    # it doesn't actually take any longer to travel diagonally than in a straight line,
    # it just makes for weird-looking routes
    my $len = sqrt($dx*$dx + $dy*$dy);

    # TODO: take into account acceleration (currently just +1 per step to minimise number of steps)
    # XXX: must be integer
    return int(100*$len) + 1;
}

# move the motors to (x, y) and wait until done
sub moveMotors {
    my ($self, $x, $y, $block) = @_;

    my $fh = $self->{fh};
    print $fh "goto $x $y\nwait\n";
    $self->blockUntil("waited") if $block;
    $self->{motorx} = $x;
    $self->{motory} = $y;
}

sub grabMagnet {
    my ($self) = @_;

    my $fh = $self->{fh};
    print $fh "grab\n";
}

sub releaseMagnet {
    my ($self) = @_;

    my $fh = $self->{fh};
    print $fh "release\n";
}

sub moveShown {
    my ($self) = @_;

    my @lost;
    my @gained;

    for my $y (1..8) {
        for my $x (1..8) {
            my $sqr = XY2square($x,$y);
            my ($piece, $from_index) = $self->{game}->get_piece_at($sqr);
            if ($piece && !$self->{occupied}{$sqr}) {
                push @lost, $sqr;
            } elsif (!$piece && $self->{occupied}{$sqr}) {
                push @gained, $sqr;
            }
        }
    }

    my $nlost = @lost;
    my $ngained = @gained;

    print "lost: " . join(' ', @lost) . "\n";
    print "gained: " . join(' ', @gained) . "\n";

    # 1 lost and 1 gained: normal move or pawn promotion
    # 1 lost and 0 gained: piece captured
    # 2 lost and 2 gained: castling
    # 2 lost and 1 gained: en passant capture
    # other: illegal
    if (@lost == 1 && @gained == 1) { # normal move
        my $from = $lost[0];
        my $to = $gained[0];
        return "$from$to";
    } elsif (@lost == 1 && @gained == 0) { # piece captured
        # assume that the last non-moving player's piece that was lifted is the one that was captured
        if ($self->{last_lifted}) {
            my $from = $lost[0];
            return "$from$self->{last_lifted}";
        }
    }

    return undef;
}

sub XY2square {
    my ($x, $y) = @_;

    my @file = qw(z a b c d e f g h i);
    my @rank = qw(0 1 2 3 4 5 6 7 8 9);

    return $file[$y] . $rank[$x];
}

sub square2XY {
    my ($sqr) = @_;
    my @c = split //, $sqr;
    my $x = int($c[1]);
    my $y = int(ord($c[0])-ord('a'))+1;
    return ($x,$y);
}

1;
