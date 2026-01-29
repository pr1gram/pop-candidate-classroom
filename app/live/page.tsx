"use client"

import Link from "next/link"
import { MATCHES } from "@/lib/matches"

export default function LiveIndexPage() {
  return (
    <div className="min-h-screen bg-[#ece9e6] flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl p-6">
        {Object.entries(MATCHES).map(([slug, match]) => (
          <Link
            key={slug}
            href={`/live/${slug}`}
            className="group rounded-2xl shadow-lg overflow-hidden bg-white hover:scale-[1.02] transition"
          >
            <div className="flex h-28">
              {/* LEFT */}
              <div
                className={`flex-1 ${match.topColor} flex items-center justify-center text-white text-xl font-bold`}
              >
                {match.top}
              </div>

              {/* VS */}
              <div className="w-20 flex items-center justify-center bg-gray-100 font-black text-gray-500">
                VS
              </div>

              {/* RIGHT */}
              <div
                className={`flex-1 ${match.bottomColor} flex items-center justify-center text-white text-xl font-bold`}
              >
                {match.bottom}
              </div>
            </div>

            <div className="text-center py-2 text-sm text-gray-500">
              /live/{slug}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
