import { NextRequest } from "next/server"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"
import { findCodegenById } from "@/lib/db/codegen/selectors"
import { CodegenApi } from "../types"

export async function GET(request: NextRequest) {
    try {
        const authError = await validateSession()
        if (authError) {
            return authError
        }

        await connectToDatabase()

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get("id")

        if (!id) {
            return Response.json({ error: "Missing id parameter" }, { status: 400 })
        }

        const data = await findCodegenById(id)

        return Response.json({
          data,
        } satisfies CodegenApi.DetailResponse)

    } catch (error) {
    console.error("[CODEGEN_DETAIL]", error)
    return Response.json(
      { error: "Failed to fetch codegen detail" },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
