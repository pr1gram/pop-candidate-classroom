"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { MATCHES, MatchSlug } from "@/lib/matches"
import AnimatedText from "@/app/components/animatedText"

/* ========================= */

export default function LivePage() {
  const { slug } = useParams<{ slug: MatchSlug }>()
  const router = useRouter()

  const match = MATCHES[slug]

  // 🚨 invalid slug
  useEffect(() => {
    if (!match) router.replace("/404")
  }, [match, router])

  if (!match) return null

  const { top, bottom, topColor, bottomColor } = match

  /* =========================
     SCORE STATE
  ========================= */
  const [topScore, setTopScore] = useState(0)
  const [bottomScore, setBottomScore] = useState(0)
  const total = topScore + bottomScore

  /* =========================
     TIMER STATE
  ========================= */
  const START_TIME = 6 * 60
  const [timeLeft, setTimeLeft] = useState(START_TIME)
  const [started, setStarted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  /* =========================
     QR URL
  ========================= */
  const [clickUrl, setClickUrl] = useState("")

  useEffect(() => {
    if (!slug) return
    setClickUrl(`${window.location.origin}/${slug}`)
  }, [slug])

  /* =========================
     SPACE TO START
  ========================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setStarted((p) => (p ? p : true))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  /* =========================
     TIMER LOGIC
  ========================= */
  useEffect(() => {
    if (!started) return

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [started])

  /* =========================
     LIVE SCORE POLLING
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/live", { cache: "no-store" })
      const data = await res.json()
      setTopScore(data[top] ?? 0)
      setBottomScore(data[bottom] ?? 0)
    }

    fetchData()
    const poll = setInterval(fetchData, 2000)
    return () => clearInterval(poll)
  }, [top, bottom])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-[#ece9e6] flex items-center justify-center font-Adirek">
      <div className="bg-[#ece9e6] w-[90vw] h-[80vh] rounded-2xl px-10 flex items-center justify-between relative">

        {/* LEFT COLUMN */}
        <ScoreColumn score={topScore} total={total} color={topColor} />

        {/* CENTER */}
        <div className="flex flex-col items-center justify-center gap-10 z-10 mx-24">
          <button
            onClick={() => !started && setStarted(true)}
            className={`font-bold transition ${
              timeLeft === 0
                ? "text-red-500"
                : started
                ? "text-[#7F7F7F]"
                : "text-black hover:scale-105 cursor-pointer"
            } text-[9rem]`}
          >
            {formatTime(timeLeft)}
          </button>

          

          {/* BIG QR */}
          <div className="bg-white p-5 rounded-2xl shadow h-56 w-56">
            {clickUrl && (
              <QRCode
                size={512}
                style={{ width: "100%", height: "100%" }}
                value={clickUrl}
                fgColor="#565656"
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <ScoreColumn score={bottomScore} total={total} color={bottomColor} />
      </div>
    </div>
  )
}

/* ========================= */

function ScoreColumn({
  score,
  total,
  color,
}: {
  score: number
  total: number
  color: string
}) {
  const percent = total ? (score / total) * 100 : 0

  return (
    <div className="relative flex flex-col items-center h-full w-80 bg-[#D8D6D6] rounded-xl overflow-hidden shadow-inner">
      <div className="z-10 mt-10 text-5xl font-semibold text-white drop-shadow">
        <AnimatedText value={score} />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 ${color} transition-all duration-700 ease-in-out`}
        style={{ height: `${percent}%` }}
      />
    </div>
  )
}
