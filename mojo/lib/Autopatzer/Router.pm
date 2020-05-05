package Autopatzer::Router;

use strict;
use warnings;

use Autopatzer;
use List::PriorityQueue;

sub new {
    my ($pkg, %opts) = @_;

    my $self = bless \%opts, $pkg;

    return $self;
}

# figure out the best route to move a piece from $from to $to without knocking over any others, and return it
# opts:
#   motorx (e.g. 2), motory (e.g. 5), from (e.g. e2), to (e.g. e5), occupied (e.g. {a1=>1,e2=>1,...})
# Dijkstra's algorithm
sub route {
    my ($self, %opts) = @_;

    my $motorx = $opts{motorx};
    my $motory = $opts{motory};
    my $from = $opts{from};
    my $to = $opts{to};
    my $occupied = $opts{occupied};

    my ($fromx,$fromy) = Autopatzer::square2XY($from);
    my ($tox,$toy) = (-1, -1);
    ($tox,$toy) = Autopatzer::square2XY($to) if $to ne 'xx';

    my $q = List::PriorityQueue->new();
    my %visited;

    # current state:
    my $occupied_board = {};
    for my $sqr (keys %$occupied) {
        $occupied_board->{join(',', Autopatzer::square2XY($sqr))} = 1;
    }

    $q->insert({
        # position of the electromagnet
        x => $motorx,
        y => $motory,

        # position of the piece that we're trying to move
        piecex => $fromx,
        piecey => $fromy,

        magnet => 0, # magnet state
        len => 0, # total path cost so far
        begin_cmds => [], # preparation steps (moving pieces out of the way)
        cmds => [], # steps to carry out to move the piece
        finish_cmds => [], # undoing preparation steps
        board => $occupied_board, # board representation

        # XXX: if adding new fields, make sure to consider them in hashDijkstraState() as well!
    }, 0);
    my $cmds;
    while (my $node = $q->pop) {
        $visited{$self->hashDijkstraState($node)} = 1;

        my ($px,$py) = ($node->{piecex},$node->{piecey});
        if (($to eq 'xx' && ($px == 0 || $px == 9 || $py == 0 || $py == 9))
                || ($px == $tox && $py == $toy)) {
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
                            len => $self->commandsCost($motorx, $motory, [@$begin_cmds, @{ $node->{cmds} }, @$finish_cmds]),
                            begin_cmds => $begin_cmds,
                            cmds => $node->{cmds},
                            finish_cmds => $finish_cmds,
                            board => $newboard,
                        };

                        if (!$visited{$self->hashDijkstraState($newnode)}) {
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
                    len => $self->commandsCost($motorx, $motory, [@{ $node->{begin_cmds} }, @$newcmds, @{ $node->{finish_cmds} }]),
                    begin_cmds => $node->{begin_cmds},
                    cmds => $newcmds,
                    finish_cmds => $node->{finish_cmds},
                    board => $newboard,
                };

                if (!$visited{$self->hashDijkstraState($newnode)}) {
                    $q->insert($newnode, $newnode->{len});
                }
            }
        }
    }

    die "no route found???" if !$cmds;

    return @$cmds;
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
    my $dist = sqrt($dx*$dx+$dy*$dy)*($grabbed ? $self->{grabbedCost} : $self->{releasedCost});

    return int($dist*100)+1;
}

sub commandsCost {
    my ($self, $motorx, $motory, $cmds) = @_;

    my ($x,$y) = ($motorx,$motory);
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
}

sub hashDijkstraState {
    my ($self, $s) = @_;

    my $strboard = join (';', sort keys %{ $s->{board} });
    return join('.', $s->{x}, $s->{y}, $s->{piecex}, $s->{piecey}, $s->{magnet}, $strboard);
}

1;
