package Autopatzer;

use strict;
use warnings;

use Chess::Rep;
use IO::Select;
use List::PriorityQueue;
use Time::HiRes qw(usleep);

sub new {
    my ($pkg, %opts) = @_;

    my $self = bless \%opts, $pkg;

    die "Autopatzer->new() missing argument: device\n" if !$self->{device};

    # configure serial port
    # no idea what the hex numbers mean, I got them from "stty -g" after getting the port into a workable state using Arduino serial monitor
    system("stty -F \Q$self->{device}\E 4:0:8bd:a30:3:1c:7f:15:4:0:1:0:11:13:1a:0:12:f:17:16:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0");

    open( $self->{fh}, '+<', $self->{device} )
        or die "can't open $self->{device}: $!\n";

    $self->reset;

    $self->{ready} = 0;
    $self->{buf} = '';
    $self->{occupied} = {};

    # we don't actually know motor positions yet, but it's only going to be used for shortest path computation anyway,
    # so the worst case is we have a single suboptimal path
    $self->{motorx} = 0;
    $self->{motory} = 0;

    # consume & discard any pending data
    1 while $self->read(0);

    $self->{ready} = 1;

    return $self;
}

sub reset {
    my ($self) = @_;

    $self->{game} = Chess::Rep->new;
    $self->{last_lifted} = undef;
}

sub read {
    my ($self, $timeout) = @_;

    my $s = IO::Select->new;
    $s->add($self->{fh});

    my @ready = IO::Select->new($self->{fh})->can_read($timeout);
    return 0 unless @ready;

    my $data;
    sysread($self->{fh}, $data, 1024, 0);
    $self->handle_data($data);

    return 1;
}

sub handle_data {
    my ($self, $data) = @_;

    $self->{buf} .= $data;

    while ($self->{buf} =~ s/^(.*?\n)//m) {
        my $line = $1;
        $line =~ s/[\r\n]//gm;
        print "[[$line]]\n";
        $self->handle_line($line);
    }
}

sub handle_line {
    my ($self, $line) = @_;

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

sub adjust {
    my ($self, $sqr) = @_;

    my $fh = $self->{fh};

    my ($x, $y) = square2XY($sqr);

    print $fh "goto $x $y\nwait\n";
    $self->blockUntil('waited');
    print $fh "grab\n";

    my $wiggle = 0.05;

    for my $dir ([+1,+1], [+1,-1], [-1,-1], [-1,+1]) {
        my ($dx,$dy) = @$dir;
        print $fh "goto " . ($x+$wiggle*$dx) . " " . ($y+$wiggle*$dy) . "\nwait\n";
        $self->blockUntil('waited');
    }
    print $fh "goto $x $y\nwait\n";
    $self->blockUntil('waited');
    print $fh "release\n";

    $self->scan(1);
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

    $self->{ready} = 0;

    # captured a piece: drag it off the board
    if ($m->{san} =~ /x/) {
        my $removepiece = lc $m->{to};

        # if it was an en passant capture, move the correct square
        $removepiece = $self->enPassantSquare($removepiece) if !$self->{game}->get_piece_at($removepiece);

        $self->movePiece($removepiece, 'xx');
        delete $self->{occupied}{$removepiece};
    }

    $self->movePiece(lc $m->{from}, lc $m->{to});
    delete $self->{occupied}{lc $m->{from}};
    $self->{occupied}{lc $m->{to}} = 1;

    # if they castled, now move the rook
    if ($m->{san} =~ /O/) {
        # if the king moved to g1, move the rook from h1 to f1
        my %castle_rookmove = (
            g1 => ['h1','f1'],
            c1 => ['a1','d1'],
            g8 => ['h8','f8'],
            c8 => ['a8','d8'],
        );
        my ($from,$to) = @{ $castle_rookmove{lc $m->{to}} };
        $self->movePiece($from,$to);
        delete $self->{occupied}{$from};
        $self->{occupied}{$to} = 1;
    }

    if ($m->{promote}) {
        # TODO: if it was a pawn promotion, ask for the right piece to be placed on the square
    }

    $self->{ready} = 1;
}

# figure out the best route to move a piece from $from to $to without knocking over any others, and move it
# set $to to 'xx' to remove the piece from the board in any direction
# TODO: refactor this into several functions, and probably move into Autopatzer::Routing or something
sub movePiece {
    my ($self, $from, $to) = @_;

    my ($fromx,$fromy) = square2XY($from);
    my ($tox,$toy) = (-1, -1);
    ($tox,$toy) = square2XY($to) if $to ne 'xx';

    # find the shortest (in time) sequence of commands that gets the board position to an acceptable state
    # (dijkstra's algorithm)
    # possible state transitions:
    #  - [release magnet, move to the piece, grab magnet, ]move the piece in a straight/diagonal line to the centre of an unoccupied square;
    #  - [release magnet, ]move to a different piece, grab piece, move it to one of the 4 corners of its square, release magnet
    #  - [release magnet, ]move to a displaced piece, grab it, move it to the centre of its square, release magnet
    my $q = List::PriorityQueue->new();
    my %visited;

    # function to calculate cost of some movements
    my $commandsCost = sub {
        my ($cmds) = @_;

        my ($x,$y) = ($self->{motorx},$self->{motory});
        my $magnet = 0;

        my $cost = 0;
        for my $c (@$cmds) {
            my ($cmd, $arg1, $arg2) = @$c;
            if ($cmd eq 'goto') {
                $cost += $self->movementCost($x,$y, $arg1,$arg2, $magnet);
                ($x,$y) = ($arg1,$arg2);
            } elsif ($cmd eq 'grab') {
                $magnet = 1;
            } elsif ($cmd eq 'release') {
                $magnet = 0;
            }
        }
        return $cost;
    };

    # functions to hash boards & dijkstra states
    my $strboard = sub {
        my ($b) = @_;
        return join (';', sort keys %$b);
    };
    my $hash = sub {
        my ($s) = @_;
        return join('.', $s->{x}, $s->{y}, $s->{piecex}, $s->{piecey}, $s->{magnet}, $strboard->($s->{board}));
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
        begin_cmds => [], # preparation steps (moving pieces out of the way)
        cmds => [], # steps to carry out to move the piece
        finish_cmds => [], # undoing preparation steps
        board => $occupied_board, # board representation

        # XXX: if adding new fields, make sure to consider them in $hash->() as well!
    }, 0);
    my $cmds;
    while (my $node = $q->pop) {
        $visited{$hash->($node)} = 1;

        my ($px,$py) = ($node->{piecex},$node->{piecey});
        if (($to eq 'xx' && ($px == 0 || $px == 9 || $py == 0 || $py == 9))
                || ($px == $tox && $py == $toy)) {
            print "length = $node->{len}\n";
            print "board = " . $strboard->($node->{board}) . "\n";
            $cmds = [ @{ $node->{begin_cmds} }, @{ $node->{cmds} }, ['release'], @{ $node->{finish_cmds} } ];
            last;
        }

        #  - [release magnet, move to the piece, grab magnet, ]move the piece in a straight/diagonal line to the centre of an unoccupied square;
        my @xdir = (-1, -1, 0, 1, 1, 1, 0, -1);
        my @ydir = (0, -1, -1, -1, 0, 1, 1, 1);
        for my $dir (0..7) {
            my $dx = $xdir[$dir];
            my $dy = $ydir[$dir];

            my ($x,$y) = ($node->{piecex},$node->{piecey});

            while (1) {
                $x += $dx;
                $y += $dy;

                # don't move off the board (note: the (0,9) exception is because the electromagnet will get caught in the wires in that corner!)
                last if $x < 0 || $x > 9 || $y < 0 || $y > 9 || ($x == 0 && $y == 9);

                # don't pass through displaced pieces
                my ($halfx,$halfy) = ($x-$dx/2, $y-$dy/2); # this is the corner that we would have just passed through to get to ($x,$y) - halfway between ($x,$y) and ($x-$dx,$y-$dy)
                last if $node->{board}{"$halfx,$halfy"};

                # don't pass too close to displaced pieces
                if ($dx == 0) {
                    my $xp = $x+0.5;
                    my $xm = $x-0.5;
                    last if $node->{board}{"$xp,$halfy"} || $node->{board}{"$xm,$halfy"};
                } elsif ($dy == 0) {
                    my $yp = $y+0.5;
                    my $ym = $y-0.5;
                    last if $node->{board}{"$halfx,$yp"} || $node->{board}{"$halfx,$ym"};
                }

                # if we'd want to move on to a non-displaced piece, displace it instead so that we can try again next time around
                if ($node->{board}{"$x,$y"}) {
                    for my $displace ([-0.5,-0.5], [-0.5,0.5], [0.5,-0.5], [0.5,0.5]) {
                        my ($dispx,$dispy) = @$displace;
                        my ($newx,$newy) = ($x+$dispx,$y+$dispy);

                        # don't displace off the edge of the board (probably not possible here, but just in case)
                        next if $newx < 0 || $newx > 9 || $newy < 0 || $newy > 9;

                        next if $node->{board}{"$newx,$newy"};

                        my $begin_cmds = [@{ $node->{begin_cmds} }];
                        my $finish_cmds = [@{ $node->{finish_cmds} }];

                        push @$begin_cmds, ['goto',$x,$y], ['grab'], ['goto',$newx,$newy], ['release'];
                        unshift @$finish_cmds, ['goto',$newx,$newy], ['grab'], ['goto',$x,$y], ['release'];

                        my $newboard = { %{ $node->{board} } };
                        delete $newboard->{"$x,$y"};
                        $newboard->{"$newx,$newy"} = 1;

                         my $newnode = {
                            x => $node->{x},
                            y => $node->{y},
                            piecex => $node->{piecex},
                            piecey => $node->{piecey},
                            magnet => $node->{magnet},
                            len => $commandsCost->([@$begin_cmds, @{ $node->{cmds} }, @$finish_cmds]),
                            begin_cmds => $begin_cmds,
                            cmds => $node->{cmds},
                            finish_cmds => $finish_cmds,
                            board => $newboard,
                        };

                        if (!$visited{$hash->($newnode)}) {
                            $q->insert($newnode, $newnode->{len});
                        }
                    }
                    last;
                }

                my $newcmds = [@{ $node->{cmds} }];

                # if we're not already at the piece we want to move:
                #     if the magnet is on, turn it off
                #     move to the correct piece, then turn the magnet on
                # else:
                #     if the magnet is off, turn it on
                if ($node->{x} != $node->{piecex} || $node->{y} != $node->{piecey}) {
                    push @$newcmds, ['release'] if $node->{magnet};
                    push @$newcmds, ['goto',$node->{piecex},$node->{piecey}], ['grab'];
                } else {
                    push @$newcmds, ['grab'] if !$node->{magnet};
                }

                push @$newcmds, ['goto',$x,$y];

                my $newboard = { %{ $node->{board} } };
                $newboard->{"$x,$y"} = 1 if $x > 0 && $x < 9 && $y > 0 && $y < 9;
                delete $newboard->{"$node->{piecex},$node->{piecey}"};

                my $newnode = {
                    x => $x,
                    y => $y,
                    piecex => $x,
                    piecey => $y,
                    magnet => 1,
                    len => $commandsCost->([@{ $node->{begin_cmds} }, @$newcmds, @{ $node->{finish_cmds} }]),
                    begin_cmds => $node->{begin_cmds},
                    cmds => $newcmds,
                    finish_cmds => $node->{finish_cmds},
                    board => $newboard,
                };

                if (!$visited{$hash->($newnode)}) {
                    $q->insert($newnode, $newnode->{len});
                }
            }
        }
    }

    die "no route found???" if !$cmds;

    for my $cmd (@$cmds) {
        my ($cmd, $arg1, $arg2) = @$cmd;
        die "unknown cmd: $cmd" if $cmd !~ /^(goto|grab|release)$/;
        if ($cmd eq 'goto') {
            print "goto $arg1 $arg2\n";
            $self->moveMotors($arg1,$arg2,1);
        } elsif ($cmd eq 'grab') {
            print "grab\n";
            $self->grabMagnet();
        } elsif ($cmd eq 'release') {
            print "release\n";
            $self->releaseMagnet();
        }
    }
    $self->releaseMagnet();
}

# e.g. exf3 is an en-passant capture of the pawn on f4
# so $self->enPassantSquare('f3') == 'f4'
sub enPassantSquare {
    my ($self, $square) = @_;

    my %m = map { ("${_}3" => "${_}4", "${_}6" => "${_}5") } qw(a b c d e f g h);
    return $m{$square}||$square;
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

# NOTE: return value must be integer as it is used in List::PriorityQueue,
# which operates on the value using ">>"
sub movementCost {
    my ($self, $fromx,$fromy, $tox,$toy, $grabbed) = @_;

    my $dx = abs($tox-$fromx);
    my $dy = abs($toy-$fromy);

    # it's actually just as quick to go (4,4) as (4,0), but it
    # looks strange, so we do this to penalise unnecessary diagonal
    # movements; also, we ignore acceleration because considering
    # acceleration results in faster moves which *look* slower; it's
    # better to just move in the shortest-path even if it's not the quickest
    # path
    my $dist = sqrt($dx*$dx+$dy*$dy);

    return int($dist*100)+1;
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
        my $promote = '';
        if ($self->{game}->get_piece_at($from) & 0x1 && $to =~ /^[18]$/) {
            # TODO: ask what piece to promote to
            $promote = 'q';
        }

        return "$from$to$promote";
    } elsif (@lost == 1 && @gained == 0) { # piece captured
        # assume that the last non-moving player's piece that was lifted is the one that was captured
        if ($self->{last_lifted}) {
            my $from = $lost[0];
            return "$from$self->{last_lifted}";
        }
    } elsif (@lost == 2 && @gained == 2) { # castling
        @lost = sort @lost;
        @gained = sort @gained;
        my %castle = (
            "e1,h1,f1,g1" => "e1g1",
            "e8,h8,f8,g8" => "e8g8",
            "a1,e1,c1,d1" => "e1c1",
            "a8,e8,c8,d8" => "e8c8",
        );
        my $s = join(',', @lost, @gained);
        return $castle{$s} if $castle{$s};
    } elsif (@lost == 2 && @gained == 1) { # en passant
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
