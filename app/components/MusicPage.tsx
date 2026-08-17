// app/components/MusicPage.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const PLAYLIST = [
  { id: 1, title: "Semua Aku Di Rayakan", artist: "Nadin Amizah", src: "/assets/sfx/bg-sound.mp3" },
  { id: 2, title: "About you", artist: "The 1975", src: "/assets/sfx/about-you.mp3" },
];

interface MusicPageProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function MusicPage({ audioRef }: MusicPageProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // FIX: guard defensif -- kalo prop audioRef gak ke-pass dari parent (undefined),
  // getAudio() balikin null aja daripada crash "Cannot read properties of undefined".
  const getAudio = () => audioRef?.current ?? null;

  const playTrack = useCallback(
    (index: number) => {
      const audio = getAudio();
      if (!audio) return;

      setCurrentSongIndex(index); // FIX: update index SEBELUM ganti src, biar UI langsung sinkron

      audio.pause();
      audio.src = PLAYLIST[index].src;
      audio.load();
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Playback error:", err));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioRef]
  );

  const nextSong = useCallback(() => {
    setCurrentSongIndex((prevIndex) => {
      const nextIdx = (prevIndex + 1) % PLAYLIST.length;
      playTrack(nextIdx);
      return nextIdx;
    });
  }, [playTrack]);

  const prevSong = useCallback(() => {
    setCurrentSongIndex((prevIndex) => {
      const prevIdx = (prevIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
      playTrack(prevIdx);
      return prevIdx;
    });
  }, [playTrack]);

  // FIX: pasang listener SEKALI pas komponen mount, bukan bergantung ke
  // `audioInstance` yang didapat dari polling (yang gak pernah berubah reference-nya
  // sehingga effect gak pernah re-run pas ganti lagu).
  useEffect(() => {
    if (!audioRef) return; // guard: kalo prop gak ke-pass sama sekali, skip diem-diem
    const audio = getAudio();
    if (!audio) return;

    setIsPlaying(!audio.paused);
    setProgress(audio.currentTime || 0);
    if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);

    const updateProgress = () => {
      setProgress(audio.currentTime || 0);
      if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => nextSong();

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSong]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getAudio();
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    nextSong();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    prevSong();
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    const audio = getAudio();
    if (audio) audio.currentTime = val;
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time <= 0) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 pb-12 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.img
        src="/assets/images/piringan.png"
        alt="Piringan Hitam"
        className="w-44 h-44 md:w-52 md:h-52 mb-4 rounded-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] object-contain pointer-events-none"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />

      <div className="text-center mb-4 px-4">
        <h3 className={`${ebGaramond.className} text-2xl mt-10 text-[#7C1E1F] font-bold tracking-wide drop-shadow-sm`}>
          {PLAYLIST[currentSongIndex].title}
        </h3>
        <p className="text-sm text-[#7C1E1F]/80 mt-1 font-sans font-medium">
          {PLAYLIST[currentSongIndex].artist}
        </p>
      </div>

      <div className="w-[85%] max-w-[260px] flex flex-col items-center mb-6">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleScrub}
          className="w-full h-2 bg-[#7C1E1F]/20 rounded-lg appearance-none cursor-pointer relative z-50 pointer-events-auto hover:scale-[1.03] transition-transform shadow-sm"
          style={{ accentColor: "#7C1E1F" }}
        />
        <div className="w-full flex justify-between text-xs text-[#7C1E1F]/80 mt-2 font-mono font-semibold">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-50 pointer-events-auto">
        <button
          onClick={handlePrev}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#7C1E1F] hover:bg-[#5A1516] hover:scale-110 text-[#f4e8d4] transition-all active:scale-95 shadow-md hover:shadow-lg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#7C1E1F] hover:bg-[#5A1516] hover:scale-110 text-[#f4e8d4] text-xl transition-all active:scale-95 shadow-[0_4px_14px_rgba(124,30,31,0.4)] hover:shadow-[0_6px_20px_rgba(124,30,31,0.6)]"
        >
          {isPlaying ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleNext}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#7C1E1F] hover:bg-[#5A1516] hover:scale-110 text-[#f4e8d4] transition-all active:scale-95 shadow-md hover:shadow-lg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}