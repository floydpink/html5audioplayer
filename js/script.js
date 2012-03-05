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
        seeker:$('#seeker'),
        currentTime:$('#currentTime'),
        remainingTime:$('#remainingTime'),
        nowPlayingClass:'nowPlaying',
        selectedClass:'selected',
        shuffle:function () {
            return $('#shuffle').prop('checked')
        },
        repeat:function () {
            return $('#repeat').prop('checked')
        },
        getPlayListItems:function () {
            return $('#playlist ul.playlistItem')
        },
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
            }).click(function () {
                    musicPlayer.next();
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
                    musicPlayer.emptyShufflePlayedList();
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
            $('#audio,.myMarquee,#controls,#playlistSection').show('slow');
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
            musicPlayer.setupSliderAndAudioEvents();
            musicPlayer.getAudioComponent().play();
        },
        stopAndRemoveAudio:function () {
            if (musicPlayer.getAudioComponent()) {
                musicPlayer.getAudioComponent().pause();
                musicPlayer.defaultSlider();
                $('#audio').find('audio').remove();
            }
        },
        getSongScroller:function () {
            return $('#songScroller div:first').text();
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
        deselectAlItems:function () {
            $('.playlistItem').removeClass(musicPlayer.selectedClass);
        },
        getSelectedItem:function () {
            return $('.' + musicPlayer.selectedClass);
        },
        setSelectedItem:function (playlistItem) {
            playlistItem.addClass(musicPlayer.selectedClass);
        },
        getNowPlayingItem:function () {
            var nowPlayingItem = $('.' + musicPlayer.nowPlayingClass);
            if (nowPlayingItem.length) {
                return nowPlayingItem;
            }
            return null;
        },
        generateRandom:function (upper) {
            var min = 0, max = upper;
            var random = Math.floor(Math.random() * (max - min + 1)) + min;
            return random;
        },
        getNextRandomItemNotShufflePlayed:function () {
            var usedList = musicPlayer.getShufflePlyedList(),
                upper = musicPlayer.getPlayListItems().length - 1,
                randomItemIndex;
            if (usedList.length === musicPlayer.getPlayListItems().length) {
                return 0;
            }
            randomItemIndex = musicPlayer.generateRandom(upper);
            while ($.inArray(randomItemIndex, usedList) > -1) {
                randomItemIndex = musicPlayer.generateRandom(upper);
            }
            return musicPlayer.getPlayListItems().eq(randomItemIndex);
        },
        getShufflePlyedList:function(){
            return musicPlayer.shuffleButton.data('shufflePlayedList') || [];
        },
        emptyShufflePlayedList:function () {
            musicPlayer.shuffleButton.data('shufflePlayedList', []);
        },
        addToShufflePlayedList:function (listItemIndex) {
            var shufflePlayedList = musicPlayer.getShufflePlyedList();
            shufflePlayedList.push(listItemIndex);
            musicPlayer.shuffleButton.data('shufflePlayedList', shufflePlayedList);
        },
        playSelectedOrResumePaused:function () {
            var audio = musicPlayer.getAudioComponent();
            if (audio && audio.paused) {
                musicPlayer.setSongScroller(musicPlayer.seeker.data('pausedTrackTitle'));
                musicPlayer.seeker.data('pausedTrackTitle', '');
                musicPlayer.getAudioComponent().play();
                return true;
            } else {
                var selectedTrack = musicPlayer.getSelectedItem();
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
            musicPlayer.seeker.data('pausedTrackTitle', musicPlayer.getSongScroller());
            musicPlayer.getAudioComponent().pause();
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
        next:function () {
            var nowPlayingItem = musicPlayer.getNowPlayingItem(),
                nextPlayListItem,
                nowPlayingItemIndex = nowPlayingItem.index() - 1; //correcton for #playlistHead sibling

            if (nowPlayingItem) {
                musicPlayer.stopButton.click();
                musicPlayer.deselectAlItems();
                if (!musicPlayer.shuffle()) {
                    nextPlayListItem = musicPlayer.getPlayListItems().eq(nowPlayingItemIndex + 1);
                    if (nextPlayListItem.length) {
                        musicPlayer.setSelectedItem(nextPlayListItem);
                    } else if (musicPlayer.repeat()) {
                        musicPlayer.setSelectedItem(musicPlayer.getPlayListItems().eq(0));
                    }
                } else {
                    musicPlayer.addToShufflePlayedList(nowPlayingItemIndex);
                    nextPlayListItem = musicPlayer.getNextRandomItemNotShufflePlayed();
                    if (nextPlayListItem) {
                        musicPlayer.setSelectedItem(nextPlayListItem);
                    } else if (musicPlayer.repeat()) {
                        musicPlayer.emptyShufflePlayedList();
                        musicPlayer.addToShufflePlayedList(nowPlayingItemIndex);
                        musicPlayer.setSelectedItem(musicPlayer.getNextRandomItemNotShufflePlayed());
                    }
                }
                if (musicPlayer.getSelectedItem().length) {
                    musicPlayer.playButton.click();
                }
            }
        },
        previous:function () {
            //if nothing is playing return
            //stop current track
            //get the nowplayingtrack index
            //if shuffle off
            //  if exist nowPlayingTrackIndex - 1 track
            //      select nowPlayingTrackIndex - 1 track
            //  else if repeat on
            //      select maxIndex track
            //else
            //  if exist (items in shuffledList)
            //      select (maxIndex item in shuffledList)
            //  else if repeat on
            //      select (nextRandomTrack not in shuffledList)
        },
        trackClick:function (e) {
            musicPlayer.deselectAlItems();
            musicPlayer.setSelectedItem($(this));
        },
        trackDoubleClick:function (e) {
            musicPlayer.stopButton.click();
            musicPlayer.setSelectedItem($(this));
            musicPlayer.playButton.click();
            e.preventDefault();
            e.stopPropagation();
        },
        defaultSlider:function () {
            musicPlayer.seeker.slider({value:0});
            musicPlayer.currentTime.empty();
            musicPlayer.remainingTime.empty();
        },
        setupSliderAndAudioEvents:function () {
            // http://neutroncreations.com/blog/building-a-custom-html5-audio-player-with-jquery/
            var audio = musicPlayer.getAudioComponent(),
                seekerHandle = musicPlayer.seeker.find('#handle'),
                manualSeek, loaded;

            $(audio).bind('timeupdate', function () {
                var currentTimeInt = parseInt(audio.currentTime, 10),
                    durationInt = parseInt(audio.duration, 10),
                    remainingTime = durationInt - currentTimeInt,
                    currentMinutes = Math.floor(currentTimeInt / 60, 10),
                    currentSeconds = currentTimeInt - currentMinutes * 60,
                    remainingMinutes = Math.floor(remainingTime / 60, 10),
                    remainingSeconds = remainingTime - remainingMinutes * 60,
                    position = (audio.currentTime / audio.duration) * 100;

                musicPlayer.currentTime.text(currentMinutes + ':' + (currentSeconds > 9 ? currentSeconds : '0' + currentSeconds));
                musicPlayer.remainingTime.text('-' + remainingMinutes + ':' + (remainingSeconds > 9 ? remainingSeconds : '0' + remainingSeconds));
                if (!manualSeek) {
                    seekerHandle.css({left:position + '%'});
                }
                if (!loaded) {
                    loaded = true;

                    musicPlayer.seeker.slider({
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
            if (Modernizr.audio.ogg || Modernizr.audio.mp3) {
                musicPlayer.setupPlayerButtons();
                musicPlayer.defaultSlider();

                var library = musicPlayer.getLibrary();
                musicPlayer.compilejQueryTemplates();
                $.each(library.albums, function (index, album) {
                    $('#albums').append($.tmpl("albumTemplate", album));
                });

                musicPlayer.wireUpPageEvents();
            } else {
                $('#unsupportedBrowser').show('slow');
            }
        }
    };
}(jQuery));

$(function () {
    musicPlayer.initializePage();
});



