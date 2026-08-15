import { audioEngine } from './audioEngine.js';
import { ytPlayer } from './ytPlayer.js';

let isUserDraggingSeek = false;
let audioUnlocked = false;

// Format seconds into m:ss
const formatTime = (sec) => {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

document.addEventListener('DOMContentLoaded', async () => {

  // Player Elements
  const playBtn = document.getElementById('radio-play-btn');
  const playIcon = document.getElementById('play-icon');
  const prevBtn = document.getElementById('radio-prev-btn');
  const nextBtn = document.getElementById('radio-next-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const trackTitleEl = document.getElementById('track-title');
  const trackArtistEl = document.getElementById('track-artist');
  const trackThumbImg = document.getElementById('track-thumb');
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');
  const seekBar = document.getElementById('seek-bar');
  const discArt = document.getElementById('disc-art');

  // Hotspot
  const steeringHotspot = document.getElementById('hotspot-steering');

  // Modal
  const customYtBtn = document.getElementById('custom-yt-btn');
  const ytModal = document.getElementById('yt-modal');
  const closeYtModalBtn = document.getElementById('close-yt-modal');
  const loadYtUrlBtn = document.getElementById('load-yt-url-btn');
  const ytUrlInput = document.getElementById('yt-url-input');
  const ytModalError = document.getElementById('yt-modal-error');

  // Unlock AudioContext & start music on first gesture
  const unlockAudio = () => {
    if (!audioUnlocked) {
      audioEngine.init();
      ytPlayer.play();
      audioUnlocked = true;
    }
  };

  document.body.addEventListener('click', unlockAudio, { once: true });
  document.body.addEventListener('touchstart', unlockAudio, { once: true });

  // Initialize Punjabi music player (audio only, uses a separate hidden iframe)
  await ytPlayer.init('yt-player-container');
  ytPlayer.play();

  // ── Invisible Steering Horn ──────────────────────────────────────────
  const triggerHorn = (e) => {
    if (e) e.preventDefault();
    unlockAudio();
    audioEngine.playPressureHorn();
  };

  if (steeringHotspot) {
    steeringHotspot.addEventListener('click', triggerHorn);
    steeringHotspot.addEventListener('touchstart', triggerHorn);
  }

  // ── Player controls ──────────────────────────────────────────────────
  playBtn.addEventListener('click', () => {
    unlockAudio();
    audioEngine.playClick();
    ytPlayer.togglePlay();
  });

  prevBtn.addEventListener('click', () => {
    unlockAudio();
    audioEngine.playRadioStatic();
    ytPlayer.prevTrack();
  });

  nextBtn.addEventListener('click', () => {
    unlockAudio();
    audioEngine.playRadioStatic();
    ytPlayer.nextTrack();
  });

  volumeSlider.addEventListener('input', (e) => {
    ytPlayer.setVolume(e.target.value);
  });

  // ── Seek bar ─────────────────────────────────────────────────────────
  seekBar.addEventListener('mousedown', () => { isUserDraggingSeek = true; });
  seekBar.addEventListener('touchstart', () => { isUserDraggingSeek = true; });

  seekBar.addEventListener('input', () => {
    updateSeekBarStyle(parseFloat(seekBar.value));
  });

  seekBar.addEventListener('change', () => {
    const pct = parseFloat(seekBar.value);
    if (ytPlayer.isReady && ytPlayer.player && typeof ytPlayer.player.getDuration === 'function') {
      const dur = ytPlayer.player.getDuration() || 1;
      ytPlayer.seekTo((pct / 100) * dur);
    }
    isUserDraggingSeek = false;
  });

  function updateSeekBarStyle(pct) {
    seekBar.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`;
  }

  // ── State & Track info callbacks ─────────────────────────────────────
  ytPlayer.onStateChange((isPlaying) => {
    if (isPlaying) {
      playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      discArt.classList.add('playing');
    } else {
      playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      discArt.classList.remove('playing');
    }
  });

  ytPlayer.onTrackInfo((info) => {
    if (info.title) {
      trackTitleEl.textContent = info.title;
      trackTitleEl.classList.toggle('scrolling', info.title.length > 18);
    }
    if (info.author) trackArtistEl.textContent = info.author;

    currentTimeEl.textContent = formatTime(info.currentTime);
    totalDurationEl.textContent = formatTime(info.duration);

    if (!isUserDraggingSeek && info.duration > 0) {
      const pct = (info.currentTime / info.duration) * 100;
      seekBar.value = pct;
      updateSeekBarStyle(pct);
    }

    if (info.thumbnailUrl) {
      if (trackThumbImg.src !== info.thumbnailUrl) trackThumbImg.src = info.thumbnailUrl;
      trackThumbImg.classList.add('loaded');
    } else {
      trackThumbImg.classList.remove('loaded');
    }
  });

  // ── Custom Playlist Modal ────────────────────────────────────────────
  customYtBtn.addEventListener('click', () => {
    ytModal.classList.remove('modal-hidden');
    ytUrlInput.focus();
  });

  closeYtModalBtn.addEventListener('click', () => {
    ytModal.classList.add('modal-hidden');
    ytModalError.textContent = '';
  });

  loadYtUrlBtn.addEventListener('click', () => {
    const inputVal = ytUrlInput.value.trim();
    if (!inputVal) return;
    const success = ytPlayer.loadPlaylistUrl(inputVal);
    if (success) {
      ytModal.classList.add('modal-hidden');
      ytUrlInput.value = '';
      ytModalError.textContent = '';
    } else {
      ytModalError.textContent = 'Invalid YouTube Music Playlist or Video URL.';
    }
  });

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if (document.activeElement === ytUrlInput) return;
    const key = e.key.toLowerCase();
    if (key === 'h') { e.preventDefault(); unlockAudio(); audioEngine.playPressureHorn(); }
    else if (key === ' ') { e.preventDefault(); unlockAudio(); ytPlayer.togglePlay(); }
    else if (key === 'n') { e.preventDefault(); unlockAudio(); audioEngine.playRadioStatic(); ytPlayer.nextTrack(); }
    else if (key === 'p') { e.preventDefault(); unlockAudio(); audioEngine.playRadioStatic(); ytPlayer.prevTrack(); }
  });
});
