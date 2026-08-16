"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VinylRecordProps {
  // Ref audio bg-sound dari page.tsx, dipake buat ngeduck volume-nya
  bgMusicRef: React.RefObject<HTMLAudioElement | null>;
  // True kalau halaman piringan ini lagi kelihatan di layar (currentSheet === 4).
  // Dipake buat auto-pause + balikin volume bg pas user pindah halaman.
  isActive: boolean;
  // Path lagu HBD instrumental. Taro file-nya di /public/assets/sfx/happy-birthday.mp3
  src?: string;
}

export default function VinylRecord({
  bgMusicRef,
  isActive,
  src = "/assets/sfx/happy-birthday.mp3",
}: VinylRecordProps) {
  const songAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fade volume bg-sound halus dari volume sekarang ke `to`, biar gak "klik" pas berubah.
  const fadeBgVolume = (to: number, duration = 500) => {
    const bg = bgMusicRef.current;
    if (!bg) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const steps = 20;
    const stepTime = duration / steps;
    const from = bg.volume;
    let count = 0;

    fadeIntervalRef.current = setInterval(() => {
      count++;
      const progress = count / steps;
      bg.volume = Math.max(0, Math.min(1, from + (to - from) * progress));
      if (count >= steps) {
        bg.volume = to;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, stepTime);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // biar klik piringan gak nembus ke parent (flip halaman)
    if (!songAudioRef.current) {
      songAudioRef.current = new Audio(src);
      songAudioRef.current.loop = true;
      songAudioRef.current.volume = 0.9;
      songAudioRef.current.onended = () => setIsPlaying(false);
    }
    const song = songAudioRef.current;

    if (isPlaying) {
      song.pause();
      setIsPlaying(false);
      fadeBgVolume(1.0, 600); // balikin bg-sound ke volume normal
    } else {
      fadeBgVolume(0.12, 400); // redupin bg-sound biar gak nabrak sama lagu HBD
      song.currentTime = 0;
      song.play().catch(() => {
        // browser block autoplay tanpa interaksi -- aman karena ini dari onClick
      });
      setIsPlaying(true);
    }
  };

  // Auto-pause + balikin volume bg kalau user pindah halaman (flip ke sheet lain)
  useEffect(() => {
    if (!isActive && isPlaying) {
      songAudioRef.current?.pause();
      setIsPlaying(false);
      fadeBgVolume(1.0, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Cleanup total pas komponen unmount (misal navigasi keluar halaman/app)
  useEffect(() => {
    return () => {
      songAudioRef.current?.pause();
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      const bg = bgMusicRef.current;
      if (bg) bg.volume = 1.0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 pointer-events-none">
      <motion.button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause lagu" : "Putar lagu"}
        className="relative w-36 h-36 md:w-40 md:h-40 rounded-full bg-[#111] shadow-[0_10px_25px_rgba(0,0,0,0.6)] pointer-events-auto cursor-pointer flex items-center justify-center"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={
          isPlaying
            ? { duration: 3, repeat: Infinity, ease: "linear" }
            : { duration: 0.3 }
        }
        whileTap={{ scale: 0.96 }}
      >
        {/* Alur-alur piringan (grooves) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-white/10"
            style={{ width: `${100 - i * 16}%`, height: `${100 - i * 16}%` }}
          />
        ))}
        {/* Label tengah piringan */}
        <div className="w-11 h-11 rounded-full bg-red-800 border-2 border-yellow-500 flex items-center justify-center z-10">
          <div className="w-2 h-2 rounded-full bg-black" />
        </div>
      </motion.button>

      <span className="font-sans text-[11px] md:text-xs tracking-widest text-black/60 pointer-events-none select-none text-center px-4">
        {isPlaying ? "♪ Now Playing..." : "Ketuk piringan buat muter lagu"}
      </span>
    </div>
  );
}