package Autopatzer;

use strict;
use warnings;

use Autopatzer::Router;
use Autopatzer::Input;
use Chess::Rep;
use IO::Select;
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

    $self->{router} = Autopatzer::Router->new(
        grabbedCost => 1.5,
        releasedCost => 1,
    );

    # we don't actually know motor positions yet, but it's only going to be used for shortest path computation anyway,
    # so the worst case is we have a single suboptimal path
    $self->{motorx} = 0;
    $self->{motory} = 0;

    # consume & discard any pending data
    1 while $self->read(0);

    $self->scan(1);

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

sub write {
    my ($self, $line) = @_;

    print " >>>> $line\n";
    my $fh = $self->{fh};
    print $fh "$line\n";
}

sub handle_data {
    my ($self, $data) = @_;

    $self->{buf} .= $data;

    while ($self->{buf} =~ s/^(.*?\n)//m) {
        my $line = $1;
        $line =~ s/[\r\n]//gm;
        print " <<<< $line\n";
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

sub blockUntil {
    my ($self, $keyword) = @_;

    $self->{ready} = 0;
    $self->{look_for} = $keyword;
    $self->read while $self->{look_for};
    $self->{ready} = 1;
    $self->{cb}->($self) if $self->{cb} && $self->{ready};
}

sub scan {
    my ($self, $block) = @_;
    my $fh = $self->{fh};

    $self->write("scan");

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
sub movePiece {
    my ($self, $from, $to) = @_;

    return if $to ne 'xx' && $self->{occupied}{$to};
    return if !$self->{occupied}{$from};

    my @cmds = $self->{router}->route(
        motorx => $self->{motorx},
        motory => $self->{motory},
        from => $from,
        to => $to,
        occupied => $self->{occupied},
    );

    for my $cmd (@cmds) {
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

# move the Y motor back and forth to make a noise
sub wiggle {
    my ($self) = @_;

    my $pos1 = $self->{motory};
    my $pos2 = $pos1 < 4 ? $pos1+0.25 : $pos1-0.25;

    for (1..2) {
        $self->moveMotors($self->{motory}, $pos2, 1);
        $self->moveMotors($self->{motory}, $pos1, 1);
    }
}

# e.g. exf3 is an en-passant capture of the pawn on f4
# so $self->enPassantSquare('f3') == 'f4'
sub enPassantSquare {
    my ($self, $square) = @_;

    my %m = map { ("${_}3" => "${_}4", "${_}6" => "${_}5") } qw(a b c d e f g h);
    return $m{$square}||$square;
}

# move the motors to (x, y) and wait until done
sub moveMotors {
    my ($self, $x, $y, $block) = @_;

    my $fh = $self->{fh};
    $self->write("goto $x $y");
    $self->write("wait");
    $self->blockUntil("waited") if $block;
    $self->{motorx} = $x;
    $self->{motory} = $y;
}

sub grabMagnet {
    my ($self) = @_;

    $self->write("grab");
}

sub releaseMagnet {
    my ($self) = @_;

    $self->write("release");
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

    return Autopatzer::Input->detect($self->{game}, \@lost, \@gained, $self->{last_lifted});
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
