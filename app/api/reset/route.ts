import { NextResponse } from "next/server"
import { dbAdmin } from "@/lib/firebase-admin"
import { MATCHES } from "@/lib/matches"

export async function POST(req: Request) {
  const { slug, target } = await req.json()

  const match = MATCHES[slug as keyof typeof MATCHES]
  if (!match) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  const teams =
    target === "both"
      ? [match.top, match.bottom]
      : target === "top"
      ? [match.top]
      : [match.bottom]

  for (const team of teams) {
    const shardSnap = await dbAdmin
      .collection("teams")
      .doc(team)
      .collection("shards")
      .get()

    const batch = dbAdmin.batch()

    shardSnap.forEach((doc) => {
      batch.set(doc.ref, { count: 0 }, { merge: true })
    })

    await batch.commit()
  }

  return NextResponse.json({ ok: true })
}
