/* Author:

 */
var musicPlayer = (function ($) {
    return {
        library:{
            albums:[
                {
                    albumId:101,
                    albumTitle:"Symphonies",
                    tracks:[
                        {
                            trackId:10101,
                            trackTitle:"Symphony 05",
                            artist:"Beethoven",
                            trackLocation:"music/Beethoven_Symphony_5.ogg"
                        },
                        {
                            trackId:10102,
                            trackTitle:"Symphony 07",
                            artist:"Beethoven",
                            trackLocation:"music/Beethoven_Symphony_7.ogg"
                        },
                        {
                            trackId:10103,
                            trackTitle:"Symphony 40",
                            artist:"Mozart",
                            trackLocation:"music/Mozart_Symphony_40.ogg"
                        }
                    ]
                },
                {
                    albumId:102,
                    albumTitle:"Concertos",
                    tracks:[
                        {
                            trackId:10201,
                            trackTitle:"Concerto 01",
                            artist:"Bach",
                            trackLocation:"music/Bach_Concerto_1.ogg"
                        },
                        {
                            trackId:10202,
                            trackTitle:"Concerto 04",
                            artist:"Brandenburg",
                            trackLocation:"music/Brandenburg_Concerto_4.ogg"
                        }
                    ]
                }
            ]
        }
    };
}(jQuery));

$(function(){
    //don't do the seeker, if ogg is not supported
    if (Modernizr.audio.ogg) {
        $('#seeker').slider();
    }
});



