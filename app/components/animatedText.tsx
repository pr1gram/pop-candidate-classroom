"use client"

import { useEffect, useState } from "react"

export default function AnimatedText({
  value,
  duration = 300,
  className = "",
}: {
  value: number | string
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (typeof value === "string") {
      setDisplay(value)
      return
    }

    let start = Number(display) || 0
    let diff = value - start
    let startTime = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      setDisplay(Math.round(start + diff * progress))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return (
    <span className={`tabular-nums ${className}`}>
      {typeof display === "number"
        ? display.toLocaleString()
        : display}
    </span>
  )
}
