package Autopatzer::Button;

use strict;
use warnings;

use Mojo::IOLoop;
use RPi::Pin;
use RPi::Const qw(:all);
use Time::HiRes qw(time);

my $DEBOUNCE_TIME = 0.01; # secs

sub new {
    my ($pkg, %opts) = @_;

    my $self = bless \%opts, $pkg;

    {
        no strict 'refs';
        *{"Autopatzer::Button::pin$self->{pin}_interrupt"} = sub {
            $self->interrupt;
        };
    }

    $self->{rpi_pin} = RPi::Pin->new($self->{pin});
    $self->{rpi_pin}->set_interrupt(EDGE_BOTH, "Autopatzer::Button::pin$self->{pin}_interrupt");

    $self->{last_state} = $self->{rpi_pin}->read;
    $self->{ready_for_press} = 1 if $self->{last_state};
    $self->{last_press} = 0;

    return $self;
}

sub interrupt {
    my ($self) = @_;

    my $now = Time::HiRes::time();

    if ($self->{ready_for_press}) {
        $self->{ready_for_press} = 0;
        $self->{cb}->($self);
    }

    $self->{last_press} = $now;

    # after half $DEBOUNCE_TIME without interrupt firing, read pin state and update $self->{last_state}
    Mojo::IOLoop->remove($self->{timer_id}) if $self->{timer_id};
    $self->{timer_id} = Mojo::IOLoop->timer($DEBOUNCE_TIME => sub {
        my $timer_fired = Time::HiRes::time();
        my $elapsed = $timer_fired - $self->{timer_scheduled};
        print "Timer took $elapsed secs to fire\n";
        $self->{last_state} = $self->{rpi_pin}->read;
        $self->{ready_for_press} = 1 if $self->{last_state};
        delete $self->{timer_id};
    });
    $self->{timer_scheduled} = $now;
}

1;
