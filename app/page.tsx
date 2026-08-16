"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // State sekarang ngitung "LEMBAR KERTAS" (0 sampai 5)
  const [currentSheet, setCurrentSheet] = useState(0);

  // FIX BUG "KETIMPA" PAS BALIK:
  // Nyimpen index kertas yang lagi dalam proses animasi (baik maju/mundur),
  // biar selama animasi jalan, kertas itu dikasih z-index PALING TINGGI sementara.
  // Tanpa ini, begitu currentSheet berubah, status isFlipped langsung berubah
  // duluan sebelum rotateY-nya kelar animasi -> kertas keburu dianggap "belum
  // flipped" padahal masih di sudut -90an -> ketutup kertas tetangganya.
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  const pages = [
    "/assets/images/sampul-depan.png",
    "/assets/images/page1.png",
    "/assets/images/page2.png",
    "/assets/images/page3.png",
    "/assets/images/mini-game.png",
    "/assets/images/page-foto.png",
    "/assets/images/message.png",
    "/assets/images/page-music.png",
    "/assets/images/page-kue.png",
    "/assets/images/sampul-belakang.png",
  ];

  const sheets = [
    { front: pages[0], back: pages[1] },
    { front: pages[2], back: pages[3] },
    { front: pages[4], back: pages[5] },
    { front: pages[6], back: pages[7] },
    { front: pages[8], back: pages[9] },
  ];

  const tumpukanPenghalang = [
    { id: 1, src: "/assets/images/kertas-kusam.png", rotate: -15, zIndex: 45, width: 200, height: 280 },
    { id: 2, src: "/assets/images/tiket.png", rotate: 10, zIndex: 46, width: 220, height: 120 },
    { id: 3, src: "/assets/images/buku-catatan.png", rotate: -5, zIndex: 47, width: 225, height: 320 },
    { id: 4, src: "/assets/images/amplop-tua.png", rotate: 7, zIndex: 48, width: 240, height: 160 },
  ];

  // ==========================================
  // SOUND EFFECTS
  // Taro file suara lu di /public/assets/sfx/
  // - page-flip.mp3  : suara kertas dibalik
  // - book-open.mp3  : suara buku dibuka (whoosh)
  // Native Audio API, ringan, gak perlu library tambahan.
  // ==========================================
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const openAudioRef = useRef<HTMLAudioElement | null>(null);

  const playFlipSound = useCallback(() => {
    if (!flipAudioRef.current) {
      flipAudioRef.current = new Audio("/assets/sfx/page-flip.mp3");
    }
    const audio = flipAudioRef.current;
    audio.currentTime = 0;
    audio.volume = 0.55;
    audio.play().catch(() => {
      // Browser kadang block autoplay sebelum ada interaksi user pertama,
      // tapi karena ini dipicu dari onClick, harusnya aman.
    });
  }, []);

  const playOpenSound = useCallback(() => {
    if (!openAudioRef.current) {
      openAudioRef.current = new Audio("/assets/sfx/book-open.wav");
    }
    const audio = openAudioRef.current;
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }, []);

  const handleBookClick = () => {
    setShowFlash(true);
    playOpenSound();
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

  const nextSheet = () => {
    setCurrentSheet((prev) => {
      if (prev >= sheets.length) return prev;
      playFlipSound();
      setAnimatingIndex(prev); // kertas yang lagi maju diflip
      setTimeout(() => setAnimatingIndex(null), 850);
      return prev + 1;
    });
  };

  const prevSheet = () => {
    setCurrentSheet((prev) => {
      if (prev <= 0) return prev;
      playFlipSound();
      setAnimatingIndex(prev - 1); // kertas yang lagi dibalik mundur
      setTimeout(() => setAnimatingIndex(null), 850);
      return prev - 1;
    });
  };

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black font-serif">
      {/* SCENE 1: MEJA BERSERAKAN — tetep render terus, jadi background di belakang buku */}
      <motion.div className="absolute inset-0 bg-[#2b1d14] bg-[url('/assets/images/bg.jpg')] bg-cover bg-center flex items-center justify-center shadow-[inset_0_0_200px_120px_rgba(0,0,0,0.95)]">
        <div className="absolute inset-0 z-[60] pointer-events-none overflow-hidden flex flex-col">
          <motion.div
            className="w-full h-1/2"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
          >
            <img src="/assets/images/awan.png" alt="Kabut Atas" className="w-full h-full object-cover object-bottom opacity-90" />
          </motion.div>

          <motion.div
            className="w-full h-1/2"
            style={{
              WebkitMaskImage: "linear-gradient(to top, black 60%, transparent 100%)",
              maskImage: "linear-gradient(to top, black 60%, transparent 100%)",
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: "100%", opacity: 0 }}
            transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
          >
            <img src="/assets/images/awan.png" alt="Kabut Bawah" className="w-full h-full object-cover object-bottom opacity-90 -scale-y-100" />
          </motion.div>
        </div>

        <motion.img
          src="/assets/images/buku-element.png"
          className="absolute top-[10%] left-[10%] -rotate-12 w-[340px] h-[340px] drop-shadow-[6px_12px_15px_rgba(0,0,0,0.9)] object-contain brightness-50 pointer-events-none"
          animate={{ opacity: isOpened ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.img
          src="/assets/images/buku-element.png"
          className="absolute bottom-[15%] right-[15%] rotate-[20deg] w-[340px] h-[340px] drop-shadow-[6px_12px_15px_rgba(0,0,0,0.9)] object-contain brightness-50 pointer-events-none"
          animate={{ opacity: isOpened ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        />

        {!isOpened && (
          <motion.img
            src="/assets/images/sampul-depan.png"
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
        )}

        {tumpukanPenghalang.map((item) => (
          <motion.img
            key={item.id}
            src={item.src}
            drag={!isOpened}
            dragMomentum={false}
            initial={{ rotate: item.rotate }}
            animate={{ opacity: isOpened ? 0 : 1 }}
            transition={{ opacity: { duration: 0.6 } }}
            whileDrag={{ scale: 1.05, boxShadow: "15px 25px 40px rgba(0,0,0,0.9)", cursor: "grabbing" }}
            className="absolute rounded cursor-grab object-contain drop-shadow-[8px_12px_15px_rgba(0,0,0,0.8)] select-none"
            style={{
              width: item.width,
              height: item.height,
              zIndex: item.zIndex,
              touchAction: "none",
              pointerEvents: isOpened ? "none" : "auto",
            }}
          />
        ))}
      </motion.div>

      {/* SCENE 2: FLASH */}
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

      {/* SCENE 3: REAL 3D BOOK FLIP */}
      {isOpened && !showFlash && (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 w-[350px] h-[500px] md:w-[400px] md:h-[600px] rounded-lg ring-1 ring-black/10 drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
            style={{ perspective: "2500px", y: "-50%" }}
            animate={{ x: currentSheet === 0 ? "-50%" : currentSheet === sheets.length ? "50%" : "0%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {sheets.map((sheet, index) => {
              const isFlipped = index < currentSheet;
              const isClickable = index === currentSheet || index === currentSheet - 1;
              const isAnimating = animatingIndex === index;

              // FIX Z-INDEX SAAT PREV:
              // Selama kertas ini masih dalam proses animasi (maju ATAU mundur),
              // paksa dia jadi paling atas biar gak ketimpa kertas tetangga
              // di tengah-tengah rotasi. Begitu animasi kelar, balik ke aturan normal.
              let zIndex: number;
              if (isAnimating) {
                zIndex = 999;
              } else if (isFlipped) {
                zIndex = sheets.length + index;
              } else {
                zIndex = sheets.length - index;
              }

              return (
                <motion.div
                  key={index}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                    zIndex,
                    pointerEvents: isClickable ? "auto" : "none",
                    cursor: isClickable ? "pointer" : "default",
                  }}
                  initial={false}
                  animate={{ rotateY: isFlipped ? -180 : 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  onClick={() => {
                    if (!isClickable) return;
                    isFlipped ? prevSheet() : nextSheet();
                  }}
                >
                  {/* SISI DEPAN KERTAS (Halaman Kanan) */}
                  <div
                    className="absolute inset-0 bg-[#f4e8d4] rounded-r-lg overflow-hidden border border-black/20"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <img src={sheet.front} className="w-full h-full object-cover" alt="Front" />
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-gradient-to-l from-black/25 to-transparent z-10 pointer-events-none" />
                    {/* PAGE CURL SHADOW DINAMIS
                        Muncul cuma pas kertas ini lagi dianimasikan, opacity-nya
                        naik-turun ngikutin fase animasi (paling gelap pas kertas
                        tegak lurus di tengah putaran ~90deg, transparan di awal/akhir). */}
                    {isAnimating && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/40 to-black/0 pointer-events-none z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0] }}
                        transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] }}
                      />
                    )}
                  </div>

                  {/* SISI BELAKANG KERTAS (Halaman Kiri) */}
                  <div
                    className="absolute inset-0 bg-[#f4e8d4] rounded-l-lg overflow-hidden border border-black/20"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <img src={sheet.back} className="w-full h-full object-cover" alt="Back" />
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-r from-black/25 to-transparent z-10 pointer-events-none" />
                    {isAnimating && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-l from-black/0 via-black/40 to-black/0 pointer-events-none z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0] }}
                        transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] }}
                      />
                    )}
                  </div>

                  {/* Ambient contact shadow yang jatuh ke kertas di baliknya selama animasi */}
                  {isAnimating && (
                    <motion.div
                      className="absolute inset-0 bg-black pointer-events-none"
                      style={{ transformStyle: "preserve-3d" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.25, 0] }}
                      transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* TOMBOL NAVIGASI */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 z-50">
            <button
              onClick={prevSheet}
              disabled={currentSheet === 0}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                currentSheet === 0
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-zinc-700 text-white hover:bg-zinc-600 active:scale-95 shadow-lg"
              }`}
            >
              &larr; Balik
            </button>

            <span className="text-zinc-400 text-sm font-sans tracking-widest">
              {currentSheet} / {sheets.length}
            </span>

            <button
              onClick={nextSheet}
              disabled={currentSheet === sheets.length}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                currentSheet === sheets.length
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-yellow-600 text-white hover:bg-yellow-500 active:scale-95 shadow-lg shadow-yellow-900/50"
              }`}
            >
              Lanjut &rarr;
            </button>
          </div>
        </div>
      )}
    </main>
  );
}