use strict;
use warnings;

#use Devel::NYTProf;

use Test::More;
use Autopatzer;
use Autopatzer::Router;
use Chess::Rep;

plan tests => 8;

my $game = Chess::Rep->new;
my $router = Autopatzer::Router->new(
    grabbedCost => 1.5,
    releasedCost => 1.0,
);

is(getRoute('e2' => 'e4'), 'goto 2 5,grab,goto 4 5,release', "1. e4");
$game->go_move('e4');

is(getRoute('e7' => 'e5'), 'goto 7 5,grab,goto 5 5,release', "1... e5");
$game->go_move('e5');

is(getRoute('d2' => 'd4'), 'goto 2 4,grab,goto 4 4,release', "2. d4");
$game->go_move('d4');

is(getRoute('d4' => 'xx'), 'goto 4 4,grab,goto 4 0,release', "2... exd4 (1)");
is(getRoute('e5' => 'd4', hide => ['d4']), 'goto 5 5,grab,goto 4 4,release', "2... exd4 (2)");
$game->go_move('exd4');

is(getRoute('d4' => 'xx'), 'goto 4 4,grab,goto 4 0,release', "3. Qxd4 (1)");
is(getRoute('d1' => 'd4', hide => ['d4']), 'goto 1 4,grab,goto 4 4,release', "3. Qxd4 (2)");
$game->go_move('Qxd4');

is(getRoute('b8' => 'c6'), 'goto 7 2,grab,goto 6.5 1.5,release,goto 8 2,grab,goto 7 2,goto 6 3,release,goto 6.5 1.5,grab,goto 7 2,release', "3... Nc6");
$game->go_move('Nc6');

done_testing();

sub getOccupied {
    my (%opts) = @_;

    my %hide = map { $_ => 1 } @{ $opts{hide}||[] };

    my $occ = {};

    for my $rank (1..8) {
        for my $file ('a'..'h') {
            my $sqr = "$file$rank";
            $occ->{$sqr} = 1 if $game->get_piece_at($sqr) and !$hide{$sqr};
        }
    }

    return $occ;
}

sub getRoute {
    my ($from, $to, %opts) = @_;
    return join(',', map { join(' ', @$_) } $router->route(
        motorx => 0, motory => 0,
        from => $from, to=> $to,
        occupied => getOccupied(%opts),
    ));
}
