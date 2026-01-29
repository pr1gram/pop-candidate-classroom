"use client"

import { MATCHES } from "@/lib/matches"
import { useState } from "react"

type Target = "top" | "bottom" | "both"

export default function ResetControlPage() {
  const [slug, setSlug] = useState<keyof typeof MATCHES>("ylwble")
  const [target, setTarget] = useState<Target>("both")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const match = MATCHES[slug]

  async function reset() {
    setLoading(true)
    setDone(false)

    await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, target }),
    })

    setLoading(false)
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
      <div className="bg-white w-[420px] p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Reset Score Control
        </h1>

        {/* MATCH SELECT */}
        <div>
          <label className="block mb-2 font-semibold">Match</label>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value as any)}
            className="w-full p-3 rounded-lg border"
          >
            {Object.entries(MATCHES).map(([key, m]) => (
              <option key={key} value={key}>
                {m.top} vs {m.bottom}
              </option>
            ))}
          </select>
        </div>

        {/* TARGET SELECT */}
        <div>
          <label className="block mb-2 font-semibold">Reset</label>
          <div className="flex gap-3">
            {["top", "bottom", "both"].map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t as Target)}
                className={`flex-1 py-2 rounded-lg font-bold transition
                  ${
                    target === t
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="text-center text-gray-500 text-sm">
          Will reset:
          <div className="font-bold text-gray-700">
            {target === "top" && match.top}
            {target === "bottom" && match.bottom}
            {target === "both" && `${match.top} + ${match.bottom}`}
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={reset}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-lg hover:bg-red-700 active:scale-95 transition"
        >
          {loading ? "Resetting..." : "RESET"}
        </button>

        {done && (
          <div className="text-center text-green-600 font-semibold animate-pulse">
            ✅ Reset complete
          </div>
        )}
      </div>
    </div>
  )
}
