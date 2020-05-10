use strict;
use warnings;

use Test::More;
use Autopatzer::Input;
use Chess::Rep;
use Storable qw(dclone);
use Try::Tiny;

plan tests => 22;

my $game = Chess::Rep->new;

my $i = 1;

# ordinary move
is(detect(['e2'], ['e4']), 'e4', "1. e4");
$game->go_move('e4');

# ordinary move with illegal interjection
is(detect(['e7'],[]), undef, "1... picked up e7");
is(detect(['e7'],['f6']), undef, "1... dropped on f6");
is(detect(['e7'],['e5']), 'e5', "1... e5");
$game->go_move('e5');

$game->go_move('d4');

# capture: pick up capturing piece first
is(detect(['e5'], []), undef, "2... picked up e5");
is(detect(['e5','d4'], []), undef, "2... picked up d4");
is(detect(['e5'],[],'d4'), 'exd4', "2... exd4");
$game->go_move('exd4');

# capture: pick up captured piece first
is(detect(['d4'], []), undef, "3. picked up d4");
is(detect(['d1','d4'],[],'d4'), undef, "3. picked up d1");
is(detect(['d1'],[],'d4'), 'Qxd4', "3. Qxd4");
$game->go_move('Qxd4');

$game->go_move('Nc6');
$game->go_move('Nf3');
$game->go_move('d6');
$game->go_move('Bb5');
$game->go_move('Bd7');

# castling
is(detect(['e1'],[]), undef, "6. picked up e1");
is(detect(['e1'],['g1']), undef, "6. put down e1");
is(detect(['e1','h1'],['g1']), undef, "6. picked up h1");
is(detect(['e1','h1'],['g1','f1']), 'O-O', "6. O-O");
$game->go_move('O-O');

$game->go_move('Nb4');
$game->go_move('e5');
$game->go_move('Bxb5');
$game->go_move('exd6');
$game->go_move('Nxc2');
$game->go_move('dxc7');
$game->go_move('Bc4');

# capture & pawn promotion
is(detect(['c7'],[]), undef, "10. picked up c7");
is(detect(['c7','d8'],[]), undef, "10. picked up d8");
is(detect(['c7'],[],'d8'), "cxd8=Q+", "10. cxd8=Q+");
$game->go_move('cxd8=Q+');

$game->go_move('Rxd8');
$game->go_move('b4');
$game->go_move('Nxd4');
$game->go_move('b5');
$game->go_move('a5');

# en passant capture
is(detect(['b5'],[]), undef, "13. picked up b5");
is(detect(['b5','a5'],[]), undef, "13. picked up b5");
is(detect(['b5','a5'],['a6']), "bxa6", "13. bxa6");
$game->go_move('bxa6');

# self-capture
is(detect(['d8'],[],'d4'), undef, "can't self-capture");
# wrong turn
is(detect(['a6'],['a7']), undef, "can't move wrong player's pieces");

done_testing();

sub detect {
    my ($lost, $gained, $lifted) = @_;

    my $maybemove = Autopatzer::Input->detect($game, $lost, $gained, $lifted);

    my $move = undef;
    try {
        $move = dclone($game)->go_move($maybemove)->{san} if $maybemove;
    } catch {
        warn "$_" unless $_ =~ /Illegal move/;
    };

    return $move;
}
