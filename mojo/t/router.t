use strict;
use warnings;

#use Devel::NYTProf;

use Test::More;
use Autopatzer::Router;
use Chess::Rep;

plan tests => 37;

my $game = Chess::Rep->new;
my $occupied = getOccupied();
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
is(getRoute('e5' => 'd4'), 'goto 5 5,grab,goto 4 4,release', "2... exd4 (2)");
$game->go_move('exd4');

is(getRoute('d4' => 'xx'), 'goto 4 4,grab,goto 4 0,release', "3. Qxd4 (1)");
is(getRoute('d1' => 'd4'), 'goto 1 4,grab,goto 4 4,release', "3. Qxd4 (2)");
$game->go_move('Qxd4');

is(getRoute('b8' => 'c6'), 'goto 7 2,grab,goto 6.5 1.5,release,goto 8 2,grab,goto 7 2,goto 6 3,release,goto 6.5 1.5,grab,goto 7 2,release', "3... Nc6");
$game->go_move('Nc6');

is(getRoute('d4' => 'e3'), 'goto 4 4,grab,goto 3 5,release', "4. Qe3");
$game->go_move('Qe3');

is(getRoute('g8' => 'f6'), 'goto 7 6,grab,goto 7.5 5.5,release,goto 8 7,grab,goto 7 6,goto 6 6,release,goto 7.5 5.5,grab,goto 7 6,release', "4... Nf6");
$game->go_move('Nf6');

is(getRoute('b1' => 'c3'), 'goto 1 2,grab,goto 0 3,goto 1 4,goto 2 4,goto 3 3,release', "5. Nc3");
$game->go_move('Nc3');

is(getRoute('f8' => 'b4'), 'goto 8 6,grab,goto 4 2,release', "5... Bb4");
$game->go_move('Bb4');

is(getRoute('c1' => 'd2'), 'goto 1 3,grab,goto 2 4,release', "6. Bd2");
$game->go_move('Bd2');

is(getRoute('e8' => 'g8'), 'goto 8 5,grab,goto 8 7,release', "6... O-O (1)");
is(getRoute('h8' => 'f8'), 'goto 8 8,grab,goto 9 7,goto 8 6,release', "6... O-O (2)");
$game->go_move('O-O');

is(getRoute('e1' => 'c1'), 'goto 1 5,grab,goto 1 3,release', "7. O-O-O (1)");
is(getRoute('a1' => 'd1'), 'goto 1 1,grab,goto 1 2,goto 0 3,goto 1 4,release', "7. O-O-O (2)");
$game->go_move('O-O-O');

is(getRoute('f8' => 'e8'), 'goto 8 6,grab,goto 8 5,release', "7... Re8");
$game->go_move('Re8');

is(getRoute('e3' => 'g3'), 'goto 3 5,grab,goto 3 7,release', "8. Qg3");
$game->go_move('Qg3');

is(getRoute('e4' => 'xx'), 'goto 4 5,grab,goto 0 5,release', "8... Rxe4 (1)");
is(getRoute('e8' => 'e4'), 'goto 8 5,grab,goto 4 5,release', "8... Rxe4 (2)");
$game->go_move('Rxe4');

is(getRoute('a2' => 'a3'), 'goto 2 1,grab,goto 3 1,release', "9. a3");
$game->go_move('a3');

is(getRoute('b4' => 'd6'), 'goto 4 2,grab,goto 6 4,release', "9... Bd6");
$game->go_move('Bd6');

is(getRoute('f2' => 'f4'), 'goto 2 6,grab,goto 4 6,release', "10. f4");
$game->go_move('f4');

is(getRoute('e4' => 'e8'), 'goto 4 5,grab,goto 8 5,release', "10... Re8");
$game->go_move('Re8');

is(getRoute('f1' => 'd3'), 'goto 1 6,grab,goto 3 4,release', "11. Bd3");
$game->go_move('Bd3');

is(getRoute('d6' => 'f8'), 'goto 6 4,grab,goto 8 6,release', "11... Bf8");
$game->go_move('Bf8');

is(getRoute('g1' => 'f3'), 'goto 1 7,grab,goto 2 6,goto 3 6,release', "12. Nf3");
$game->go_move('Nf3');

is(getRoute('d7' => 'd5'), 'goto 7 4,grab,goto 5 4,release', "12... d5");
$game->go_move('d5');

is(getRoute('h1' => 'e1'), 'goto 1 8,grab,goto 1 5,release', "13. Rhe1");
$game->go_move('Rhe1');

is(getRoute('e1' => 'xx'), 'goto 1 5,grab,goto 0 5,release', "13... Rxe1 (1)");
is(getRoute('e8' => 'e1'), 'goto 8 5,grab,goto 1 5,release', "13... Rxe1 (2)");
$game->go_move('Rxe1');

is(getRoute('e1' => 'xx'), 'goto 1 5,grab,goto 0 5,release', "14. Rxe1 (1)");
is(getRoute('d1' => 'e1'), 'goto 1 4,grab,goto 1 5,release', "14. Rxe1 (2)");
$game->go_move('Rxe1');

is(getRoute('c6' => 'e7'), 'goto 6 3,grab,goto 7 4,goto 7 5,release', "14... Ne7");
$game->go_move('Ne7');

is(getRoute('g3' => 'h4'), 'goto 3 7,grab,goto 4 8,release', "15. Qh4");
$game->go_move('Qh4');

is(getRoute('e7' => 'f5'), 'goto 7 5,grab,goto 6 5,goto 5 6,release', "15... Nf5");
$game->go_move('Nf5');


done_testing();

sub getOccupied {
    my (%opts) = @_;

    my $occ = {};

    for my $rank (1..8) {
        for my $file ('a'..'h') {
            my $sqr = "$file$rank";
            $occ->{$sqr} = 1 if $game->get_piece_at($sqr);
        }
    }

    return $occ;
}

sub getRoute {
    my ($from, $to, %opts) = @_;

    my $r =  join(',', map { join(' ', @$_) } $router->route(
        motorx => 0, motory => 0,
        from => $from, to=> $to,
        occupied => $occupied,
    ));

    delete $occupied->{$from};
    $occupied->{$to} = 1 if $to ne 'xx';

    return $r;
}
