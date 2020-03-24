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

    print "{{{ $self->{buf} }}}\n";

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
}

sub moveWithMotors {
    my ($self, $move, $block) = @_;

    my $m = $self->{game}->go_move($move);

    my $fromx = $m->{from_row}+1;
    my $fromy = $m->{from_col}+1;
    my $tox = $m->{to_row}+1;
    my $toy = $m->{to_col}+1;

    my $fh = $self->{fh};
    print $fh "goto $fromx $fromy\nwait\n";
    $self->blockUntil("waited") if $block;
    print $fh "grab\ngoto $tox $toy\nwait\nrelease\n";
    $self->blockUntil("waited") if $block;
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
    print "$nlost lost and $ngained gained\n";

    print "lost: " . join(' ', @lost) . "\n";
    print "gained: " . join(' ', @gained) . "\n";

    if (@lost == 1 && @gained == 1) {
        my $from = $lost[0];
        my $to = $gained[0];
        return "$from$to";
    } else {
        # 1 lost and 0 gained: piece captured
        # 2 lost and 2 gained: castling
        # 2 lost and 1 gained: en passant capture
        # other: illegal
        return undef;
    }
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
