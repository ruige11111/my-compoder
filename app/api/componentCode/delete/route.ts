import { NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"
import { deleteComponentCode } from "@/lib/db/componentCode/mutations"

export async function DELETE(request: Request) {
  try {
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)

    const id = searchParams.get("id")

    if (!id) {
        return NextResponse.json(
          { error: "Missing required parameter: id" },
          { status: 400 },
        )
    }

    await deleteComponentCode({ id })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in DELETE operation:", error)
    return NextResponse.json(
      { error: "Delete operation failed" },
      { status: 500 },
    )
  }
}