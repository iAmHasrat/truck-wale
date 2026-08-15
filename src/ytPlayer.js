// Pure YouTube Music & IFrame API Player for Punjabi Truck Radio
// Default Playlist: PLNreTuzx45cU

export const DEFAULT_PLAYLIST_ID = 'PLNreTuzx45cU';

class YTMusicPlayerManager {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.isPlaying = false;
    this.isSeeking = false;
    this.volume = 80;
    this.currentPlaylistId = DEFAULT_PLAYLIST_ID;
    this.onStateChangeCallbacks = [];
    this.onTrackInfoCallbacks = [];
    this.pollInterval = null;
  }

  init(containerId) {
    return new Promise((resolve) => {
      const createYT = () => {
        try {
          this.player = new window.YT.Player(containerId, {
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              enablejsapi: 1,
              listType: 'playlist',
              list: DEFAULT_PLAYLIST_ID
            },
            events: {
              onReady: (event) => {
                this.isReady = true;
                try {
                  event.target.setVolume(this.volume);
                } catch (e) {}
                this.startInfoPoller();
                resolve();
              },
              onStateChange: (event) => {
                this.handleStateChange(event);
              },
              onError: (err) => {
                console.warn('YouTube Player error code:', err.data);
                try {
                  if (this.player && typeof this.player.nextVideo === 'function') {
                    this.player.nextVideo();
                  }
                } catch (e) {}
              }
            }
          });
        } catch (e) {
          console.error('Error instantiating YT Player:', e);
          resolve();
        }
      };

      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          createYT();
        };
      } else if (window.YT && window.YT.Player) {
        createYT();
      } else {
        resolve();
      }
    });
  }

  handleStateChange(event) {
    if (event.data === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.notifyStateChange(true);
      this.notifyTrackInfo();
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.notifyStateChange(false);
      if (event.data === window.YT.PlayerState.ENDED) {
        this.nextTrack();
      }
    }
  }

  play() {
    if (this.isReady && this.player) {
      try {
        if (typeof this.player.playVideo === 'function') {
          this.player.playVideo();
          this.isPlaying = true;
          this.notifyStateChange(true);
        }
      } catch (e) {
        console.error('YT playVideo failed:', e);
      }
    }
  }

  pause() {
    if (this.isReady && this.player) {
      try {
        if (typeof this.player.pauseVideo === 'function') {
          this.player.pauseVideo();
          this.isPlaying = false;
          this.notifyStateChange(false);
        }
      } catch (e) {}
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seekTo(seconds) {
    if (this.isReady && this.player && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch (e) {}
    }
  }

  nextTrack() {
    if (this.isReady && this.player && typeof this.player.nextVideo === 'function') {
      try {
        this.player.nextVideo();
      } catch (e) {}
    }
  }

  prevTrack() {
    if (this.isReady && this.player && typeof this.player.previousVideo === 'function') {
      try {
        this.player.previousVideo();
      } catch (e) {}
    }
  }

  loadPlaylistUrl(url) {
    const trimmed = url.trim();
    let playlistId = null;
    let videoId = null;

    try {
      if (trimmed.includes('list=')) {
        const urlObj = new URL(trimmed);
        playlistId = urlObj.searchParams.get('list');
      }
    } catch (e) {
      const listMatch = trimmed.match(/[?&]list=([^#\&\?]+)/);
      if (listMatch) playlistId = listMatch[1];
    }

    if (!playlistId) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = trimmed.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    }

    if (playlistId && this.isReady && this.player) {
      this.currentPlaylistId = playlistId;
      try {
        this.player.loadPlaylist({
          listType: 'playlist',
          list: playlistId,
          index: 0
        });
        this.play();
        return true;
      } catch (e) {
        console.error('Error loading playlist:', e);
      }
    } else if (videoId && this.isReady && this.player) {
      try {
        this.player.loadVideoById(videoId);
        this.play();
        return true;
      } catch (e) {
        console.error('Error loading video:', e);
      }
    }

    return false;
  }

  setVolume(volumePercent) {
    this.volume = Math.max(0, Math.min(100, volumePercent));
    if (this.isReady && this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(this.volume);
      } catch (e) {}
    }
  }

  startInfoPoller() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.notifyTrackInfo();
    }, 500);
  }

  notifyStateChange(isPlaying) {
    this.onStateChangeCallbacks.forEach(cb => cb(isPlaying));
  }

  notifyTrackInfo() {
    let title = 'Punjabi Highway Playlist';
    let author = 'YouTube Music';
    let currentTime = 0;
    let duration = 0;
    let videoId = '';
    let thumbnailUrl = '';

    if (this.player) {
      try {
        if (typeof this.player.getCurrentTime === 'function') {
          currentTime = this.player.getCurrentTime() || 0;
        }
        if (typeof this.player.getDuration === 'function') {
          duration = this.player.getDuration() || 0;
        }
        if (typeof this.player.getVideoData === 'function') {
          const data = this.player.getVideoData();
          if (data) {
            if (data.title) title = data.title;
            if (data.author) author = data.author;
            if (data.video_id) {
              videoId = data.video_id;
              thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
          }
        }
      } catch (e) {}
    }

    this.onTrackInfoCallbacks.forEach(cb => cb({
      title,
      author,
      currentTime,
      duration,
      videoId,
      thumbnailUrl
    }));
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.push(cb);
  }

  onTrackInfo(cb) {
    this.onTrackInfoCallbacks.push(cb);
  }
}

export const ytPlayer = new YTMusicPlayerManager();
