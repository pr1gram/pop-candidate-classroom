"use client"

import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { useParams, useRouter } from "next/navigation"
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

  const {
    top,
    bottom,
    topColor,
    bottomColor,
  } = match

  const [topScore, setTopScore] = useState(0)
  const [bottomScore, setBottomScore] = useState(0)
  const total = topScore + bottomScore

  // Timer (6 minutes)
  const [timeLeft, setTimeLeft] = useState(6 * 60)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.href)

    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)

    const fetchData = async () => {
      const res = await fetch("/api/live", { cache: "no-store" })
      const data = await res.json()

      setTopScore(data[top] ?? 0)
      setBottomScore(data[bottom] ?? 0)
    }

    fetchData()
    const poll = setInterval(fetchData, 500)

    return () => {
      clearInterval(timer)
      clearInterval(poll)
    }
  }, [top, bottom])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`

  return (
    <div className="min-h-screen bg-[#ece9e6] flex items-center justify-center">
      <div className="bg-[#ece9e6] w-[70vw] h-[80vh] rounded-2xl px-12 flex items-center justify-between relative">

        {/* TOP */}
        <ScoreColumn
          score={topScore}
          total={total}
          color={topColor}
        />

        {/* CENTER */}
        <div className="flex flex-col items-center justify-center gap-6 z-10">
          <div className={`text-8xl font-bold font-mono ${
            timeLeft === 0 ? "text-red-500" : "text-[#7F7F7F]"
          }`}>
            {formatTime(timeLeft)}
          </div>

          <div className="bg-white p-3 rounded-xl shadow h-36 w-36">
            {currentUrl && (
              <QRCode
                size={256}
                style={{ width: "100%", height: "auto" }}
                value={currentUrl}
              />
            )}
          </div>
        </div>

        {/* BOTTOM */}
        <ScoreColumn
          score={bottomScore}
          total={total}
          color={bottomColor}
        />
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
      <div className="z-10 mt-8 text-5xl font-bold text-white font-mono drop-shadow">
        <AnimatedText value={score} />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 ${color} transition-all duration-700 ease-in-out`}
        style={{ height: `${percent}%` }}
      />
    </div>
  )
}
