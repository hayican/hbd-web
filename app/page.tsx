"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  // State biar pas bukunya lagi ditarik (di-drag), efek melayangnya berhenti
  const [isDragging, setIsDragging] = useState(false);

  const handleBookClick = () => {
    // 1. Flash Putih
    setShowFlash(true);

    // 2. Transisi & Confetti
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#ff0000", "#ffffff"],
      });
      setIsOpened(true);
    }, 400);

    // 3. Flash Hilang
    setTimeout(() => {
      setShowFlash(false);
    }, 900);
  };

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black font-serif">
      
      {/* SCENE 1: MEJA BERSERAKAN */}
      {!isOpened && (
        // Vignette effect ada di shadow-[inset_...]
        <motion.div 
          className="absolute inset-0 bg-[#2b1d14] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] flex items-center justify-center shadow-[inset_0_0_200px_120px_rgba(0,0,0,0.95)]"
          exit={{ opacity: 0 }}
        >
          {/* EFEK KABUT (FOG) LOADING AWAL */}
          <motion.div
            className="absolute inset-0 bg-black z-[60] pointer-events-none flex items-center justify-center text-white tracking-widest"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
          >
            Memuat memori...
          </motion.div>

          {/* BUKU PELENGKAP */}
          {/* Nanti bg-zinc-800 diganti kalau udah ada gambar */}
          <div className="absolute top-[15%] left-[15%] -rotate-12 w-[160px] h-[240px] bg-zinc-800 rounded shadow-[6px_12px_25px_rgba(0,0,0,0.8)]" />
          <div className="absolute bottom-[20%] right-[20%] rotate-[20deg] w-[160px] h-[240px] bg-zinc-800 rounded shadow-[6px_12px_25px_rgba(0,0,0,0.8)]" />

          {/* BUKU UTAMA (GLOWING) */}
          <motion.div
            className="absolute w-[220px] h-[320px] bg-yellow-900 border-2 border-yellow-600 rounded z-40 cursor-pointer flex items-center justify-center text-yellow-300 font-bold text-center"
            animate={{
              boxShadow: [
                "0px 0px 15px rgba(255,215,0,0.4)",
                "0px 0px 50px rgba(255,215,0,1)",
                "0px 0px 15px rgba(255,215,0,0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookClick}
          >
            Buku Utama
          </motion.div>

          {/* BUKU PENUTUP (Bisa digeser & Melayang) */}
          <motion.div
            drag // Boom! Cuma modal tulisan ini doang udah bisa di-drag sepuasnya
            dragMomentum={false} // Biar pas dilepas, bukunya ga ngeloyor jalan sendiri
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            // Animasi Y (naik turun) jalan kalau isDragging false. Kalau true, diem.
            animate={isDragging ? { rotate: 7 } : { y: [0, -12, 0], rotate: 7 }}
            transition={{ 
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0 } // Biar miringnya tetep konstan 7 derajat
            }}
            className="absolute w-[230px] h-[330px] bg-zinc-800 rounded z-50 cursor-grab active:cursor-grabbing flex items-center justify-center text-zinc-400 shadow-[10px_15px_35px_rgba(0,0,0,0.9)] select-none"
            style={{ touchAction: "none" }} // Wajib biar pas main di HP ga kepencet scroll
          >
            Buku Penutup (Geser Aku)
          </motion.div>

        </motion.div>
      )}

      {/* SCENE 2: TRANSISI CAHAYA PUTIH (FLASH) */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 bg-white z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* SCENE 3: ISI SURAT */}
      {isOpened && !showFlash && (
        <motion.div 
          className="absolute inset-0 z-40 bg-[#f4e8d4] text-zinc-800 p-5 flex flex-col items-center justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-[800px] bg-white p-10 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] min-h-[70vh]">
            <h2 className="text-center text-3xl mb-8 font-serif font-bold">Untuk Kamu...</h2>
            <p className="leading-relaxed text-lg font-serif">
              (Ini tempat desain UI suratnya. Tinggal disesuaikan aja, tambahin div, flexbox, atau tag img buat foto).
            </p>
          </div>
        </motion.div>
      )}

    </main>
  );
}