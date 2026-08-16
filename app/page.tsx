"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  
  // State halaman & arah flip (1 buat maju, -1 buat mundur)
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  // Aset Halaman Fatih
  const pages = [
    "/assets/images/page1.png",
    "/assets/images/page2.png",
    "/assets/images/page3.png",
    "/assets/images/page-foto.png",
    "/assets/images/page-music.png",
    "/assets/images/page-kue.png",
    "/assets/images/message.png",
    "/assets/images/mini-game.png",
    "/assets/images/sampul-belakang.png",
  ];

  // ==========================================
  // ARRAY TUMPUKAN BUKU/BARANG PENGHALANG
  // ==========================================
  const tumpukanPenghalang = [
    { 
      id: 1, 
      src: "/assets/images/kertas-kusam.png", 
      rotate: -15, 
      zIndex: 45, 
      width: 200, 
      height: 280 
    },
    { 
      id: 2, 
      src: "/assets/images/tiket.png", 
      rotate: 10, 
      zIndex: 46, 
      width: 220, // Tiket agak dilebarin
      height: 120 
    },
    { 
      id: 3, 
      src: "/assets/images/buku-catatan.png", 
      rotate: -5, 
      zIndex: 47, 
      width: 225, 
      height: 320 
    },
    { 
      id: 4, 
      src: "/assets/images/amplop-tua.png", 
      rotate: 7, 
      zIndex: 48, 
      width: 240, 
      height: 160 
    },
  ];

  const handleBookClick = () => {
    setShowFlash(true);
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#ff0000", "#ffffff"],
      });
      setIsOpened(true);
    }, 400);
    setTimeout(() => {
      setShowFlash(false);
    }, 900);
  };

  const nextPage = () => {
    setDirection(1); 
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  const prevPage = () => {
    setDirection(-1); 
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const flipVariants = {
    initial: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90, 
      opacity: 0,
      transformOrigin: dir > 0 ? "right" : "left", 
    }),
    animate: (dir: number) => ({
      rotateY: 0, 
      opacity: 1,
      transformOrigin: dir > 0 ? "right" : "left",
      transition: { duration: 0.6, ease: "easeOut" },
    }),
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90, 
      opacity: 0,
      transformOrigin: dir > 0 ? "left" : "right",
      transition: { duration: 0.6, ease: "easeIn" },
    }),
  };

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black font-serif">
      
      {/* =========================================
          SCENE 1: MEJA BERSERAKAN
          ========================================= */}
      {!isOpened && (
        <motion.div 
          // Background sekarang ngambil dari assets/images/background.png
          className="absolute inset-0 bg-[#2b1d14] bg-[url('/assets/images/background.png')] bg-cover bg-center flex items-center justify-center shadow-[inset_0_0_200px_120px_rgba(0,0,0,0.95)]"
          exit={{ opacity: 0 }}
        >
          {/* EFEK KABUT (FOG) DARI AWAN.PNG */}
          <motion.div
            className="absolute inset-0 bg-black/90 z-[60] pointer-events-none flex items-center justify-center text-white tracking-widest"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
          >
            {/* Gambar Awan / Kabut */}
            <img 
              src="/assets/images/awan.png" 
              alt="Kabut" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
            />
            <p className="z-10 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">Memuat memori...</p>
          </motion.div>

          {/* BUKU PELENGKAP SUDUT */}
          <motion.img 
            src="/assets/images/sampul-belakang.png"
            className="absolute top-[15%] left-[15%] -rotate-12 w-[160px] h-[240px] rounded shadow-[6px_12px_25px_rgba(0,0,0,0.8)] object-cover filter brightness-50 pointer-events-none" 
            alt="Buku Pelengkap 1"
          />
          <motion.img 
            src="/assets/images/sampul-belakang.png"
            className="absolute bottom-[20%] right-[20%] rotate-[20deg] w-[160px] h-[240px] rounded shadow-[6px_12px_25px_rgba(0,0,0,0.8)] object-cover filter brightness-50 pointer-events-none" 
            alt="Buku Pelengkap 2"
          />

          {/* BUKU UTAMA (Yang Bercahaya di dasar tumpukan) */}
          <motion.img
            src="/assets/images/sampul-depan.png"
            alt="Sampul Depan"
            className="absolute w-[220px] h-[320px] rounded z-40 cursor-pointer object-cover"
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
          />

          {/* TUMPUKAN PENGHALANG */}
          {tumpukanPenghalang.map((item) => (
            <motion.img
              key={item.id}
              src={item.src} 
              alt={`Penghalang ${item.id}`}
              drag
              dragMomentum={false} 
              initial={{ rotate: item.rotate }}
              whileDrag={{ 
                scale: 1.05, 
                boxShadow: "15px 25px 40px rgba(0,0,0,0.9)",
                cursor: "grabbing"
              }}
              className="absolute rounded cursor-grab object-contain drop-shadow-[8px_12px_15px_rgba(0,0,0,0.8)] select-none pointer-events-auto"
              style={{ 
                width: item.width, 
                height: item.height, 
                zIndex: item.zIndex,
                touchAction: "none" 
              }}
            />
          ))} 

        </motion.div>
      )}

      {/* =========================================
          SCENE 2: TRANSISI CAHAYA PUTIH (FLASH)
          ========================================= */}
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

      {/* =========================================
          SCENE 3: ISI BUKU (SLIDER 3D)
          ========================================= */}
      {isOpened && !showFlash && (
        <motion.div 
          className="absolute inset-0 z-40 bg-[#120f0d] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="relative w-full max-w-[500px] h-[75vh] flex items-center justify-center"
            style={{ perspective: "1500px" }} 
          >
            <AnimatePresence custom={direction}>
              <motion.img
                key={currentPage}
                src={pages[currentPage]}
                custom={direction}
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                alt={`Halaman ${currentPage + 1}`}
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl px-4"
                style={{ backfaceVisibility: "hidden" }}
              />
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 mt-6 z-50">
            <button 
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                currentPage === 0 
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                  : "bg-zinc-700 text-white hover:bg-zinc-600 active:scale-95 shadow-lg"
              }`}
            >
              &larr; Balik
            </button>

            <span className="text-zinc-400 text-sm font-sans tracking-widest">
              {currentPage + 1} / {pages.length}
            </span>

            <button 
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                currentPage === pages.length - 1 
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                  : "bg-yellow-600 text-white hover:bg-yellow-500 active:scale-95 shadow-lg shadow-yellow-900/50"
              }`}
            >
              Lanjut &rarr;
            </button>
          </div>
        </motion.div>
      )}

    </main>
  );
}