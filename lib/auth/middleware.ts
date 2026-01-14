import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { NextResponse } from "next/server"

export async function validateSession() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized - Please login first" },
      { status: 401 },
    )
  }

  return null
}

export async function getUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id
}