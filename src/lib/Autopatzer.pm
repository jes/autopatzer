package Autopatzer;

use strict;
use warnings;

use Chess::Rep;
use IO::Select;

sub new {
    my ($pkg, %opts) = @_;

    my $self = bless \%opts, $pkg;

    die "Autopatzer->new() missing argument: device\n" if !$self->{device};

    # TODO: set baud rate with stty

    open( $self->{fh}, '+<', $self->{device} )
        or die "can't open $self->{device}: $!\n";

    $self->{game} = Chess::Rep->new;
    $self->{ready} = 0;

    # consume & discard any pending data
    1 while $self->read(0);

    $self->{ready} = 1;
    $self->{occupied} = {};

    # TODO: get this from "scan", don't just assume
    for my $y (1..8) {
        for my $x (1,2,7,8) {
            $self->{occupied}{XY2square($x,$y)} = 1;
        }
    }

    return $self;
}

sub read {
    my ($self, $timeout) = @_;

    my $s = IO::Select->new;
    $s->add($self->{fh});

    print "can_read...\n";
    my @ready = IO::Select->new($self->{fh})->can_read($timeout);
    return 0 unless @ready;

    # TODO: will this block if less than a full line is available?
    print "read...\n";
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
    }

    $self->movePiece(lc $m->{from}, lc $m->{to});
}

# figure out the best route to move a piece from $from to $to without knocking over any others, and move it
# set to to 'xx' to remove the piece from the board in any direction
sub movePiece {
    my ($self, $from, $to) = @_;

    my ($fromx,$fromy) = square2XY($from);
    my ($tox,$toy) = square2XY($to);

    if ($to eq 'xx') {
        ($tox,$toy) = (5, 0);
    }

    my $fh = $self->{fh};
    $self->moveMotors($fromx,$fromy,1);
    $self->grabMagnet();
    $self->moveMotors($tox,$toy,1);
    $self->releaseMagnet();
}

# move the motors to (x, y) and wait until done
sub moveMotors {
    my ($self, $x, $y, $block) = @_;

    my $fh = $self->{fh};
    print $fh "goto $x $y\nwait\n";
    $self->blockUntil("waited") if $block;
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
