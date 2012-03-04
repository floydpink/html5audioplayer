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
        showMessage:function (message, title) {
            jAlert(message, title);
        },
        askQuestion:function (message, title, returnAction) {
            jConfirm(message, title, returnAction);
        },
        getLibrary:function () {
            return mockData.library;
        },
        literals:{
            albumExists:'Album is already in the playlist.',
            albumExistsTitle:'We have it!',
            confirmClearPlaylist:'Music would stop and playlist would clear. Continue?',
            confirmClearPlaylistTitle:'Well...?',
            noTrackSelected:'Click on a track and hit play. Or double click on a track to play it.',
            noTrackSelectedTitle:'What would I play!?.'
        },
        previousButton:$("#previous"),
        playButton:$("#play"),
        stopButton:$("#stop"),
        nextButton:$("#next"),
        shuffleButton:$("#shuffle"),
        repeatButton:$("#repeat"),
        nowPlayingClass:'nowPlaying',
        selectedClass:'selected',
        pausedClass:'paused',
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
                    var playPauseSwitched;
                    if ($(this).text() === "Play") {
                        options = {
                            label:"Pause",
                            icons:{
                                primary:"ui-icon-pause"
                            }
                        };
                        playPauseSwitched = musicPlayer.playSelectedOrResumePaused();
                    } else {
                        options = {
                            label:"Play",
                            icons:{
                                primary:"ui-icon-play"
                            }
                        };
                        musicPlayer.pauseCurrentTrack();
                        playPauseSwitched = true;
                    }
                    if (playPauseSwitched) {
                        $(this).button("option", options);
                    }
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
                    musicPlayer.stop();
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
            $('ul.playlistItem').live('click', musicPlayer.trackClick);
            $('ul.playlistItem').live('dblclick', musicPlayer.trackDoubleClick);
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
        addAndPlayAudio:function (track) {
            $('#audio').append($.tmpl("audioTemplate", track));
            musicPlayer.setupSlider();
            musicPlayer.getAudioComponent().play();
        },
        stopAndRemoveAudio:function () {
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
        setScrollerAndGetTrack:function (playlistItem) {
            var track = musicPlayer.getTrackFromPlayListItem(playlistItem);
            musicPlayer.setSongScroller(track.artist + " - " + track.trackTitle);
            return track;
        },
        playSelectedOrResumePaused:function () {
            var pausedTrack = $('.' + musicPlayer.pausedClass);
            if (pausedTrack.length > 0) {
                var track = musicPlayer.setScrollerAndGetTrack(pausedTrack);
                pausedTrack.removeClass(musicPlayer.pausedClass);
                musicPlayer.getAudioComponent().play();
                return true;
            } else {
                var selectedTrack = $('.' + musicPlayer.selectedClass);
                if (selectedTrack.length > 0) {
                    musicPlayer.play(selectedTrack);
                    return true;
                } else {
                    musicPlayer.showMessage(musicPlayer.literals.noTrackSelected,
                        musicPlayer.literals.noTrackSelectedTitle);
                    return false;
                }
            }
        },
        pauseCurrentTrack:function () {
            musicPlayer.getAudioComponent().pause();
            $('.' + musicPlayer.nowPlayingClass).addClass(musicPlayer.pausedClass);
            musicPlayer.setSongScroller(' - PAUSED -');
        },
        stop:function () {
            musicPlayer.stopAndRemoveAudio();
            musicPlayer.setSongScroller('No track playing.');
            $('.playlistItem').removeClass(musicPlayer.nowPlayingClass);
        },
        play:function (playlistItem) {
            playlistItem.addClass(musicPlayer.nowPlayingClass);
            var track = musicPlayer.setScrollerAndGetTrack(playlistItem);
            musicPlayer.addAndPlayAudio(track);
        },
        setSelectedTrack:function (playlistItem) {
            playlistItem.addClass(musicPlayer.selectedClass);
        },
        trackClick:function (e) {
            $('.playlistItem').removeClass(musicPlayer.selectedClass);
            musicPlayer.setSelectedTrack($(this));
        },
        trackDoubleClick:function (e) {
            musicPlayer.stopButton.click();
            musicPlayer.setSelectedTrack($(this));
            musicPlayer.playButton.click();
            e.preventDefault();
            e.stopPropagation();
        },
        setupSlider:function () {
            // http://neutroncreations.com/blog/building-a-custom-html5-audio-player-with-jquery/
            var audio = musicPlayer.getAudioComponent(),
                timeleft = $('#remainingTime'),
                positionIndicator = $('#seeker #handle'),
                manualSeek, loaded;

            $(audio).bind('timeupdate', function () {
                var remaining = parseInt(audio.duration - audio.currentTime, 10),
                    position = (audio.currentTime / audio.duration) * 100,
                    minutes = Math.floor(remaining / 60, 10),
                    seconds = remaining - minutes * 60;
                timeleft.text('-' + minutes + ':' + (seconds > 9 ? seconds : '0' + seconds));
                if (!manualSeek) {
                    positionIndicator.css({left:position + '%'});
                }
                if (!loaded) {
                    loaded = true;

                    $('#seeker').slider({
                        value:0,
                        step:0.01,
                        orientation:"horizontal",
                        range:"min",
                        max:audio.duration,
                        animate:true,
                        slide:function () {
                            manualSeek = true;
                        },
                        stop:function (e, ui) {
                            manualSeek = false;
                            audio.currentTime = ui.value;
                        }
                    });
                }

            });
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



