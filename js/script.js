/* Author:

 */
var mockData = {
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
    }
};

var musicPlayer = (function ($) {
    return {
        getLibrary:function () {
            return mockData.library;
        },
        literals:{
            albumExists:'Album is already in the playlist.',
            albumExistsTitle:'We have it!',
            confirmClearPlaylist:'Music would stop and playlist would clear. Continue?',
            confirmClearPlaylistTitle:'Well...?'
        },
        showMessage:function (message, title) {
            jAlert(message, title);
        },
        askQuestion:function (message, title, returnAction) {
            jConfirm(message, title, returnAction);
        },
        previousButton:$("#previous"),
        playButton:$("#play"),
        stopButton:$("#stop"),
        nextButton:$("#next"),
        shuffleButton:$("#shuffle"),
        repeatButton:$("#repeat"),
        nowPlayingClass:'nowPlaying',
        getAudioComponent:function () {
            if ($('#audio').find('audio').length > 0) {
                return $('#audio').find('audio').get(0);
            }
            return null;
        },
        setupPlayerButtons:function () {
            musicPlayer.previousButton.button({
                text:false,
                icons:{
                    primary:"ui-icon-seek-start"
                }
            });
            musicPlayer.playButton.button({
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
            musicPlayer.stopButton.button({
                text:false,
                icons:{
                    primary:"ui-icon-stop"
                }
            }).click(function () {
                    musicPlayer.playButton.button("option", {
                        label:"Play",
                        icons:{
                            primary:"ui-icon-play"
                        }
                    });
                    musicPlayer.removeAudio();
                    musicPlayer.setSongScroller('No track playing.');
                    $('.playlistItem').removeClass(musicPlayer.nowPlayingClass);
                });
            musicPlayer.nextButton.button({
                text:false,
                icons:{
                    primary:"ui-icon-seek-end"
                }
            });
            musicPlayer.shuffleButton.button({
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
            musicPlayer.repeatButton.button({
                text:false,
                icons:{
                    primary:"ui-icon-refresh"
                }
            }).click(function () {
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
            $('#audio,.myMarquee,#controls,#playlist').show('slow');
        },
        wireUpPageEvents:function () {
            $('#clearPlaylistButton').click(musicPlayer.clearPlaylist);
            $('.addAlbumButton').live('click', musicPlayer.addAlbumButtonClick);
            $('ul.playlistItem').live('dblclick', musicPlayer.startPlayingSelectedTrack);
        },
        compilejQueryTemplates:function () {
            //compile jQuery templates
            $("#audioTemplate").template("audioTemplate");
            $("#albumTemplate").template("albumTemplate");
            $("#albumListingTemplate").template("albumListingTemplate");
            $("#playlistitemtemplate").template("playlistitemtemplate");
        },
        clearPlaylist:function () {
            if ($('#playlist').find('ul.playlistItem').length > 0) {
                musicPlayer.askQuestion(musicPlayer.literals.confirmClearPlaylist,
                    musicPlayer.literals.confirmClearPlaylistTitle,
                    function (confirmed) {
                        if (confirmed) {
                            musicPlayer.stopButton.click();
                            $('#playlist').find('ul.playlistItem').hide('slow', function () {
                                $(this).remove();
                            });
                        }
                    });
            }
        },
        flattenTracksList:function (albumId) {
            var originalAlbum,
                flattenedTracksList = [],
                library = musicPlayer.getLibrary();
            $.each(library.albums, function (index, album) {
                if (album.albumId === albumId) {
                    originalAlbum = album;
                    return;
                }
            });
            if (originalAlbum) {
                $.each(originalAlbum.tracks, function (index, track) {
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
        addAlbumButtonClick:function () {
            musicPlayer.addAlbumToPlaylist($(this).prev('h4').data('albumId'));
        },
        addAlbumToPlaylist:function (albumId) {
            var flattenedTracksList;
            if ($('#playlist').find('ul[data-album-id=' + albumId + ']').length === 0) {
                flattenedTracksList = musicPlayer.flattenTracksList(albumId);
                $.each(flattenedTracksList, function (index, track) {
                    $('#playlist').append($.tmpl("playlistitemtemplate", track));
                });
                $('.playlistItem li').show('slow');
            } else {
                musicPlayer.showMessage(musicPlayer.literals.albumExists, musicPlayer.literals.albumExistsTitle);
            }
        },
        addAudio:function (track) {
            $('#audio').append($.tmpl("audioTemplate", track));
            musicPlayer.getAudioComponent().play();
        },
        removeAudio:function () {
            if (musicPlayer.getAudioComponent()) {
                musicPlayer.getAudioComponent().pause();
                $('#audio').find('audio').remove();
            }
        },
        setSongScroller:function (text) {
            $('#songScroller div').text(text);
        },
        getTrackFromPlayListItem:function (playlistItem) {
            return {
                albumId:playlistItem.data('albumId'),
                albumTitle:playlistItem.find('li.albumTitle').text(),
                trackId:playlistItem.data('trackId'),
                trackTitle:playlistItem.find('li.trackTitle').text(),
                artist:playlistItem.find('li.artist').text(),
                trackLocation:playlistItem.data('trackLocation')
            }
        },
        play:function (track) {
            musicPlayer.stopButton.click();
            var playlistItem = $('.playlistItem[data-track-id=' + track.trackId + ']');
            playlistItem.addClass(musicPlayer.nowPlayingClass);
            musicPlayer.setSongScroller(track.artist + " - " + track.trackTitle);
            musicPlayer.addAudio(track);
        },
        startPlayingSelectedTrack:function (e) {
            var self = $(this),
                track = musicPlayer.getTrackFromPlayListItem(self);
            musicPlayer.play(track);
            e.preventDefault();
            e.stopPropagation();
        },
        initializePage:function () {
            //don't show the seeker, if ogg/mp3 is not supported
            if (Modernizr.audio.ogg || Modernizr.audio.mp3) {
                $('#seeker').slider();
            }

            musicPlayer.setupPlayerButtons();

            musicPlayer.compilejQueryTemplates();

            //get library (from mock) and render it
            var library = musicPlayer.getLibrary();
            $.each(library.albums, function (index, album) {
                $('#albums').append($.tmpl("albumTemplate", album));
            });

            musicPlayer.wireUpPageEvents();
        }
    };
}(jQuery));

$(function () {
    musicPlayer.initializePage();
    musicPlayer.addAlbumToPlaylist(102);
});



