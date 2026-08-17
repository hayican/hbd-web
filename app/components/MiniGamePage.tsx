// app/components/MiniGamePage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom"; // <-- Ditambahkan
import { Architects_Daughter } from "next/font/google";

const architectsDaughter = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
});

// ============================================================================
// 1. ENGINE GAME: SKY JUMP
// ============================================================================
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.4;
const JUMP_STRENGTH = 10.5;
const PLATFORM_WIDTH = 65;
const PLATFORM_HEIGHT = 12;
const CHAR_RADIUS = 15;

type SkyGameStatus = "idle" | "playing" | "won" | "lost";

function SkyJumpGame({ onWin, onClose, targetScore = 50 }: { onWin: () => void, onClose: () => void, targetScore?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<SkyGameStatus>("idle");

  const engine = useRef<{
    status: SkyGameStatus;
    score: number;
    mouseX: number;
    cameraY: number;
    char: { x: number; y: number; vy: number };
    platforms: Array<{ x: number; y: number; moving: boolean; vx: number; index: number }>;
  }>({
    status: "idle",
    score: 0,
    mouseX: CANVAS_WIDTH / 2,
    cameraY: 0,
    char: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vy: 0 },
    platforms: [],
  });

  const initGame = useCallback(() => {
    const initialPlatforms = [];
    let currentY = CANVAS_HEIGHT - 20;

    initialPlatforms.push({ x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2, y: currentY, moving: false, vx: 0, index: 0 });

    for (let i = 1; i < 12; i++) {
      currentY -= Math.random() * 40 + 70;
      const isMoving = Math.random() < 0.25;
      initialPlatforms.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: currentY,
        moving: isMoving,
        vx: isMoving ? (Math.random() > 0.5 ? 1.5 : -1.5) : 0,
        index: i,
      });
    }

    engine.current = {
      status: "playing",
      score: 0,
      mouseX: CANVAS_WIDTH / 2,
      cameraY: 0,
      char: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100, vy: -JUMP_STRENGTH },
      platforms: initialPlatforms,
    };

    setGameState("playing");
  }, []);

  const gameLoop = useCallback(() => {
    const state = engine.current;
    if (state.status !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    state.char.vy += GRAVITY;
    state.char.y += state.char.vy;
    state.char.x += (state.mouseX - state.char.x) * 0.2;

    if (state.char.x < CHAR_RADIUS) state.char.x = CHAR_RADIUS;
    if (state.char.x > CANVAS_WIDTH - CHAR_RADIUS) state.char.x = CANVAS_WIDTH - CHAR_RADIUS;

    if (state.char.vy > 0) {
      for (const p of state.platforms) {
        if (
          state.char.x + CHAR_RADIUS > p.x &&
          state.char.x - CHAR_RADIUS < p.x + PLATFORM_WIDTH &&
          state.char.y + CHAR_RADIUS >= p.y &&
          state.char.y + CHAR_RADIUS <= p.y + state.char.vy + 5
        ) {
          state.char.vy = -JUMP_STRENGTH;
          if (p.index > state.score) {
            state.score = p.index;
          }
        }
      }
    }

    if (state.char.y < CANVAS_HEIGHT / 2.2) {
      const diff = CANVAS_HEIGHT / 2.2 - state.char.y;
      state.char.y = CANVAS_HEIGHT / 2.2;
      state.cameraY += diff;
      state.platforms.forEach((p) => (p.y += diff));
    }

    state.platforms.forEach((p) => {
      if (p.moving) {
        p.x += p.vx;
        if (p.x < 0 || p.x + PLATFORM_WIDTH > CANVAS_WIDTH) p.vx *= -1;
      }
    });

    state.platforms = state.platforms.filter((p) => p.y < CANVAS_HEIGHT + 50);
    const highestY = Math.min(...state.platforms.map((p) => p.y));
    const highestIndex = Math.max(...state.platforms.map((p) => p.index));

    if (highestY > 0) {
      const isMoving = Math.random() < Math.min(0.2 + state.score * 0.01, 0.6);
      state.platforms.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: highestY - (Math.random() * 45 + 75),
        moving: isMoving,
        vx: isMoving ? (Math.random() > 0.5 ? 2 : -2) : 0,
        index: highestIndex + 1,
      });
    }

    if (state.char.y > CANVAS_HEIGHT + 20) {
      state.status = "lost";
      setGameState("lost");
      return;
    }

    if (state.score >= targetScore) {
      state.status = "won";
      setGameState("won");
      onWin();
      return;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#7C1E1F";
    state.platforms.forEach((p) => {
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT, 5);
      ctx.fill();
      ctx.fillStyle = "#5A1516"; 
      ctx.fillRect(p.x, p.y + PLATFORM_HEIGHT - 3, PLATFORM_WIDTH, 3);
      ctx.fillStyle = "#7C1E1F";
    });

    ctx.fillStyle = "#e2b765";
    ctx.beginPath();
    ctx.arc(state.char.x, state.char.y, CHAR_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(state.char.x - 5, state.char.y - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(state.char.x + 5, state.char.y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [targetScore, onWin]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || engine.current.status !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    engine.current.mouseX = x;
  };

  return (
    <div className="relative w-full max-w-[360px] md:max-w-[400px] flex flex-col items-center justify-center p-4 bg-[#2b1d14]/90 border border-yellow-600/30 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerMove={handlePointerMove}
        className="w-full h-auto aspect-[2/3] bg-gradient-to-b from-[#f4e8d4] to-[#f9f3e9] rounded-2xl shadow-inner border-2 border-[#7C1E1F]/30 touch-none cursor-crosshair"
      />

      {gameState !== "playing" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-3xl p-6 text-center">
          <div className="bg-[#fcfbf7] p-6 rounded-2xl border-4 border-[#7C1E1F] drop-shadow-xl max-w-[260px] w-full">
            {gameState === "idle" && (
              <>
                <h2 className="text-2xl font-bold text-[#7C1E1F] mb-2 font-serif">Sky Jump</h2>
                <p className="text-sm text-zinc-600 mb-5 leading-relaxed font-sans">
                  Geser ke <strong>Kiri/Kanan</strong> untuk melompat.<br/>
                  Lompat terus sampai mencapai puncak!
                </p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#e2b765] hover:bg-[#d4a854] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md font-sans">Mulai Main</button>
              </>
            )}
            {gameState === "lost" && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2 font-serif">Yaah Jatuh!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">Jangan menyerah, coba lompat lagi!</p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#7C1E1F] hover:bg-[#5A1516] text-white font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Coba Lagi 🔄</button>
              </>
            )}
            {gameState === "won" && (
              <>
                <div className="text-4xl mb-2 animate-bounce">🏆</div>
                <h2 className="text-xl font-bold text-[#7C1E1F] mb-1 font-serif">Berhasil!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">Hebat! Kamu berhasil mencapai puncak tertinggi.</p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#e2b765] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Main Lagi</button>
                <button onClick={onClose} className="w-full py-2 text-sm text-zinc-500 font-bold hover:text-zinc-700 font-sans">Tutup Game</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. ENGINE GAME: TEBAK GELAS (SHELL GAME)
// ============================================================================
type ShellGameStatus = "idle" | "showing" | "shuffling" | "guessing" | "reveal" | "won" | "lost";

function TebakGelasGame({ onWin, onClose, roundsToWin = 3 }: { onWin: () => void, onClose: () => void, roundsToWin?: number }) {
  const [gameState, setGameState] = useState<ShellGameStatus>("idle");
  const [score, setScore] = useState(0);
  
  const [cupPositions, setCupPositions] = useState([0, 1, 2]);
  const [targetCup, setTargetCup] = useState(1);
  const [guessedCup, setGuessedCup] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const doShuffle = (currentScore: number) => {
    let count = 0;
    const totalSwaps = 10 + Math.floor(Math.random() * 5);
    const speed = Math.max(160, 450 - (currentScore * 80));

    const shuffleInterval = window.setInterval(() => {
      count++;
      setCupPositions((prev) => {
        const newCups = [...prev];
        let p1 = Math.floor(Math.random() * 3);
        let p2 = Math.floor(Math.random() * 3);
        while (p1 === p2) p2 = Math.floor(Math.random() * 3);

        const cupIndex1 = newCups.findIndex(c => c === p1);
        const cupIndex2 = newCups.findIndex(c => c === p2);

        newCups[cupIndex1] = p2;
        newCups[cupIndex2] = p1;
        return newCups;
      });

      if (count >= totalSwaps) {
        window.clearInterval(shuffleInterval);
        setGameState("guessing");
      }
    }, speed);
  };

  const startRound = useCallback((currentScore: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    setScore(currentScore);
    setGuessedCup(null);
    setCupPositions([0, 1, 2]);
    setTargetCup(Math.floor(Math.random() * 3));
    setGameState("showing");

    timerRef.current = window.setTimeout(() => {
      setGameState("shuffling");
      doShuffle(currentScore);
    }, 1800);
  }, []);

  const handleGuess = (cupId: number) => {
    if (gameState !== "guessing") return;

    setGuessedCup(cupId);
    setGameState("reveal");

    timerRef.current = window.setTimeout(() => {
      if (cupId === targetCup) {
        const newScore = score + 1;
        if (newScore >= roundsToWin) {
          setGameState("won");
          onWin();
        } else {
          startRound(newScore);
        }
      } else {
        setGameState("lost");
      }
    }, 1600);
  };

  return (
    <div 
      className="relative w-full max-w-[360px] md:max-w-[400px] h-[550px] flex flex-col items-center p-4 bg-[#2b1d14]/90 border border-yellow-600/30 rounded-3xl shadow-2xl overflow-hidden select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full flex justify-between items-center bg-[#fcfbf7] px-5 py-3 rounded-2xl mb-12 shadow-inner border-2 border-[#7C1E1F]/20">
        <div className="text-[#7C1E1F] font-bold font-sans">
          Berhasil: <span className="text-xl">{score}/{roundsToWin}</span>
        </div>
        <div className="font-bold text-sm font-sans text-zinc-500 uppercase tracking-wider">
          {gameState === "showing" ? "Perhatikan!" : gameState === "shuffling" ? "Mengacak..." : gameState === "guessing" ? "Pilih Gelas!" : "Tebak Gelas"}
        </div>
      </div>

      <div className="relative w-full h-[250px] flex items-center justify-center mt-10">
        {[0, 1, 2].map((cupId) => {
          const pos = cupPositions[cupId];
          const translateX = (pos - 1) * 105; 
          
          const isLifted = 
            (gameState === "showing" && cupId === targetCup) || 
            (gameState === "reveal" && (cupId === guessedCup || cupId === targetCup)) || 
            gameState === "won";

          return (
            <div
              key={cupId}
              className={`absolute flex flex-col items-center justify-end h-48 w-24 transition-transform ease-in-out cursor-pointer ${gameState === "shuffling" ? "duration-200" : "duration-500"}`}
              style={{ transform: `translateX(${translateX}px)` }}
              onClick={() => handleGuess(cupId)}
            >
              {cupId === targetCup && (
                <div 
                  className={`absolute bottom-4 text-5xl z-10 transition-all duration-300 ${
                    isLifted ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
                  }`}
                >
                  🐹
                </div>
              )}
              
              <div 
                className={`absolute bottom-0 text-[95px] z-20 select-none drop-shadow-2xl transition-transform duration-500 ease-in-out
                  ${isLifted ? "-translate-y-24" : "translate-y-0"}
                  ${gameState === "guessing" ? "hover:-translate-y-3" : ""}
                `}
              >
                🥤
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-[20px] w-full h-8 bg-[#4d3220] rounded-[100%] blur-[4px] opacity-60 -z-10"></div>
      </div>

      {["idle", "won", "lost"].includes(gameState) && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-3xl p-6 text-center">
          <div className="bg-[#fcfbf7] p-6 rounded-2xl border-4 border-[#7C1E1F] drop-shadow-xl max-w-[260px] w-full">
            {gameState === "idle" && (
              <>
                <h2 className="text-2xl font-bold text-[#7C1E1F] mb-2 font-serif">Tebak Gelas</h2>
                <p className="text-sm text-zinc-600 mb-5 leading-relaxed font-sans">
                  Perhatikan di gelas 🥤 mana hamster 🐹 bersembunyi. Jangan sampai terkecoh saat diacak!<br/><br/>
                  Tebak benar <strong>{roundsToWin} kali</strong> untuk menang.
                </p>
                <button onClick={() => startRound(0)} className="w-full py-2.5 bg-[#e2b765] hover:bg-[#d4a854] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md font-sans">Mulai Main</button>
              </>
            )}

            {gameState === "lost" && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2 font-serif">Salah Tebak!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">
                  Hamsternya bukan di situ.<br/>Skor kamu: <span className="font-bold text-lg">{score}</span>
                </p>
                <button onClick={() => startRound(0)} className="w-full py-2.5 bg-[#7C1E1F] hover:bg-[#5A1516] text-white font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Coba Lagi 🔄</button>
              </>
            )}

            {gameState === "won" && (
              <>
                <div className="text-4xl mb-2 animate-bounce">🎩</div>
                <h2 className="text-xl font-bold text-[#7C1E1F] mb-1 font-serif">Mata Pesulap!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">Hebat! Kamu tidak terkecoh triknya.</p>
                <button onClick={() => startRound(0)} className="w-full py-2.5 bg-[#e2b765] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Main Lagi</button>
                <button onClick={onClose} className="w-full py-2 text-sm text-zinc-500 font-bold hover:text-zinc-700 font-sans">Tutup Game</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. ENGINE GAME: CLIFF DASH (ENDLESS RUNNER)
// ============================================================================
type CliffGameStatus = "idle" | "playing" | "won" | "lost";

const RUNNER_WIDTH = 400;
const RUNNER_HEIGHT = 270;
const GROUND_Y = 220;
const RUNNER_GRAVITY = 0.62;
const RUNNER_JUMP = -11.5;

function CliffDashGame({ onWin, onClose, targetDuration = 20 }: { onWin: () => void, onClose: () => void, targetDuration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<CliffGameStatus>("idle");
  const [displayTime, setDisplayTime] = useState(0);

  const engine = useRef<{
    status: CliffGameStatus;
    startTime: number;
    timeElapsed: number;
    char: { x: number; y: number; vy: number; isGrounded: boolean; size: number };
    obstacles: Array<{ x: number; y: number; width: number; height: number; type: "spike" | "rock" }>;
    spawnTimer: number;
    particles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number }>;
  }>({
    status: "idle",
    startTime: 0,
    timeElapsed: 0,
    char: { x: 55, y: GROUND_Y - 30, vy: 0, isGrounded: true, size: 30 },
    obstacles: [],
    spawnTimer: 60,
    particles: [],
  });

  const jump = useCallback(() => {
    const state = engine.current;
    if (state.status !== "playing") return;

    if (state.char.isGrounded) {
      state.char.vy = RUNNER_JUMP;
      state.char.isGrounded = false;

      for (let i = 0; i < 5; i++) {
        state.particles.push({
          x: state.char.x + 8,
          y: GROUND_Y - 2,
          vx: -Math.random() * 3 - 1,
          vy: -Math.random() * 2,
          alpha: 1,
          size: Math.random() * 4 + 2,
        });
      }
    }
  }, []);

  const initGame = useCallback(() => {
    engine.current = {
      status: "playing",
      startTime: performance.now(),
      timeElapsed: 0,
      char: { x: 55, y: GROUND_Y - 30, vy: 0, isGrounded: true, size: 30 },
      obstacles: [],
      spawnTimer: 70,
      particles: [],
    };

    setDisplayTime(0);
    setGameState("playing");
  }, []);

  const gameLoop = useCallback(() => {
    const state = engine.current;
    if (state.status !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    state.timeElapsed = (performance.now() - state.startTime) / 1000;
    const currentSeconds = Math.min(targetDuration, Math.floor(state.timeElapsed));
    setDisplayTime(currentSeconds);

    if (state.timeElapsed >= targetDuration) {
      state.status = "won";
      setGameState("won");
      onWin();
      return;
    }

    const currentSpeed = 4.2 + (state.timeElapsed / targetDuration) * 2.8;

    state.char.vy += RUNNER_GRAVITY;
    state.char.y += state.char.vy;

    if (state.char.y >= GROUND_Y - state.char.size) {
      state.char.y = GROUND_Y - state.char.size;
      state.char.vy = 0;
      state.char.isGrounded = true;
    }

    state.spawnTimer--;
    if (state.spawnTimer <= 0) {
      const isSpike = Math.random() > 0.45;
      state.obstacles.push({
        x: RUNNER_WIDTH + 20,
        y: isSpike ? GROUND_Y - 24 : GROUND_Y - 30,
        width: isSpike ? 24 : 30,
        height: isSpike ? 24 : 30,
        type: isSpike ? "spike" : "rock",
      });
      state.spawnTimer = Math.floor(Math.random() * 45 + Math.max(45, 90 - state.timeElapsed * 1.8));
    }

    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obs = state.obstacles[i];
      obs.x -= currentSpeed;

      const pad = 5;
      const charBox = {
        left: state.char.x + pad,
        right: state.char.x + state.char.size - pad,
        top: state.char.y + pad,
        bottom: state.char.y + state.char.size - pad,
      };
      const obsBox = {
        left: obs.x + 3,
        right: obs.x + obs.width - 3,
        top: obs.y + 3,
        bottom: obs.y + obs.height,
      };

      if (
        charBox.right > obsBox.left &&
        charBox.left < obsBox.right &&
        charBox.bottom > obsBox.top &&
        charBox.top < obsBox.bottom
      ) {
        state.status = "lost";
        setGameState("lost");
        return;
      }

      if (obs.x + obs.width < -20) {
        state.obstacles.splice(i, 1);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
      }
    }

    ctx.clearRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);

    ctx.fillStyle = "#3d2214";
    ctx.fillRect(0, GROUND_Y, RUNNER_WIDTH, RUNNER_HEIGHT - GROUND_Y);
    ctx.fillStyle = "#7C1E1F";
    ctx.fillRect(0, GROUND_Y, RUNNER_WIDTH, 4);

    state.particles.forEach((p) => {
      ctx.fillStyle = `rgba(180, 140, 100, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    state.obstacles.forEach((obs) => {
      if (obs.type === "spike") {
        ctx.fillStyle = "#7C1E1F";
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#5A1516";
        ctx.fillRect(obs.x + 2, obs.y + obs.height - 3, obs.width - 4, 3);
      } else {
        ctx.fillStyle = "#634735";
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
        ctx.fill();
        ctx.fillStyle = "#472f21";
        ctx.fillRect(obs.x + 3, obs.y + obs.height - 4, obs.width - 6, 4);
      }
    });

    ctx.fillStyle = "#e2b765";
    ctx.beginPath();
    ctx.roundRect(state.char.x, state.char.y, state.char.size, state.char.size, 8);
    ctx.fill();

    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(state.char.x + 20, state.char.y + 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9777f";
    ctx.beginPath();
    ctx.arc(state.char.x + 25, state.char.y + 15, 2, 0, Math.PI * 2);
    ctx.fill();

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [targetDuration, onWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  return (
    <div 
      className="relative w-full max-w-[360px] md:max-w-[400px] flex flex-col items-center p-4 bg-[#2b1d14]/90 border border-yellow-600/30 rounded-3xl shadow-2xl select-none"
      onClick={(e) => {
        e.stopPropagation();
        jump();
      }}
    >
      <div className="w-full flex justify-between items-center bg-[#fcfbf7] px-5 py-3 rounded-2xl mb-4 shadow-inner border-2 border-[#7C1E1F]/20">
        <div className="text-[#7C1E1F] font-bold font-sans">
          Bertahan: <span className="text-xl font-extrabold">{displayTime}s / {targetDuration}s</span>
        </div>
        <div className="font-bold text-xs font-sans text-zinc-500 uppercase tracking-wider">
          Tap / Spasi untuk Lompat
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={RUNNER_WIDTH}
        height={RUNNER_HEIGHT}
        className="w-full h-auto aspect-[4/2.7] bg-gradient-to-b from-[#f4e8d4] to-[#f9f3e9] rounded-2xl shadow-inner border-2 border-[#7C1E1F]/30 touch-none cursor-pointer"
      />

      {gameState !== "playing" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-3xl p-6 text-center">
          <div className="bg-[#fcfbf7] p-6 rounded-2xl border-4 border-[#7C1E1F] drop-shadow-xl max-w-[260px] w-full" onClick={(e) => e.stopPropagation()}>
            {gameState === "idle" && (
              <>
                <h2 className="text-2xl font-bold text-[#7C1E1F] mb-2 font-serif">Cliff Dash</h2>
                <p className="text-sm text-zinc-600 mb-5 leading-relaxed font-sans">
                  <strong>Tap Layar</strong> atau tekan <strong>Spasi</strong> untuk melompat melewati rintangan!<br/><br/>
                  Bertahan selama <strong>{targetDuration} detik</strong> untuk menang.
                </p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#e2b765] hover:bg-[#d4a854] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md font-sans">Mulai Lari</button>
              </>
            )}

            {gameState === "lost" && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2 font-serif">Tertabrak!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">
                  Waktu bertahan: <span className="font-bold text-lg">{displayTime}s</span>
                </p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#7C1E1F] hover:bg-[#5A1516] text-white font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Coba Lagi 🔄</button>
              </>
            )}

            {gameState === "won" && (
              <>
                <div className="text-4xl mb-2 animate-bounce">🏃‍♂️💨</div>
                <h2 className="text-xl font-bold text-[#7C1E1F] mb-1 font-serif">Pelari Handal!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">Hebat! Kamu berhasil bertahan sampai garis akhir.</p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#e2b765] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Main Lagi</button>
                <button onClick={onClose} className="w-full py-2 text-sm text-zinc-500 font-bold hover:text-zinc-700 font-sans">Tutup Game</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. ENGINE GAME: COIN GRABBER (NANGKEP KOIN)
// ============================================================================
type GrabberGameStatus = "idle" | "playing" | "won" | "lost";

const GRABBER_WIDTH = 400;
const GRABBER_HEIGHT = 500;
const BASKET_WIDTH = 70;
const BASKET_HEIGHT = 30;
const COIN_RADIUS = 12;

function CoinGrabberGame({ onWin, onClose, targetScore = 15, timeLimit = 30 }: { onWin: () => void, onClose: () => void, targetScore?: number, timeLimit?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GrabberGameStatus>("idle");
  const [displayScore, setDisplayScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const engine = useRef<{
    status: GrabberGameStatus;
    score: number;
    startTime: number;
    mouseX: number;
    basket: { x: number; y: number };
    coins: Array<{ x: number; y: number; vy: number }>;
    spawnTimer: number;
    particles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number; isGold: boolean }>;
  }>({
    status: "idle",
    score: 0,
    startTime: 0,
    mouseX: GRABBER_WIDTH / 2,
    basket: { x: GRABBER_WIDTH / 2 - BASKET_WIDTH / 2, y: GRABBER_HEIGHT - 60 },
    coins: [],
    spawnTimer: 0,
    particles: [],
  });

  const initGame = useCallback(() => {
    engine.current = {
      status: "playing",
      score: 0,
      startTime: performance.now(),
      mouseX: GRABBER_WIDTH / 2,
      basket: { x: GRABBER_WIDTH / 2 - BASKET_WIDTH / 2, y: GRABBER_HEIGHT - 60 },
      coins: [],
      spawnTimer: 20,
      particles: [],
    };
    setDisplayScore(0);
    setTimeLeft(timeLimit);
    setGameState("playing");
  }, [timeLimit]);

  const gameLoop = useCallback(() => {
    const state = engine.current;
    if (state.status !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Timer Logik
    const timeElapsed = (performance.now() - state.startTime) / 1000;
    const currentSeconds = Math.max(0, timeLimit - Math.floor(timeElapsed));
    setTimeLeft(currentSeconds);

    if (currentSeconds <= 0) {
      if (state.score >= targetScore) {
        state.status = "won";
        setGameState("won");
        onWin();
      } else {
        state.status = "lost";
        setGameState("lost");
      }
      return;
    }

    // Gerakan Wadah (Basket) mengikuti mouse dengan sedikit Easing
    const targetX = state.mouseX - BASKET_WIDTH / 2;
    state.basket.x += (targetX - state.basket.x) * 0.3;

    if (state.basket.x < 0) state.basket.x = 0;
    if (state.basket.x > GRABBER_WIDTH - BASKET_WIDTH) state.basket.x = GRABBER_WIDTH - BASKET_WIDTH;

    // Spawn Koin
    state.spawnTimer--;
    if (state.spawnTimer <= 0) {
      state.coins.push({
        x: COIN_RADIUS + Math.random() * (GRABBER_WIDTH - COIN_RADIUS * 2),
        y: -20,
        vy: 3 + Math.random() * 3 + (state.score * 0.1), // Makin lama makin cepet dikit
      });
      state.spawnTimer = Math.max(15, 45 - state.score * 1.5);
    }

    // Update Koin
    for (let i = state.coins.length - 1; i >= 0; i--) {
      const c = state.coins[i];
      c.y += c.vy;

      // Deteksi Tabrakan Koin & Wadah
      if (
        c.y + COIN_RADIUS > state.basket.y &&
        c.y - COIN_RADIUS < state.basket.y + BASKET_HEIGHT &&
        c.x + COIN_RADIUS > state.basket.x &&
        c.x - COIN_RADIUS < state.basket.x + BASKET_WIDTH
      ) {
        state.score++;
        setDisplayScore(state.score);
        state.coins.splice(i, 1);

        // Efek Partikel Tangkap
        for (let j = 0; j < 6; j++) {
          state.particles.push({
            x: c.x,
            y: c.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            alpha: 1,
            size: Math.random() * 3 + 2,
            isGold: Math.random() > 0.5,
          });
        }

        // Cek Langsung Menang (opsional, jika ingin langsung menang tanpa nunggu timer)
        if (state.score >= targetScore) {
            state.status = "won";
            setGameState("won");
            onWin();
            return;
        }

        continue;
      }

      // Hapus Koin yang lewat bawah layar
      if (c.y > GRABBER_HEIGHT + 20) {
        state.coins.splice(i, 1);
      }
    }

    // Update Partikel
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.05;
      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // === DRAWING ===
    ctx.clearRect(0, 0, GRABBER_WIDTH, GRABBER_HEIGHT);

    // Koin
    state.coins.forEach(c => {
      ctx.fillStyle = "#FFD700"; // Gold
      ctx.beginPath();
      ctx.arc(c.x, c.y, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#DAA520"; // Inner
      ctx.beginPath();
      ctx.arc(c.x, c.y, COIN_RADIUS - 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Wadah
    ctx.fillStyle = "#7C1E1F";
    ctx.beginPath();
    ctx.roundRect(state.basket.x, state.basket.y, BASKET_WIDTH, BASKET_HEIGHT, [4, 4, 12, 12]);
    ctx.fill();
    ctx.fillStyle = "#5A1516";
    ctx.fillRect(state.basket.x + 4, state.basket.y + 4, BASKET_WIDTH - 8, BASKET_HEIGHT - 8);

    // Partikel
    state.particles.forEach(p => {
      ctx.fillStyle = p.isGold ? `rgba(255, 215, 0, ${p.alpha})` : `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [targetScore, timeLimit, onWin]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || engine.current.status !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GRABBER_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    engine.current.mouseX = x;
  };

  return (
    <div 
      className="relative w-full max-w-[360px] md:max-w-[400px] flex flex-col items-center p-4 bg-[#2b1d14]/90 border border-yellow-600/30 rounded-3xl shadow-2xl select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full flex justify-between items-center bg-[#fcfbf7] px-5 py-3 rounded-2xl mb-4 shadow-inner border-2 border-[#7C1E1F]/20">
        <div className="text-[#7C1E1F] font-bold font-sans flex items-center gap-2">
          <span>Skor:</span>
          <span className="text-xl font-extrabold">{displayScore}</span>
          <span className="text-zinc-400 text-sm">/ {targetScore}</span>
        </div>
        <div className={`font-bold text-lg font-sans ${timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-zinc-700"}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={GRABBER_WIDTH}
        height={GRABBER_HEIGHT}
        onPointerMove={handlePointerMove}
        className="w-full h-auto aspect-[4/5] bg-gradient-to-b from-[#f4e8d4] to-[#f9f3e9] rounded-2xl shadow-inner border-2 border-[#7C1E1F]/30 touch-none cursor-ew-resize"
      />

      {/* OVERLAY MENU (Idle / Menang / Kalah) */}
      {gameState !== "playing" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-3xl p-6 text-center">
          <div className="bg-[#fcfbf7] p-6 rounded-2xl border-4 border-[#7C1E1F] drop-shadow-xl max-w-[260px] w-full" onClick={(e) => e.stopPropagation()}>
            {gameState === "idle" && (
              <>
                <h2 className="text-2xl font-bold text-[#7C1E1F] mb-2 font-serif">Coin Grabber</h2>
                <p className="text-sm text-zinc-600 mb-5 leading-relaxed font-sans">
                  <strong>Geser Kiri/Kanan</strong> untuk menangkap koin yang jatuh!<br/><br/>
                  Kumpulkan <strong>{targetScore} Koin</strong> sebelum waktu habis.
                </p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#e2b765] hover:bg-[#d4a854] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md font-sans">Mulai Tangkap</button>
              </>
            )}

            {gameState === "lost" && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2 font-serif">Waktu Habis!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">
                  Koin terkumpul: <span className="font-bold text-lg">{displayScore}</span>
                </p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#7C1E1F] hover:bg-[#5A1516] text-white font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Coba Lagi 🔄</button>
              </>
            )}

            {gameState === "won" && (
              <>
                <div className="text-4xl mb-2 animate-bounce">🪙</div>
                <h2 className="text-xl font-bold text-[#7C1E1F] mb-1 font-serif">Kaya Raya!</h2>
                <p className="text-zinc-600 mb-4 text-sm font-sans">Hebat! Target koin berhasil dikumpulkan.</p>
                <button onClick={initGame} className="w-full py-2.5 bg-[#e2b765] text-[#5d1725] font-bold rounded-full transition-transform active:scale-95 shadow-md mb-2 font-sans">Main Lagi</button>
                <button onClick={onClose} className="w-full py-2 text-sm text-zinc-500 font-bold hover:text-zinc-700 font-sans">Tutup Game</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. KOMPONEN HALAMAN UTAMA: MENU MINI GAME
// ============================================================================
export default function MiniGamePage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Mencegah interaksi tembus ke elemen di bawahnya
  const handleWrapperClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center pt-16 px-8 pb-12 z-20 overflow-hidden select-none"
      onClick={handleWrapperClick}
    >
      {/* POP-UP OVERLAY UNTUK SEMUA GAME */}
      {activeGame !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={handleWrapperClick}
        >
          <div className="w-full max-w-[360px] md:max-w-[400px] flex justify-between items-center mb-3 px-1">
            <button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full text-xs md:text-sm font-sans font-semibold transition-all shadow-md active:scale-95 border border-white/10"
            >
              <span>&larr;</span> Kembali ke Menu
            </button>
            <button
              onClick={() => setActiveGame(null)}
              className="w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-red-900/80 text-white rounded-full text-sm font-bold transition-all shadow-md active:scale-95 border border-white/10"
            >
              ✕
            </button>
          </div>

          {activeGame === "skyjump" && (
            <SkyJumpGame 
              targetScore={50} 
              onWin={() => {}} 
              onClose={() => setActiveGame(null)} 
            />
          )}

          {activeGame === "tebakgelas" && (
            <TebakGelasGame 
              roundsToWin={3} 
              onWin={() => {}} 
              onClose={() => setActiveGame(null)} 
            />
          )}

          {activeGame === "cliffdash" && (
            <CliffDashGame 
              targetDuration={20} 
              onWin={() => {}} 
              onClose={() => setActiveGame(null)} 
            />
          )}

          {activeGame === "coingrabber" && (
            <CoinGrabberGame 
              targetScore={15} 
              timeLimit={30}
              onWin={() => {}} 
              onClose={() => setActiveGame(null)} 
            />
          )}
        </div>
      )}

      {/* Judul Halaman */}
      <h1 
        className={`${architectsDaughter.className} text-4xl sm:text-5xl font-bold mb-6 drop-shadow-sm`} 
        style={{ color: "#7C1E1F" }}
      >
        Mini Game
      </h1>

      {/* Kerangka Grid 4 Mini Game */}
      <div className="grid grid-cols-2 gap-4 w-full h-full max-h-[70%] ml-10">
        {/* SLOT GAME 1: SKY JUMP */}
        <div 
          onClick={() => setActiveGame("skyjump")}
          className="relative border-2 border-dashed border-[#7C1E1F]/50 rounded-2xl flex flex-col items-center justify-center bg-[#f4e8d4]/80 hover:bg-[#7C1E1F]/10 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="text-[#7C1E1F] font-bold text-lg sm:text-xl font-sans text-center px-2">Sky Jump</span>
          <span className="text-xs text-[#7C1E1F]/70 mt-1 font-sans">Tap untuk main</span>
        </div>

        {/* SLOT GAME 2: TEBAK GELAS */}
        <div 
          onClick={() => setActiveGame("tebakgelas")}
          className="relative border-2 border-dashed border-[#7C1E1F]/50 rounded-2xl flex flex-col items-center justify-center bg-[#f4e8d4]/80 hover:bg-[#7C1E1F]/10 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="text-[#7C1E1F] font-bold text-lg sm:text-xl font-sans text-center px-2">Tebak Gelas</span>
          <span className="text-xs text-[#7C1E1F]/70 mt-1 font-sans">Tap untuk main</span>
        </div>

        {/* SLOT GAME 3: CLIFF DASH */}
        <div 
          onClick={() => setActiveGame("cliffdash")}
          className="relative border-2 border-dashed border-[#7C1E1F]/50 rounded-2xl flex flex-col items-center justify-center bg-[#f4e8d4]/80 hover:bg-[#7C1E1F]/10 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="text-[#7C1E1F] font-bold text-lg sm:text-xl font-sans text-center px-2">Cliff Dash</span>
          <span className="text-xs text-[#7C1E1F]/70 mt-1 font-sans">Tap untuk main</span>
        </div>

        {/* SLOT GAME 4: COIN GRABBER */}
        <div 
          onClick={() => setActiveGame("coingrabber")}
          className="relative border-2 border-dashed border-[#7C1E1F]/50 rounded-2xl flex flex-col items-center justify-center bg-[#f4e8d4]/80 hover:bg-[#7C1E1F]/10 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="text-[#7C1E1F] font-bold text-lg sm:text-xl font-sans text-center px-2">Coin Grabber</span>
          <span className="text-xs text-[#7C1E1F]/70 mt-1 font-sans">Tap untuk main</span>
        </div>
      </div>
    </div>
  );
}