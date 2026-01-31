import { NextResponse } from "next/server"
import { dbAdmin, FieldValue } from "@/lib/firebase-admin"

const SHARD_COUNT = 20

// ===== CONFIG =====
const MAX_AMOUNT = 15          // max clicks per request
const RATE_LIMIT = 30          // requests
const RATE_WINDOW = 1000       // per second (ms)

// ===== TEAM ALLOWLIST =====
const ALLOWED_TEAMS = new Set([
  "Yellow1", "Orange1", "Blue1", "Red1",
  "Yellow2", "Orange2", "Blue2", "Red2",
])

// ===== IN-MEMORY RATE LIMIT (EDGE-SAFE) =====
const ipHits = new Map<string, number[]>()

function rateLimit(ip: string) {
  const now = Date.now()
  const hits = ipHits.get(ip) ?? []

  // keep last 1s
  const recent = hits.filter(t => now - t < RATE_WINDOW)

  if (recent.length >= RATE_LIMIT) return false

  recent.push(now)
  ipHits.set(ip, recent)
  return true
}

export async function POST(req: Request) {
  try {
    // ===== BASIC BOT FILTER =====
    const ua = req.headers.get("user-agent")
    if (!ua) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ===== IP RATE LIMIT =====
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      "unknown"

    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    // ===== PARSE BODY =====
    const body = await req.json()
    const { team, amount } = body

    // ===== VALIDATE TEAM =====
    if (!ALLOWED_TEAMS.has(team)) {
      return NextResponse.json({ error: "Invalid team" }, { status: 400 })
    }

    // ===== SANITIZE AMOUNT =====
    let incrementBy = 1
    if (typeof amount === "number") {
      incrementBy = Math.min(Math.max(amount, 1), MAX_AMOUNT)
    }

    // ===== SHARD WRITE =====
    const shardId = Math.floor(Math.random() * SHARD_COUNT).toString()

    const shardRef = dbAdmin
      .collection("teams")
      .doc(team)
      .collection("shards")
      .doc(shardId)

    await shardRef.set(
      { count: FieldValue.increment(incrementBy) },
      { merge: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POP ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
