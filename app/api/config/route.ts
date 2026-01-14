import { NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/middleware"
import {
  getAIProviders,
  AIProvider,
  ProcessedAIProviderConfig,
} from "@/lib/config/ai-providers"

function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 7) {
    return apiKey
  }

  const firstPart = apiKey.substring(0, 5)
  const lastPart = apiKey.substring(apiKey.length - 2)
  const maskedPart = "*".repeat(apiKey.length - 7)

  return `${firstPart}${maskedPart}${lastPart}`
}

export async function GET() {
  try {
    const authError = await validateSession()

    if (authError) {
        return authError
    }

    const aiProviders = getAIProviders()

    const maskedProviders = Object.entries(aiProviders).reduce(
      (acc, [key, providerConfig]) => {
        const provider = key as AIProvider

        const maskedConfig: ProcessedAIProviderConfig = {
          provider: providerConfig.provider,
          models: providerConfig.models.map(model => ({
            ...model,
            apiKey: maskApiKey(model.apiKey),
          })),
        }

        acc[provider] = maskedConfig

        return acc
      },
      {} as Record<AIProvider, ProcessedAIProviderConfig>,
    )
    
    return NextResponse.json({ providers: maskedProviders })

  } catch (error) {
    console.error("Error reading config file:", error)
    return NextResponse.json(
      { error: "Failed to read configuration file" },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"