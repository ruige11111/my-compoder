import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/middleware"
import { connectToDatabase } from "@/lib/db/mongo"
import { getUserId } from "@/lib/auth/middleware"
import { ComponentCodeApi } from "../type"
import { getAIClient } from "@/app/api/ai-core/utils/aiClient"
import { AIProvider } from "@/lib/config/ai-providers"
import { findCodegenById } from "@/lib/db/codegen/selectors"
import { run, updateComponentWorkflow } from "@/app/api/ai-core/workflow"
import { LanguageModel } from "ai"

export async function POST(request: NextRequest) {
    try {
        const authError = await validateSession()
        if (authError) {
          return authError
        }
    
        await connectToDatabase()

        const userId = await getUserId()

        const encoder = new TextEncoder()
        const stream = new TransformStream()
        const writer = stream.writable.getWriter()

        const params: ComponentCodeApi.editRequest = await request.json()

        const aiModel = getAIClient(params.provider as AIProvider, params.model)

        if (!params.codegenId || !params.prompt || !params.component) {
            return NextResponse.json(
              { error: "Missing required parameters" },
              { status: 400 },
            )
        }

        const codegenDetail = await findCodegenById(params.codegenId)

        run(updateComponentWorkflow, {
            stream: {
              write: (chunk: string) => writer.write(encoder.encode(chunk)),
              close: () => writer.close(),
            },
            query: {
              prompt: params.prompt,
              aiModel: aiModel as LanguageModel,
              rules: codegenDetail.rules,
              userId: userId!,
              component: params.component,
            },
        })

        return new Response(stream.readable)
    } catch (error) {
        console.error("Failed to get component code detail:", error)
        return NextResponse.json(
        { error: "Failed to get component code detail" },
        { status: 500 },
        )
    }
}