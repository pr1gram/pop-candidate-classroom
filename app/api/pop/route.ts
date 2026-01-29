import { NextResponse } from "next/server"
import { dbAdmin, FieldValue } from "@/lib/firebase-admin"

const SHARD_COUNT = 100

export async function POST(req: Request) {
  try {
    const { team, amount } = await req.json()

    if (team !== "Yellow1" && team !== "Orange1" && team !== "Blue1" && team !== "Red1" && team !== "Yellow2" && team !== "Orange2" && team !== "Blue2" && team !== "Red2") {
      return NextResponse.json({ error: "Invalid team" }, { status: 400 })
    }

    const incrementBy = typeof amount === "number" ? amount : 1
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
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

