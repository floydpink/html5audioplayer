/* Author:

 */
var musicPlayer = (function ($) {
    return {
        mockedModel:{
            albums:[
                {
                    albumId:1001,
                    albumTitle:"Symphonies",
                    tracks:[
                        {
                            trackId:101,
                            trackTitle:"Symphony 05",
                            artist:"Beethoven",
                            trackLocation:"music/Beethoven_Symphony_5.ogg"
                        },
                        {
                            trackId:102,
                            trackTitle:"Symphony 07",
                            artist:"Beethoven",
                            trackLocation:"music/Beethoven_Symphony_7.ogg"
                        },
                        {
                            trackId:103,
                            trackTitle:"Symphony 40",
                            artist:"Mozart",
                            trackLocation:"music/Mozart_Symphony_40.ogg"
                        }
                    ]
                },
                {
                    albumId:1002,
                    albumTitle:"Concertos",
                    tracks:[
                        {
                            trackId:201,
                            trackTitle:"Concerto 01",
                            artist:"Bach",
                            trackLocation:"music/Bach_Concerto_1.ogg"
                        },
                        {
                            trackId:202,
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



