"use client";

import { MATCHES } from "@/lib/matches";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* =========================
   POP BUFFER (GLOBAL)
========================= */
let bufferTop = 0;
let bufferBottom = 0;
let timer: any = null;

/* =========================
   ANIMATED NUMBER
========================= */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (value === display) return;

    const start = display;
    const diff = value - start;
    const duration = 200;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.round(start + diff * progress));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

/* =========================
   PAGE
========================= */
export default function ClickPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;
  const match = MATCHES[slug as keyof typeof MATCHES];

  /* 🚨 invalid slug */
  useEffect(() => {
    if (!match) router.replace("/404");
  }, [match, router]);

  if (!match) return null;

  const { top, bottom, topColor, bottomColor, topText, bottomText } = match;

  const [topScore, setTopScore] = useState(0);
  const [bottomScore, setBottomScore] = useState(0);

  /* =========================
     SEND TO API
  ========================= */
  function send(team: string, amount: number) {
    fetch("/api/pop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team, amount }),
    });
  }

  /* =========================
     CLICK HANDLER (OPTIMISTIC)
  ========================= */
  function pop(side: "top" | "bottom") {
    if (side === "top") {
      bufferTop++;
      setTopScore((s) => {
        const next = s + 1;
        lastTop.current = next; // 🔴 IMPORTANT
        return next;
      });
    } else {
      bufferBottom++;
      setBottomScore((s) => {
        const next = s + 1;
        lastBottom.current = next; // 🔵 IMPORTANT
        return next;
      });
    }

    if (!timer) {
      timer = setTimeout(() => {
        if (bufferTop) send(top, bufferTop);
        if (bufferBottom) send(bottom, bufferBottom);

        bufferTop = 0;
        bufferBottom = 0;
        timer = null;
      }, 250);
    }
  }

  /* =========================
     LIVE SYNC (ANTI-JITTER)
  ========================= */
  const lastTop = useRef(0);
  const lastBottom = useRef(0);

  useEffect(() => {
    const fetchLive = async () => {
      const res = await fetch("/api/live", { cache: "no-store" });
      const data = await res.json();

      const t = data[top] ?? 0;
      const b = data[bottom] ?? 0;

      if (t >= lastTop.current) {
        setTopScore(t);
        lastTop.current = t;
      }

      if (b >= lastBottom.current) {
        setBottomScore(b);
        lastBottom.current = b;
      }
    };

    fetchLive();
    const i = setInterval(fetchLive, 500);
    return () => clearInterval(i);
  }, [top, bottom]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="relative h-screen w-screen flex flex-col font-bold select-none">
      {/* TOP */}
      <div
        className={`flex-1 flex items-center justify-center ${topColor}`}
        onPointerDown={() => pop("top")}
      >
        <span className={`text-7xl ${topText}`}>
          <AnimatedNumber value={topScore} />
        </span>
      </div>

      {/* VS */}
      
        <Image src="/vs.png" alt="VS" width={150} height={150} className="object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10" />


      {/* BOTTOM */}
      <div
        className={`flex-1 flex items-center justify-center ${bottomColor}`}
        onPointerDown={() => pop("bottom")}
      >
        <span className={`text-7xl ${bottomText} transition-transform`}>
          <AnimatedNumber value={bottomScore} />
        </span>
      </div>
    </div>
  );
}
