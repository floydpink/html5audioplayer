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
                            trackLocation:"music/Beethoven_Symphony_5"
                        },
                        {
                            trackId:10102,
                            trackTitle:"Symphony 07",
                            artist:"Beethoven",
                            trackLocation:"music/Beethoven_Symphony_7"
                        },
                        {
                            trackId:10103,
                            trackTitle:"Symphony 40",
                            artist:"Mozart",
                            trackLocation:"music/Mozart_Symphony_40"
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
                            trackLocation:"music/Bach_Concerto_1"
                        },
                        {
                            trackId:10202,
                            trackTitle:"Concerto 04",
                            artist:"Brandenburg",
                            trackLocation:"music/Brandenburg_Concerto_4"
                        }
                    ]
                }
            ]
        },
        setupPlayerControls:function () {
            //set buttons as player controls
            $("#previous").button({
                text:false,
                icons:{
                    primary:"ui-icon-seek-start"
                }
            });
            $("#play").button({
                text:false,
                icons:{
                    primary:"ui-icon-play"
                }
            }).click(function () {
                    var options;
                    if ($(this).text() === "Play") {
                        options = {
                            label:"Pause",
                            icons:{
                                primary:"ui-icon-pause"
                            }
                        };
                    } else {
                        options = {
                            label:"Play",
                            icons:{
                                primary:"ui-icon-play"
                            }
                        };
                    }
                    $(this).button("option", options);
                });
            $("#stop").button({
                text:false,
                icons:{
                    primary:"ui-icon-stop"
                }
            }).click(function () {
                    $("#play").button("option", {
                        label:"play",
                        icons:{
                            primary:"ui-icon-play"
                        }
                    });
                });
            $("#next").button({
                text:false,
                icons:{
                    primary:"ui-icon-seek-end"
                }
            });
            $("#shuffle").button({
                text:false,
                icons:{
                    primary:"ui-icon-shuffle"
                }
            }).click(function () {
                    var options;
                    if ($('#shufflelabel').text() === "Turn Shuffle On") {
                        options = {
                            label:"Turn Shuffle Off"
                        };
                    } else {
                        options = {
                            label:"Turn Shuffle On"
                        };
                    }
                    $(this).button("option", options);
                });
            $("#repeat").button({
                text:false,
                icons:{
                    primary:"ui-icon-refresh"
                }
            }).click(function () {
                    debugger;
                    var options;
                    if ($('#repeatlabel').text() === "Turn Repeat On") {
                        options = {
                            label:"Turn Repeat Off"
                        };
                    } else {
                        options = {
                            label:"Turn Repeat On"
                        };
                    }
                    $(this).button("option", options);
                });
        },
        wireUpPageEvents:function(){
            $('#clearPlaylistButton').click(musicPlayer.clearPlaylist);
            $('.clearPlaylistButton').live(musicPlayer.addAlbumToPlaylist);
        },
        compilejQueryTemplates:function () {
            //compile jQuery templates
            $("#audioTemplate").template("audioTemplate");
            $("#albumTemplate").template("albumTemplate");
            $("#albumListingTemplate").template("albumListingTemplate");
            $("#playlistitemtemplate").template("playlistitemtemplate");
        },
        clearPlaylist:function(){
            $('#playlist').find('ul.playlistItem').remove();
        },
        flattenTracksList:function(albumId){
            var originalAlbum,
                flattenedTracksList = [],
                library = musicPlayer.library;
            $.each(library.albums, function(index,album){
                if (album.albumId === albumId) {
                    originalAlbum = album;
                    return;
                }
            });
            if (originalAlbum) {
                $.each(originalAlbum.tracks,function(index,track){
                   flattenedTracksList.push({
                       albumId:originalAlbum.albumId,
                       albumTitle:originalAlbum.albumTitle,
                       trackId:track.trackId,
                       trackTitle:track.trackTitle,
                       artist:track.artist,
                       trackLocation:track.trackLocation
                   });
                });
            }
            return flattenedTracksList;
        },
        addAlbumToPlaylist:function(){
            var albumId = $(this).prev('h4').data('albumId'),
                flattenedTracksList = musicPlayer.flattenTracksList(albumId);
            for (var track in flattenedTracksList){
                $('#playlist').append($.tmpl("playlistitemtemplate", track));
            }
        },
        initializePage:function(){
            //don't show the seeker, if ogg/mp3 is not supported
            if (Modernizr.audio.ogg || Modernizr.audio.mp3) {
                $('#seeker').slider();
            }

            musicPlayer.setupPlayerControls();

            musicPlayer.compilejQueryTemplates();

            //get library (from mock) and render it
            var library = musicPlayer.library;
            $.each(library.albums, function (index, album) {
                $('#albums').append($.tmpl("albumTemplate", album));
            });

            musicPlayer.wireUpPageEvents();
        }
    };
}(jQuery));

$(function () {
    musicPlayer.initializePage();
});



