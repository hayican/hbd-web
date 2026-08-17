// app/components/CandleCake.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export default function CandleCake() {
  const [isBlown, setIsBlown] = useState(false);
  const blowAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleBlow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBlown(true);

    if (!blowAudioRef.current) {
      blowAudioRef.current = new Audio("/assets/sfx/blow.wav");
    }
    blowAudioRef.current.currentTime = 0;
    blowAudioRef.current.play().catch(() => {});
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#7C1E1F", "#e2b765", "#ffffff", "#f4e8d4"],
      zIndex: 9999
    });
  }, []);

  // Koordinat presisi di ujung sumbu lilin
  const flames = [
    { id: 1, top: "34.5%", left: "37.8%" },
    { id: 2, top: "34.0%", left: "45.3%" },
    { id: 3, top: "34.0%", left: "53.0%" },
    { id: 4, top: "34.5%", left: "60.5%" },
  ];

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto select-none">
      {/* =======================================
          ANIMASI API LILIN
          ======================================= */}
      <AnimatePresence>
        {!isBlown && flames.map((flame) => (
          <motion.div
            key={flame.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.15, 0.95, 1.05, 1],
              rotate: [-2, 3, -1, 2, 0],
            }}
            exit={{ opacity: 0, scale: 0, y: -10 }}
            transition={{ 
              scale: { duration: 0.3 + Math.random() * 0.2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.4 + Math.random() * 0.2, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.5 },
              default: { duration: 0.3 }
            }}
            className="absolute origin-bottom z-30"
            style={{ 
              top: flame.top, 
              left: flame.left,
              width: "12px",
              height: "20px",
              transform: "translate(-50%, -100%)",
              background: "radial-gradient(ellipse at bottom, #ffffff 10%, #fde047 40%, #ea580c 80%, #ef4444 100%)",
              borderRadius: "50% 50% 20% 20% / 60% 60% 30% 30%",
              boxShadow: "0 0 10px 2px rgba(251, 146, 60, 0.7)"
            }}
          />
        ))}
      </AnimatePresence>

      {/* =======================================
          TOMBOL & PESAN
          ======================================= */}
      <div className="absolute bottom-24 w-full flex flex-col items-center">
        {!isBlown ? (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBlow}
            className={`${ebGaramond.className} px-3 py-1 bg-[#7C1E1F] hover:bg-[#5A1516] text-[#f4e8d4] text-xl font-bold rounded-full transition-colors shadow-[0_6px_15px_rgba(124,30,31,0.4)] hover:shadow-[0_8px_25px_rgba(124,30,31,0.6)] mb-7 `}
          >
            Tiup Lilin 💨
          </motion.button>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${ebGaramond.className} text-2xl font-bold text-[#7C1E1F] tracking-wide text-center  mb-9 ml-7`}
          >
            Selamat! 🎉<br />
          </motion.p>
        )}
      </div>
    </div>
  );
}