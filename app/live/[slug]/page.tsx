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
     QR URL (CLICK PAGE)
  ========================= */
  const [clickUrl, setClickUrl] = useState("")

  useEffect(() => {
    if (!slug) return
    setClickUrl(`${window.location.origin}/${slug}`)
  }, [slug])

  /* =========================
     TIMER LOGIC
  ========================= */
  useEffect(() => {
    if (!started) return

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
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
      <div className="bg-[#ece9e6] w-[70vw] h-[80vh] rounded-2xl px-12 flex items-center justify-between relative">

        {/* TOP */}
        <ScoreColumn score={topScore} total={total} color={topColor} />

        {/* CENTER */}
        <div className="flex flex-col items-center justify-center gap-6 z-10">
          <button
            onClick={() => !started && setStarted(true)}
            className={`text-8xl font-bold transition ${
              timeLeft === 0
                ? "text-red-500"
                : started
                ? "text-[#7F7F7F]"
                : "text-black hover:scale-105 cursor-pointer"
            }`}
          >
            {formatTime(timeLeft)}
          </button>

          {/* QR → CLICK PAGE */}
          <div className="bg-white p-3 rounded-xl shadow h-36 w-36">
            {clickUrl && (
              <QRCode
                size={256}
                style={{ width: "100%", height: "auto" }}
                value={clickUrl}
                fgColor="#565656"
              />
            )}
          </div>
        </div>

        {/* BOTTOM */}
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
    <div className="relative flex flex-col items-center h-full w-60 bg-[#D8D6D6] rounded-xl overflow-hidden shadow-inner">
      <div className="z-10 mt-8 text-5xl font-semibold text-white drop-shadow">
        <AnimatedText value={score} />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 ${color} transition-all duration-700 ease-in-out`}
        style={{ height: `${percent}%` }}
      />
    </div>
  )
}
