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
  // State untuk menangkap instance audio dari luar agar tombol tidak "kosong"
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentIndexRef = useRef(0);

  // 1. Tangkap audio instance dari parent (page.tsx) secara reaktif
  useEffect(() => {
    const checkAudio = () => {
      if (audioRef.current && audioRef.current !== audioInstance) {
        setAudioInstance(audioRef.current);
      }
    };
    
    checkAudio();
    const interval = setInterval(checkAudio, 200); // Polling sampai audio tersedia
    return () => clearInterval(interval);
  }, [audioRef, audioInstance]);

  // 2. Fungsi putar lagu yang ke-binding dengan audioInstance asli
  const playTrack = useCallback(
    (index: number) => {
      if (!audioInstance) return;
      
      setCurrentSongIndex(index);
      currentIndexRef.current = index;

      audioInstance.pause();
      audioInstance.src = PLAYLIST[index].src;
      audioInstance.load();
      audioInstance
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Playback error:", err));
    },
    [audioInstance]
  );

  const nextSong = useCallback(() => {
    const nextIdx = (currentIndexRef.current + 1) % PLAYLIST.length;
    playTrack(nextIdx);
  }, [playTrack]);

  const prevSong = useCallback(() => {
    const prevIdx = (currentIndexRef.current - 1 + PLAYLIST.length) % PLAYLIST.length;
    playTrack(prevIdx);
  }, [playTrack]);

  // 3. Pasang Listener setelah audioInstance didapatkan
  useEffect(() => {
    if (!audioInstance) return;

    // Sinkronisasi index lagu dari src yang sedang berjalan
    const currentSrc = audioInstance.src;
    const foundIndex = PLAYLIST.findIndex(
      (song) => currentSrc.includes(song.src) || song.src.includes(currentSrc)
    );
    if (foundIndex !== -1) {
      setCurrentSongIndex(foundIndex);
      currentIndexRef.current = foundIndex;
    }

    setIsPlaying(!audioInstance.paused);
    setProgress(audioInstance.currentTime || 0);
    if (audioInstance.duration && !isNaN(audioInstance.duration)) {
      setDuration(audioInstance.duration);
    }

    const updateProgress = () => {
      setProgress(audioInstance.currentTime || 0);
      if (audioInstance.duration && !isNaN(audioInstance.duration)) {
        setDuration(audioInstance.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => nextSong();

    audioInstance.addEventListener("timeupdate", updateProgress);
    audioInstance.addEventListener("play", handlePlay);
    audioInstance.addEventListener("pause", handlePause);
    audioInstance.addEventListener("ended", handleEnded);
    audioInstance.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audioInstance.removeEventListener("timeupdate", updateProgress);
      audioInstance.removeEventListener("play", handlePlay);
      audioInstance.removeEventListener("pause", handlePause);
      audioInstance.removeEventListener("ended", handleEnded);
      audioInstance.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [audioInstance, nextSong]);

  const togglePlay = () => {
    if (!audioInstance) return;

    if (audioInstance.paused) {
      audioInstance.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audioInstance.pause();
      setIsPlaying(false);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioInstance) {
      audioInstance.currentTime = val;
    }
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
      {/* Piringan Hitam */}
      <motion.img
        src="/assets/images/piringan.png"
        alt="Piringan Hitam"
        className="w-44 h-44 md:w-52 md:h-52 mb-4 rounded-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] object-contain pointer-events-none"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />

      {/* Info Lagu */}
      <div className="text-center mb-4 px-4">
        <h3 className={`${ebGaramond.className} text-2xl mt-10 text-[#7C1E1F] font-bold tracking-wide drop-shadow-sm`}>
          {PLAYLIST[currentSongIndex].title}
        </h3>
        <p className="text-sm text-[#7C1E1F]/80 mt-1 font-sans font-medium">
          {PLAYLIST[currentSongIndex].artist}
        </p>
      </div>

      {/* Progress Bar dengan Efek Hover */}
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

      {/* Tombol Navigasi dengan Efek Hover */}
      <div className="flex items-center gap-6 relative z-50 pointer-events-auto">
        <button
          onClick={prevSong}
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
          onClick={nextSong}
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