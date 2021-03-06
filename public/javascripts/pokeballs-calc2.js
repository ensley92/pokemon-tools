var pokeballApp = (function() {

    var config = {
        '$wildPokeContainer': $( '#js-wildPoke' ),
        '$hpTextContainer': $( '#js-hpRemaining' ),
        '$wildPokeLevelContainer': $( '#js-wildPokeLevel' )
    };

    var $hp;
    var $hp_inner_bar;
    var $originalContents;

    var initialize = function( options ) {
        if( options && typeof( options ) === 'object' ) {
            $.extend( config, options );
        }

        $originalContents = $( '#results-container' ).html();

        $hp = $( '<div/>', {
            class: 'js-dynamic-hp-bar'
        }).append(
            $( '<div/>', {
                class: 'js-dynamic-hp-inner-bar'
            })
        );

        $hp.css( 'display', 'none' );
        $hp.click( click_hp_bar );
        config.$hpTextContainer.after( $hp );
        config.$hpTextContainer.keyup( update_hp_bar );

        $('form').submit( submit_data );

        update_hp_bar();
    };

    var update_hp_bar = function() {
        if( !$hp.length ) return;

        var value = parseInt( config.$hpTextContainer.val() );

        if( !value || value < 0 || value > 100 ) {
            $hp.css( 'display', 'none' );
            return;
        }

        $hp.css( 'display', '' );

        $hp_inner_bar = $hp.find( '.js-dynamic-hp-inner-bar' );
        var bar_width = Math.ceil( value / 100 * 48 );
        $hp_inner_bar.css( 'width', bar_width * 2 );
        $hp_inner_bar.removeClass( 'low_hp medium_hp high_hp' );
        $hp_inner_bar.addClass( getHPBarClass( value ) );
    };

    var click_hp_bar = function( e ) {
        var $this = $( this );
        var offset_x = e.pageX - $this.offset().left - $hp_inner_bar.position().left;
        config.$hpTextContainer.val( Math.max( 1, Math.min( 100, Math.round( offset_x * 100 / 96 ) ) ) );

        update_hp_bar();
    };

    var submit_data = function( e ) {
        e.preventDefault();
        $('#results-container').html( $originalContents );
        $.ajax({
            type: 'POST',
            url: '/pokeballs',
            data: $( this ).serialize()
        }).done( function( data ) {
            write_results( data );
        } );
    };

    var write_results = function( data ) {
        console.log( data );
        var $container = $('#results-container');
        $( '#results-panel' ).css( 'display', '' );
        data.ballProbs.map( function( ball ) {
            var ballElement = $('<tbody/>');
            if( typeof ball.cases === 'undefined' ) {
                ballElement.append($('<tr/>')
                    .append($('<th/>', {
                        class: 'item'
                    })
                        .text( ball.name )
                    )
                    .append($('<td/>', {
                        class: 'chance'
                    })
                        .append($('<div/>', {
                            class: 'js-capture-rate-graph',
                            title: 'Capture: ' + ball.shakes[4].toFixed(1) + '%'
                        })))
                    .append($('<td/>', {
                        class: 'chance'
                    })
                        .text( ball.shakes[4].toFixed(1) + '%' ))
                    .append($('<td/>', {
                        class: 'expected-attempts'
                    })
                        .text( (100 / ball.shakes[4]).toFixed(1) ))
                    .append($('<td/>', {
                        class: 'condition'
                    })
                        .text( ball.notes )));

                for( var j = 0; j < 4; j++ ) {
                    ballElement.find( '.js-capture-rate-graph' ).append(
                        $('<div/>', {
                            class: 'js-capture-rate-graph-bar shake' + j,
                            title: j + ' shakes: ' + ball.shakes[j].toFixed(1) + '%',
                            style: 'width: ' + ball.shakes[j] + '%'
                        } )
                    );
                }
            } else {
                ball.cases.map( function( c, i ) {
                    var $blah = $('<tr/>', {
                        class: c.isActive ? '' : 'inactive'
                    });
                    if( i === 0) {
                        $blah.append($('<th/>', {
                            rowspan: ball.cases.length,
                            class: 'item'
                        })
                            .text( ball.name ));
                    }
                    $blah.append($('<td/>', {
                        class: 'chance'
                    })
                        .append($('<div/>', {
                            class: 'js-capture-rate-graph',
                            title: 'Capture: ' + c.shakes[4].toFixed(1) + '%'
                        })))
                        .append($('<td/>', {
                            class: 'chance'
                        })
                            .text( c.shakes[4].toFixed(1) + '%' ))
                        .append($('<td/>', {
                            class: 'expected-attempts'
                        })
                            .text( (100 / c.shakes[4]).toFixed(1) ))
                        .append($('<td/>', {
                            class: 'condition'
                        })
                            .text( c.notes )
                    );
                    for( var j = 0; j < 4; j++ ) {
                        $blah.find( '.js-capture-rate-graph' ).append(
                            $('<div/>', {
                                class: 'js-capture-rate-graph-bar shake' + j,
                                title: j + ' shakes: ' + c.shakes[j].toFixed(1) + '%',
                                style: 'width: ' + c.shakes[j] + '%'
                            } )
                        );
                    }

                    ballElement.append($blah);
                });
            }

            $container.append( ballElement );
        });
    };

    var getHPBarClass = function( hp ) {
        if( hp < 20 ) {
            return 'low_hp';
        } else if( hp < 50 ) {
            return 'medium_hp';
        } else {
            return 'high_hp';
        }
    };

    return {
        initialize: initialize
    };

})();

$(function() {
    $( '#results-panel' ).css( 'display', 'none' );
    pokeballApp.initialize();
});
