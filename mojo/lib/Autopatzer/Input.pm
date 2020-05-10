package Autopatzer::Input;

use strict;
use warnings;

sub detect {
    my ($pkg, $game, $lostref, $gainedref, $lastlifted) = @_;

    my @lost = @$lostref;
    my @gained = @$gainedref;

    # 1 lost and 1 gained: normal move or pawn promotion
    # 1 lost and 0 gained: piece captured
    # 2 lost and 2 gained: castling
    # 2 lost and 1 gained: en passant capture
    # other: illegal
    if (@lost == 1 && @gained == 1) { # normal move
        my $from = $lost[0];
        my $to = $gained[0];
        my $promote = '';
        if ($game->get_piece_at($from) & 0x1 && $to =~ /[18]/) {
            $promote = 'q';
        }

        # don't say the king has castled if he's moved 2 squares without moving the rook
        my %is_castle = map { $_ => 1 } qw(e1g1 e8g1 e1c1 e8c8);
        return undef if $game->get_piece_at($from) & 0x4 && $is_castle{"$from$to"};

        return "$from$to$promote";
    } elsif (@lost == 1 && @gained == 0) { # piece captured
        # assume that the last non-moving player's piece that was lifted is the one that was captured
        if ($lastlifted) {
            my $from = $lost[0];

            my $promote = '';
            if ($game->get_piece_at($from) & 0x1 && $lastlifted =~ /[18]/) {
                $promote = 'q';
            }

            return "$from$lastlifted$promote";
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
        my $to = $gained[0];
        my $from1 = $lost[0];
        my $from2 = $lost[1];
        if ($game->get_piece_at($from1) & 0x1 && $game->get_piece_at($from2) & 0x1 && $to =~ /[36]/) {
            my $file = substr($to,0,1);
            my $realfrom = grep { $_ !~ /$file/ } @lost;
            return "$realfrom$to" if $realfrom;
        }
    }

    return undef;
}

1;
