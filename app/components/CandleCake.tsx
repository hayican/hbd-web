"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Posisi api lilin (dalam % relatif ke gambar page-kue.png).
// PENTING: angka top/left di bawah ini cuma ESTIMASI. Sesuaikan biar
// pas persis nempel di atas tiap lilin di gambar kue punya lu.
const CANDLE_FLAMES = [
  { top: "27%", left: "40%" },
  { top: "25%", left: "47%" },
  { top: "24%", left: "54%" },
  { top: "26%", left: "61%" },
];

export default function CandleCake() {
  const [isBlown, setIsBlown] = useState(false);
  const blowAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleBlow = (e: React.MouseEvent) => {
    e.stopPropagation(); // biar klik tombol gak nembus ke parent (flip halaman)
    if (isBlown) return;

    // sfx niup lilin (opsional). Taro file di /public/assets/sfx/blow-candles.mp3
    // Kalo file-nya belum ada, .catch() nangkep error-nya jadi gak bikin crash.
    if (!blowAudioRef.current) {
      blowAudioRef.current = new Audio("/assets/sfx/blow-candle.mp3");
    }
    blowAudioRef.current.currentTime = 0;
    blowAudioRef.current.volume = 0.6;
    blowAudioRef.current.play().catch(() => {});

    setIsBlown(true);

    // Confetti utama, dikasih delay dikit biar nyambung sama momen "api padam"
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#FFD700", "#ff4d6d", "#ffffff"],
      });
    }, 250);

    // Susulan confetti dari 2 sisi biar makin rame
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.4, x: 0.25 },
        colors: ["#FFD700", "#ff4d6d", "#ffffff"],
      });
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.4, x: 0.75 },
        colors: ["#FFD700", "#ff4d6d", "#ffffff"],
      });
    }, 550);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Api lilin -- muncul goyang-goyang, ilang begitu ditiup */}
      <AnimatePresence>
        {!isBlown &&
          CANDLE_FLAMES.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute text-xl md:text-2xl select-none"
              style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
              animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
            >
              🔥
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Tombol Tiup Lilin */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-auto">
        <motion.button
          onClick={handleBlow}
          disabled={isBlown}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2 rounded-full font-bold font-sans text-sm shadow-lg transition-all ${
            isBlown
              ? "bg-emerald-700 text-white cursor-default"
              : "bg-yellow-600 text-white hover:bg-yellow-500 active:scale-95"
          }`}
        >
          {isBlown ? "🎉 Selamat Ulang Tahun!" : "💨 Tiup Lilinnya"}
        </motion.button>
      </div>
    </div>
  );
}