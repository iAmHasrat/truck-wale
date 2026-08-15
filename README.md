# TruckWale 🚛

A fun weekend project — a minimal, ultra-transparent **Punjabi Truck Cabin FM Experience** built for the vibes.

> Inspired by viral atmospheric sites like hornokplease.wtf, deluxsalon.in, and drive & listen.

---

## What It Does

- 🎵 **Plays a Punjabi music playlist** via YouTube Music (T-Series Apna Punjab) right from the truck cabin
- 🛣️ **Live highway drive video** plays through the truck windscreen (YouTube video composited behind a chroma-keyed truck cabin PNG)
- 📀 **Liquid glass music player** with draggable seek bar, spinning album art, auto-scrolling marquee for long song titles
- 🚨 **Invisible pressure horn** — click the center of the steering wheel (or press `H`) to blast a real Tamil Nadu bus horn
- 🎨 **Regal Punjabi aesthetic** — Rozha One + Cinzel fonts, white glass accents, ultra-transparent frosted UI
- 🎵 Custom playlist support — paste any YouTube Music playlist URL to swap it out

---

## Tech Stack

- **Vite** (vanilla JS, no framework)
- **YouTube IFrame API** for music playback
- **Web Audio API** for the horn sound
- **Python + Pillow** for chroma-key PNG processing
- **Pure CSS** glassmorphism / liquid glass UI

---

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

*This was a fun side project — built entirely for the nostalgia of long GT Road drives, Punjabi music, and truck art culture. 🚛💨*
