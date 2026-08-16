"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // State halaman & arah flip (1 buat maju, -1 buat mundur)
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

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

  // Fungsi navigasi buat ngatur arah 3D flip-nya
  const nextPage = () => {
    setDirection(1); // Flip ke kiri
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  const prevPage = () => {
    setDirection(-1); // Flip ke kanan
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  // ==========================================
  // VARIANTS 3D PAGE FLIP (KUNCI RAHASIANYA DI SINI!)
  // ==========================================
  const flipVariants = {
    initial: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90, // Kalo maju, siap-siap dari sudut kanan 90 derajat
      opacity: 0,
      transformOrigin: dir > 0 ? "right" : "left", // Poros putarannya di pinggir
    }),
    animate: (dir: number) => ({
      rotateY: 0, // Kembali rata
      opacity: 1,
      transformOrigin: dir > 0 ? "right" : "left",
      transition: { duration: 0.6, ease: "easeOut" },
    }),
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90, // Kalo maju, kertas lama kelipet ke kiri (-90 derajat)
      opacity: 0,
      transformOrigin: dir > 0 ? "left" : "right",
      transition: { duration: 0.6, ease: "easeIn" },
    }),
  };

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black font-serif">
      
      {/* SCENE 1: MEJA BERSERAKAN */}
      {!isOpened && (
        <motion.div 
          className="absolute inset-0 bg-[#2b1d14] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] flex items-center justify-center shadow-[inset_0_0_200px_120px_rgba(0,0,0,0.95)]"
          exit={{ opacity: 0 }}
        >
          {/* EFEK KABUT (FOG) */}
          <motion.div
            className="absolute inset-0 bg-black z-[60] pointer-events-none flex items-center justify-center text-white tracking-widest"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
          >
            Memuat memori...
          </motion.div>

          <motion.img 
            src="/assets/images/sampul-belakang.png"
            className="absolute top-[15%] left-[15%] -rotate-12 w-[160px] h-[240px] rounded shadow-[6px_12px_25px_rgba(0,0,0,0.8)] object-cover filter brightness-50" 
            alt="Buku Pelengkap 1"
          />
          <motion.img 
            src="/assets/images/sampul-belakang.png"
            className="absolute bottom-[20%] right-[20%] rotate-[20deg] w-[160px] h-[240px] rounded shadow-[6px_12px_25px_rgba(0,0,0,0.8)] object-cover filter brightness-50" 
            alt="Buku Pelengkap 2"
          />

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

          <motion.div
            drag 
            dragMomentum={false} 
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            animate={isDragging ? { rotate: 7 } : { y: [0, -12, 0], rotate: 7 }}
            transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 0 } }}
            className="absolute w-[230px] h-[330px] bg-zinc-900 border border-zinc-700 rounded z-50 cursor-grab active:cursor-grabbing flex items-center justify-center text-zinc-500 text-sm shadow-[10px_15px_35px_rgba(0,0,0,0.9)] select-none"
            style={{ touchAction: "none" }} 
          >
            Buku Lama (Geser Aku)
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

      {/* SCENE 3: ISI BUKU (DENGAN EFEK 3D FLIP) */}
      {isOpened && !showFlash && (
        <motion.div 
          className="absolute inset-0 z-40 bg-[#120f0d] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 
            CONTAINER HALAMAN 
            Catatan: "perspective: 1500px" itu wajib biar efek 3D rotasinya kerasa 
          */}
          <div 
            className="relative w-full max-w-[500px] h-[75vh] flex items-center justify-center"
            style={{ perspective: "1500px" }} 
          >
            {/* mode="wait" dihapus biar halaman yang masuk sama keluar animasinya jalan barengan */}
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
                /* 
                  Gambar dikasih position: absolute biar pas transisi, 
                  kertas lama sama kertas baru saling numpuk.
                  backfaceVisibility: "hidden" biar belakang kertas ga berbayang aneh.
                */
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl px-4"
                style={{ backfaceVisibility: "hidden" }}
              />
            </AnimatePresence>
          </div>

          {/* NAVIGASI TOMBOL NEXT / PREV */}
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