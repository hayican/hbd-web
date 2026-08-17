// app/components/MessagePage.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- Import createPortal
import { motion, AnimatePresence } from "framer-motion";
import { EB_Garamond } from "next/font/google";

// Inisialisasi Font EB Garamond
const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export default function MessagePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mencegah error hydration di Next.js saat menggunakan createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className="absolute inset-0 flex flex-col justify-center z-10 pb-40 pl-8 overflow-hidden select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ==========================================
          1. AMPLOP DI HALAMAN BUKU
         ========================================== */}
      <div
        className="flex flex-col items-center cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <motion.img
          key={isOpen ? "open" : "closed"}
          src={isOpen ? "/assets/images/amplop-buka.png" : "/assets/images/amplop-tua.png"}
          alt={isOpen ? "Amplop Terbuka" : "Amplop Tertutup"}
          className="w-56 sm:w-64 h-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] transition-transform"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.92, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
        
        <p className={`${ebGaramond.className} text-xl md:text-1xl text-[#111111] font-semibold tracking-wide mt-4 `}>
          {isOpen ? "Ketuk untuk melihat surat lagi" : "Ketuk untuk membuka surat"}
        </p>
      </div>

      {/* ==========================================
          2. POP-UP SURAT FULLSCREEN (PORTAL)
         ========================================== */}
      {/* createPortal memindahkan pop-up ini keluar dari komponen buku langsung ke <body> agar bisa full layar */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              {/* Box Pop-up Surat */}
              <motion.div
                initial={{ scale: 0.75, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.75, y: 30, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 260 }}
                className="relative max-w-[95vw] md:max-w-[600px] flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Tombol Tutup '✕' */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-10 h-10 flex items-center justify-center bg-zinc-900/90 hover:bg-red-900 text-white rounded-full text-lg font-bold transition-all shadow-xl active:scale-95 border border-white/20 z-50"
                >
                  ✕
                </button>

                {/* Gambar Desain Surat */}
                <img
                  src="/assets/images/surat.png"
                  alt="Surat"
                  className="w-full h-auto max-h-[90vh] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] rounded-lg"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}