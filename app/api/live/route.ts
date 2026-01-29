import { NextResponse } from "next/server"
import { dbAdmin } from "@/lib/firebase-admin"

export async function GET() {
  const teams = ["Yellow1", "Blue1", "Orange1", "Red1", "Yellow2", "Blue2", "Orange2", "Red2"]
  const result: Record<string, number> = {}

  for (const team of teams) {
    const snap = await dbAdmin
      .collection("teams")
      .doc(team)
      .collection("shards")
      .get()

    let total = 0
    snap.forEach(doc => {
      total += doc.data().count || 0
    })

    result[team] = total
  }

  return NextResponse.json(result)
}
